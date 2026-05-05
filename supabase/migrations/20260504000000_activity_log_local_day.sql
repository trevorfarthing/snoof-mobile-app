-- ============================================================================
-- Add utc_offset_minutes + local_day to activity_logs.
--
-- Streak evaluation buckets activities by the local day they occurred in (from
-- the logging client's perspective), not by UTC. The client writes the offset
-- at insert time. local_day is derived by a BEFORE trigger so the two cannot
-- drift, and the column stays indexable.
--
-- (Note: we can't use a generated column here: the natural expression involves
-- AT TIME ZONE, which Postgres marks STABLE, and generated columns require
-- IMMUTABLE expressions.)
--
-- The offset is frozen at write time and intentionally NOT updated on edits —
-- e.g., a walk that happened in NYC stays bucketed to its NYC day even if the
-- user later edits the time from a different timezone.
-- ============================================================================

ALTER TABLE activity_logs
  ADD COLUMN utc_offset_minutes SMALLINT,
  ADD COLUMN local_day          DATE;

-- Backfill legacy rows: assume PDT.
UPDATE activity_logs
SET utc_offset_minutes = -420,
    local_day          = ((occurred_at + make_interval(mins => -420))
                            AT TIME ZONE 'UTC')::DATE
WHERE utc_offset_minutes IS NULL;

ALTER TABLE activity_logs
  ALTER COLUMN utc_offset_minutes SET NOT NULL,
  ALTER COLUMN local_day          SET NOT NULL;

CREATE INDEX idx_activity_logs_pet_local_day
  ON activity_logs(pet_id, local_day);

-- Derive local_day from occurred_at + utc_offset_minutes on every write.
CREATE OR REPLACE FUNCTION set_activity_log_local_day()
RETURNS TRIGGER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.local_day := ((NEW.occurred_at + make_interval(mins => NEW.utc_offset_minutes))
                      AT TIME ZONE 'UTC')::DATE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER activity_logs_set_local_day
  BEFORE INSERT OR UPDATE OF occurred_at, utc_offset_minutes
  ON activity_logs
  FOR EACH ROW EXECUTE FUNCTION set_activity_log_local_day();
