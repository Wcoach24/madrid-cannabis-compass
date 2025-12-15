-- Update existing clubs or insert new ones with real Google Place IDs

-- 1. Mística - Tetuán
INSERT INTO clubs (name, slug, description, summary, address, district, city, country, status, is_featured, is_tourist_friendly, is_verified, rating_editorial, rating_safety, rating_ambience, rating_location, languages, main_image_url, timetable, google_place_id, seo_title, seo_description)
VALUES (
  'Mística Cannabis Club',
  'mistica-cannabis-club-madrid',
  'Mística is a welcoming cannabis social club located in the Tetuán district of Madrid. Known for its relaxed atmosphere and quality cannabis selection, this club offers a comfortable space for members to enjoy responsibly. The club caters to both Spanish speakers and English-speaking tourists, making it accessible for international visitors.',
  'Welcoming cannabis club in Tetuán with quality selection and bilingual staff.',
  'Calle de San Benito 18, 28039 Madrid',
  'Tetuán',
  'Madrid',
  'ES',
  'active',
  false,
  true,
  true,
  4.2,
  4.3,
  4.1,
  4.0,
  ARRAY['es', 'en'],
  '/images/clubs/club-tetuan.jpg',
  '{"monday": {"open": "11:00", "close": "23:00"}, "tuesday": {"open": "11:00", "close": "23:00"}, "wednesday": {"open": "11:00", "close": "23:00"}, "thursday": {"open": "11:00", "close": "23:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "11:00", "close": "23:00"}}'::jsonb,
  'ChIJOW5Cvd4pQg0R0CU_lMEbJA0',
  'Mística Cannabis Club Madrid | Tetuán District',
  'Visit Mística cannabis club in Tetuán, Madrid. Bilingual staff, quality cannabis selection. Open daily 11:00-23:00.'
)
ON CONFLICT (slug) DO UPDATE SET
  google_place_id = EXCLUDED.google_place_id,
  address = EXCLUDED.address,
  timetable = EXCLUDED.timetable,
  languages = EXCLUDED.languages,
  is_verified = true,
  updated_at = now();

-- 2. Lúdico - Chamberí
INSERT INTO clubs (name, slug, description, summary, address, district, city, country, status, is_featured, is_tourist_friendly, is_verified, rating_editorial, rating_safety, rating_ambience, rating_location, languages, main_image_url, timetable, google_place_id, seo_title, seo_description)
VALUES (
  'Lúdico Cannabis Club',
  'ludico-cannabis-club-madrid',
  'Lúdico is a popular cannabis social club situated in the vibrant Chamberí neighborhood near Calle de Galileo. This club is known for its friendly community atmosphere and consistent quality. A favorite among local members seeking a reliable and comfortable space to enjoy cannabis in Madrid.',
  'Popular cannabis club in Chamberí with friendly atmosphere and local community vibe.',
  'Calle de Galileo, 28010 Madrid',
  'Chamberí',
  'Madrid',
  'ES',
  'active',
  false,
  true,
  true,
  4.3,
  4.4,
  4.2,
  4.5,
  ARRAY['es'],
  '/images/clubs/club-vallehermoso.jpg',
  '{"monday": {"open": "11:00", "close": "23:00"}, "tuesday": {"open": "11:00", "close": "23:00"}, "wednesday": {"open": "11:00", "close": "23:00"}, "thursday": {"open": "11:00", "close": "23:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "11:00", "close": "23:00"}}'::jsonb,
  'ChIJA2AsUgApQg0ReI3Xa5hqdE4',
  'Lúdico Cannabis Club Madrid | Chamberí',
  'Lúdico cannabis club in Chamberí, Madrid. Local community atmosphere with quality cannabis. Open daily 11:00-23:00.'
)
ON CONFLICT (slug) DO UPDATE SET
  google_place_id = EXCLUDED.google_place_id,
  address = EXCLUDED.address,
  timetable = EXCLUDED.timetable,
  is_verified = true,
  updated_at = now();

