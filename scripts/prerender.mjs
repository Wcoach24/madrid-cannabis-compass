#!/usr/bin/env node
/**
 * Robust SSG Prerender Script
 * 
 * Prerenders ALL public routes to static HTML with correct SEO metadata.
 * Each generated file is validated before saving.
 * 
 * FEATURES:
 * - Soft-fail: continues on non-core route failures
 * - Debug dumps: saves failed HTML for inspection
 * - Core routes gating: only fails build if core routes fail
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
const DEBUG_DIR = join(DIST_DIR, '__prerender_debug__');
const BASE_URL = 'https://www.weedmadrid.com';

// Validation thresholds
const MIN_TITLE_LENGTH = 10;
const MIN_CONTENT_LENGTH = 1000;
const MAX_RETRIES = 2;
const DEFAULT_TIMEOUT = 30000;
const HEAVY_ROUTE_TIMEOUT = 60000;
const STABILITY_WAIT = 750;

// Parallelization settings - process multiple pages simultaneously
const CONCURRENCY = 8;

// Heavy routes that need more time
const HEAVY_ROUTES = ['/clubs'];

// Core routes - build fails if ANY of these fail
const CORE_ROUTES = [
  '/',
  '/clubs',
  '/guides',
  '/club/genetics-social-club-madrid',
  '/guide/best-cannabis-clubs-madrid-2025'
];

// Language home paths
const LANGUAGE_HOMES = new Set(['/', '/es', '/de', '/fr', '/it']);

// Fallback title to detect unhydrated pages
const FALLBACK_TITLE = 'Weed Madrid';

// Track validation results
const validationResults = {
  success: [],
  warnings: [],
  failed: [],
  coreFailed: [],
  debugDumps: {},
};

/**
 * Check if route is a core route
 */
function isCoreRoute(url) {
  return CORE_ROUTES.includes(url);
}

/**
 * Get timeout for a specific route
 */
function getTimeoutForRoute(url) {
  if (HEAVY_ROUTES.includes(url)) {
    return HEAVY_ROUTE_TIMEOUT;
  }
  return DEFAULT_TIMEOUT;
}

/**
 * Static file server for dist/
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
  const isHome = LANGUAGE_HOMES.has(url);

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

  // For non-home pages, detect fallback issues
  if (!isHome) {
    // Canonical should point to THIS page, not home
    if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
      issues.push(`CRITICAL: Canonical pointing to home instead of page!`);
    }
    
    // Title shouldn't be just the fallback
    if (title === FALLBACK_TITLE || title === '') {
      issues.push(`CRITICAL: Title is fallback or empty on internal page!`);
    }
  }

  // og:url should match canonical
  if (canonical && ogUrl && canonical !== ogUrl) {
    issues.push(`og:url doesn't match canonical`);
  }

  // H1 warning (not critical)
  if (!h1Match) {
    issues.push(`Warning: Missing H1 tag`);
  }

  // Content length check
  if (html.length < MIN_CONTENT_LENGTH) {
    issues.push(`HTML content too short (${html.length} chars)`);
  }

  // Check for empty root (SPA shell)
  if (html.includes('<div id="root"></div>') || html.includes('<div id="root"> </div>')) {
    issues.push(`CRITICAL: Contains empty #root (SPA shell)`);
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
 * Save debug dump for failed route
 */
