-- Update all clubs with optimized SEO titles and descriptions
UPDATE clubs SET
  seo_title = name || ' Cannabis Club Madrid | ' || district || ' District | Verified',
  seo_description = 'Join ' || name || ' in ' || district || ', Madrid. ' || 
    CASE 
      WHEN is_tourist_friendly THEN 'Tourist-friendly, '
      ELSE ''
    END ||
    CASE 
      WHEN is_verified THEN 'verified cannabis social club. '
      ELSE 'cannabis social club. '
    END ||
    'Same-day invitation access available. ' ||
    CASE 
      WHEN rating_editorial >= 4.0 THEN 'Highly rated for quality and ambience.'
      ELSE 'Quality cannabis club experience in Madrid.'
    END
WHERE status = 'active';