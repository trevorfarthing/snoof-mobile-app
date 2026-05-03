-- ============================================================================
-- FUNCTION: get_today_activity_logs
-- Returns every activity log for a pet that occurred today (in the user's
-- local timezone), joined with type-specific child tables (walks, feedings,
-- potty_logs) as JSONB blobs. Powers the dashboard "Today" list.
--
-- p_utc_offset_minutes: client's UTC offset (e.g. -300 for UTC-5).
-- React Native: pass -new Date().getTimezoneOffset()
-- ============================================================================

CREATE OR REPLACE FUNCTION get_today_activity_logs(
  p_pet_id             UUID,
  p_utc_offset_minutes INTEGER DEFAULT 0
)
RETURNS TABLE(
  id          UUID,
  type        TEXT,
  occurred_at TIMESTAMPTZ,
  notes       TEXT,
  walk        JSONB,
  feeding     JSONB,
  potty       JSONB
)
SECURITY DEFINER STABLE SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  offset_interval INTERVAL;
  today_start     TIMESTAMPTZ;
  today_end       TIMESTAMPTZ;
BEGIN
  offset_interval := (p_utc_offset_minutes || ' minutes')::INTERVAL;
  today_start     := date_trunc('day', now() + offset_interval) - offset_interval;
  today_end       := today_start + interval '1 day';

  RETURN QUERY
  SELECT
    al.id,
    al.type::TEXT,
    al.occurred_at,
    al.notes,
    CASE WHEN w.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id',              w.id,
      'started_at',      w.started_at,
      'ended_at',        w.ended_at,
      'duration_sec',    w.duration_sec,
      'distance_meters', w.distance_meters,
      'avg_pace',        w.avg_pace,
      'calories_est',    w.calories_est,
      'metadata',        w.metadata
    ) END AS walk,
    CASE WHEN f.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id',          f.id,
      'food_name',   f.food_name,
      'food_type',   f.food_type,
      'amount',      f.amount,
      'amount_unit', f.amount_unit,
      'meal_label',  f.meal_label
    ) END AS feeding,
    CASE WHEN p.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id',          p.id,
      'potty_type',  p.potty_type,
      'consistency', p.consistency,
      'location',    p.location,
      'is_accident', p.is_accident
    ) END AS potty
  FROM activity_logs al
  LEFT JOIN walks       w ON w.activity_log_id = al.id
  LEFT JOIN feedings    f ON f.activity_log_id = al.id
  LEFT JOIN potty_logs  p ON p.activity_log_id = al.id
  WHERE al.pet_id      = p_pet_id
    AND al.occurred_at >= today_start
    AND al.occurred_at <  today_end
    AND can_access_pet(al.pet_id)
  ORDER BY al.occurred_at ASC;
END;
$$;
