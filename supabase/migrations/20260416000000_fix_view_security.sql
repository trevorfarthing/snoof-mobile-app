-- Fix active_medications view to use SECURITY INVOKER so it respects the
-- querying user's RLS policies instead of running as the view creator.
-- PostgreSQL defaults to SECURITY DEFINER for views; Supabase flags this
-- as a security risk because it bypasses row-level security.

CREATE OR REPLACE VIEW active_medications
WITH (security_invoker = true)
AS
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
