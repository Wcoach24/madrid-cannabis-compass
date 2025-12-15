-- Add google_place_id column to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Update Vallehermoso club with correct data from Google Business Profile
UPDATE clubs 
SET 
  name = 'Vallehermoso Club Social Madrid',
  slug = 'vallehermoso-club-social-madrid',
  address = 'C. de Casarrubuelos, Chamberí',
  postal_code = '28015',
  website_url = 'https://weedmadrid.com',
  google_place_id = 'ChIJ7Z2SYXEpQg0R0_RjmwNLhGA',
  seo_title = 'Vallehermoso Club Social Madrid | Cannabis Club Chamberí',
  seo_description = 'Vallehermoso Club Social Madrid in Chamberí district. Tourist-friendly verified cannabis social club. Same-day invitation access available.',
  timetable = '{
    "sunday": {"open": "11:00", "close": "01:00", "closed": false},
    "monday": {"open": "11:00", "close": "23:00", "closed": false},
    "tuesday": {"open": "11:00", "close": "23:00", "closed": false},
    "wednesday": {"open": "11:00", "close": "23:00", "closed": false},
    "thursday": {"open": "11:00", "close": "23:00", "closed": false},
    "friday": {"open": "11:00", "close": "01:00", "closed": false},
    "saturday": {"open": "11:00", "close": "01:00", "closed": false}
  }'::jsonb,
  updated_at = now()
WHERE slug = 'chamberi-club-social-madrid';