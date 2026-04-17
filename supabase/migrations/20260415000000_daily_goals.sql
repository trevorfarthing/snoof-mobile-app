-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE goal_type AS ENUM ('walk_distance', 'walk_duration', 'meal_count');

-- ============================================================================
-- MODULE: PET DAILY GOALS
-- ============================================================================

-- User-defined daily goals that power the hero card stat cards.
-- Each goal occupies one of three configurable slots on the hero card.
-- Slot 3 defaults to "upcoming health event" when no goal is assigned.
CREATE TABLE pet_daily_goals (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  goal_type       goal_type NOT NULL,
  target_value    NUMERIC NOT NULL CHECK (target_value > 0),
  target_unit     TEXT NOT NULL,       -- 'miles' | 'km' | 'minutes' | 'hours' | 'count'
  hero_card_slot  SMALLINT CHECK (hero_card_slot BETWEEN 1 AND 3),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pet_id, hero_card_slot)      -- one goal per slot
);

CREATE INDEX idx_daily_goals_pet ON pet_daily_goals(pet_id) WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE pet_daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY goals_select ON pet_daily_goals
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY goals_insert ON pet_daily_goals
  FOR INSERT WITH CHECK (can_access_pet(pet_id));
CREATE POLICY goals_update ON pet_daily_goals
  FOR UPDATE USING (can_access_pet(pet_id));
CREATE POLICY goals_delete ON pet_daily_goals
  FOR DELETE USING (can_access_pet(pet_id));

-- ============================================================================
-- UPDATED_AT TRIGGER
-- Re-run the idempotent DO block so pet_daily_goals (and any other new tables
-- with updated_at) get the trigger without duplicating existing ones.
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
-- DEFAULT GOALS TRIGGER
-- Every new pet gets walk_duration (60 min) and meal_count (2) goals by default.
-- Users can edit/replace these later (Pro: any slot, any goal type).
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_pet()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO pet_daily_goals (pet_id, goal_type, target_value, target_unit, hero_card_slot)
  VALUES
    (NEW.id, 'walk_duration', 60, 'minutes', 1),
    (NEW.id, 'meal_count',     2, 'count',   2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pet_created
  AFTER INSERT ON pets
  FOR EACH ROW EXECUTE FUNCTION handle_new_pet();

-- ============================================================================
-- FUNCTION: get_pet_goal_progress
-- Returns each active goal for a pet with today's computed progress.
-- p_utc_offset_minutes: client's UTC offset (e.g. -300 for UTC-5, 330 for UTC+5:30)
-- so "today" is evaluated in the user's local timezone.
-- React Native: pass -new Date().getTimezoneOffset()
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pet_goal_progress(
  p_pet_id             UUID,
  p_utc_offset_minutes INTEGER DEFAULT 0
)
RETURNS TABLE(
  goal_id        UUID,
  goal_type      TEXT,
  target_value   NUMERIC,
  target_unit    TEXT,
  hero_card_slot SMALLINT,
  current_value  NUMERIC
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
    g.id,
    g.goal_type::TEXT,
    g.target_value,
    g.target_unit,
    g.hero_card_slot,
    CASE g.goal_type
      WHEN 'walk_distance' THEN COALESCE((
        SELECT SUM(
          CASE g.target_unit
            WHEN 'miles' THEN w.distance_meters * 0.000621371
            WHEN 'km'    THEN w.distance_meters / 1000.0
            ELSE w.distance_meters
          END
        )
        FROM activity_logs al
        JOIN walks w ON w.activity_log_id = al.id
        WHERE al.pet_id = p_pet_id
          AND al.type = 'walk'
          AND al.occurred_at >= today_start
          AND al.occurred_at <  today_end
          AND w.distance_meters IS NOT NULL
      ), 0)
      WHEN 'walk_duration' THEN COALESCE((
        SELECT SUM(
          CASE g.target_unit
            WHEN 'minutes' THEN w.duration_sec / 60.0
            WHEN 'hours'   THEN w.duration_sec / 3600.0
            ELSE w.duration_sec
          END
        )
        FROM activity_logs al
        JOIN walks w ON w.activity_log_id = al.id
        WHERE al.pet_id = p_pet_id
          AND al.type = 'walk'
          AND al.occurred_at >= today_start
          AND al.occurred_at <  today_end
          AND w.duration_sec IS NOT NULL
      ), 0)
      WHEN 'meal_count' THEN COALESCE((
        SELECT COUNT(*)::NUMERIC
        FROM activity_logs
        WHERE pet_id  = p_pet_id
          AND type    = 'feeding'
          AND occurred_at >= today_start
          AND occurred_at <  today_end
      ), 0)
    END AS current_value
  FROM pet_daily_goals g
  WHERE g.pet_id   = p_pet_id
    AND g.is_active = true
  ORDER BY g.hero_card_slot NULLS LAST;
END;
$$;

-- ============================================================================
-- FUNCTION: get_next_upcoming_event
-- Returns the single nearest health event across vaccinations, vet follow-ups,
-- and medication refills. Returns 0 rows when everything is up to date.
-- Named generically for future extensibility beyond health events.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_upcoming_event(p_pet_id UUID)
RETURNS TABLE(
  event_type TEXT,
  title      TEXT,
  due_date   DATE,
  days_until INTEGER
)
SECURITY DEFINER STABLE SET search_path = public
LANGUAGE sql AS $$
  SELECT event_type, title, due_date, (due_date - CURRENT_DATE)::INTEGER AS days_until
  FROM (
    -- Vaccinations (current, due soon, or overdue)
    SELECT
      'vaccination'::TEXT AS event_type,
      name                AS title,
      next_due_date       AS due_date
    FROM vaccinations
    WHERE pet_id       = p_pet_id
      AND next_due_date IS NOT NULL
      AND status       IN ('current', 'due_soon', 'overdue')

    UNION ALL

    -- Vet follow-up appointments (future only)
    SELECT
      'vet_visit',
      COALESCE(reason, 'Vet follow-up'),
      follow_up_date
    FROM vet_visits
    WHERE pet_id         = p_pet_id
      AND follow_up_date IS NOT NULL
      AND follow_up_date >= CURRENT_DATE

    UNION ALL

    -- Medication refills (upcoming + up to 7 days overdue)
    SELECT
      'medication_refill',
      name || ' refill',
      refill_date
    FROM medications
    WHERE pet_id     = p_pet_id
      AND status     = 'active'
      AND refill_date IS NOT NULL
      AND refill_date >= CURRENT_DATE - interval '7 days'
  ) events
  ORDER BY due_date ASC
  LIMIT 1;
$$;
