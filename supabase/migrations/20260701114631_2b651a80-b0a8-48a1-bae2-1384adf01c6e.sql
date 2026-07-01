
-- RLS policies for the private talent-uploads bucket
CREATE POLICY "Talent can read own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Talent can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Talent can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Talent can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Staff can read all talent files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'talent-uploads' AND public.is_staff(auth.uid()));
