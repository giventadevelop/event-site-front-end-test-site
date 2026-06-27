-- Fix tenant_settings table schema to match backend expectations
-- Add missing columns for homepage section visibility

ALTER TABLE tenant_settings 
ADD COLUMN IF NOT EXISTS show_events_section_in_home_page BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_team_members_section_in_home_page BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_sponsors_section_in_home_page BOOLEAN DEFAULT true;

-- Update existing records with default values if columns were just added
UPDATE tenant_settings 
SET 
    show_events_section_in_home_page = true,
    show_team_members_section_in_home_page = true,
    show_sponsors_section_in_home_page = true
WHERE 
    show_events_section_in_home_page IS NULL 
    OR show_team_members_section_in_home_page IS NULL 
    OR show_sponsors_section_in_home_page IS NULL;

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tenant_settings' 
ORDER BY ordinal_position;
