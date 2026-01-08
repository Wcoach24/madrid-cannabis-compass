#!/usr/bin/env node
/**
 * Robust SSG Prerender Script
 * 
 * Prerenders ALL public routes to static HTML with correct SEO metadata.
 * Each generated file is validated before saving.
 * 
 * Usage: node scripts/prerender.mjs
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { getAllPaths } from './routes-inventory.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.weedmadrid.com';

// Validation thresholds
const MIN_TITLE_LENGTH = 10;
const MIN_CONTENT_LENGTH = 1000;
const MAX_RETRIES = 2;

// Track validation results
const validationResults = {
  success: [],
  warnings: [],
  errors: [],
};

/**
 * Simple static file server for dist/
 */
function createStaticServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      
      // SPA fallback - serve index.html for routes without file extension
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
          'jpeg': 'image/jpeg',
          'svg': 'image/svg+xml',
          'webp': 'image/webp',
          'woff2': 'font/woff2',
          'woff': 'font/woff',
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

/**
 * Validate that HTML has proper SEO metadata
 */
function validateHtml(html, url) {
  const issues = [];
  const fullUrl = `${BASE_URL}${url === '/' ? '' : url}`;

  // Extract SEO elements
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
  const ogUrlMatch = html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]*)"[^>]*>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);

  const title = titleMatch ? titleMatch[1] : '';
  const canonical = canonicalMatch ? canonicalMatch[1] : '';
  const ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';

  // Title validation
  if (!title || title.length < MIN_TITLE_LENGTH) {
    issues.push(`Title too short or missing: "${title}"`);
  }

  // For non-home pages, canonical should not be home
  if (url !== '/' && url !== '') {
    if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
      issues.push(`Canonical pointing to home instead of page`);
    }
  }

  // og:url should match canonical
  if (canonical && ogUrl && canonical !== ogUrl) {
    issues.push(`og:url doesn't match canonical`);
  }

  // H1 should exist
  if (!h1Match) {
    issues.push(`Missing H1 tag`);
  }

  // Content length check (rough indicator of proper render)
  if (html.length < MIN_CONTENT_LENGTH) {
    issues.push(`HTML content too short (${html.length} chars)`);
  }

  // Check for empty root (SPA shell)
  if (html.includes('<div id="root"></div>') || html.includes('<div id="root"> </div>')) {
    issues.push(`Contains empty #root (SPA shell)`);
  }

  return issues;
}

/**
 * Fix SEO metadata in HTML to use production URLs
 */
function fixSeoMetadata(html, url) {
  const fullUrl = `${BASE_URL}${url === '/' ? '' : url}`;

  // Fix canonical - always use full production URL
  html = html.replace(
    /<link[^>]*rel="canonical"[^>]*href="[^"]*"[^>]*>/gi,
    `<link rel="canonical" href="${fullUrl}">`
  );

  // Fix og:url - must match canonical exactly
  html = html.replace(
    /<meta[^>]*property="og:url"[^>]*content="[^"]*"[^>]*>/gi,
    `<meta property="og:url" content="${fullUrl}">`
  );

  // Fix any localhost references
  html = html.replace(/http:\/\/localhost:\d+/g, BASE_URL);

  // Ensure proper doctype
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<!doctype')) {
    html = '<!DOCTYPE html>' + html;
  }

  return html;
}

/**
 * Prerender a single route with retries and validation
 */
async function prerenderRoute(browser, url, serverPort, retryCount = 0) {
  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({ width: 1280, height: 800 });
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (compatible; PrerenderBot/1.0)');

  try {
    // Navigate to the route
    await page.goto(`http://localhost:${serverPort}${url}`, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // Wait for hydration indicator
    await page.waitForFunction(() => {
      // Check multiple indicators of complete render
      const hasTitle = document.title && document.title.length > 10;
      const hasH1 = !!document.querySelector('h1');
      const hasContent = document.body.innerText.length > 100;
      const isHydrated = document.documentElement.getAttribute('data-hydrated') === 'true' 
        || document.querySelector('[data-hydrated="true"]')
        || (hasTitle && hasH1 && hasContent);
      return isHydrated;
    }, { timeout: 15000 }).catch(() => {
      console.warn(`  ⚠ Timeout waiting for full render on ${url}`);
    });

    // Extra wait for async data and SEOHead updates
    await new Promise(r => setTimeout(r, 1000));

    // Get rendered HTML
    let html = await page.content();

    // Fix SEO metadata
    html = fixSeoMetadata(html, url);

    // Validate
    const issues = validateHtml(html, url);

    if (issues.length > 0 && retryCount < MAX_RETRIES) {
      console.log(`  ⚠ Validation issues, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
      return prerenderRoute(browser, url, serverPort, retryCount + 1);
    }

    if (issues.length > 0) {
      validationResults.warnings.push({ url, issues });
    } else {
      validationResults.success.push(url);
    }

    return { html, issues };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`  ⚠ Error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
      return prerenderRoute(browser, url, serverPort, retryCount + 1);
    }
    validationResults.errors.push({ url, error: error.message });
    throw error;
  } finally {
    await page.close().catch(() => {});
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

/**
 * Print validation summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PRERENDER SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${validationResults.success.length}`);
  console.log(`⚠️  Warnings: ${validationResults.warnings.length}`);
  console.log(`❌ Errors: ${validationResults.errors.length}`);
  
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  Pages with warnings:');
    validationResults.warnings.forEach(({ url, issues }) => {
      console.log(`   ${url}`);
      issues.forEach(i => console.log(`      - ${i}`));
    });
  }
  
  if (validationResults.errors.length > 0) {
    console.log('\n❌ Failed pages:');
    validationResults.errors.forEach(({ url, error }) => {
      console.log(`   ${url}: ${error}`);
    });
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Robust SSG Prerender...\n');

  // Verify dist exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run `vite build` first.');
    process.exit(1);
  }

  // Get all URLs from routes inventory
  const urls = await getAllPaths();
  console.log(`📄 Total routes to prerender: ${urls.length}\n`);

  // Start static server
  const PORT = 3456;
  const server = await createStaticServer(PORT);

  // Launch Puppeteer
  console.log('🎭 Launching Puppeteer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // Prerender each route
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] ${url}...`);
    
    try {
      const { html, issues } = await prerenderRoute(browser, url, PORT);
      saveHtml(url, html);
      
      if (issues.length > 0) {
        console.log(` ⚠️ (${issues.length} warnings)`);
      } else {
        console.log(` ✅`);
      }
    } catch (error) {
      console.log(` ❌ ${error.message}`);
    }
  }

  // Cleanup
  await browser.close();
  server.close();

  // Print summary
  printSummary();

  // Exit with error if critical failures
  if (validationResults.errors.length > 0) {
    console.log('❌ Prerender completed with errors\n');
    process.exit(1);
  }

  console.log('✅ Prerender completed successfully!\n');
  console.log(`📁 Output: ${DIST_DIR}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
