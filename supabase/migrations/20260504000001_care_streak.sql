-- ============================================================================
-- CARE STREAK
--
-- A "streak day" is a local day on which a pet met all of its active daily
-- goals. We bucket activities by activity_logs.local_day (frozen at log time)
-- so historical days never re-evaluate when a user changes timezones.
--
-- Architecture:
--   pet_streak_days  — historical record, one row per (pet, day) that was met
--   pet_streaks      — denormalized cache, one row per pet (current/longest)
--   evaluate_pet_day  — function: returns whether a (pet, day) is met. Honors
--                       the frozen goals_snapshot if a row already exists,
--                       otherwise uses current pet_daily_goals.
--   recompute_pet_streak — function: upserts pet_streak_days + recomputes
--                          pet_streaks
--   triggers on activity_logs / walks / feedings call recompute
--
-- pet_daily_goals changes do NOT trigger recompute. Today's status refreshes
-- on the next activity log write. The client should call recompute_pet_streak
-- explicitly after a goal save if it wants today to update immediately.
--
-- Pets with no active goals (and no frozen snapshot for the day) are paused:
-- no streak days accrue.
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE pet_streak_days (
  pet_id         UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  day            DATE NOT NULL,
  goals_snapshot JSONB NOT NULL,
  met_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pet_id, day)
);

CREATE INDEX idx_pet_streak_days_pet_day ON pet_streak_days(pet_id, day DESC);

CREATE TABLE pet_streaks (
  pet_id         UUID PRIMARY KEY REFERENCES pets(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_met_day   DATE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE pet_streak_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_streaks     ENABLE ROW LEVEL SECURITY;

CREATE POLICY streak_days_select ON pet_streak_days
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY streaks_select ON pet_streaks
  FOR SELECT USING (can_access_pet(pet_id));

-- Writes happen exclusively through SECURITY DEFINER functions called by
-- triggers, so no insert/update/delete policies are exposed to users.

-- ============================================================================
-- updated_at trigger pickup
-- ============================================================================

DO $$ DECLARE tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_name = c.table_name
     AND t.table_schema = c.table_schema
     AND t.table_type = 'BASE TABLE'
    WHERE c.column_name = 'updated_at'
      AND c.table_schema = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.triggers tr
        WHERE tr.trigger_name = 'set_updated_at'
          AND tr.event_object_table = c.table_name
      )
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl
    );
  END LOOP;
END; $$;

