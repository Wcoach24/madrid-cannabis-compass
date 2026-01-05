
-- Fix clubs with null SEO data
UPDATE clubs SET 
  seo_title = name || ' | Cannabis Club Madrid 2026',
  seo_description = 'Visit ' || name || ' in ' || district || ', Madrid. Verified cannabis social club with same-day invitations. Tourist-friendly.'
WHERE seo_title IS NULL AND status = 'active';

-- Update all club SEO titles to include 2026 for freshness
UPDATE clubs SET 
  seo_title = REGEXP_REPLACE(seo_title, '2025', '2026', 'g'),
  seo_description = REGEXP_REPLACE(seo_description, '2025', '2026', 'g'),
  updated_at = now()
WHERE status = 'active' AND (seo_title LIKE '%2025%' OR seo_description LIKE '%2025%');

-- Update all article SEO titles to 2026
UPDATE articles SET 
  seo_title = REGEXP_REPLACE(seo_title, '2025', '2026', 'g'),
  title = REGEXP_REPLACE(title, '2025', '2026', 'g'),
  updated_at = now()
WHERE status = 'published' AND (seo_title LIKE '%2025%' OR title LIKE '%2025%');
