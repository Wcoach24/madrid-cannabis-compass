-- Fix remaining French title prefix (the REGEXP wasn't matching due to colon spacing)
UPDATE articles 
SET title = TRIM(REGEXP_REPLACE(title, '^Titre\s*:\s*', '', 'i'))
WHERE title ~* '^Titre\s*:';

-- Verify all titles are now clean
SELECT id, language, LEFT(title, 80) as title 
FROM articles 
WHERE title ~* '^(Titel|Titre|Titolo|Titulo)'
ORDER BY language;