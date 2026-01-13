#!/usr/bin/env node
/**
 * SEO Audit Script for /dist
 * 
 * Validates prerendered HTML files for common SEO issues.
 * Runs after build+prerender to ensure no regressions.
 * 
 * CHECKS:
 * 1. Exactly 1 H1 per page
 * 2. Meta robots in <head> (not body)
 * 3. No internal links with query params
 * 4. No links to weedmadrid.com without www
 * 5. No links to legacy routes
 * 6. H2 before H1 (heading sequence issue)
 * 
 * EXIT CODES:
 * 0 = OK
 * 1 = Errors found
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const REPORT_FILE = join(ROOT_DIR, 'seo-audit-report.json');

// Base URL
const BASE_URL = 'https://www.weedmadrid.com';

// Directories to skip
const SKIP_DIRS = new Set(['assets', 'images', 'fonts', '__prerender_debug__', 'api']);

// Legacy routes that should not be linked
const LEGACY_ROUTES = [
  '/how-to-join-cannabis-club-madrid',
  '/best-cannabis-clubs-madrid',
  '/complete-guide-cannabis-clubs-madrid',
  '/cannabis-tourism-madrid',
  '/cannabis-laws-spain-2025',
  '/guides/how-to-join-cannabis-club-madrid',
  '/guides/cannabis-laws-spain-2025',
  '/guides/best-cannabis-clubs-madrid-2025',
  '/invitation',
  '/invite/',
  '/clubs/club-',
];

// Counters
const results = {
  totalFiles: 0,
  h1Issues: [],        // Pages with 0 or >1 H1
  robotsInBody: [],    // Pages with meta robots in body
  queryLinks: [],      // Pages with ?param links
  nonWwwLinks: [],     // Pages with weedmadrid.com (no www)
  legacyLinks: [],     // Pages with legacy route links
  h2BeforeH1: [],      // Pages where H2 appears before H1
};

/**
 * Extract all href values from HTML
 */
function extractHrefs(html) {
  const hrefs = [];
  const regex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    hrefs.push(match[1]);
  }
  return hrefs;
}

/**
 * Check if meta robots is in body instead of head
 */
function hasRobotsInBody(html) {
  // Split at </head>
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) return false;
  
  const body = html.slice(headEnd);
  return /<meta[^>]*name=["']robots["'][^>]*>/i.test(body);
}

/**
 * Count H1 tags in HTML
 */
function countH1(html) {
  // Exclude noscript content from H1 count
  const htmlWithoutNoscript = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  const matches = htmlWithoutNoscript.match(/<h1[\s\S]*?<\/h1>/gi);
  return matches ? matches.length : 0;
}

/**
 * Check if H2 appears before H1
 */
function hasH2BeforeH1(html) {
  // Exclude noscript content
  const htmlWithoutNoscript = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  
  const h1Index = htmlWithoutNoscript.search(/<h1[\s>]/i);
  const h2Index = htmlWithoutNoscript.search(/<h2[\s>]/i);
  
  if (h2Index === -1) return false; // No H2
  if (h1Index === -1) return true;  // H2 but no H1
  
  return h2Index < h1Index;
}

/**
 * Check for internal links with query params
 */
function findQueryLinks(hrefs) {
  return hrefs.filter(href => {
    // Only internal links
    if (href.startsWith('http') && !href.includes('weedmadrid.com')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return false;
    
    // Check for ? in the href
    return href.includes('?');
  });
}

/**
 * Check for links to weedmadrid.com without www
 */
function findNonWwwLinks(hrefs) {
  return hrefs.filter(href => {
    // Match weedmadrid.com without www
    return /https?:\/\/weedmadrid\.com/i.test(href);
  });
}

/**
 * Check for links to legacy routes
 */
function findLegacyLinks(hrefs) {
  return hrefs.filter(href => {
    const normalizedHref = href.toLowerCase();
    return LEGACY_ROUTES.some(legacy => {
      if (legacy.endsWith('/')) {
        return normalizedHref.includes(legacy);
      }
      // Exact match or with trailing content
      return normalizedHref === legacy || 
             normalizedHref.startsWith(legacy + '/') ||
             normalizedHref.startsWith(legacy + '?') ||
             normalizedHref.endsWith(legacy);
    });
  });
}

/**
 * Validate a single HTML file
 */
function validateFile(filePath, urlPath) {
  const html = readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // 1. Check H1 count
  const h1Count = countH1(html);
  if (h1Count !== 1) {
    results.h1Issues.push({ url: urlPath, count: h1Count });
    issues.push(`H1 count: ${h1Count}`);
  }
  
  // 2. Check meta robots position
  if (hasRobotsInBody(html)) {
    results.robotsInBody.push(urlPath);
    issues.push('Meta robots in BODY');
  }
  
  // Extract all hrefs
  const hrefs = extractHrefs(html);
  
  // 3. Check query links
  const queryLinks = findQueryLinks(hrefs);
  if (queryLinks.length > 0) {
    results.queryLinks.push({ url: urlPath, links: queryLinks });
    issues.push(`Query links: ${queryLinks.length}`);
  }
  
  // 4. Check non-www links
  const nonWwwLinks = findNonWwwLinks(hrefs);
  if (nonWwwLinks.length > 0) {
    results.nonWwwLinks.push({ url: urlPath, links: nonWwwLinks });
    issues.push(`Non-www links: ${nonWwwLinks.length}`);
  }
  
  // 5. Check legacy links
  const legacyLinks = findLegacyLinks(hrefs);
  if (legacyLinks.length > 0) {
    results.legacyLinks.push({ url: urlPath, links: legacyLinks });
    issues.push(`Legacy links: ${legacyLinks.length}`);
  }
  
  // 6. Check H2 before H1
  if (hasH2BeforeH1(html)) {
    results.h2BeforeH1.push(urlPath);
    issues.push('H2 before H1');
  }
  
  results.totalFiles++;
  
  return issues;
}

/**
 * Walk directory recursively
 */
function walkDir(dir, baseDir = dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(file)) {
        walkDir(filePath, baseDir);
      }
    } else if (file === 'index.html') {
      const relativePath = dir.replace(baseDir, '') || '/';
      const urlPath = relativePath.replace(/\\/g, '/');
      
      const issues = validateFile(filePath, urlPath);
      if (issues.length > 0) {
        console.log(`  ❌ ${urlPath}: ${issues.join(', ')}`);
      }
    }
  }
}

