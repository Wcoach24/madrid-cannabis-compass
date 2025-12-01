-- Fix German article titles (remove "Titel: " prefix)
UPDATE articles 
SET title = REGEXP_REPLACE(title, '^Titel: ', '')
WHERE language = 'de' AND title LIKE 'Titel:%';

-- Fix French article titles (remove "Titre : " prefix)  
UPDATE articles 
SET title = REGEXP_REPLACE(title, '^Titre : ', '')
WHERE language = 'fr' AND title LIKE 'Titre%';

-- Verify the fix
SELECT id, language, title FROM articles WHERE language IN ('de', 'fr') ORDER BY language, id;
