-- Update club image paths to use public directory
UPDATE clubs 
SET main_image_url = REPLACE(main_image_url, '/src/assets/', '/images/clubs/')
WHERE main_image_url LIKE '/src/assets/%';

-- Update any gallery images that might have the old path
UPDATE clubs 
SET gallery_image_urls = ARRAY(
  SELECT REPLACE(url, '/src/assets/', '/images/clubs/')
  FROM UNNEST(gallery_image_urls) AS url
)
WHERE gallery_image_urls IS NOT NULL;