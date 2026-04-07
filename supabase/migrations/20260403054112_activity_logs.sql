-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE activity_type AS ENUM (
  'walk', 'feeding', 'potty', 'medication', 'water',
  'sleep', 'training', 'grooming', 'vet_visit', 'play', 'other'
);
CREATE TYPE potty_type AS ENUM ('pee', 'poo', 'both');
CREATE TYPE potty_consistency AS ENUM ('normal', 'soft', 'hard', 'liquid', 'bloody', 'mucus');

-- ============================================================================
-- MODULE 4: DAILY ACTIVITY & ROUTINES
-- ============================================================================

-- Unified activity log — the backbone of the daily dashboard.
-- Each quick-log tap creates one row here.
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  household_id    UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  type            activity_type NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(), -- When the actual activity took place
  logged_by       UUID REFERENCES profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB DEFAULT '{}'::jsonb  -- Type-specific extra data
);

CREATE INDEX idx_activity_logs_pet_date ON activity_logs(pet_id, occurred_at DESC);
CREATE INDEX idx_activity_logs_household_date ON activity_logs(household_id, occurred_at DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(pet_id, type, occurred_at DESC);

-- Walk-specific data (extends activity_logs where type = 'walk')
CREATE TABLE walks (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE,
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ,
  duration_sec    INTEGER,
  distance_meters DECIMAL(10,2),
  route           extensions.GEOMETRY(LineString, 4326),  -- PostGIS GPS route
  avg_pace        DECIMAL(6,2),                -- minutes per mile/km
  calories_est    INTEGER,                     -- Estimated calories burned
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB DEFAULT '{}'::jsonb     -- Weather, terrain, etc.
);

CREATE INDEX idx_walks_pet ON walks(pet_id, started_at DESC);
CREATE INDEX idx_walks_route ON walks USING GIST(route);  -- Spatial index

-- Feeding-specific data (extends activity_logs where type = 'feeding')
CREATE TABLE feedings (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE,
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  food_name       TEXT,                -- Brand/type of food
  food_type       TEXT,                -- 'kibble', 'wet', 'raw', 'homemade', 'treat'
  amount          DECIMAL(8,2),        -- Quantity
  amount_unit     TEXT DEFAULT 'cups', -- 'cups', 'grams', 'oz', 'scoops'
  meal_label      TEXT,                -- 'breakfast', 'lunch', 'dinner', 'snack'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedings_pet ON feedings(pet_id, created_at DESC);

-- Potty-specific data (extends activity_logs where type = 'potty')
CREATE TABLE potty_logs (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE,
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  potty_type      potty_type NOT NULL DEFAULT 'both',
  consistency     potty_consistency DEFAULT 'normal',
  location        TEXT,                -- 'backyard', 'walk', 'indoor accident'
  is_accident     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_potty_logs_pet ON potty_logs(pet_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Core principle: Users can only access data belonging to households
-- they are active members of.

-- ---- Enable RLS on all tables ----
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE potty_logs ENABLE ROW LEVEL SECURITY;

-- ACTIVITY LOGS
CREATE POLICY activity_logs_select ON activity_logs
  FOR SELECT USING (household_id IN (SELECT get_user_household_ids()));
CREATE POLICY activity_logs_insert ON activity_logs
  FOR INSERT WITH CHECK (household_id IN (SELECT get_user_household_ids()));
CREATE POLICY activity_logs_update ON activity_logs
  FOR UPDATE USING (household_id IN (SELECT get_user_household_ids()));

-- Helper function: check if user has access to a pet
CREATE OR REPLACE FUNCTION can_access_pet(p_id UUID)
RETURNS BOOLEAN 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pets
    WHERE id = p_id
      AND household_id IN (SELECT get_user_household_ids())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- Pet-scoped tables (shared pattern) ----
-- For tables with pet_id: resolve household through pets table.

-- Apply pet-scoped policies to all pet-linked tables
-- (Using a consistent pattern for readability)

  -- WALKS
CREATE POLICY walks_select ON walks
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY walks_insert ON walks
  FOR INSERT WITH CHECK (can_access_pet(pet_id));

-- FEEDINGS
CREATE POLICY feedings_select ON feedings
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY feedings_insert ON feedings
  FOR INSERT WITH CHECK (can_access_pet(pet_id));

-- POTTY LOGS
CREATE POLICY potty_select ON potty_logs
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY potty_insert ON potty_logs
  FOR INSERT WITH CHECK (can_access_pet(pet_id));