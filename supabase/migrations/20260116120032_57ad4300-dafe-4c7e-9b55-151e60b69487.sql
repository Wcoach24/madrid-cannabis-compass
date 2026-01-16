-- Task 2: Deactivate Barrio del Pilar and feature Meltz Club
UPDATE clubs 
SET status = 'inactive' 
WHERE slug = 'barrio-pilar-social-club';

UPDATE clubs 
SET is_featured = true 
WHERE slug = 'meltz-club-social-madrid';

-- Task 3: Assign admin role to royaaltrade@gmail.com
SELECT assign_admin_role_to_user('royaaltrade@gmail.com');