-- ============================================================================
-- PET INSIGHTS
--
-- Caches the most recent AI-generated insight for each pet.
-- One row per pet (upserted on each regeneration by the edge function).
-- context_hash is an MD5 of the context JSON + time_of_day; if it matches
-- the cached row, the edge function skips the Gemini call and returns the
-- cached text.
--
-- Users have read access only. All writes go through the
-- generate-pet-insight edge function using the service role key.
-- ============================================================================

CREATE TABLE pet_insights (
  pet_id        UUID        PRIMARY KEY REFERENCES pets(id) ON DELETE CASCADE,
  insight_text  TEXT        NOT NULL,
  time_of_day   TEXT        NOT NULL CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  context_hash  TEXT        NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pet_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY pet_insights_select ON pet_insights
  FOR SELECT USING (can_access_pet(pet_id));

-- ============================================================================
-- FUNCTION: get_pet_insight_context
--
-- Returns a single JSONB payload that the generate-pet-insight edge function
-- sends to the AI model. Centralised here so the edge function stays thin and
-- so future data points can be added in one place (see TODO block below).
--
-- p_local_today — the user's local date (derived from their UTC offset).
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pet_insight_context(
  p_pet_id      UUID,
  p_local_today DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
SECURITY DEFINER STABLE SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN jsonb_build_object(

    /* ── Pet profile ──────────────────────────────────────────────────── */
    'pet', (
      SELECT jsonb_build_object(
        'name',         p.name,
        'species',      p.species,
        'breed',        p.breed,
        'age_years',    EXTRACT(YEAR FROM AGE(p_local_today, p.date_of_birth::DATE)),
        'weight_lbs',   p.weight_lbs,
        'sex',          p.sex,
        'spay_neuter',  p.spay_neuter
      )
      FROM pets p WHERE p.id = p_pet_id
    ),

    /* ── Care streak ──────────────────────────────────────────────────── */
    'streak', (
      SELECT jsonb_build_object(
        'current', ps.current_streak,
        'longest', ps.longest_streak
      )
      FROM pet_streaks ps WHERE ps.pet_id = p_pet_id
    ),

    /* ── Today's activity (detail) ────────────────────────────────────── */
    'today_logs', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'type',              al.type,
          'occurred_at',       al.occurred_at,
          'walk_distance_m',   w.distance_meters,
          'walk_duration_s',   w.duration_sec,
          'meal_label',        f.meal_label,
          'food_name',         f.food_name,
          'potty_type',        pl.potty_type
        ) ORDER BY al.occurred_at
      ), '[]'::jsonb)
      FROM activity_logs al
      LEFT JOIN walks       w  ON w.activity_log_id  = al.id
      LEFT JOIN feedings    f  ON f.activity_log_id  = al.id
      LEFT JOIN potty_logs  pl ON pl.activity_log_id = al.id
      WHERE al.pet_id = p_pet_id AND al.local_day = p_local_today
    ),

    /* ── Days with any logs (used by client to gate the insight) ──────── */
    'days_with_logs_total', (
      SELECT COUNT(DISTINCT local_day)
      FROM activity_logs
      WHERE pet_id = p_pet_id
    ),

    /* ── Walk trends: last 7d vs prev 7d, count over 30d ─────────────── */
    'walk_trends', (
      SELECT jsonb_build_object(
        'avg_distance_m_7d',     ROUND(AVG(
          CASE WHEN al.local_day >= p_local_today - 6
          THEN w.distance_meters END
        )::NUMERIC, 1),
        'avg_distance_m_prev7d', ROUND(AVG(
          CASE WHEN al.local_day >= p_local_today - 13
               AND al.local_day <  p_local_today - 6
          THEN w.distance_meters END
        )::NUMERIC, 1),
        'avg_duration_s_7d',     ROUND(AVG(
          CASE WHEN al.local_day >= p_local_today - 6
          THEN w.duration_sec END
        )::NUMERIC, 0),
        'avg_duration_s_prev7d', ROUND(AVG(
          CASE WHEN al.local_day >= p_local_today - 13
               AND al.local_day <  p_local_today - 6
          THEN w.duration_sec END
        )::NUMERIC, 0),
        'count_30d', COUNT(CASE WHEN al.local_day >= p_local_today - 29 THEN 1 END)
      )
      FROM activity_logs al
      JOIN walks w ON w.activity_log_id = al.id
      WHERE al.pet_id    = p_pet_id
        AND al.local_day >= p_local_today - 29
        AND al.type      = 'walk'
    ),

    /* ── Feeding trends: avg meals/day over 30d vs prev 30d ──────────── */
    'feeding_trends', (
      SELECT jsonb_build_object(
        'avg_meals_per_day_30d',     ROUND(
          COUNT(CASE WHEN al.local_day >= p_local_today - 29 THEN 1 END
          )::NUMERIC / 30, 2),
        'avg_meals_per_day_prev30d', ROUND(
          COUNT(CASE WHEN al.local_day >= p_local_today - 59
                      AND al.local_day <  p_local_today - 29 THEN 1 END
          )::NUMERIC / 30, 2)
      )
      FROM activity_logs al
      JOIN feedings f ON f.activity_log_id = al.id
      WHERE al.pet_id    = p_pet_id
        AND al.local_day >= p_local_today - 59
        AND al.type      = 'feeding'
        AND COALESCE(f.food_type,   '') != 'treat'
        AND COALESCE(f.meal_label,  '') != 'snack'
    ),

    /* ── Last 3 weight logs ───────────────────────────────────────────── */
    'weight_recent', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'weight_lbs', wl.weight_lbs,
          'measured_at', wl.measured_at
        ) ORDER BY wl.measured_at DESC
      ), '[]'::jsonb)
      FROM (
        SELECT weight_lbs, measured_at
        FROM weight_logs
        WHERE pet_id = p_pet_id
        ORDER BY measured_at DESC
        LIMIT 3
      ) wl
    ),

    /* ── Active medications ───────────────────────────────────────────── */
    'active_medications', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name',        m.name,
        'frequency',   m.frequency,
        'refill_date', m.refill_date,
        'end_date',    m.end_date
      )), '[]'::jsonb)
      FROM medications m
      WHERE m.pet_id = p_pet_id
        AND m.status = 'active'
    ),

    /* ── Vaccinations due in the next 30 days ────────────────────────── */
    'upcoming_vaccinations', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name',          v.name,
        'next_due_date', v.next_due_date
      )), '[]'::jsonb)
      FROM vaccinations v
      WHERE v.pet_id         = p_pet_id
        AND v.next_due_date IS NOT NULL
        AND v.next_due_date  >= p_local_today
        AND v.next_due_date  <= p_local_today + 30
    )

    /*
     * TODO: Add additional context blocks as new features are built:
     * - training_sessions (commands practiced, session frequency trends)
     * - vet_visits (last visit date, upcoming appointments)
     * - inventory_items (low stock alerts)
     * - expenses (monthly spend trends)
     * - behaviors (flagged behaviors and frequency)
     */
  );
END;
$$;
