-- Add view_count column to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(service_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.services
  SET view_count = view_count + 1
  WHERE id = service_id;
END;
$$;
