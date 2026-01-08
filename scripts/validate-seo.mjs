#!/usr/bin/env node
/**
 * SEO Validation Script
 * 
 * Validates that prerendered HTML files have correct SEO metadata.
 * Run after prerender to ensure all pages are correctly generated.
 * 
 * STRICT MODE: Exits with code 1 if any critical SEO errors are found.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.weedmadrid.com';

// Home page patterns - used to detect fallback issues
const HOME_TITLE_PREFIX = 'Best Cannabis Clubs Madrid 2025';
const HOME_DESCRIPTION_FRAGMENT = 'Find the best cannabis clubs in Madrid 2025';

// Language home paths (these ARE allowed to have home-like content)
const LANGUAGE_HOMES = new Set(['/', '/es', '/de', '/fr', '/it']);

let errors = 0;
let warnings = 0;
let validated = 0;

function validateHtmlFile(filePath, urlPath) {
  const html = readFileSync(filePath, 'utf-8');
  const issues = [];

  // Extract key SEO elements
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
  const ogUrlMatch = html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]*)"[^>]*>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);

  const title = titleMatch ? titleMatch[1].trim() : '';
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
  const ogUrl = ogUrlMatch ? ogUrlMatch[1].trim() : '';
  const h1 = h1Match ? h1Match[1].trim() : '';
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';

  const expectedCanonical = `${BASE_URL}${urlPath === '/' ? '' : urlPath}`;
  const isLanguageHome = LANGUAGE_HOMES.has(urlPath);

  // ===== CRITICAL ERRORS (fail build) =====

  // 1) Title must exist and have minimum length
  if (!title || title.length < 10) {
    issues.push(`❌ CRITICAL: Missing or too short <title> (got: "${title}")`);
  }

  // 2) Canonical MUST exist and be EXACTLY correct
  if (!canonical) {
    issues.push(`❌ CRITICAL: Missing canonical link`);
  } else if (canonical !== expectedCanonical) {
    issues.push(`❌ CRITICAL: Canonical mismatch: "${canonical}" (expected: "${expectedCanonical}")`);
  }

  // 3) og:url MUST exist and MUST match canonical exactly
  if (!ogUrl) {
    issues.push(`❌ CRITICAL: Missing og:url`);
  } else if (canonical && ogUrl !== canonical) {
    issues.push(`❌ CRITICAL: og:url "${ogUrl}" must match canonical "${canonical}"`);
  }

  // 4) For non-home pages, PROHIBIT home fallback patterns
  if (!isLanguageHome) {
    // Check title doesn't look like home
    if (title.startsWith(HOME_TITLE_PREFIX)) {
      issues.push(`❌ CRITICAL: <title> is HOME fallback on internal page! ("${title.substring(0, 50)}...")`);
    }

    // Check canonical isn't pointing to home
    if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
      issues.push(`❌ CRITICAL: Canonical points to HOME on internal page!`);
    }

    // Check description doesn't look like home
    if (description && description.startsWith(HOME_DESCRIPTION_FRAGMENT)) {
      issues.push(`❌ CRITICAL: Meta description is HOME fallback on internal page!`);
    }
  }

  // 5) Check for SPA shell (empty root)
  if (html.includes('<div id="root"></div>') || 
      html.includes('<div id="root"> </div>') ||
      (html.includes('id="root"') && html.includes('Loading...'))) {
    issues.push(`❌ CRITICAL: Contains empty #root or Loading state (SPA shell not hydrated)`);
  }

  // ===== WARNINGS (don't fail build) =====

  if (!h1) {
    issues.push(`⚠️ Missing <h1> tag`);
  }

  if (!description || description.length < 50) {
    issues.push(`⚠️ Missing or too short meta description (${description.length} chars)`);
  }

  if (!html.includes('application/ld+json')) {
    issues.push(`⚠️ Missing JSON-LD structured data`);
  }

  // Content too short might indicate incomplete render
  if (html.length < 5000) {
    issues.push(`⚠️ HTML content suspiciously short (${html.length} chars)`);
  }

  return issues;
}

function walkDir(dir, baseDir = dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip asset directories
      if (!['assets', 'images', 'fonts'].includes(file)) {
        walkDir(filePath, baseDir);
      }
    } else if (file === 'index.html') {
      // Calculate URL path from file path
      const relativePath = dir.replace(baseDir, '') || '/';
      const urlPath = relativePath.replace(/\\/g, '/');
      
      const issues = validateHtmlFile(filePath, urlPath);
      validated++;
      
      if (issues.length > 0) {
        console.log(`\n📄 ${urlPath}`);
        issues.forEach(issue => {
          console.log(`   ${issue}`);
          if (issue.includes('CRITICAL')) errors++;
          else if (issue.startsWith('⚠️')) warnings++;
        });
      }
    }
  }
}

function main() {
  console.log('\n🔍 Validating SEO in prerendered HTML files...\n');
  console.log(`📁 Scanning: ${DIST_DIR}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found');
    process.exit(1);
  }

  walkDir(DIST_DIR);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SEO VALIDATION SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   Files validated: ${validated}`);
  console.log(`   ❌ Critical errors: ${errors}`);
  console.log(`   ⚠️ Warnings: ${warnings}`);
  console.log(`${'='.repeat(60)}\n`);

  if (errors > 0) {
    console.log('❌ SEO VALIDATION FAILED');
    console.log(`   ${errors} critical error(s) must be fixed before deploying.\n`);
    console.log('   Common causes:');
    console.log('   - Prerender captured page before SEO was ready');
    console.log('   - Route not found (404 showing home fallback)');
    console.log('   - Async data fetch not completed before capture');
    console.log('   - SEOHead component not mounted\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`⚠️ SEO validation passed with ${warnings} warning(s)\n`);
    process.exit(0);
  } else {
    console.log('✅ SEO VALIDATION PASSED - All pages have correct metadata!\n');
    process.exit(0);
  }
}

main();
