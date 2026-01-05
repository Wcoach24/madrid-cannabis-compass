-- Clean titles on regenerated articles
UPDATE articles 
SET title = TRIM(REGEXP_REPLACE(title, '^(Titel|Titre|Titolo|Titulo)\s*:\s*', '', 'i'))
WHERE id IN (32, 33, 49);

-- Clean body_markdown on regenerated articles - remove all header metadata
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^(Titel|Titre|Titolo|Titulo)\s*:\s*[^\n]*\n*(Untertitel|Sous-titre|Sottotitolo|Subtítulo)\s*:\s*[^\n]*\n*(Body|Text|Corps|Corpo|Cuerpo)\s*:\s*\n*', 
  '', 
  'i'
)
WHERE id IN (32, 33, 49);