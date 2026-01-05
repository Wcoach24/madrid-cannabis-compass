-- More aggressive cleanup for DE and FR body content
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^Titel:\s*[^\n]+\n+', 
  '', 
  'i'
)
WHERE id = 32;

UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^Titre\s*:\s*[^\n]+\n+', 
  '', 
  'i'
)
WHERE id = 33;

-- Also clean any remaining Untertitel/Sous-titre lines
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^(Untertitel|Sous-titre|Sottotitolo):\s*[^\n]+\n+(Body|Text|Corps|Corpo):\s*\n*', 
  '', 
  'i'
)
WHERE id IN (32, 33);