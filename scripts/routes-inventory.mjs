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

// Languages with real club content (others auto-noindexed by SEOHead)
const CLUB_LANGUAGES = ['en', 'es'];

// Static routes that exist for all languages (INDEXABLE)
// NOTE: /cannabis-club-madrid is handled specially - EN uses /cannabis-club-madrid, other langs use /club-cannabis-madrid
export const STATIC_ROUTES = [
  '/',
  '/clubs',
  '/guides',
  '/faq',
  '/how-it-works',
  '/districts',
  '/legal',
  '/privacy',
  '/terms',
  '/safety',
  '/about',
  '/contact',
  '/knowledge',
  '/shop',
  '/safety/scams',
  '/clubs/near-me',
  '/glossary',
];

// 6 districts with high search volume (prioritized for indexation)
// Includes malasana and lavapies for SEO value
export const SUPPORTED_DISTRICT_SLUGS = [
  'centro',
  'chamberi', 
  'malasana',
  'lavapies',
  'tetuan',
  'arganzuela',
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
 * Robust slugify function for URL-safe strings
 * Removes diacritics, special characters, and normalizes to lowercase kebab-case
 */
function slugifyDistrict(input) {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    // Normalize and remove diacritics (accents)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove & and other special characters
    .replace(/[&]/g, '')
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim hyphens from start and end
    .replace(/^-+|-+$/g, '');
}

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
      
      // Extract unique districts and slugify them properly (no accents!)
      const uniqueDistricts = [...new Set(clubs.map(c => c.district))];
      const slugifiedDistricts = uniqueDistricts
        .map(d => slugifyDistrict(d))
        .filter(d => d !== null && d !== undefined && d !== '');
      
      // Deduplicate after slugification (e.g., "Chamberí" and "Chamberi" -> "chamberi")
      data.districts = [...new Set(slugifiedDistricts)];
      
      console.log(`  ✓ Found ${data.clubs.length} clubs, ${data.districts.length} districts`);
      console.log(`  ✓ District slugs: ${data.districts.join(', ')}`);
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

  // 1b. Special pillar page: cannabis-club-madrid
  // EN uses /cannabis-club-madrid, other langs use /:lang/club-cannabis-madrid
  urls.push({ path: '/cannabis-club-madrid', lang: 'en', type: 'pillar' });
  for (const lang of LANGUAGES) {
    if (lang !== 'en') {
      urls.push({ path: `/${lang}/club-cannabis-madrid`, lang, type: 'pillar' });
    }
  }

  // 2. Club pages — only EN and ES (de/fr/it lack translated content, auto-noindexed by SEOHead)
  for (const slug of dynamicData.clubs) {
    urls.push({ path: `/club/${slug}`, lang: 'en', type: 'club', slug });
    for (const lang of CLUB_LANGUAGES) {
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

  // 4. District pages - only for supported districts with high search volume
  // Only EN and ES to focus crawl budget on quality pages
  for (const district of dynamicData.districts) {
    const isSupported = SUPPORTED_DISTRICT_SLUGS.includes(district);
    
    // Only generate routes for supported districts
    if (!isSupported) continue;
    
    // District detail page - only EN and ES
    urls.push({ path: `/district/${district}`, lang: 'en', type: 'district', slug: district });
    urls.push({ path: `/es/district/${district}`, lang: 'es', type: 'district', slug: district });
    
    // NOTE: /clubs/{district} removed to avoid duplicate content with /district/{district}
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
