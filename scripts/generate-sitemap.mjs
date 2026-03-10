#!/usr/bin/env node
/**
 * Static Sitemap Generator v2 — Phase 3 SEO Cleanup
 *
 * Changes from v1:
 * - Removed .geo.txt and llm.txt entries (not web pages)
 * - Added hreflang annotations for EN↔ES pairs
 * - Only includes URLs that should be indexed (respects indexability)
 * - Excludes DE/FR/IT static pages (thin content, auto-noindexed by SEOHead)
 * - Meaningful priority values (not all 1.0)
 * - Fixed changefreq to reflect actual update patterns
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, writeFileSync } from 'fs';
import { getAllPaths, buildUrlInventory, fetchDynamicData, LANGUAGES } from './routes-inventory.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');

config({ path: join(ROOT_DIR, '.env') });

const BASE_URL = 'https://www.weedmadrid.com';
const TODAY = new Date().toISOString().split('T')[0];

// ============================================
// PAGES THAT SHOULD NOT APPEAR IN SITEMAP
// (legal pages, thin content, no search value)
// ============================================
const NOINDEX_PATHS = [
  '/privacy',
  '/terms',
  '/about',
  '/contact',
  '/shop',
  '/auth',
  '/admin',
  '/seed-data',
  '/generate-articles',
  '/bulk-generate',
  '/translate-content',
  '/invite',
];

// Languages that have FULL content for static pages
// DE/FR/IT only have guide articles — their static pages are thin
const SITEMAP_LANGUAGES_STATIC = ['en', 'es'];

// All languages for guide/article content (fetched from Supabase with real translations)
const SITEMAP_LANGUAGES_GUIDES = ['en', 'es', 'de', 'fr', 'it'];

// ============================================
// PRIORITY CONFIG — Intentional, not all 1.0
// ============================================
const PRIORITY_CONFIG = {
  '/': 1.0,                          // Homepage — money page
  '/clubs': 0.9,                     // Directory — high intent
  '/cannabis-club-madrid': 0.9,      // Pillar page
  '/guides': 0.8,                    // Guide hub
  '/faq': 0.8,                       // FAQ — featured snippets
  '/how-it-works': 0.8,              // Conversion funnel
  '/districts': 0.7,                 // District hub
  '/clubs/near-me': 0.7,             // Local intent
  '/club/': 0.7,                     // Individual clubs
  '/guide/': 0.7,                    // Individual guides
  '/district/': 0.6,                 // Individual districts
  '/safety': 0.5,                    // E-E-A-T
  '/safety/scams': 0.5,              // E-E-A-T
  '/legal': 0.5,                     // E-E-A-T
  '/knowledge': 0.4,                 // Topical authority
  '/glossary': 0.4,                  // Long-tail
  '/blog/': 0.8,                     // Blog articles — E-E-A-T content
};

// Localized routes get slightly lower priority than their EN counterpart
const LANG_PRIORITY_PENALTY = 0.1;

// ============================================
// CHANGEFREQ — Realistic update patterns
// ============================================
const CHANGEFREQ_CONFIG = {
  '/': 'weekly',
  '/clubs': 'weekly',
  '/guides': 'weekly',
  '/faq': 'monthly',
  '/club/': 'monthly',
  '/guide/': 'monthly',
  '/district/': 'monthly',
  '/blog/': 'monthly',
  default: 'monthly',
};

/**
 * Get priority for a URL path
 */
function getPriority(path) {
  // Strip language prefix to get base path
  const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
  const basePath = langMatch ? (langMatch[2] || '/') : path;
  const isLocalized = !!langMatch;

  // Exact match
  if (PRIORITY_CONFIG[basePath] !== undefined) {
    const base = PRIORITY_CONFIG[basePath];
    return Math.max(0.1, isLocalized ? base - LANG_PRIORITY_PENALTY : base);
  }

  // Prefix match for dynamic routes
  for (const [prefix, priority] of Object.entries(PRIORITY_CONFIG)) {
    if (prefix.endsWith('/') && basePath.startsWith(prefix)) {
      return Math.max(0.1, isLocalized ? priority - LANG_PRIORITY_PENALTY : priority);
    }
  }

  return 0.3;
}

/**
 * Get changefreq for a URL path
 */
function getChangefreq(path) {
  const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
  const basePath = langMatch ? (langMatch[2] || '/') : path;

  if (CHANGEFREQ_CONFIG[basePath]) return CHANGEFREQ_CONFIG[basePath];

  for (const [prefix, freq] of Object.entries(CHANGEFREQ_CONFIG)) {
    if (prefix.endsWith('/') && basePath.startsWith(prefix)) return freq;
  }

  return CHANGEFREQ_CONFIG.default;
}

/**
 * Check if prerendered HTML exists
 */
function hasPrerenderedFile(path) {
  const filePath = path === '/'
    ? join(DIST_DIR, 'index.html')
    : join(DIST_DIR, path, 'index.html');
  return existsSync(filePath);
}

/**
 * Should this URL be in the sitemap?
 */