function saveDebugDump(url, html, metadata) {
  mkdirSync(DEBUG_DIR, { recursive: true });
  
  // Convert URL to safe filename
  const safeName = url === '/' ? 'index' : url.replace(/^\//, '').replace(/\//g, '__');
  const htmlPath = join(DEBUG_DIR, `${safeName}.html`);
  const metaPath = join(DEBUG_DIR, `${safeName}.json`);
  
  writeFileSync(htmlPath, html);
  writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  
  validationResults.debugDumps[url] = {
    html: htmlPath.replace(ROOT_DIR, ''),
    meta: metaPath.replace(ROOT_DIR, ''),
  };
  
  console.log(`  📝 Debug dump saved: ${safeName}.html`);
}

/**
 * Extract page metadata for debugging
 */
async function extractMetadata(page, url) {
  return await page.evaluate((urlPath) => {
    const canonical = document.querySelector('link[rel="canonical"]');
    const title = document.title;
    const h1 = document.querySelector('h1');
    const hydrated = document.documentElement.getAttribute('data-hydrated');
    const seoReady = document.documentElement.getAttribute('data-seo-ready');
    const rootContent = document.getElementById('root')?.innerHTML?.substring(0, 200) || '';
    
    return {
      url: urlPath,
      pathname: window.location.pathname,
      title,
      canonical: canonical?.getAttribute('href') || null,
      h1: h1?.textContent?.substring(0, 100) || null,
      dataHydrated: hydrated,
      dataSeoReady: seoReady,
      rootPreview: rootContent,
      timestamp: new Date().toISOString(),
    };
  }, url);
}

/**
 * Prerender a single route with retries and validation
 */
async function prerenderRoute(browser, url, serverPort, retryCount = 0) {
  const page = await browser.newPage();
  const isHome = LANGUAGE_HOMES.has(url);
  const timeout = getTimeoutForRoute(url);
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

  try {
    await page.goto(`http://localhost:${serverPort}${url}`, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // ROBUST WAITING: Wait for stable SEO conditions
    let waitSuccess = true;
    try {
      await page.waitForFunction((isHomePage, fallbackTitle, baseUrl, currentUrl) => {
        // 1) data-hydrated must be 'true'
        const hydrated = document.documentElement.getAttribute('data-hydrated') === 'true';
        if (!hydrated) return false;
        
        // 2) data-seo-ready must be 'true'
        const seoReady = document.documentElement.getAttribute('data-seo-ready') === 'true';
        if (!seoReady) return false;
        
        // 3) Title must exist and not be just the fallback for non-home pages
        const title = (document.title || '').trim();
        if (!title) return false;
        if (!isHomePage && title === fallbackTitle) return false;
        
        // 4) Canonical must exist and contain the current route path
        const canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) return false;
        const canonicalHref = canonical.getAttribute('href') || '';
        
        // For non-home, canonical should contain the path
        if (!isHomePage) {
          // Normalize: remove trailing slash for comparison
          const normalizedUrl = currentUrl.replace(/\/$/, '') || '/';
          if (!canonicalHref.includes(normalizedUrl)) return false;
        }
        
        // 5) Root should not have Loading state
        const root = document.getElementById('root');
        if (root && root.innerHTML.includes('Loading...')) return false;
        
        return true;
      }, { timeout }, isHome, FALLBACK_TITLE, BASE_URL, url);
    } catch (waitError) {
      console.warn(`  ⚠ Timeout waiting for SEO conditions: ${waitError.message.split('\n')[0]}`);
      waitSuccess = false;
    }

    // Extra stability wait after conditions are met
    await new Promise(r => setTimeout(r, STABILITY_WAIT));

    // Get rendered HTML
    let html = await page.content();
    
    // Extract metadata for debugging
    const metadata = await extractMetadata(page, url);

    // Fix SEO metadata
    html = fixSeoMetadata(html, url);

    // Validate
    const issues = validateHtml(html, url);

    // Check for CRITICAL issues
    const hasCritical = issues.some(i => i.includes('CRITICAL'));
    
    if ((hasCritical || !waitSuccess) && retryCount < MAX_RETRIES) {
      console.log(`  ⚠ Issues detected, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
      return prerenderRoute(browser, url, serverPort, retryCount + 1);
    }

    // After max retries, save debug dump if still failing
    if (hasCritical || !waitSuccess) {
      saveDebugDump(url, html, { ...metadata, issues, waitSuccess });
    }

    if (issues.some(i => i.includes('CRITICAL'))) {
      validationResults.failed.push({ url, issues });
      if (isCoreRoute(url)) {
        validationResults.coreFailed.push(url);
      }
    } else if (issues.length > 0) {
      validationResults.warnings.push({ url, issues });
    } else {
      validationResults.success.push(url);
    }

    return { html, issues, waitSuccess };
  } catch (error) {
    // Get current HTML even on error
    let html = '';
    let metadata = {};
    try {
      html = await page.content();
      metadata = await extractMetadata(page, url);
    } catch (e) {
      // Ignore extraction errors
    }
    
    if (retryCount < MAX_RETRIES) {
      console.log(`  ⚠ Error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
      return prerenderRoute(browser, url, serverPort, retryCount + 1);
    }
    
    // Save debug dump for failed route
    saveDebugDump(url, html, { ...metadata, error: error.message });
    
    validationResults.failed.push({ url, issues: [error.message] });
    if (isCoreRoute(url)) {
      validationResults.coreFailed.push(url);
    }
    
    // Return minimal result instead of throwing
    return { html, issues: [error.message], waitSuccess: false };
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
  console.log(`❌ Failed: ${validationResults.failed.length}`);
  console.log(`🔴 Core Failed: ${validationResults.coreFailed.length}`);
  
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  Pages with warnings:');
    validationResults.warnings.slice(0, 5).forEach(({ url, issues }) => {
      console.log(`   ${url}`);
      issues.slice(0, 2).forEach(i => console.log(`      - ${i}`));
    });
    if (validationResults.warnings.length > 5) {
      console.log(`   ... and ${validationResults.warnings.length - 5} more`);
    }
  }
  
  if (validationResults.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    validationResults.failed.forEach(({ url, issues }) => {
      console.log(`   ${url}`);
      issues.slice(0, 2).forEach(i => console.log(`      - ${i}`));
    });
  }
  
  if (validationResults.coreFailed.length > 0) {
    console.log('\n🔴 CORE ROUTES FAILED (build will fail):');
    validationResults.coreFailed.forEach(url => {
      console.log(`   ${url}`);
    });
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Save report JSON
 */
function saveReport() {
  mkdirSync(DEBUG_DIR, { recursive: true });
  const reportPath = join(DEBUG_DIR, 'report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      success: validationResults.success.length,
      warnings: validationResults.warnings.length,
      failed: validationResults.failed.length,
      coreFailed: validationResults.coreFailed.length,
    },
    coreRoutes: CORE_ROUTES,
    coreFailed: validationResults.coreFailed,
    failed: validationResults.failed,
    warnings: validationResults.warnings.map(w => ({ url: w.url, issues: w.issues })),
    debugDumps: validationResults.debugDumps,
  };
  
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 Report saved: ${reportPath.replace(ROOT_DIR, '')}`);
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

  const allUrls = await getAllPaths();
  
  // Sort: core routes first for early failure detection
  const urls = [
    ...allUrls.filter(u => CORE_ROUTES.includes(u)),
    ...allUrls.filter(u => !CORE_ROUTES.includes(u))
  ];
  
  console.log(`📄 Total routes to prerender: ${urls.length}`);
  console.log(`⚡ Parallelization: ${CONCURRENCY} concurrent pages\n`);

  const PORT = 3456;
  const server = await createStaticServer(PORT);

  console.log('🎭 Launching Puppeteer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // Process in parallel batches
  const startTime = Date.now();
  let completed = 0;

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchNum = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(urls.length / CONCURRENCY);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} pages)`);
    
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const isCore = isCoreRoute(url);
        const shortUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
        
        try {
          const { html, issues, waitSuccess } = await prerenderRoute(browser, url, PORT);
          
          // Always save HTML (even if issues exist, for fallback)
          if (html && html.length > 500) {
            saveHtml(url, html);
          }
          
          const hasCritical = issues.some(i => i.includes('CRITICAL'));
          const status = hasCritical || !waitSuccess ? '❌' : issues.length > 0 ? '⚠️' : '✅';
          
          return { url, status, isCore, issues };
        } catch (error) {
          return { url, status: '❌', isCore, error: error.message };
        }
      })
    );
    
    // Log batch results
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        const { url, status, isCore } = result.value;
        const coreTag = isCore ? ' [CORE]' : '';
        console.log(`  ${status} ${url}${coreTag}`);
      } else {
        console.log(`  ❌ ${batch[idx]} (Promise rejected)`);
      }
    });
    
    completed += batch.length;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (completed / parseFloat(elapsed)).toFixed(1);
    console.log(`  ⏱️ Progress: ${completed}/${urls.length} (${rate} pages/sec)`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⚡ Total prerender time: ${totalTime}s`);

  await browser.close();
  server.close();

  printSummary();
  saveReport();

  // Only fail build if CORE routes failed
  if (validationResults.coreFailed.length > 0) {
    console.log(`\n❌ BUILD FAILED: ${validationResults.coreFailed.length} core route(s) failed!\n`);
    console.log('Core routes are critical for SEO. Fix these before deploying.\n');
    process.exit(1);
  }

  if (validationResults.failed.length > 0) {
    console.log(`\n⚠️ Prerender completed with ${validationResults.failed.length} non-core failures.`);
    console.log('These pages have debug dumps for inspection.\n');
  } else {
    console.log('✅ Prerender completed successfully!\n');
  }
  
  console.log(`📁 Output: ${DIST_DIR}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
