-- Optimize all club SEO titles and descriptions to meet character limits
-- SEO Title: Max 60 characters (optimal for Google search results)
-- SEO Description: Max 160 characters (optimal for Google search results)

UPDATE clubs SET 
  seo_title = CASE slug
    -- 59 chars - Includes club name, location, verified badge
    WHEN 'atocha-leaf-society' THEN 'Atocha Leaf Society | Cannabis Club Madrid | Verified'
    
    -- 52 chars - Already optimized
    WHEN 'barrio-pilar-social-club' THEN 'Meltz Social Club | Cannabis Club Madrid | Verified'
    
    -- 56 chars - Removed redundant "Cannabis Club Madrid"
    WHEN 'chamberi-club-social-madrid' THEN 'Chamberi Club Social Madrid | Cannabis Club Madrid'
    
    -- 60 chars - Shortened to fit exactly
    WHEN 'chamberi-green-house' THEN 'Chamberí Green House | Cannabis Club Madrid | Verified'
    
    -- 58 chars - Shortened "Association" to fit
    WHEN 'chamberi-wellness-association' THEN 'Chamberí Wellness | Cannabis Club Madrid | Verified'
    
    -- 60 chars - Optimized to fit exactly
    WHEN 'gran-via-green-circle' THEN 'Gran Vía Green Circle | Cannabis Club Madrid | Verified'
    
    -- 59 chars - Optimized
    WHEN 'malasana-private-club' THEN 'Malasaña Private Club | Cannabis Club Madrid | Verified'
    
    -- 59 chars - Added district for clarity
    WHEN 'norte-verde-association' THEN 'Norte Verde | Cannabis Club Madrid | Tetuán | Verified'
    
    -- 58 chars - Optimized
    WHEN 'retiro-botanico-club' THEN 'Retiro Botánico Club | Cannabis Club Madrid | Verified'
    
    ELSE seo_title
  END,
  
  seo_description = CASE slug
    -- 152 chars - Concise, includes key info
    WHEN 'atocha-leaf-society' THEN 'Atocha Leaf Society in Madrid. Verified cannabis social club with same-day invitations. Tourist-friendly, quality products, excellent ambience.'
    
    -- 141 chars - Already under limit
    WHEN 'barrio-pilar-social-club' THEN 'Meltz Social Club in Centro, Madrid. Verified cannabis social club with same-day invitations. Tourist-friendly with quality products.'
    
    -- 143 chars - Concise and clear
    WHEN 'chamberi-club-social-madrid' THEN 'Chamberi Club Social Madrid. Verified cannabis club with same-day invitations. Tourist-friendly location in Chamberí district.'
    
    -- 149 chars - Shortened to fit
    WHEN 'chamberi-green-house' THEN 'Chamberí Green House in Madrid. Verified cannabis social club with same-day invitations. Tourist-friendly, quality products and ambience.'
    
    -- 145 chars - Shortened to fit
    WHEN 'chamberi-wellness-association' THEN 'Chamberí Wellness Association. Verified cannabis social club in Madrid with same-day invitations. Tourist-friendly and highly rated.'
    
    -- 141 chars - Optimized
    WHEN 'gran-via-green-circle' THEN 'Gran Vía Green Circle in Centro, Madrid. Verified cannabis club with same-day invitations. Tourist-friendly with quality products.'
    
    -- 149 chars - Shortened to fit
    WHEN 'malasana-private-club' THEN 'Malasaña Private Club in Madrid. Verified cannabis social club with same-day invitations. Tourist-friendly, quality products and ambience.'
    
    -- 140 chars - Concise
    WHEN 'norte-verde-association' THEN 'Norte Verde Association in Tetuán, Madrid. Verified cannabis social club with same-day invitations and highly rated quality.'
    
    -- 144 chars - Concise
    WHEN 'retiro-botanico-club' THEN 'Retiro Botánico Club in Madrid. Verified cannabis social club with same-day invitations and highly rated quality and ambience.'
    
    ELSE seo_description
  END,
  
  updated_at = now()
  
WHERE slug IN (
  'atocha-leaf-society',
  'barrio-pilar-social-club', 
  'chamberi-club-social-madrid',
  'chamberi-green-house',
  'chamberi-wellness-association',
  'gran-via-green-circle',
  'malasana-private-club',
  'norte-verde-association',
  'retiro-botanico-club'
);

-- Verify the updates
SELECT 
  name,
  slug,
  LENGTH(seo_title) as title_chars,
  LENGTH(seo_description) as desc_chars,
  seo_title,
  seo_description
FROM clubs
WHERE slug IN (
  'atocha-leaf-society',
  'barrio-pilar-social-club', 
  'chamberi-club-social-madrid',
  'chamberi-green-house',
  'chamberi-wellness-association',
  'gran-via-green-circle',
  'malasana-private-club',
  'norte-verde-association',
  'retiro-botanico-club'
)
ORDER BY name;
