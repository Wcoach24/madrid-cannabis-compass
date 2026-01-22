-- Swap main_image_url: Vallehermoso gets dark bar (meltz-featured), Meltz gets bright lounge (vallehermoso-featured)
UPDATE clubs 
SET main_image_url = '/images/clubs/meltz/meltz-featured.webp'
WHERE slug = 'vallehermoso-club-social-madrid';

UPDATE clubs 
SET main_image_url = '/images/clubs/club-vallehermoso-featured.webp'
WHERE slug = 'meltz-club-social-madrid';