-- Fix remaining Italian title prefix
UPDATE articles 
SET title = TRIM(REGEXP_REPLACE(title, '^Title:\s*', '', 'i'))
WHERE id = 55;