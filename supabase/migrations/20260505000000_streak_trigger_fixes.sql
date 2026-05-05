-- ============================================================================
-- Fix streak triggers to handle inserts correctly.
--
-- The original setup put an INSERT trigger on activity_logs, but the client
-- inserts the child row (walks / feedings) in a separate request after the
-- activity_logs row is committed. By the time the activity_logs INSERT trigger
-- ran, no child row existed yet, so evaluate_pet_day saw zero progress and
-- never recorded the streak day.
--
-- Fix: drop the activity_logs INSERT trigger entirely, and add INSERT triggers
-- on walks and feedings instead. Those fire after the goal-relevant data is
-- actually present.
--
-- We keep the activity_logs UPDATE trigger because edits to occurred_at can
-- shift local_day, and that change isn't visible to walks/feedings triggers.
-- We keep the activity_logs DELETE trigger because it handles deletes for all
-- activity types uniformly (cascades will also remove the child row, but the
-- activity_logs trigger has the local_day we need without a join).
-- ============================================================================

DROP TRIGGER IF EXISTS activity_logs_streak_insert ON activity_logs;
DROP FUNCTION IF EXISTS trg_activity_log_streak_insert();

-- Reuse the same handler shape we already have for UPDATE on the child tables.
CREATE OR REPLACE FUNCTION trg_child_table_streak_insert()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT al.pet_id, al.local_day
    FROM activity_logs al
    WHERE al.id IN (SELECT activity_log_id FROM new_rows)
  LOOP
    PERFORM recompute_pet_streak(r.pet_id, r.local_day);
  END LOOP;
  RETURN NULL;
END; $$;

CREATE TRIGGER walks_streak_insert
  AFTER INSERT ON walks
  REFERENCING NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_child_table_streak_insert();

CREATE TRIGGER feedings_streak_insert
  AFTER INSERT ON feedings
  REFERENCING NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_child_table_streak_insert();
