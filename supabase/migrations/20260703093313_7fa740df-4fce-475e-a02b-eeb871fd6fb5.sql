
-- Talents write own files (folder = user id)
DROP POLICY IF EXISTS "Own uploads insert" ON storage.objects;
CREATE POLICY "Own uploads insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('avatars','resumes','verification-docs')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Own uploads update" ON storage.objects;
CREATE POLICY "Own uploads update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('avatars','resumes','verification-docs')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Own uploads delete" ON storage.objects;
CREATE POLICY "Own uploads delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('avatars','resumes','verification-docs')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Own uploads read" ON storage.objects;
CREATE POLICY "Own uploads read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('avatars','resumes','verification-docs')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Staff read all uploads" ON storage.objects;
CREATE POLICY "Staff read all uploads" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('avatars','resumes','verification-docs')
    AND public.is_staff(auth.uid())
  );
