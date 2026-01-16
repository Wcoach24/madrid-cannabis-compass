
-- Remove featured status from all clubs except Vallehermoso and Meltz
UPDATE clubs 
SET is_featured = false 
WHERE slug NOT IN ('vallehermoso-club-social-madrid', 'meltz-club-social-madrid');

-- Ensure Vallehermoso and Meltz are featured
UPDATE clubs 
SET is_featured = true 
WHERE slug IN ('vallehermoso-club-social-madrid', 'meltz-club-social-madrid');

-- Update Vallehermoso image to the new uploaded image
UPDATE clubs 
SET main_image_url = '/images/clubs/club-vallehermoso-new.webp'
WHERE slug = 'vallehermoso-club-social-madrid';
