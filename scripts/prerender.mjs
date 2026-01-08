#!/usr/bin/env node
/**
 * Robust SSG Prerender Script
 * 
 * Prerenders ALL public routes to static HTML with correct SEO metadata.
 * Each generated file is validated before saving.
 * 
 * CRITICAL: This script must run in an environment with Chrome available
 * (e.g., GitHub Actions with puppeteer browsers install chrome)
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
const SEO_READY_TIMEOUT = 30000;
const STABILITY_WAIT = 500;

// Home page detection - used to prevent home fallback on internal pages
const HOME_TITLE_PREFIX = 'Best Cannabis Clubs Madrid 2025';

// Track validation results
const validationResults = {
  success: [],
  warnings: [],
  errors: [],
};

/**
 * Static file server for dist/
 * CRITICAL: For routes without extension, ALWAYS serve the SPA index.html.
 * This prevents already-prerendered HTML from contaminating subsequent renders.
 */
function createStaticServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      const ext = extname(urlPath);

      // For requests WITHOUT file extension, ALWAYS serve SPA index.html
      if (!ext) {
        try {
          const content = readFileSync(join(DIST_DIR, 'index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
          return;
        } catch (e) {
          res.writeHead(500);
          res.end('SPA index.html not found');
          return;
        }
      }

      // For requests WITH extension, serve the actual file
      const filePath = join(DIST_DIR, urlPath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ico': 'image/x-icon',
      };

      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
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
  const isHome = url === '/' || url === '';

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

  // CRITICAL: For non-home pages, detect home fallback
  if (!isHome) {
    if (title.startsWith(HOME_TITLE_PREFIX)) {
      issues.push(`CRITICAL: Home title detected on internal page!`);
    }
    if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
      issues.push(`CRITICAL: Canonical pointing to home instead of page!`);
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

  // Content length check
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

  // Fix canonical
  html = html.replace(
    /<link[^>]*rel="canonical"[^>]*href="[^"]*"[^>]*>/gi,
    `<link rel="canonical" href="${fullUrl}">`
  );

  // Fix og:url
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
  const isHome = url === '/' || url === '';
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

  try {
    await page.goto(`http://localhost:${serverPort}${url}`, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // ROBUST WAITING: Wait for ALL conditions to be true
    await page.waitForFunction((isHomePage, homeTitlePrefix) => {
      // 1) data-seo-ready must be 'true'
      const seoReady = document.documentElement.getAttribute('data-seo-ready') === 'true';
      if (!seoReady) return false;
      
      // 2) H1 must exist with non-empty text
      const h1 = document.querySelector('h1');
      const h1Ok = !!h1 && (h1.textContent || '').trim().length > 0;
      if (!h1Ok) return false;
      
      // 3) No "Loading..." visible in root
      const root = document.getElementById('root');
      const noLoading = !root || !root.textContent.includes('Loading...');
      if (!noLoading) return false;
      
      // 4) For non-home pages, title must NOT be home title
      if (!isHomePage) {
        const title = document.title || '';
        if (title.startsWith(homeTitlePrefix)) return false;
      }
      
      return true;
    }, { timeout: SEO_READY_TIMEOUT }, isHome, HOME_TITLE_PREFIX).catch((e) => {
      console.warn(`  ⚠ Timeout waiting for SEO conditions on ${url}: ${e.message}`);
    });

    // Extra stability wait after conditions are met
    await new Promise(r => setTimeout(r, STABILITY_WAIT));

    // Get rendered HTML
    let html = await page.content();

    // Fix SEO metadata
    html = fixSeoMetadata(html, url);

    // Validate
    const issues = validateHtml(html, url);

    // Check for CRITICAL issues that should trigger retry
    const hasCritical = issues.some(i => i.includes('CRITICAL'));
    
    if (hasCritical && retryCount < MAX_RETRIES) {
      console.log(`  ⚠ Critical issues, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
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

/**
 * Save HTML to the correct path in dist/
 */
function saveHtml(url, html) {
  let outputPath;
  
  if (url === '/') {
    outputPath = join(DIST_DIR, 'index.html');
  } else {
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
    validationResults.warnings.slice(0, 10).forEach(({ url, issues }) => {
      console.log(`   ${url}`);
      issues.forEach(i => console.log(`      - ${i}`));
    });
    if (validationResults.warnings.length > 10) {
      console.log(`   ... and ${validationResults.warnings.length - 10} more`);
    }
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

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run `vite build` first.');
    process.exit(1);
  }

  const urls = await getAllPaths();
  console.log(`📄 Total routes to prerender: ${urls.length}\n`);

  const PORT = 3456;
  const server = await createStaticServer(PORT);

  console.log('🎭 Launching Puppeteer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] ${url}...`);
    
    try {
      const { html, issues } = await prerenderRoute(browser, url, PORT);
      saveHtml(url, html);
      
      const hasCritical = issues.some(i => i.includes('CRITICAL'));
      if (hasCritical) {
        console.log(` ❌ CRITICAL`);
      } else if (issues.length > 0) {
        console.log(` ⚠️ (${issues.length} warnings)`);
      } else {
        console.log(` ✅`);
      }
    } catch (error) {
      console.log(` ❌ ${error.message}`);
    }
  }

  await browser.close();
  server.close();

  printSummary();

  // Fail build if there are CRITICAL issues or errors
  const criticalCount = validationResults.warnings.filter(
    w => w.issues.some(i => i.includes('CRITICAL'))
  ).length;
  
  if (validationResults.errors.length > 0 || criticalCount > 0) {
    console.log(`❌ Prerender FAILED: ${validationResults.errors.length} errors, ${criticalCount} critical issues\n`);
    process.exit(1);
  }

  console.log('✅ Prerender completed successfully!\n');
  console.log(`📁 Output: ${DIST_DIR}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
