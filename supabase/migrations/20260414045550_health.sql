-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE medication_frequency AS ENUM (
  'once_daily', 'twice_daily', 'three_times_daily',
  'every_other_day', 'weekly', 'biweekly', 'monthly', 'as_needed', 'custom'
);
CREATE TYPE medication_status AS ENUM ('active', 'completed', 'discontinued', 'paused');
CREATE TYPE vaccination_status AS ENUM ('current', 'due_soon', 'overdue', 'not_applicable');
CREATE TYPE document_type AS ENUM (
  'vet_record', 'lab_result', 'xray', 'vaccination_cert',
  'insurance', 'adoption', 'registration', 'other'
);

-- ============================================================================
-- MODULE 2: HEALTH & VETERINARY
-- ============================================================================

-- Medications (active prescriptions and supplements)
CREATE TABLE medications (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  dosage          TEXT,              -- e.g., "50mg", "1 tablet"
  frequency       medication_frequency NOT NULL DEFAULT 'once_daily',
  frequency_custom TEXT,             -- If frequency = 'custom', describe here
  instructions    TEXT,              -- "Give with food", etc.
  prescribed_by   TEXT,              -- Vet name
  start_date      DATE,
  end_date        DATE,              -- NULL = ongoing
  status          medication_status NOT NULL DEFAULT 'active',
  refill_date     DATE,              -- Next refill due
  remaining_count INTEGER,           -- Pills/doses remaining
  is_preventative BOOLEAN DEFAULT false,  -- Flea/tick, heartworm, etc.
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_medications_pet ON medications(pet_id, status);

-- Medication administration log (when a dose was actually given)
CREATE TABLE medication_logs (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  medication_id   UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  administered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  administered_by UUID REFERENCES profiles(id),
  skipped         BOOLEAN DEFAULT false,
  skip_reason     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medication_logs_med ON medication_logs(medication_id, administered_at DESC);
CREATE INDEX idx_medication_logs_pet ON medication_logs(pet_id, administered_at DESC);

-- Vaccinations
CREATE TABLE vaccinations (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,      -- e.g., "Rabies", "DHPP", "Bordetella"
  date_given      DATE NOT NULL,
  next_due_date   DATE,
  administering_vet TEXT,
  lot_number      TEXT,
  status          vaccination_status NOT NULL DEFAULT 'current',
  document_id     UUID,               -- Link to uploaded certificate
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vaccinations_pet ON vaccinations(pet_id);
CREATE INDEX idx_vaccinations_due ON vaccinations(next_due_date) WHERE status != 'not_applicable';

-- Vet visits
CREATE TABLE vet_visits (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  visit_date      DATE NOT NULL,
  vet_name        TEXT,
  clinic_name     TEXT,
  reason          TEXT NOT NULL,       -- "Annual checkup", "Limping", etc.
  diagnosis       TEXT,
  treatment       TEXT,
  cost            DECIMAL(10,2),
  follow_up_date  DATE,
  notes           TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_vet_visits_pet ON vet_visits(pet_id, visit_date DESC);

-- Weight history (tracked over time for charts)
CREATE TABLE weight_logs (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_lbs      DECIMAL(6,2) NOT NULL,
  measured_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  logged_by       UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_weight_logs_pet ON weight_logs(pet_id, measured_at DESC);

-- Document storage (vet records, lab results, x-rays, etc.)
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type            document_type NOT NULL DEFAULT 'other',
  title           TEXT NOT NULL,
  description     TEXT,
  storage_path    TEXT NOT NULL,       -- Supabase Storage path
  file_size_bytes BIGINT,
  mime_type       TEXT,
  related_visit_id UUID REFERENCES vet_visits(id),  -- Optional link to a vet visit
  uploaded_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_documents_pet ON documents(pet_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Core principle: Users can only access data belonging to households
-- they are active members of.

-- ---- Enable RLS on all tables ----
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ---- Pet-scoped tables (shared pattern) ----
-- For tables with pet_id: resolve household through pets table.

-- Apply pet-scoped policies to all pet-linked tables
-- (Using a consistent pattern for readability)

-- MEDICATIONS
CREATE POLICY meds_select ON medications
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY meds_insert ON medications
  FOR INSERT WITH CHECK (can_access_pet(pet_id));
CREATE POLICY meds_update ON medications
  FOR UPDATE USING (can_access_pet(pet_id));

-- MEDICATION LOGS
CREATE POLICY med_logs_select ON medication_logs
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY med_logs_insert ON medication_logs
  FOR INSERT WITH CHECK (can_access_pet(pet_id));

-- VACCINATIONS
CREATE POLICY vax_select ON vaccinations
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY vax_insert ON vaccinations
  FOR INSERT WITH CHECK (can_access_pet(pet_id));
CREATE POLICY vax_update ON vaccinations
  FOR UPDATE USING (can_access_pet(pet_id));

-- VET VISITS
CREATE POLICY vet_select ON vet_visits
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY vet_insert ON vet_visits
  FOR INSERT WITH CHECK (can_access_pet(pet_id));
CREATE POLICY vet_update ON vet_visits
  FOR UPDATE USING (can_access_pet(pet_id));

-- WEIGHT LOGS
CREATE POLICY weight_select ON weight_logs
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY weight_insert ON weight_logs
  FOR INSERT WITH CHECK (can_access_pet(pet_id));

-- DOCUMENTS
CREATE POLICY docs_select ON documents
  FOR SELECT USING (can_access_pet(pet_id));
CREATE POLICY docs_insert ON documents
  FOR INSERT WITH CHECK (can_access_pet(pet_id));
CREATE POLICY docs_delete ON documents
  FOR DELETE USING (can_access_pet(pet_id));

-- ============================================================================
-- USEFUL VIEWS (for dashboard queries)
-- ============================================================================

  -- Active medications needing attention
CREATE OR REPLACE VIEW active_medications AS
SELECT
  m.*,
  p.name AS pet_name,
  (
    SELECT MAX(ml.administered_at)
    FROM medication_logs ml
    WHERE ml.medication_id = m.id
  ) AS last_administered
FROM medications m
JOIN pets p ON p.id = m.pet_id
WHERE m.status = 'active'
ORDER BY m.pet_id, m.name;