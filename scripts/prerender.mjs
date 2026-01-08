#!/usr/bin/env node
/**
 * Static Site Generator (SSG) Prerender Script
 * 
 * This script prerenders all public routes to static HTML files,
 * ensuring that crawlers see proper SEO metadata in View Source.
 * 
 * Usage: node scripts/prerender.mjs
 * 
 * Requirements:
 * - Run `npm run build` first
 * - puppeteer must be installed
 * - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.weedmadrid.com';

// Load env vars
import { config } from 'dotenv';
config({ path: join(ROOT_DIR, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// Languages to prerender
const LANGUAGES = ['en', 'es', 'de', 'fr', 'it'];

// Static routes (without language prefix)
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
  '/club-cannabis-madrid', // Spanish pillar page
];

// Fetch dynamic routes from Supabase
async function fetchDynamicRoutes() {
  console.log('📡 Fetching routes from Supabase...');
  
  const routes = {
    clubs: [],
    articles: {},
    districts: [],
  };

  // Fetch active clubs
  const clubsRes = await fetch(`${SUPABASE_URL}/rest/v1/clubs?status=eq.active&select=slug`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  if (clubsRes.ok) {
    const clubs = await clubsRes.json();
    routes.clubs = clubs.map(c => c.slug);
    console.log(`  ✓ Found ${routes.clubs.length} clubs`);
  }

  // Fetch published articles per language
  for (const lang of LANGUAGES) {
    const articlesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?status=eq.published&language=eq.${lang}&select=slug`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (articlesRes.ok) {
      const articles = await articlesRes.json();
      routes.articles[lang] = articles.map(a => a.slug);
      console.log(`  ✓ Found ${articles.length} articles for ${lang}`);
    }
  }

  // Get unique districts from clubs
  const districtsRes = await fetch(`${SUPABASE_URL}/rest/v1/clubs?status=eq.active&select=district`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  if (districtsRes.ok) {
    const clubsWithDistricts = await districtsRes.json();
    const uniqueDistricts = [...new Set(clubsWithDistricts.map(c => c.district))];
    routes.districts = uniqueDistricts.map(d => d.toLowerCase().replace(/\s+/g, '-'));
    console.log(`  ✓ Found ${routes.districts.length} districts`);
  }

  return routes;
}

// Build all URLs to prerender
function buildAllUrls(dynamicRoutes) {
  const urls = [];
  
  // Static routes for all languages
  for (const route of STATIC_ROUTES) {
    // English (default) - no prefix
    urls.push(route);
    
    // Other languages with prefix
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        urls.push(`/${lang}${route === '/' ? '' : route}`);
      }
    }
  }

  // Club pages (language-agnostic content)
  for (const slug of dynamicRoutes.clubs) {
    urls.push(`/club/${slug}`);
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        urls.push(`/${lang}/club/${slug}`);
      }
    }
  }

  // Article/guide pages (language-specific content)
  for (const lang of LANGUAGES) {
    const articles = dynamicRoutes.articles[lang] || [];
    for (const slug of articles) {
      if (lang === 'en') {
        urls.push(`/guide/${slug}`);
      } else {
        urls.push(`/${lang}/guide/${slug}`);
      }
    }
  }

  // District pages
  for (const district of dynamicRoutes.districts) {
    urls.push(`/district/${district}`);
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        urls.push(`/${lang}/district/${district}`);
      }
    }
  }

  return [...new Set(urls)]; // Remove duplicates
}

// Simple static file server for dist/
function createStaticServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      
      // SPA fallback - serve index.html for all routes
      if (!existsSync(filePath) || !filePath.includes('.')) {
        filePath = join(DIST_DIR, 'index.html');
      }

      try {
        const content = readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const contentTypes = {
          'html': 'text/html',
          'js': 'application/javascript',
          'css': 'text/css',
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'svg': 'image/svg+xml',
          'webp': 'image/webp',
        };
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(content);
      } catch (e) {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log(`🌐 Static server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Prerender a single route
async function prerenderRoute(browser, url, serverPort) {
  const page = await browser.newPage();
  
  try {
    // Navigate to the route
    await page.goto(`http://localhost:${serverPort}${url}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for React to hydrate and SEOHead to update
    await page.waitForFunction(() => {
      // Check if title has been updated from default
      const title = document.title;
      return title && !title.includes('Vite') && document.querySelector('h1');
    }, { timeout: 10000 }).catch(() => {
      console.warn(`  ⚠ Timeout waiting for hydration on ${url}`);
    });

    // Additional wait for any async data loading
    await new Promise(r => setTimeout(r, 500));

    // Get the fully rendered HTML
    let html = await page.content();

    // Fix canonical, og:url to use production BASE_URL
    const fullUrl = `${BASE_URL}${url}`;
    
    // Ensure canonical is correct (not homepage unless it IS homepage)
    if (url !== '/') {
      html = html.replace(
        /<link rel="canonical" href="[^"]*">/g,
        `<link rel="canonical" href="${fullUrl}">`
      );
    }
    
    // Fix og:url
    html = html.replace(
      /<meta property="og:url" content="[^"]*">/g,
      `<meta property="og:url" content="${fullUrl}">`
    );

    // Remove the static hero placeholder that was in index.html
    html = html.replace(/<section class="static-hero">[\s\S]*?<\/section>\s*<main style="padding:2rem[\s\S]*?<\/main>\s*<footer style="padding:1rem[\s\S]*?<\/footer>/g, '');

    return html;
  } finally {
    await page.close();
  }
}

// Save HTML to the correct path in dist/
function saveHtml(url, html) {
  let outputPath;
  
  if (url === '/') {
    outputPath = join(DIST_DIR, 'index.html');
  } else {
    // Create directory structure: /club/slug -> /club/slug/index.html
    const dir = join(DIST_DIR, url);
    mkdirSync(dir, { recursive: true });
    outputPath = join(dir, 'index.html');
  }

  writeFileSync(outputPath, html);
  return outputPath;
}

// Main execution
async function main() {
  console.log('\n🚀 Starting SSG Prerender...\n');

  // Verify dist exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Fetch dynamic routes
  const dynamicRoutes = await fetchDynamicRoutes();
  
  // Build all URLs
  const urls = buildAllUrls(dynamicRoutes);
  console.log(`\n📄 Total routes to prerender: ${urls.length}\n`);

  // Start static server
  const PORT = 3456;
  const server = await createStaticServer(PORT);

  // Launch Puppeteer
  console.log('🎭 Launching Puppeteer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let successCount = 0;
  let errorCount = 0;

  // Prerender each route
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] Rendering ${url}...`);
    
    try {
      const html = await prerenderRoute(browser, url, PORT);
      const outputPath = saveHtml(url, html);
      console.log(` ✓`);
      successCount++;
    } catch (error) {
      console.log(` ❌ ${error.message}`);
      errorCount++;
    }
  }

  // Cleanup
  await browser.close();
  server.close();

  console.log(`\n✅ Prerendering complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`\n📁 Output: ${DIST_DIR}\n`);
}

main().catch(console.error);
