import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://www.weedmadrid.com';

// Ensure image URL is absolute
function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return `${BASE_URL}/logo.png`;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
}

// HTML template for club pages
function renderClubHtml(club: any, language: string = 'en') {
  const title = club.seo_title || `${club.name} - Cannabis Club Madrid`;
  const description = club.seo_description || club.summary || club.description?.substring(0, 160);
  const canonical = `${BASE_URL}${language !== 'en' ? `/${language}` : ''}/club/${club.slug}`;
  const image = toAbsoluteUrl(club.main_image_url);

  // LocalBusiness schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "PrivateMembershipOrganization"],
    "name": club.name,
    "description": club.description,
    "url": canonical,
    "image": image,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": club.address,
      "addressLocality": club.city,
      "addressRegion": club.district,
      "postalCode": club.postal_code,
      "addressCountry": club.country
    },
    ...(club.latitude && club.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": club.latitude,
        "longitude": club.longitude
      }
    } : {}),
    "priceRange": "€€"
  };

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="icon" href="/favicon.ico">
  <script type="application/ld+json">${JSON.stringify(localBusinessSchema)}</script>
</head>
<body>
  <div id="root">
    <h1>${escapeHtml(club.name)}</h1>
    <p>${escapeHtml(description)}</p>
    <address>${escapeHtml(club.address)}, ${escapeHtml(club.district)}, ${escapeHtml(club.city)}</address>
  </div>
</body>
</html>`;
}

// HTML template for article/guide pages
function renderArticleHtml(article: any, language: string = 'en') {
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || article.body_markdown?.substring(0, 160);
  const canonical = `${BASE_URL}${language !== 'en' ? `/${language}` : ''}/guide/${article.slug}`;
  const image = toAbsoluteUrl(article.cover_image_url);

  // BlogPosting schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": article.title.includes('2025') ? "NewsArticle" : "BlogPosting",
    "headline": article.title,
    "description": description,
    "image": image,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Person",
      "name": article.author_name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Weed Madrid",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonical
    }
  };

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="icon" href="/favicon.ico">
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
</head>
<body>
  <div id="root">
    <article>
      <h1>${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p>By ${escapeHtml(article.author_name)}</p>
    </article>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '';
    
    // Parse the path to extract type, slug, and language
    const pathParts = path.split('/').filter(Boolean);
    let language = 'en';
    let type = '';
    let slug = '';

    // Check for language prefix
    if (['es', 'de', 'fr', 'it'].includes(pathParts[0])) {
      language = pathParts.shift()!;
    }

    type = pathParts[0]; // 'club' or 'guide'
    slug = pathParts[1];

    if (!type || !slug) {
      return new Response(JSON.stringify({ error: 'Missing type or slug' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let html = '';

    if (type === 'club') {
      const { data: club, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error || !club) {
        return new Response('Club not found', { status: 404, headers: corsHeaders });
      }

      html = renderClubHtml(club, language);
    } else if (type === 'guide') {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('language', language)
        .single();

      if (error || !article) {
        return new Response('Article not found', { status: 404, headers: corsHeaders });
      }

      html = renderArticleHtml(article, language);
    } else {
      return new Response('Invalid type', { status: 400, headers: corsHeaders });
    }

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('SSR Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
