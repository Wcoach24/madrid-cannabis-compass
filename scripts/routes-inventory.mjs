#!/usr/bin/env node
/**
 * Routes Inventory Generator
 * 
 * Generates a complete list of all indexable URLs for prerendering.
 * Fetches dynamic data from Supabase at build time.
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

config({ path: join(ROOT_DIR, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// All supported languages
export const LANGUAGES = ['en', 'es', 'de', 'fr', 'it'];

// Static routes that exist for all languages (INDEXABLE)
export const STATIC_ROUTES = [
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
  '/shop',
  '/cannabis-club-madrid',
  '/safety/scams',
];

// Routes that should NOT be indexed (noindex)
export const NOINDEX_ROUTES = [
  '/auth',
  '/admin',
  '/admin/invitations',
  '/admin/clubs',
  '/admin/guides',
  '/seed-data',
  '/generate-articles',
  '/bulk-generate',
  '/translate-content',
  '/invite',
];

/**
 * Fetch all dynamic slugs from Supabase
 */
export async function fetchDynamicData() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    return { clubs: [], articles: {}, districts: [] };
  }

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const data = {
    clubs: [],
    articles: {},
    districts: [],
  };

  // Fetch active clubs
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/clubs?status=eq.active&select=slug,district`, { headers });
    if (res.ok) {
      const clubs = await res.json();
      data.clubs = clubs.map(c => c.slug);
      // Extract unique districts
      const uniqueDistricts = [...new Set(clubs.map(c => c.district))];
      data.districts = uniqueDistricts.map(d => d.toLowerCase().replace(/\s+/g, '-'));
      console.log(`  ✓ Found ${data.clubs.length} clubs, ${data.districts.length} districts`);
    }
  } catch (e) {
    console.error('  ✗ Failed to fetch clubs:', e.message);
  }

  // Fetch published articles per language
  for (const lang of LANGUAGES) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/articles?status=eq.published&language=eq.${lang}&select=slug`,
        { headers }
      );
      if (res.ok) {
        const articles = await res.json();
        data.articles[lang] = articles.map(a => a.slug);
        console.log(`  ✓ Found ${articles.length} articles for ${lang}`);
      }
    } catch (e) {
      console.error(`  ✗ Failed to fetch articles for ${lang}:`, e.message);
    }
  }

  return data;
}

/**
 * Build complete URL inventory
 */
export function buildUrlInventory(dynamicData) {
  const urls = [];

  // 1. Static routes for all languages
  for (const route of STATIC_ROUTES) {
    // English (default) - no prefix
    urls.push({ path: route, lang: 'en', type: 'static' });
    
    // Other languages with prefix
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        const path = `/${lang}${route === '/' ? '' : route}`;
        urls.push({ path, lang, type: 'static' });
      }
    }
  }

  // 2. Club pages (same content, different lang UI)
  for (const slug of dynamicData.clubs) {
    urls.push({ path: `/club/${slug}`, lang: 'en', type: 'club', slug });
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        urls.push({ path: `/${lang}/club/${slug}`, lang, type: 'club', slug });
      }
    }
  }

  // 3. Guide/article pages (language-specific content)
  for (const lang of LANGUAGES) {
    const articles = dynamicData.articles[lang] || [];
    for (const slug of articles) {
      const path = lang === 'en' ? `/guide/${slug}` : `/${lang}/guide/${slug}`;
      urls.push({ path, lang, type: 'guide', slug });
    }
  }

  // 4. District pages
  for (const district of dynamicData.districts) {
    // District detail page
    urls.push({ path: `/district/${district}`, lang: 'en', type: 'district', slug: district });
    // Clubs by district page
    urls.push({ path: `/clubs/${district}`, lang: 'en', type: 'clubs-district', slug: district });
    
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        urls.push({ path: `/${lang}/district/${district}`, lang, type: 'district', slug: district });
        urls.push({ path: `/${lang}/clubs/${district}`, lang, type: 'clubs-district', slug: district });
      }
    }
  }

  return urls;
}

/**
 * Get simple path list for prerendering
 */
export async function getAllPaths() {
  console.log('📡 Fetching route inventory from Supabase...');
  const dynamicData = await fetchDynamicData();
  const inventory = buildUrlInventory(dynamicData);
  return inventory.map(item => item.path);
}

// If run directly, print inventory
if (import.meta.url === `file://${process.argv[1]}`) {
  getAllPaths().then(paths => {
    console.log(`\n📊 Total routes: ${paths.length}\n`);
    paths.forEach(p => console.log(p));
  });
}
