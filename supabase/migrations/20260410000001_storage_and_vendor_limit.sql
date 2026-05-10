-- Storage bucket for service images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload service images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'service-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: anyone can view public images
CREATE POLICY "Public can view service images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'service-images');

-- RLS: owners can delete their own images
CREATE POLICY "Users can delete own service images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'service-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Vendor service limit: max 5 services per vendor
CREATE OR REPLACE FUNCTION public.check_vendor_service_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.services
    WHERE vendor_id = NEW.vendor_id
  ) >= 5 THEN
    RAISE EXCEPTION 'Maksimum 5 xidmət əlavə edə bilərsiniz';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_vendor_service_limit ON public.services;
CREATE TRIGGER enforce_vendor_service_limit
  BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.check_vendor_service_limit();

-- Admin can delete any service
CREATE POLICY "Admins can delete any service"
ON public.services FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Vendors can delete their own services
CREATE POLICY "Vendors can delete own services"
ON public.services FOR DELETE TO authenticated
USING (auth.uid() = vendor_id);
