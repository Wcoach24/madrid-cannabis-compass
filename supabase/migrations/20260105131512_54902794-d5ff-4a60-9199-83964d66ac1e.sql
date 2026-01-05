UPDATE clubs 
SET 
  main_image_url = '/images/clubs/meltz/meltz-lounge.webp',
  gallery_image_urls = ARRAY[
    '/images/clubs/meltz/meltz-lounge-large.webp',
    '/images/clubs/meltz/meltz-lounge-wide.webp',
    '/images/clubs/meltz/meltz-staircase.webp',
    '/images/clubs/meltz/meltz-bar.webp'
  ]
WHERE slug = 'meltz-club-social-madrid';