function shouldIncludeInSitemap(urlItem) {
  const { path, lang, type } = urlItem;
  const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
  const basePath = langMatch ? (langMatch[2] || '/') : path;

  // Never include noindex pages
  if (NOINDEX_PATHS.some(np => basePath === np || basePath.startsWith(np + '/'))) {
    return false;
  }

  // For static routes: only include EN and ES
  if (type === 'static' || type === 'pillar') {
    if (!SITEMAP_LANGUAGES_STATIC.includes(lang)) {
      return false; // DE/FR/IT static pages are thin content
    }
  }

  // For club pages: only EN and ES (already enforced in routes-inventory)
  // For guide pages: all languages with actual content (from Supabase)
  // For district pages: only EN and ES (already enforced)
  // For blog posts: only EN and ES (content only exists in these languages)
  if (type === 'blog') {
    if (!SITEMAP_LANGUAGES_STATIC.includes(lang)) {
      return false;
    }
  }

  return true;
}

/**
 * Build hreflang map: group URLs by their base path
 */
function buildHreflangMap(urls) {
  const map = new Map(); // basePath -> { lang: fullPath }

  for (const item of urls) {
    const { path, lang } = item;
    const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
    const basePath = langMatch ? (langMatch[2] || '/') : path;

    if (!map.has(basePath)) {
      map.set(basePath, {});
    }
    map.get(basePath)[lang] = path;
  }

  return map;
}

/**
 * Generate hreflang XML for a URL
 */
function generateHreflangXml(basePath, hreflangMap) {
  const langs = hreflangMap.get(basePath);
  if (!langs || Object.keys(langs).length <= 1) return '';

  const langToHreflang = {
    'en': 'en',
    'es': 'es',
    'de': 'de',
    'fr': 'fr',
    'it': 'it',
  };

  let xml = '';
  for (const [lang, path] of Object.entries(langs)) {
    const fullUrl = `${BASE_URL}${path === '/' ? '' : path}`;
    const hreflangCode = langToHreflang[lang] || lang;
    xml += `    <xhtml:link rel="alternate" hreflang="${hreflangCode}" href="${fullUrl}" />\n`;
  }

  // Add x-default pointing to EN version
  if (langs['en']) {
    const enUrl = `${BASE_URL}${langs['en'] === '/' ? '' : langs['en']}`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />\n`;
  }

  return xml;
}

/**
 * Generate XML for a single URL entry with hreflang
 */
function generateUrlEntry(path, hreflangMap) {
  const fullUrl = `${BASE_URL}${path === '/' ? '' : path}`;
  const priority = getPriority(path);
  const changefreq = getChangefreq(path);

  // Get base path for hreflang lookup
  const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
  const basePath = langMatch ? (langMatch[2] || '/') : path;
  const hreflangXml = generateHreflangXml(basePath, hreflangMap);

  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
${hreflangXml}  </url>`;
}

/**
 * Generate complete sitemap XML
 */
function generateSitemap(urls, hreflangMap) {
  const urlEntries = urls.map(path => generateUrlEntry(path, hreflangMap)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🗺️  Generating Optimized Sitemap (Phase 3)...\n');

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run prerender first.');
    process.exit(1);
  }

  // Get full URL inventory with metadata
  console.log('📡 Fetching route inventory...');
  const dynamicData = await fetchDynamicData();
  const inventory = buildUrlInventory(dynamicData);

  console.log(`📊 Total routes in inventory: ${inventory.length}`);

  // Filter to indexable URLs only
  const indexableUrls = inventory.filter(item => shouldIncludeInSitemap(item));
  console.log(`🎯 Indexable URLs (sitemap candidates): ${indexableUrls.length}`);
  console.log(`🚫 Excluded from sitemap: ${inventory.length - indexableUrls.length}`);

  // Filter to URLs with prerendered HTML
  const existingUrls = indexableUrls.filter(item => {
    const exists = hasPrerenderedFile(item.path);
    if (!exists) {
      console.log(`  ⚠️ Skipping (no HTML): ${item.path}`);
    }
    return exists;
  });

  console.log(`✅ Final sitemap URLs: ${existingUrls.length}`);

  // Build hreflang map from ALL indexable URLs (not just existing)
  const hreflangMap = buildHreflangMap(existingUrls);

  // Sort: homepage first, then by priority, then alphabetically
  const sortedPaths = existingUrls
    .map(item => item.path)
    .sort((a, b) => {
      if (a === '/') return -1;
      if (b === '/') return 1;
      const pDiff = getPriority(b) - getPriority(a);
      if (pDiff !== 0) return pDiff;
      return a.localeCompare(b);
    });

  // Generate sitemap
  const sitemapXml = generateSitemap(sortedPaths, hreflangMap);
  const sitemapPath = join(DIST_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemapXml);

  // Summary
  const langCounts = {};
  existingUrls.forEach(item => {
    langCounts[item.lang] = (langCounts[item.lang] || 0) + 1;
  });

  console.log(`\n✅ Sitemap generated: ${sitemapPath}`);
  console.log(`📄 Total URLs: ${sortedPaths.length}`);
  console.log(`🌐 By language:`, langCounts);
  console.log(`🔗 Hreflang pairs: ${hreflangMap.size}`);

  // Show what was excluded
  const excludedCount = inventory.length - existingUrls.length;
  console.log(`\n🚫 Excluded from sitemap: ${excludedCount} URLs`);
  console.log('   Reasons: noindex pages, thin DE/FR/IT static pages, missing HTML');

  console.log('\n📋 Sample URLs:');
  sortedPaths.slice(0, 10).forEach(path => {
    const p = getPriority(path);
    console.log(`   [${p.toFixed(1)}] ${BASE_URL}${path === '/' ? '' : path}`);
  });
  if (sortedPaths.length > 10) {
    console.log(`   ... and ${sortedPaths.length - 10} more`);
  }

  console.log('\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