-- ============================================================================
-- Extend handle_new_pet to seed a pet_streaks row
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_pet()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO pet_daily_goals (pet_id, goal_type, target_value, target_unit, hero_card_slot)
  VALUES
    (NEW.id, 'walk_duration', 60, 'minutes', 1),
    (NEW.id, 'meal_count',     2, 'count',   2);

  INSERT INTO pet_streaks (pet_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill pet_streaks rows for any pets created before this migration.
INSERT INTO pet_streaks (pet_id)
SELECT id FROM pets
ON CONFLICT (pet_id) DO NOTHING;

-- ============================================================================
-- FUNCTION: evaluate_pet_day
-- Re-evaluates a (pet, day) and returns whether all goals are met plus a
-- snapshot of those goals.
--
-- If a pet_streak_days row already exists for the day, we evaluate against
-- its frozen goals_snapshot. This is the freeze guarantee: once a day is on
-- the books, only changes to that day's underlying activities can flip it,
-- never changes to the goal definitions themselves.
--
-- If no row exists, we evaluate against current pet_daily_goals.
-- Returns (false, NULL) when there are no goals to evaluate against.
-- ============================================================================

CREATE OR REPLACE FUNCTION evaluate_pet_day(
  p_pet_id UUID,
  p_day    DATE
)
RETURNS TABLE(all_met BOOLEAN, snapshot JSONB)
SECURITY DEFINER STABLE SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_existing_snapshot JSONB;
  v_goal_count        INTEGER;
BEGIN
  SELECT goals_snapshot INTO v_existing_snapshot
  FROM pet_streak_days
  WHERE pet_id = p_pet_id AND day = p_day;

  RETURN QUERY
  WITH effective_goals AS (
    -- Use frozen snapshot when present, otherwise current active goals.
    SELECT
      (g->>'goal_type')::TEXT       AS goal_type,
      (g->>'target_value')::NUMERIC AS target_value,
      (g->>'target_unit')::TEXT     AS target_unit
    FROM jsonb_array_elements(v_existing_snapshot) g
    WHERE v_existing_snapshot IS NOT NULL

    UNION ALL

    SELECT
      g.goal_type::TEXT,
      g.target_value,
      g.target_unit
    FROM pet_daily_goals g
    WHERE v_existing_snapshot IS NULL
      AND g.pet_id    = p_pet_id
      AND g.is_active = true
  ),
  progress AS (
    SELECT
      eg.goal_type,
      eg.target_value,
      eg.target_unit,
      CASE eg.goal_type
        WHEN 'walk_distance' THEN COALESCE((
          SELECT SUM(
            CASE eg.target_unit
              WHEN 'miles' THEN w.distance_meters * 0.000621371
              WHEN 'km'    THEN w.distance_meters / 1000.0
              ELSE w.distance_meters
            END
          )
          FROM activity_logs al
          JOIN walks w ON w.activity_log_id = al.id
          WHERE al.pet_id    = p_pet_id
            AND al.type      = 'walk'
            AND al.local_day = p_day
            AND w.distance_meters IS NOT NULL
        ), 0)
        WHEN 'walk_duration' THEN COALESCE((
          SELECT SUM(
            CASE eg.target_unit
              WHEN 'minutes' THEN w.duration_sec / 60.0
              WHEN 'hours'   THEN w.duration_sec / 3600.0
              ELSE w.duration_sec
            END
          )
          FROM activity_logs al
          JOIN walks w ON w.activity_log_id = al.id
          WHERE al.pet_id    = p_pet_id
            AND al.type      = 'walk'
            AND al.local_day = p_day
            AND w.duration_sec IS NOT NULL
        ), 0)
        WHEN 'meal_count' THEN COALESCE((
          SELECT COUNT(*)::NUMERIC
          FROM activity_logs al
          JOIN feedings f ON f.activity_log_id = al.id
          WHERE al.pet_id    = p_pet_id
            AND al.type      = 'feeding'
            AND al.local_day = p_day
            AND (f.food_type != 'treat'  OR f.food_type IS NULL)
            AND (f.meal_label != 'snack' OR f.meal_label IS NULL)
        ), 0)
      END AS current_value
    FROM effective_goals eg
  )
  SELECT
    -- bool_and over zero rows returns NULL — coalesce to false (paused day).
    COALESCE(bool_and(p.current_value >= p.target_value), false) AS all_met,
    -- jsonb_agg over zero rows returns NULL — that's fine, we won't insert
    -- a row when all_met is false anyway.
    jsonb_agg(jsonb_build_object(
      'goal_type',    p.goal_type,
      'target_value', p.target_value,
      'target_unit',  p.target_unit
    )) FILTER (WHERE p.goal_type IS NOT NULL) AS snapshot
  FROM progress p;
END;
$$;

-- ============================================================================
-- FUNCTION: recompute_pet_streak
-- Re-evaluates a single (pet, day), upserts/deletes the streak_days row, and
-- updates the cached current/longest streak.
--
-- The current run is found by walking back from the most recent met day
-- through pet_streak_days until a gap. Bounded by streak length, all lookups
-- are indexed.
-- ============================================================================

CREATE OR REPLACE FUNCTION recompute_pet_streak(
  p_pet_id UUID,
  p_day    DATE
)
RETURNS VOID
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_all_met   BOOLEAN;
  v_snapshot  JSONB;
  v_cursor    DATE;
  v_run       INTEGER;
  v_longest   INTEGER;
  v_last_met  DATE;
BEGIN
  SELECT all_met, snapshot
    INTO v_all_met, v_snapshot
    FROM evaluate_pet_day(p_pet_id, p_day);

  IF v_all_met THEN
    -- Preserve the original snapshot on update so the freeze guarantee holds.
    INSERT INTO pet_streak_days (pet_id, day, goals_snapshot)
    VALUES (p_pet_id, p_day, v_snapshot)
    ON CONFLICT (pet_id, day) DO UPDATE
      SET met_at = now();
  ELSE
    DELETE FROM pet_streak_days
    WHERE pet_id = p_pet_id AND day = p_day;
  END IF;

  -- Walk back from the most recent met day to find the current run length.
  SELECT MAX(day) INTO v_last_met
  FROM pet_streak_days
  WHERE pet_id = p_pet_id;

  v_run    := 0;
  v_cursor := v_last_met;

  WHILE v_cursor IS NOT NULL AND EXISTS (
    SELECT 1 FROM pet_streak_days
    WHERE pet_id = p_pet_id AND day = v_cursor
  ) LOOP
    v_run    := v_run + 1;
    v_cursor := v_cursor - 1;
  END LOOP;

  SELECT GREATEST(COALESCE(longest_streak, 0), v_run)
    INTO v_longest
    FROM pet_streaks
    WHERE pet_id = p_pet_id;

  UPDATE pet_streaks
  SET current_streak = v_run,
      longest_streak = v_longest,
      last_met_day   = v_last_met,
      updated_at     = now()
  WHERE pet_id = p_pet_id;
END;
$$;

-- ============================================================================
-- Triggers: collect (pet, day) pairs from each statement and recompute.
-- Statement-level so a bulk insert/delete/update fires once per statement
-- instead of once per row.
-- ============================================================================

CREATE OR REPLACE FUNCTION trg_activity_log_streak_insert()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT pet_id, local_day FROM new_rows LOOP
    PERFORM recompute_pet_streak(r.pet_id, r.local_day);
  END LOOP;
  RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION trg_activity_log_streak_delete()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT pet_id, local_day FROM old_rows LOOP
    PERFORM recompute_pet_streak(r.pet_id, r.local_day);
  END LOOP;
  RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION trg_activity_log_streak_update()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  -- An update can shift local_day, so cover both before- and after-day.
  FOR r IN
    SELECT pet_id, local_day FROM old_rows
    UNION
    SELECT pet_id, local_day FROM new_rows
  LOOP
    PERFORM recompute_pet_streak(r.pet_id, r.local_day);
  END LOOP;
  RETURN NULL;
END; $$;

CREATE TRIGGER activity_logs_streak_insert
  AFTER INSERT ON activity_logs
  REFERENCING NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_activity_log_streak_insert();

CREATE TRIGGER activity_logs_streak_update
  AFTER UPDATE ON activity_logs
  REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_activity_log_streak_update();

CREATE TRIGGER activity_logs_streak_delete
  AFTER DELETE ON activity_logs
  REFERENCING OLD TABLE AS old_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_activity_log_streak_delete();

-- Walk and feeding edits also affect goal progress (e.g., distance edits).
-- We resolve back to the activity_log to get its local_day, then recompute.

CREATE OR REPLACE FUNCTION trg_child_table_streak_update()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT al.pet_id, al.local_day
    FROM activity_logs al
    WHERE al.id IN (
      SELECT activity_log_id FROM old_rows
      UNION
      SELECT activity_log_id FROM new_rows
    )
  LOOP
    PERFORM recompute_pet_streak(r.pet_id, r.local_day);
  END LOOP;
  RETURN NULL;
END; $$;

CREATE TRIGGER walks_streak_update
  AFTER UPDATE ON walks
  REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_child_table_streak_update();

CREATE TRIGGER feedings_streak_update
  AFTER UPDATE ON feedings
  REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION trg_child_table_streak_update();

-- ============================================================================
-- FUNCTION: get_pet_streak
-- Returns the 7-day window for the dashboard plus current/longest counts.
-- p_utc_offset_minutes determines what "today" means for the in-progress cell.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pet_streak(
  p_pet_id             UUID,
  p_utc_offset_minutes INTEGER DEFAULT 0
)
RETURNS TABLE(
  day            DATE,
  status         TEXT,           -- 'met' | 'in_progress' | 'missed'
  is_today       BOOLEAN,
  current_streak INTEGER,
  longest_streak INTEGER
)
SECURITY DEFINER STABLE SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_today        DATE;
  v_current      INTEGER;
  v_longest      INTEGER;
  v_has_progress BOOLEAN;
  v_goal_count   INTEGER;
BEGIN
  v_today := (date_trunc('day', now() + (p_utc_offset_minutes || ' minutes')::INTERVAL))::DATE;

  -- Pull cached counts. Reinterpret current_streak: if last_met_day is older
  -- than yesterday, the streak has lapsed regardless of what the cache says.
  SELECT
    CASE
      WHEN ps.last_met_day IS NULL        THEN 0
      WHEN ps.last_met_day >= v_today - 1 THEN ps.current_streak
      ELSE 0
    END,
    ps.longest_streak
  INTO v_current, v_longest
  FROM pet_streaks ps
  WHERE ps.pet_id = p_pet_id;

  v_current := COALESCE(v_current, 0);
  v_longest := COALESCE(v_longest, 0);

  -- "in_progress" = today not yet met but at least one goal has progress, or
  -- the pet has no goals at all (so today is implicitly waiting on setup).
  SELECT COUNT(*) INTO v_goal_count
  FROM pet_daily_goals
  WHERE pet_id = p_pet_id AND is_active = true;

  v_has_progress := EXISTS (
    SELECT 1 FROM activity_logs
    WHERE pet_id = p_pet_id AND local_day = v_today
  );

  RETURN QUERY
  SELECT
    d.day,
    CASE
      WHEN sd.day IS NOT NULL                                  THEN 'met'
      WHEN d.day = v_today AND (v_has_progress OR v_goal_count = 0)
                                                               THEN 'in_progress'
      ELSE 'missed'
    END AS status,
    (d.day = v_today) AS is_today,
    v_current         AS current_streak,
    v_longest         AS longest_streak
  FROM (
    SELECT (v_today - offs)::DATE AS day
    FROM generate_series(0, 6) AS offs
  ) d
  LEFT JOIN pet_streak_days sd ON sd.pet_id = p_pet_id AND sd.day = d.day
  ORDER BY d.day ASC;
END;
$$;
