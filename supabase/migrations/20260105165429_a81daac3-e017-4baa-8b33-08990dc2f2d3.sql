-- Final cleanup of remaining subtitle lines
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^(Untertitel|Sous-titre|Sottotitolo|Subtítulo)\s*:\s*\n*', 
  '', 
  'i'
)
WHERE id IN (32, 33, 49) AND body_markdown ~ '^(Untertitel|Sous-titre|Sottotitolo|Subtítulo)';