-- 1. Storage bucket limitini 500MB-a qaldır (video yükləmələri üçün)
UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB
WHERE id = 'service-images';

-- 2. Dublikat storage upload policy-ni sil (ilk migration-da eyni ad var)
DROP POLICY IF EXISTS "Authenticated users can upload service images" ON storage.objects;

-- Düzgün versiyasını yenidən yarat
CREATE POLICY "Authenticated users can upload service images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'service-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Dublikat storage delete policy-ni sil
DROP POLICY IF EXISTS "Users can delete their own service images" ON storage.objects;

-- Düzgün versiyasını saxla (20260410 migration-dakı versiya artıq var)

-- 4. Dublikat services DELETE policy-ni sil
DROP POLICY IF EXISTS "Vendors can delete their own services" ON public.services;

-- Tək versiya saxla
CREATE POLICY "Vendors can delete their own services"
ON public.services FOR DELETE TO authenticated
USING (auth.uid() = vendor_id);
