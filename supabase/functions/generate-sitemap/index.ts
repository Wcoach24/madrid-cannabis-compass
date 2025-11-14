import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://lovable.dev';

    const { data: clubs } = await supabase
      .from('clubs')
      .select('slug, updated_at')
      .eq('status', 'active');

    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    const addHreflangLinks = (path: string) => {
      return `
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${path}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/es${path}"/>`;
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

    if (clubs && clubs.length > 0) {
      clubs.forEach(club => {
        const clubPath = `/club/${club.slug}`;
        sitemap += `
  <url>
    <loc>${baseUrl}${clubPath}</loc>${addHreflangLinks(clubPath)}
    <lastmod>${new Date(club.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/es${clubPath}</loc>${addHreflangLinks(clubPath)}
    <lastmod>${new Date(club.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    if (articles && articles.length > 0) {
      articles.forEach(article => {
        const articlePath = `/guide/${article.slug}`;
        sitemap += `
  <url>
    <loc>${baseUrl}${articlePath}</loc>${addHreflangLinks(articlePath)}
    <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/es${articlePath}</loc>${addHreflangLinks(articlePath)}
    <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
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
