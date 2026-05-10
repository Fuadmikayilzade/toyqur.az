-- Add listing_code column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS listing_code VARCHAR(6);

-- Generate codes for existing services that don't have one
UPDATE services
SET listing_code = LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
WHERE listing_code IS NULL;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS services_listing_code_unique ON services(listing_code);

-- Create a function to generate unique listing codes
CREATE OR REPLACE FUNCTION generate_listing_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  new_code VARCHAR(6);
  exists_count INTEGER;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    SELECT COUNT(*) INTO exists_count FROM services WHERE listing_code = new_code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate listing_code on insert
CREATE OR REPLACE FUNCTION set_listing_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_code IS NULL OR NEW.listing_code = '' THEN
    NEW.listing_code := generate_listing_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_listing_code ON services;
CREATE TRIGGER trigger_set_listing_code
  BEFORE INSERT ON services
  FOR EACH ROW
  EXECUTE FUNCTION set_listing_code();
