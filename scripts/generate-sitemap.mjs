#!/usr/bin/env node
/**
 * Static Sitemap Generator
 * 
 * Generates a static sitemap.xml at build time based on:
 * 1. All prerendered routes from routes-inventory.mjs
 * 2. Only URLs that exist as physical HTML files in dist/
 * 
 * This ensures 100% consistency between sitemap and actual site content.
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { getAllPaths } from './routes-inventory.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');

config({ path: join(ROOT_DIR, '.env') });

const BASE_URL = 'https://www.weedmadrid.com';
const TODAY = new Date().toISOString().split('T')[0];

// Priority configuration by route type
const PRIORITY_CONFIG = {
  '/': 1.0,
  '/clubs': 0.9,
  '/guides': 0.9,
  '/cannabis-club-madrid': 0.9,
  '/club/': 0.8,
  '/guide/': 0.8,
  '/faq': 0.7,
  '/districts': 0.7,
  '/district/': 0.6,
  '/clubs/': 0.6,
  '/how-it-works': 0.6,
  '/legal': 0.5,
  '/privacy': 0.4,
  '/terms': 0.4,
  '/safety': 0.5,
  '/about': 0.5,
  '/contact': 0.5,
  '/knowledge': 0.5,
  '/shop': 0.6,
};

// Change frequency by route type
const CHANGEFREQ_CONFIG = {
  '/': 'daily',
  '/clubs': 'daily',
  '/guides': 'weekly',
  '/club/': 'weekly',
  '/guide/': 'monthly',
  '/faq': 'weekly',
  '/districts': 'weekly',
  '/district/': 'weekly',
  default: 'monthly',
};

/**
 * Get priority for a URL
 */
function getPriority(path) {
  // Exact match first
  if (PRIORITY_CONFIG[path] !== undefined) {
    return PRIORITY_CONFIG[path];
  }
  
  // Prefix match for dynamic routes
  for (const [prefix, priority] of Object.entries(PRIORITY_CONFIG)) {
    if (prefix.endsWith('/') && path.startsWith(prefix)) {
      return priority;
    }
  }
  
  // Language-prefixed routes get same priority as base route
  const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
  if (langMatch) {
    const basePath = langMatch[2] || '/';
    return getPriority(basePath);
  }
  
  return 0.5; // Default priority
}

/**
 * Get change frequency for a URL
 */
function getChangefreq(path) {
  // Exact match first
  if (CHANGEFREQ_CONFIG[path]) {
    return CHANGEFREQ_CONFIG[path];
  }
  
  // Prefix match for dynamic routes
  for (const [prefix, freq] of Object.entries(CHANGEFREQ_CONFIG)) {
    if (prefix.endsWith('/') && path.startsWith(prefix)) {
      return freq;
    }
  }
  
  // Language-prefixed routes
  const langMatch = path.match(/^\/(es|de|fr|it)(\/.*)?$/);
  if (langMatch) {
    const basePath = langMatch[2] || '/';
    return getChangefreq(basePath);
  }
  
  return CHANGEFREQ_CONFIG.default;
}

/**
 * Check if a prerendered HTML file exists for a path
 */
function hasPrerenderedFile(path) {
  let filePath;
  if (path === '/') {
    filePath = join(DIST_DIR, 'index.html');
  } else {
    filePath = join(DIST_DIR, path, 'index.html');
  }
  return existsSync(filePath);
}

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(path) {
  const fullUrl = `${BASE_URL}${path === '/' ? '' : path}`;
  const priority = getPriority(path);
  const changefreq = getChangefreq(path);
  
  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

/**
 * Generate GEO file entries for AI crawlers
 */
function generateGeoFileEntries() {
  const geoFiles = [
    { path: '/llm.txt', priority: 0.9 },
    { path: '/home.geo.txt', priority: 0.8 },
    { path: '/clubs.geo.txt', priority: 0.8 },
    { path: '/guides.geo.txt', priority: 0.8 },
    { path: '/faq.geo.txt', priority: 0.7 },
    { path: '/knowledge.geo.txt', priority: 0.7 },
    { path: '/how-it-works.geo.txt', priority: 0.6 },
  ];

  return geoFiles.map(file => `  <url>
    <loc>${BASE_URL}${file.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${file.priority.toFixed(1)}</priority>
  </url>`).join('\n');
}

/**
 * Generate complete sitemap XML
 */
function generateSitemap(urls) {
  const urlEntries = urls.map(generateUrlEntry).join('\n');
  const geoEntries = generateGeoFileEntries();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
${geoEntries}
</urlset>`;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🗺️  Generating Static Sitemap...\n');
  
  // Check dist directory exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run prerender first.');
    process.exit(1);
  }
  
  // Get all paths from inventory
  const allPaths = await getAllPaths();
  console.log(`📊 Total paths from inventory: ${allPaths.length}`);
  
  // Filter to only paths with prerendered HTML files
  const existingPaths = allPaths.filter(path => {
    const exists = hasPrerenderedFile(path);
    if (!exists) {
      console.log(`  ⚠️ Skipping (no HTML): ${path}`);
    }
    return exists;
  });
  
  console.log(`✅ Paths with prerendered HTML: ${existingPaths.length}`);
  
  // Sort paths for consistent output
  existingPaths.sort((a, b) => {
    // Home first
    if (a === '/') return -1;
    if (b === '/') return 1;
    // Then by priority
    const priorityDiff = getPriority(b) - getPriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    // Then alphabetically
    return a.localeCompare(b);
  });
  
  // Generate sitemap
  const sitemapXml = generateSitemap(existingPaths);
  
  // Write to dist/
  const sitemapPath = join(DIST_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemapXml);
  
  console.log(`\n✅ Sitemap generated: ${sitemapPath}`);
  console.log(`📄 Total URLs in sitemap: ${existingPaths.length}`);
  
  // Show sample of URLs
  console.log('\n📋 Sample URLs:');
  existingPaths.slice(0, 10).forEach(path => {
    console.log(`   ${BASE_URL}${path === '/' ? '' : path}`);
  });
  if (existingPaths.length > 10) {
    console.log(`   ... and ${existingPaths.length - 10} more`);
  }
  
  console.log('\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
