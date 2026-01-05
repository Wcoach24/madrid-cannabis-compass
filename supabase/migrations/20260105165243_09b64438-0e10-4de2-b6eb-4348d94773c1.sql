-- Phase 2A: Replace literal \n with actual newlines
UPDATE articles 
SET body_markdown = REPLACE(body_markdown, '\n', E'\n')
WHERE body_markdown LIKE '%\\n%' AND status = 'published';

-- Phase 2B: Remove German prefixes (Titel:, Untertitel:, Body:, Text:)
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^Titel:\s*[^\n]*\n*(Untertitel:\s*[^\n]*\n*)?(Body:|Text:)?\s*\n*', 
  '', 
  'i'
)
WHERE language = 'de' AND body_markdown ~ '^Titel:';

-- Phase 2C: Remove French prefixes (Titre:, Sous-titre:, Corps:)
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^Titre\s*:\s*[^\n]*\n*(Sous-titre\s*:\s*[^\n]*\n*)?(Corps\s*:)?\s*\n*', 
  '', 
  'i'
)
WHERE language = 'fr' AND body_markdown ~ '^Titre';

-- Phase 2D: Remove Italian prefixes (Titolo:, Sottotitolo:, Corpo:)
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^Titolo:\s*[^\n]*\n*(Sottotitolo:\s*[^\n]*\n*)?(Corpo:)?\s*\n*', 
  '', 
  'i'
)
WHERE language = 'it' AND body_markdown ~ '^Titolo';

-- Phase 2E: Clean up any remaining inline metadata artifacts
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '\n(Body|Text|Corps|Corpo|Cuerpo):\s*\n', 
  E'\n', 
  'gi'
)
WHERE body_markdown ~ '\n(Body|Text|Corps|Corpo|Cuerpo):';

-- Phase 2F: Clean up "Subtitle:" prefixes that might appear inline
UPDATE articles 
SET body_markdown = REGEXP_REPLACE(
  body_markdown, 
  '^(Subtitle|Untertitel|Sous-titre|Sottotitolo|Subtítulo):\s*[^\n]*\n*', 
  '', 
  'i'
)
WHERE body_markdown ~ '^(Subtitle|Untertitel|Sous-titre|Sottotitolo|Subtítulo):';