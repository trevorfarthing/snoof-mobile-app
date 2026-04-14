-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  26214400, -- 25 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================
-- Path convention: {pet_id}/{filename}
-- The pet_id prefix lets us reuse can_access_pet() for all household checks.

CREATE POLICY "docs_storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    can_access_pet(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "docs_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    can_access_pet(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "docs_storage_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    can_access_pet(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "docs_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    can_access_pet(((storage.foldername(name))[1])::uuid)
  );
