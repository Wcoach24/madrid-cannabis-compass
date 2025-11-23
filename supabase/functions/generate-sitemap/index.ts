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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://www.weedmadrid.com';

    // Fetch clubs with additional metadata for priority calculation
    const { data: clubs } = await supabase
      .from('clubs')
      .select('slug, updated_at, main_image_url, gallery_image_urls, is_featured, rating_editorial')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('rating_editorial', { ascending: false });

    // Fetch articles with additional metadata
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at, cover_image_url, is_featured, category')
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
    <xhtml:link rel="alternate" hreflang="es-MX" href="${baseUrl}/es${path}"/>`;
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
      { path: '/faq', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    ];

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.path}</loc>${addHreflangLinks(page.path)}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/es${page.path}</loc>${addHreflangLinks(page.path)}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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

        // English version
        sitemap += `
  <url>
    <loc>${baseUrl}${clubPath}</loc>${addHreflangLinks(clubPath)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${images.length > 0 ? addImageTags(images) : ''}
  </url>`;

        // Spanish version
        sitemap += `
  <url>
    <loc>${baseUrl}/es${clubPath}</loc>${addHreflangLinks(clubPath)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${images.length > 0 ? addImageTags(images) : ''}
  </url>`;
      });
    }

    // Add article URLs with images, news tags, and dynamic priority
    if (articles && articles.length > 0) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      articles.forEach((article: ArticleData) => {
        const articlePath = `/guide/${article.slug}`;
        const publishDate = article.published_at ? new Date(article.published_at) : new Date(article.updated_at);
        const isRecent = publishDate > sevenDaysAgo;
        
        const images: string[] = [];
        if (article.cover_image_url) images.push(article.cover_image_url);

        const priority = calculatePriority(article.is_featured, null, isRecent);
        const lastmod = new Date(article.updated_at).toISOString();
        const changefreq = isRecent ? 'daily' : 'weekly';

        // Add news sitemap tags for recent articles
        const newsTag = isRecent ? `
    <news:news>
      <news:publication>
        <news:name>Weed Madrid</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title>${article.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</news:title>
    </news:news>` : '';

        // English version
        sitemap += `
  <url>
    <loc>${baseUrl}${articlePath}</loc>${addHreflangLinks(articlePath)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${images.length > 0 ? addImageTags(images) : ''}${newsTag}
  </url>`;

        // Spanish version
        const newsTagEs = isRecent ? `
    <news:news>
      <news:publication>
        <news:name>Weed Madrid</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title>${article.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</news:title>
    </news:news>` : '';

        sitemap += `
  <url>
    <loc>${baseUrl}/es${articlePath}</loc>${addHreflangLinks(articlePath)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${images.length > 0 ? addImageTags(images) : ''}${newsTagEs}
  </url>`;
      });
    }

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
