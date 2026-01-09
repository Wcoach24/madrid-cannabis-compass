import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = Deno.env.get('INDEXNOW_KEY') || 'weedmadrid2025indexnow';
const SITE_HOST = 'www.weedmadrid.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;

const LANGUAGES = ['en', 'es', 'de', 'fr', 'it'];

const STATIC_ROUTES = [
  '/',
  '/clubs',
  '/guides',
  '/faq',
  '/how-it-works',
  '/districts',
  '/legal',
  '/safety',
  '/about',
  '/contact',
  '/knowledge',
  '/cannabis-club-madrid',
  '/safety/scams',
  '/clubs/near-me',
];

const SUPPORTED_DISTRICT_SLUGS = [
  'centro', 'chamberi', 'retiro', 'malasana', 'tetuan', 'usera',
  'atocha', 'moncloa-aravaca', 'arganzuela', 'fuencarral-el-pardo',
  'salamanca', 'chamartin'
];

interface Club {
  slug: string;
  status: string;
}

interface Article {
  slug: string;
  language: string;
  status: string;
}

async function fetchDynamicData(): Promise<{ clubs: Club[]; articles: Article[] }> {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const [clubsRes, articlesRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/clubs?status=eq.active&select=slug,status`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/articles?status=eq.published&select=slug,language,status`, { headers }),
  ]);

  const clubs = await clubsRes.json();
  const articles = await articlesRes.json();

  return { clubs, articles };
}

function buildUrlList(clubs: Club[], articles: Article[]): string[] {
  const urls: string[] = [];
  const baseUrl = `https://${SITE_HOST}`;

  // Static routes for all languages
  for (const route of STATIC_ROUTES) {
    urls.push(`${baseUrl}${route}`);
    for (const lang of LANGUAGES.filter(l => l !== 'en')) {
      if (route === '/cannabis-club-madrid') {
        urls.push(`${baseUrl}/${lang}/club-cannabis-madrid`);
      } else {
        urls.push(`${baseUrl}/${lang}${route}`);
      }
    }
  }

  // Club pages for all languages
  for (const club of clubs) {
    urls.push(`${baseUrl}/club/${club.slug}`);
    for (const lang of LANGUAGES.filter(l => l !== 'en')) {
      urls.push(`${baseUrl}/${lang}/club/${club.slug}`);
    }
  }

  // Article/guide pages (already language-specific)
  for (const article of articles) {
    if (article.language === 'en') {
      urls.push(`${baseUrl}/guide/${article.slug}`);
    } else {
      urls.push(`${baseUrl}/${article.language}/guide/${article.slug}`);
    }
  }

  // District pages for all languages
  for (const district of SUPPORTED_DISTRICT_SLUGS) {
    urls.push(`${baseUrl}/district/${district}`);
    urls.push(`${baseUrl}/clubs/${district}`);
    for (const lang of LANGUAGES.filter(l => l !== 'en')) {
      urls.push(`${baseUrl}/${lang}/district/${district}`);
      urls.push(`${baseUrl}/${lang}/clubs/${district}`);
    }
  }

  return urls;
}

async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; submitted: number; error?: string }> {
  // IndexNow accepts max 10,000 URLs per request
  const batchSize = 10000;
  const batches = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  let totalSubmitted = 0;
  const errors: string[] = [];

  for (const batch of batches) {
    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    };

    try {
      // Submit to IndexNow API (serves Bing, Yandex, and others)
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 202) {
        totalSubmitted += batch.length;
        console.log(`✅ Submitted ${batch.length} URLs to IndexNow`);
      } else {
        const errorText = await response.text();
        errors.push(`IndexNow API error: ${response.status} - ${errorText}`);
        console.error(`❌ IndexNow error: ${response.status}`, errorText);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Network error: ${errorMessage}`);
      console.error('❌ Network error:', err);
    }
  }

  return {
    success: errors.length === 0,
    submitted: totalSubmitted,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 IndexNow submission started...');

    // Fetch dynamic data from Supabase
    const { clubs, articles } = await fetchDynamicData();
    console.log(`📊 Found ${clubs.length} clubs, ${articles.length} articles`);

    // Build complete URL list
    const urls = buildUrlList(clubs, articles);
    console.log(`📄 Total URLs to submit: ${urls.length}`);

    // Submit to IndexNow
    const result = await submitToIndexNow(urls);

    const response = {
      success: result.success,
      message: result.success 
        ? `Successfully submitted ${result.submitted} URLs to IndexNow` 
        : `Partial submission: ${result.submitted} URLs submitted`,
      stats: {
        clubs: clubs.length,
        articles: articles.length,
        totalUrls: urls.length,
        submitted: result.submitted,
      },
      error: result.error,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ IndexNow submission complete:', response);

    return new Response(JSON.stringify(response, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 207,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ IndexNow function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
