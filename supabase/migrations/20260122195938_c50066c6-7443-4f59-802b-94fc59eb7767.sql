-- Revert to original file references now that files are swapped
UPDATE clubs 
SET main_image_url = '/images/clubs/club-vallehermoso-featured.webp'
WHERE slug = 'vallehermoso-club-social-madrid';

UPDATE clubs 
SET main_image_url = '/images/clubs/meltz/meltz-featured.webp'
WHERE slug = 'meltz-club-social-madrid';