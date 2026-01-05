-- Fix title prefixes on translated articles
UPDATE articles 
SET title = TRIM(REGEXP_REPLACE(title, '^(Titel|Titre|Titolo|Titulo)\s*:\s*', '', 'i'))
WHERE id IN (30, 31, 48);

-- Verify
SELECT id, language, LENGTH(body_markdown) as chars, LEFT(title, 70) as title
FROM articles 
WHERE slug LIKE 'how-to-join%' 
ORDER BY language;