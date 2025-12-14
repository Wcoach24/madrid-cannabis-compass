-- Add 6 more clubs to reach 15+ target
INSERT INTO clubs (name, slug, description, summary, address, district, city, country, status, is_featured, is_tourist_friendly, is_verified, rating_editorial, rating_safety, rating_ambience, rating_location, languages, main_image_url, timetable) VALUES

-- Club 10: Moncloa Cannabis Club
('Moncloa Cannabis Club', 'moncloa-cannabis-club-madrid', 
'Moncloa Cannabis Club is a vibrant social space located near Ciudad Universitaria, popular with students and young professionals. The club offers a diverse selection of cannabis strains in a modern, energetic environment. Known for its friendly community events and reasonable membership fees, it''s become a favorite among the younger crowd seeking quality cannabis in a social setting.',
'Vibrant student-friendly cannabis club near Ciudad Universitaria with modern amenities and social events.',
'Calle Isaac Peral 15', 'Moncloa-Aravaca', 'Madrid', 'ES', 'active', false, true, true, 
4.1, 4.3, 4.4, 4.2, ARRAY['es', 'en'], '/images/clubs/club-greenhouse.jpg',
'{"monday": {"open": "14:00", "close": "23:00"}, "tuesday": {"open": "14:00", "close": "23:00"}, "wednesday": {"open": "14:00", "close": "23:00"}, "thursday": {"open": "14:00", "close": "23:00"}, "friday": {"open": "14:00", "close": "01:00"}, "saturday": {"open": "12:00", "close": "01:00"}, "sunday": {"open": "12:00", "close": "22:00"}}'::jsonb),

-- Club 11: Salamanca Social Club
('Salamanca Social Club', 'salamanca-social-club-madrid',
'Salamanca Social Club represents the pinnacle of luxury cannabis culture in Madrid''s most prestigious neighborhood. This exclusive establishment caters to discerning members who appreciate premium cannabis products, refined aesthetics, and impeccable service. The club features private lounging areas, a curated menu of top-shelf strains, and hosts exclusive members-only events.',
'Exclusive luxury cannabis club in Madrid''s upscale Salamanca district with premium products and private lounges.',
'Calle Serrano 45', 'Salamanca', 'Madrid', 'ES', 'active', true, true, true,
4.8, 4.9, 4.9, 4.7, ARRAY['es', 'en', 'fr'], '/images/clubs/club-wellness.jpg',
'{"monday": {"open": "11:00", "close": "23:00"}, "tuesday": {"open": "11:00", "close": "23:00"}, "wednesday": {"open": "11:00", "close": "23:00"}, "thursday": {"open": "11:00", "close": "23:00"}, "friday": {"open": "11:00", "close": "00:00"}, "saturday": {"open": "10:00", "close": "00:00"}, "sunday": {"open": "12:00", "close": "22:00"}}'::jsonb),

-- Club 12: Arganzuela Green Space
('Arganzuela Green Space', 'arganzuela-green-space-madrid',
'Arganzuela Green Space is a wellness-focused cannabis club near Madrid Río, combining the benefits of cannabis with a health-conscious approach. The club features yoga sessions, meditation workshops, and educational events about responsible consumption. Their organic, pesticide-free cannabis selection appeals to health-minded members seeking a holistic experience.',
'Wellness-focused cannabis club near Madrid Río offering yoga, meditation, and organic cannabis products.',
'Paseo de la Chopera 28', 'Arganzuela', 'Madrid', 'ES', 'active', false, true, true,
4.3, 4.5, 4.6, 4.4, ARRAY['es', 'en'], '/images/clubs/club-greenhouse.jpg',
'{"monday": {"open": "10:00", "close": "22:00"}, "tuesday": {"open": "10:00", "close": "22:00"}, "wednesday": {"open": "10:00", "close": "22:00"}, "thursday": {"open": "10:00", "close": "22:00"}, "friday": {"open": "10:00", "close": "23:00"}, "saturday": {"open": "09:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "21:00"}}'::jsonb),

-- Club 13: Lavapiés Cannabis Association
('Lavapiés Cannabis Association', 'lavapies-cannabis-association-madrid',
'Located in the heart of multicultural Lavapiés, this cannabis association embodies the neighborhood''s bohemian spirit. The club attracts artists, musicians, and creative types who appreciate its eclectic atmosphere and diverse cannabis menu. Regular live music events, art exhibitions, and cultural gatherings make this more than just a cannabis club—it''s a community hub.',
'Bohemian cannabis club in multicultural Lavapiés featuring live music, art events, and diverse strains.',
'Calle Embajadores 41', 'Centro', 'Madrid', 'ES', 'active', false, true, true,
4.2, 4.1, 4.7, 4.5, ARRAY['es', 'en', 'fr', 'de'], '/images/clubs/club-latina.jpg',
'{"monday": {"open": "15:00", "close": "00:00"}, "tuesday": {"open": "15:00", "close": "00:00"}, "wednesday": {"open": "15:00", "close": "00:00"}, "thursday": {"open": "15:00", "close": "01:00"}, "friday": {"open": "15:00", "close": "02:00"}, "saturday": {"open": "14:00", "close": "02:00"}, "sunday": {"open": "14:00", "close": "23:00"}}'::jsonb),

-- Club 14: Chamartín Premium Club
('Chamartín Premium Club', 'chamartin-premium-club-madrid',
'Chamartín Premium Club offers a sophisticated cannabis experience in Madrid''s business district. Catering to professionals and executives, the club provides a discreet, upscale environment with private meeting rooms, high-speed WiFi, and a curated selection of premium strains. Perfect for those who want to unwind after work in an elegant setting.',
'Sophisticated business-district cannabis club with private rooms, WiFi, and premium strains for professionals.',
'Calle Príncipe de Vergara 180', 'Chamartín', 'Madrid', 'ES', 'active', false, true, true,
4.5, 4.7, 4.4, 4.3, ARRAY['es', 'en'], '/images/clubs/club-retiro.jpg',
'{"monday": {"open": "12:00", "close": "23:00"}, "tuesday": {"open": "12:00", "close": "23:00"}, "wednesday": {"open": "12:00", "close": "23:00"}, "thursday": {"open": "12:00", "close": "23:00"}, "friday": {"open": "12:00", "close": "00:00"}, "saturday": {"open": "11:00", "close": "00:00"}, "sunday": {"open": "closed", "close": "closed"}}'::jsonb),

-- Club 15: Usera International Cannabis Club
('Usera International Cannabis Club', 'usera-international-cannabis-club-madrid',
'Usera International Cannabis Club serves Madrid''s diverse Asian and international community. The club offers a welcoming environment for tourists and expats, with multilingual staff and a unique selection of strains from around the world. Known for its reasonable prices and friendly atmosphere, it''s an excellent choice for budget-conscious visitors.',
'International cannabis club in diverse Usera with multilingual staff, global strains, and budget-friendly prices.',
'Calle Olvido 23', 'Usera', 'Madrid', 'ES', 'active', false, true, true,
4.0, 4.2, 4.1, 3.8, ARRAY['es', 'en', 'zh'], '/images/clubs/club-tetuan.jpg',
'{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "21:00"}}'::jsonb);