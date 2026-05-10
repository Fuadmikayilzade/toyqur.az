-- Add edit_count to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS edit_count integer NOT NULL DEFAULT 0;

-- Update RLS: vendors can only update if edit_count < 2
-- (enforced in app layer, but also add a check constraint)
ALTER TABLE services ADD CONSTRAINT max_edits_check CHECK (edit_count <= 2);
