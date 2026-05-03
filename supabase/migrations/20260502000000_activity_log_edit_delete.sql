-- ============================================================================
-- ACTIVITY LOG EDIT / DELETE
-- Adds updated_at to every table with an activity_log_id FK (and the parent
-- activity_logs), plus updated_by on activity_logs. Adds the RLS policies
-- needed to UPDATE / DELETE these rows from the client.
-- ============================================================================

-- updated_by belongs on the parent: it tracks who edited the log overall.
ALTER TABLE activity_logs
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- updated_at on every child table that does not already have it.
-- vaccinations and vet_visits already have updated_at — do not re-add.
ALTER TABLE walks            ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE feedings         ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE potty_logs       ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE medication_logs  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE weight_logs      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================================================
-- Re-attach the set_updated_at trigger to every table with an updated_at
-- column. Idempotent: skips tables that already have the trigger.
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
-- RLS: DELETE on the parent + UPDATE/DELETE on every child with
-- activity_log_id. activity_logs already has a SELECT/INSERT/UPDATE policy;
-- vaccinations and vet_visits already have UPDATE.
-- ============================================================================

CREATE POLICY activity_logs_delete ON activity_logs
  FOR DELETE USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY walks_update      ON walks            FOR UPDATE USING (can_access_pet(pet_id));
CREATE POLICY walks_delete      ON walks            FOR DELETE USING (can_access_pet(pet_id));
CREATE POLICY feedings_update   ON feedings         FOR UPDATE USING (can_access_pet(pet_id));
CREATE POLICY feedings_delete   ON feedings         FOR DELETE USING (can_access_pet(pet_id));
CREATE POLICY potty_update      ON potty_logs       FOR UPDATE USING (can_access_pet(pet_id));
CREATE POLICY potty_delete      ON potty_logs       FOR DELETE USING (can_access_pet(pet_id));
CREATE POLICY med_logs_update   ON medication_logs  FOR UPDATE USING (can_access_pet(pet_id));
CREATE POLICY med_logs_delete   ON medication_logs  FOR DELETE USING (can_access_pet(pet_id));
CREATE POLICY weight_update     ON weight_logs      FOR UPDATE USING (can_access_pet(pet_id));
CREATE POLICY weight_delete     ON weight_logs      FOR DELETE USING (can_access_pet(pet_id));
CREATE POLICY vax_delete        ON vaccinations     FOR DELETE USING (can_access_pet(pet_id));
CREATE POLICY vet_delete        ON vet_visits       FOR DELETE USING (can_access_pet(pet_id));
