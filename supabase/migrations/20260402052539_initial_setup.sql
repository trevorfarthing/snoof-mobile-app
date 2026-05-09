-- ============================================================================
-- SNOOF - Supabase Database Schema
-- Version: 1.0 (MVP + Future-proofing)
-- Updated: March 2026
--
-- Architecture:
--   Household → Users (many)
--   Household → Pets (many)
--   Pet → [all tracking tables]
--   User → [activity logs via logged_by]
--
-- Conventions:
--   - All tables use UUID primary keys
--   - created_at / updated_at on every table
--   - Soft deletes via deleted_at where appropriate
--   - JSONB metadata columns for flexibility without migrations
--   - RLS policies enforce household-level isolation
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;  -- For GPS walk tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE household_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'other');  -- Dog-first, but extensible
CREATE TYPE pet_sex AS ENUM ('male', 'female', 'unknown');
CREATE TYPE spay_neuter_status AS ENUM ('spayed', 'neutered', 'intact', 'unknown');


-- ============================================================================
-- CORE: HOUSEHOLDS & USERS
-- ============================================================================

-- Households are the top-level organizational unit.
-- All pet data belongs to a household, enabling multi-user coordination.
CREATE TABLE households (
  id            UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name          TEXT NOT NULL DEFAULT 'My Household',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata      JSONB DEFAULT '{}'::jsonb  -- Future: timezone, locale, settings
);

-- User profiles extend Supabase auth.users.
-- Every authenticated user has exactly one profile.
ALTER TABLE profiles
ADD COLUMN timezone TEXT DEFAULT 'America/Los_Angeles',
ADD COLUMN push_token TEXT,  -- For push notifications
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT;

ALTER TABLE profiles ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE profiles ALTER COLUMN updated_at SET NOT NULL;

-- Junction table: users belong to households with a role.
-- A user can belong to multiple households (e.g., co-parenting).
CREATE TABLE household_members (
  id            UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          household_role NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active     BOOLEAN NOT NULL DEFAULT true,

  UNIQUE(household_id, user_id)
);

CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);

-- Invitations for adding new members to a household.
CREATE TABLE household_invites (
  id            UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  invited_by    UUID NOT NULL REFERENCES profiles(id),
  invited_email TEXT NOT NULL,
  role          household_role NOT NULL DEFAULT 'member',
  status        invite_status NOT NULL DEFAULT 'pending',
  token         TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at  TIMESTAMPTZ
);

-- ============================================================================
-- MODULE 1: PET PROFILES & IDENTITY
-- ============================================================================

CREATE TABLE pets (
  id                UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  household_id      UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  species           pet_species NOT NULL DEFAULT 'dog',
  breed             TEXT,                   -- Primary breed
  breed_secondary   TEXT,                   -- For mixes
  date_of_birth     DATE,
  is_dob_estimated  BOOLEAN DEFAULT false,  -- Many rescues don't know exact DOB
  sex               pet_sex DEFAULT 'unknown',
  spay_neuter       spay_neuter_status DEFAULT 'unknown',
  color             TEXT,
  weight_lbs        DECIMAL(6,2),           -- Current weight (also tracked over time)
  microchip_number  TEXT,
  license_number    TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  avatar_url        TEXT,
  sort_order        INTEGER DEFAULT 0,      -- For pet switcher ordering
  is_active         BOOLEAN NOT NULL DEFAULT true,  -- Soft deactivate (passed away, rehomed)
  deactivated_at    TIMESTAMPTZ,
  deactivated_reason TEXT,                  -- 'passed_away', 'rehomed', etc.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata          JSONB DEFAULT '{}'::jsonb  -- Future: AKC registration, adoption date, etc.
);

CREATE INDEX idx_pets_household ON pets(household_id);
CREATE INDEX idx_pets_active ON pets(household_id, is_active);

-- ============================================================================
-- HELPER: updated_at TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
    GROUP BY table_name
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- HELPER: Auto-create profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Create a profile for the new user
  INSERT INTO profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  -- Create a default household for the new user
  new_household_id := extensions.uuid_generate_v4();
  INSERT INTO households (id, name) VALUES (new_household_id, 'My Household');

  -- Make them the owner of that household
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (new_household_id, NEW.id, 'owner');

    -- TODO!
    -- Create a free subscription for the household
    --   INSERT INTO subscriptions (household_id, tier)
    --   VALUES (new_household_id, 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Core principle: Users can only access data belonging to households
-- they are active members of.

-- Helper function: get all household IDs for the current user
CREATE OR REPLACE FUNCTION get_user_household_ids()
RETURNS SETOF UUID 
SET search_path = public
AS $$
  SELECT household_id FROM household_members
  WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is admin/owner of a specific household
CREATE OR REPLACE FUNCTION is_household_admin(h_id UUID)
RETURNS BOOLEAN 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = h_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- Enable RLS on all tables ----

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- ---- Profiles ----

CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = (select auth.uid())
    OR id IN (
      SELECT hm.user_id FROM household_members hm
      WHERE hm.household_id IN (SELECT get_user_household_ids())
        AND hm.is_active = true
    )
  );

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = (select auth.uid()));

-- ---- Households ----

CREATE POLICY households_select ON households
  FOR SELECT USING (id IN (SELECT get_user_household_ids()));

CREATE POLICY households_update ON households
  FOR UPDATE USING (is_household_admin(id));

-- ---- Household Members ----

CREATE POLICY hm_select ON household_members
  FOR SELECT USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY hm_insert ON household_members
  FOR INSERT WITH CHECK (is_household_admin(household_id));

CREATE POLICY hm_update ON household_members
  FOR UPDATE USING (is_household_admin(household_id));

CREATE POLICY hm_delete ON household_members
  FOR DELETE USING (is_household_admin(household_id) OR user_id = (select auth.uid()));

-- ---- Household-scoped tables (shared pattern) ----
-- For tables with household_id column: members can read, members can write.

-- Macro-like approach: apply the same pattern to household-level tables.
-- (Pets, activity_logs, expenses, inventory, reminders, snoof_ai_conversations)

-- PETS
CREATE POLICY pets_select ON pets
  FOR SELECT USING (household_id IN (SELECT get_user_household_ids()));
CREATE POLICY pets_insert ON pets
  FOR INSERT WITH CHECK (household_id IN (SELECT get_user_household_ids()));
CREATE POLICY pets_update ON pets
  FOR UPDATE USING (household_id IN (SELECT get_user_household_ids()));
CREATE POLICY pets_delete ON pets
  FOR DELETE USING (is_household_admin(household_id));

-- HOUSEHOLD INVITES (admins can manage, invited user can view their own)
CREATE POLICY invites_select ON household_invites
  FOR SELECT USING (
    is_household_admin(household_id)
    OR invited_email = (SELECT email FROM profiles WHERE id = (select auth.uid()))
  );
CREATE POLICY invites_insert ON household_invites
  FOR INSERT WITH CHECK (is_household_admin(household_id));
CREATE POLICY invites_update ON household_invites
  FOR UPDATE USING (
    is_household_admin(household_id)
    OR invited_email = (SELECT email FROM profiles WHERE id = (select auth.uid()))
  );