/**
 * Print summary and exit
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEO AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total HTML files: ${results.totalFiles}`);
  console.log(`   H1 issues (not exactly 1): ${results.h1Issues.length}`);
  console.log(`   Meta robots in body: ${results.robotsInBody.length}`);
  console.log(`   Pages with query links: ${results.queryLinks.length}`);
  console.log(`   Pages with non-www links: ${results.nonWwwLinks.length}`);
  console.log(`   Pages with legacy links: ${results.legacyLinks.length}`);
  console.log(`   H2 before H1: ${results.h2BeforeH1.length}`);
  console.log('='.repeat(60));
  
  // Print details for issues
  if (results.h1Issues.length > 0) {
    console.log('\n🔍 H1 Issues:');
    results.h1Issues.slice(0, 10).forEach(({ url, count }) => {
      console.log(`   ${url}: ${count} H1(s)`);
    });
    if (results.h1Issues.length > 10) {
      console.log(`   ... and ${results.h1Issues.length - 10} more`);
    }
  }
  
  if (results.robotsInBody.length > 0) {
    console.log('\n🔍 Meta robots in BODY (should be in HEAD):');
    results.robotsInBody.slice(0, 10).forEach(url => {
      console.log(`   ${url}`);
    });
    if (results.robotsInBody.length > 10) {
      console.log(`   ... and ${results.robotsInBody.length - 10} more`);
    }
  }
  
  if (results.queryLinks.length > 0) {
    console.log('\n🔍 Query links (internal links with ?):');
    results.queryLinks.slice(0, 5).forEach(({ url, links }) => {
      console.log(`   ${url}:`);
      links.slice(0, 3).forEach(link => console.log(`     - ${link}`));
    });
  }
  
  if (results.nonWwwLinks.length > 0) {
    console.log('\n🔍 Non-www links (weedmadrid.com without www):');
    results.nonWwwLinks.slice(0, 5).forEach(({ url, links }) => {
      console.log(`   ${url}:`);
      links.slice(0, 3).forEach(link => console.log(`     - ${link}`));
    });
  }
  
  if (results.legacyLinks.length > 0) {
    console.log('\n🔍 Legacy route links:');
    results.legacyLinks.slice(0, 5).forEach(({ url, links }) => {
      console.log(`   ${url}:`);
      links.slice(0, 3).forEach(link => console.log(`     - ${link}`));
    });
  }
  
  // Save full report to JSON
  writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full report saved to: seo-audit-report.json`);
  
  // Determine exit code
  const hasErrors = 
    results.h1Issues.length > 0 ||
    results.robotsInBody.length > 0 ||
    results.queryLinks.length > 0 ||
    results.nonWwwLinks.length > 0 ||
    results.legacyLinks.length > 0;
  
  if (hasErrors) {
    console.log('\n❌ SEO AUDIT FAILED - Fix issues above before deploying\n');
    return 1;
  }
  
  console.log('\n✅ SEO AUDIT PASSED - All checks OK!\n');
  return 0;
}

/**
 * Main
 */
function main() {
  console.log('\n🔍 SEO Audit for /dist\n');
  console.log(`📁 Scanning: ${DIST_DIR}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);
  
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run build first.');
    process.exit(1);
  }
  
  console.log('Scanning files...\n');
  walkDir(DIST_DIR);
  
  const exitCode = printSummary();
  process.exit(exitCode);
}

main();
