-- Update article cover image paths to use public directory
UPDATE articles 
SET cover_image_url = REPLACE(cover_image_url, '/src/assets/', '/images/articles/')
WHERE cover_image_url LIKE '/src/assets/%';