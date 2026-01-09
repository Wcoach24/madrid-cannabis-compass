import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClubData {
  slug: string;
  updated_at: string;
  main_image_url: string | null;
  gallery_image_urls: string[] | null;
  is_featured: boolean | null;
  rating_editorial: number | null;
}

interface ArticleData {
  slug: string;
  updated_at: string;
  published_at: string | null;
  cover_image_url: string | null;
  is_featured: boolean | null;
  category: string;
  language: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://sdpmwelfkseuhlhgatsc.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseKey) {
      throw new Error('Missing Supabase key - ensure SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://www.weedmadrid.com';

    // Fetch clubs with additional metadata for priority calculation
    const { data: clubs } = await supabase
      .from('clubs')
      .select('slug, updated_at, main_image_url, gallery_image_urls, is_featured, rating_editorial')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('rating_editorial', { ascending: false });

    // Fetch articles with additional metadata INCLUDING language
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at, cover_image_url, is_featured, category, language')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

    // Enhanced sitemap with image and additional namespaces
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

    const addHreflangLinks = (path: string) => {
      return `
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${path}"/>
    <xhtml:link rel="alternate" hreflang="en-US" href="${baseUrl}${path}"/>
    <xhtml:link rel="alternate" hreflang="en-GB" href="${baseUrl}${path}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/es${path}"/>
    <xhtml:link rel="alternate" hreflang="es-ES" href="${baseUrl}/es${path}"/>
    <xhtml:link rel="alternate" hreflang="es-MX" href="${baseUrl}/es${path}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}/de${path}"/>
    <xhtml:link rel="alternate" hreflang="de-DE" href="${baseUrl}/de${path}"/>
    <xhtml:link rel="alternate" hreflang="de-AT" href="${baseUrl}/de${path}"/>
    <xhtml:link rel="alternate" hreflang="de-CH" href="${baseUrl}/de${path}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr${path}"/>
    <xhtml:link rel="alternate" hreflang="fr-FR" href="${baseUrl}/fr${path}"/>
    <xhtml:link rel="alternate" hreflang="fr-BE" href="${baseUrl}/fr${path}"/>
    <xhtml:link rel="alternate" hreflang="fr-CH" href="${baseUrl}/fr${path}"/>
    <xhtml:link rel="alternate" hreflang="it" href="${baseUrl}/it${path}"/>
    <xhtml:link rel="alternate" hreflang="it-IT" href="${baseUrl}/it${path}"/>
    <xhtml:link rel="alternate" hreflang="it-CH" href="${baseUrl}/it${path}"/>`;
    };

    const addImageTags = (images: string[]) => {
      return images.map(img => `
    <image:image>
      <image:loc>${baseUrl}${img}</image:loc>
      <image:title>Cannabis Club Madrid</image:title>
    </image:image>`).join('');
    };

    const calculatePriority = (isFeatured: boolean | null, rating: number | null, isRecent: boolean = false): string => {
      let priority = 0.6;
      if (isFeatured) priority += 0.2;
      if (rating && rating >= 4.5) priority += 0.1;
      if (isRecent) priority += 0.1;
      return Math.min(priority, 1.0).toFixed(1);
    };

    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/clubs', priority: '0.9', changefreq: 'daily' },
      { path: '/guides', priority: '0.9', changefreq: 'weekly' },
      { path: '/knowledge', priority: '0.9', changefreq: 'weekly' },
      { path: '/faq', priority: '0.8', changefreq: 'monthly' },
      { path: '/legal', priority: '0.8', changefreq: 'monthly' },
      { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
      { path: '/safety', priority: '0.8', changefreq: 'monthly' },
      { path: '/districts', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/shop', priority: '0.7', changefreq: 'weekly' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/safety/scams', priority: '0.7', changefreq: 'monthly' },
    ];

    // All 12 districts synchronized with routes-inventory.mjs
    const districts = [
      'centro', 'chamberi', 'malasana', 'retiro', 'tetuan', 'usera',
      'atocha', 'moncloa-aravaca', 'arganzuela', 'fuencarral-el-pardo',
      'salamanca', 'chamartin'
    ];
    
    // Add "Near Me" pages
    staticPages.push({ path: '/clubs/near-me', priority: '0.8', changefreq: 'weekly' });
    
    // Add district pages
    districts.forEach(district => {
      staticPages.push({ path: `/district/${district}`, priority: '0.7', changefreq: 'weekly' });
      staticPages.push({ path: `/clubs/${district}`, priority: '0.7', changefreq: 'weekly' });
    });

    const languages = ['', '/es', '/de', '/fr', '/it'];
    
    staticPages.forEach(page => {
      languages.forEach(lang => {
        sitemap += `
  <url>
    <loc>${baseUrl}${lang}${page.path}</loc>${addHreflangLinks(page.path)}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;
      });
    });

    // Add pillar page: cannabis-club-madrid (English version)
    sitemap += `
  <url>
    <loc>${baseUrl}/cannabis-club-madrid</loc>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/cannabis-club-madrid"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/cannabis-club-madrid"/>
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/es/club-cannabis-madrid"/>
    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}/de/club-cannabis-madrid"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr/club-cannabis-madrid"/>
    <xhtml:link rel="alternate" hreflang="it" href="${baseUrl}/it/club-cannabis-madrid"/>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;

    // Add pillar page localized versions
    ['es', 'de', 'fr', 'it'].forEach(lang => {
      sitemap += `
  <url>
    <loc>${baseUrl}/${lang}/club-cannabis-madrid</loc>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/cannabis-club-madrid"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/cannabis-club-madrid"/>
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/es/club-cannabis-madrid"/>
    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}/de/club-cannabis-madrid"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr/club-cannabis-madrid"/>
    <xhtml:link rel="alternate" hreflang="it" href="${baseUrl}/it/club-cannabis-madrid"/>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;
    });

    // Add club URLs with images and dynamic priority
    if (clubs && clubs.length > 0) {
      clubs.forEach((club: ClubData) => {
        const clubPath = `/club/${club.slug}`;
        const images: string[] = [];
        
        if (club.main_image_url) images.push(club.main_image_url);
        if (club.gallery_image_urls && club.gallery_image_urls.length > 0) {
          images.push(...club.gallery_image_urls.slice(0, 4)); // Max 5 images total per URL
        }

        const priority = calculatePriority(club.is_featured, club.rating_editorial);
        const lastmod = new Date(club.updated_at).toISOString();

        // All language versions
        languages.forEach(lang => {
          sitemap += `
  <url>
    <loc>${baseUrl}${lang}${clubPath}</loc>${addHreflangLinks(clubPath)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${images.length > 0 ? addImageTags(images) : ''}
  </url>`;
        });
      });
    }

    // Add article URLs with images, news tags, and dynamic priority
    // CRITICAL FIX: Only include articles in their actual language to prevent phantom URLs
    if (articles && articles.length > 0) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Group articles by language
      const languageMap: Record<string, string> = { 'en': '', 'es': '/es', 'de': '/de', 'fr': '/fr', 'it': '/it' };

      articles.forEach((article: ArticleData) => {
        const articlePath = `/guide/${article.slug}`;
        const publishDate = article.published_at ? new Date(article.published_at) : new Date(article.updated_at);
        const isRecent = publishDate > sevenDaysAgo;
        
        const images: string[] = [];
        if (article.cover_image_url) images.push(article.cover_image_url);

        const priority = calculatePriority(article.is_featured, null, isRecent);
        const lastmod = new Date(article.updated_at).toISOString();
        const changefreq = isRecent ? 'daily' : 'weekly';

        // Only generate URL for the article's actual language (prevents phantom URLs)
        const langPrefix = languageMap[article.language] ?? '';
        const newsTag = isRecent ? `
    <news:news>
      <news:publication>
        <news:name>Weed Madrid</news:name>
        <news:language>${article.language}</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title>${article.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</news:title>
    </news:news>` : '';

        sitemap += `
  <url>
    <loc>${baseUrl}${langPrefix}${articlePath}</loc>${addHreflangLinks(articlePath)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${images.length > 0 ? addImageTags(images) : ''}${newsTag}
  </url>`;
      });
    }

    // Add AI-optimized files (GEO)
    const geoFiles = [
      { path: '/llm.txt', priority: '1.0' },
      { path: '/home.geo.txt', priority: '0.9' },
      { path: '/clubs.geo.txt', priority: '0.8' },
      { path: '/guides.geo.txt', priority: '0.8' }
    ];

    geoFiles.forEach(file => {
      sitemap += `
  <url>
    <loc>${baseUrl}${file.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${file.priority}</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'all',
        'Vary': 'Accept-Encoding',
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