-- 3. Diamond Smokers Club - Centro
INSERT INTO clubs (name, slug, description, summary, address, district, city, country, status, is_featured, is_tourist_friendly, is_verified, rating_editorial, rating_safety, rating_ambience, rating_location, languages, main_image_url, timetable, google_place_id, seo_title, seo_description)
VALUES (
  'Diamond Smokers Club',
  'diamond-smokers-club-madrid',
  'Diamond Smokers Club is a premium cannabis social club located in the heart of Centro Madrid. Featured on Weedmaps, this club is known for its quality products and tourist-friendly service. With bilingual staff fluent in English and Spanish, it''s an excellent choice for international visitors looking for a reliable cannabis experience in central Madrid.',
  'Premium cannabis club in Centro Madrid, featured on Weedmaps with bilingual service.',
  'Centro, 28013 Madrid',
  'Centro',
  'Madrid',
  'ES',
  'active',
  true,
  true,
  true,
  4.5,
  4.6,
  4.4,
  4.8,
  ARRAY['es', 'en'],
  '/images/clubs/club-granvia.jpg',
  '{"monday": {"open": "14:00", "close": "23:00"}, "tuesday": {"open": "14:00", "close": "23:00"}, "wednesday": {"open": "14:00", "close": "23:00"}, "thursday": {"open": "14:00", "close": "23:00"}, "friday": {"open": "14:00", "close": "00:00"}, "saturday": {"open": "14:00", "close": "00:00"}, "sunday": {"open": "14:00", "close": "22:00"}}'::jsonb,
  'ChIJkV5hxMUnQg0RmPhZoqp5ZcY',
  'Diamond Smokers Club Madrid | Centro Premium',
  'Diamond Smokers Club in Centro Madrid. Premium cannabis, bilingual staff, tourist-friendly. Featured on Weedmaps.'
)
ON CONFLICT (slug) DO UPDATE SET
  google_place_id = EXCLUDED.google_place_id,
  address = EXCLUDED.address,
  timetable = EXCLUDED.timetable,
  languages = EXCLUDED.languages,
  is_featured = true,
  is_verified = true,
  updated_at = now();

-- 4. Bunny Social Club - Atocha
INSERT INTO clubs (name, slug, description, summary, address, district, city, country, status, is_featured, is_tourist_friendly, is_verified, rating_editorial, rating_safety, rating_ambience, rating_location, languages, main_image_url, timetable, google_place_id, seo_title, seo_description)
VALUES (
  'Bunny Social Club',
  'bunny-social-club-madrid',
  'Bunny Social Club is conveniently located near Atocha station, making it one of the most accessible cannabis clubs for tourists arriving in Madrid. The club offers a friendly environment with bilingual staff ready to welcome international visitors. Known for its convenient location and consistent quality, it''s a popular choice for travelers.',
  'Tourist-friendly cannabis club near Atocha station with excellent accessibility.',
  'Near Atocha Station, 28045 Madrid',
  'Arganzuela',
  'Madrid',
  'ES',
  'active',
  true,
  true,
  true,
  4.4,
  4.5,
  4.3,
  4.9,
  ARRAY['es', 'en'],
  '/images/clubs/club-atocha.jpg',
  '{"monday": {"open": "11:00", "close": "23:00"}, "tuesday": {"open": "11:00", "close": "23:00"}, "wednesday": {"open": "11:00", "close": "23:00"}, "thursday": {"open": "11:00", "close": "23:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "11:00", "close": "23:00"}}'::jsonb,
  'ChIJg6FxU3UnQg0Rc5DMybTUB_M',
  'Bunny Social Club Madrid | Near Atocha Station',
  'Bunny Social Club near Atocha station, Madrid. Tourist-friendly, bilingual staff. Open daily 11:00-23:00.'
)
ON CONFLICT (slug) DO UPDATE SET
  google_place_id = EXCLUDED.google_place_id,
  address = EXCLUDED.address,
  timetable = EXCLUDED.timetable,
  languages = EXCLUDED.languages,
  is_featured = true,
  is_verified = true,
  updated_at = now();

-- Verify the additions
SELECT name, slug, district, google_place_id, is_verified FROM clubs WHERE google_place_id IS NOT NULL ORDER BY name;