-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brand_name TEXT,
  brand_logo TEXT,
  brand_description TEXT,
  brand_phone1 TEXT,
  brand_phone2 TEXT,
  brand_address TEXT,
  brand_instagram TEXT,
  brand_whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor profiles are public"
  ON public.vendor_profiles FOR SELECT USING (true);

CREATE POLICY "Vendors can insert own profile"
  ON public.vendor_profiles FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own profile"
  ON public.vendor_profiles FOR UPDATE
  USING (auth.uid() = vendor_id);

CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
