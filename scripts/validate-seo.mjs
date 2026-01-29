#!/usr/bin/env node
/**
 * SEO Validation Script
 * 
 * Validates that prerendered HTML files have correct SEO metadata.
 * Run after prerender to ensure all pages are correctly generated.
 * 
 * SOFT FAIL MODE: Only exits with code 1 if CORE routes have critical errors.
 * Non-core route issues are reported as warnings.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.weedmadrid.com';

// Core routes - build fails ONLY if these have critical errors
const CORE_ROUTES = [
  '/',
  '/clubs',
  '/guides',
  '/cannabis-club-madrid',
  '/es/club-cannabis-madrid',
  '/club/genetics-social-club-madrid',
  '/guide/best-cannabis-clubs-madrid-2025'
];

// Home page patterns - used to detect fallback issues
const FALLBACK_TITLE = 'Weed Madrid';
const HOME_DESCRIPTION_FRAGMENT = 'Find the best cannabis clubs in Madrid';

// Language home paths (these ARE allowed to have home-like content)
const LANGUAGE_HOMES = new Set(['/', '/es', '/de', '/fr', '/it']);

// Directories to skip
const SKIP_DIRS = new Set(['assets', 'images', 'fonts', '__prerender_debug__']);

let coreErrors = 0;
let nonCoreErrors = 0;
let warnings = 0;
let validated = 0;

function isCoreRoute(urlPath) {
  return CORE_ROUTES.includes(urlPath);
}

function validateHtmlFile(filePath, urlPath) {
  const html = readFileSync(filePath, 'utf-8');
  const issues = [];
  const isCore = isCoreRoute(urlPath);

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

  // ===== CRITICAL ERRORS =====

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

  // 4) For non-home pages, PROHIBIT fallback patterns
  if (!isLanguageHome) {
    // Check title isn't just fallback
    if (title === FALLBACK_TITLE || title === '') {
      issues.push(`❌ CRITICAL: <title> is fallback on internal page! ("${title}")`);
    }

    // Check canonical isn't pointing to home
    if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
      issues.push(`❌ CRITICAL: Canonical points to HOME on internal page!`);
    }
  }

  // 5) Check for SPA shell (empty root)
  if (html.includes('<div id="root"></div>') || 
      html.includes('<div id="root"> </div>') ||
      (html.includes('id="root"') && html.includes('>Loading...<'))) {
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

  return { issues, isCore };
}

function walkDir(dir, baseDir = dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!SKIP_DIRS.has(file)) {
        walkDir(filePath, baseDir);
      }
    } else if (file === 'index.html') {
      // Calculate URL path from file path
      const relativePath = dir.replace(baseDir, '') || '/';
      const urlPath = relativePath.replace(/\\/g, '/');
      
      const { issues, isCore } = validateHtmlFile(filePath, urlPath);
      validated++;
      
      if (issues.length > 0) {
        const hasCritical = issues.some(i => i.includes('CRITICAL'));
        
        console.log(`\n📄 ${urlPath}${isCore ? ' [CORE]' : ''}`);
        issues.forEach(issue => {
          console.log(`   ${issue}`);
          if (issue.includes('CRITICAL')) {
            if (isCore) {
              coreErrors++;
            } else {
              nonCoreErrors++;
            }
          } else if (issue.startsWith('⚠️')) {
            warnings++;
          }
        });
      }
    }
  }
}

function main() {
  console.log('\n🔍 Validating SEO in prerendered HTML files...\n');
  console.log(`📁 Scanning: ${DIST_DIR}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🎯 Core routes: ${CORE_ROUTES.join(', ')}\n`);

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found');
    process.exit(1);
  }

  walkDir(DIST_DIR);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SEO VALIDATION SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   Files validated: ${validated}`);
  console.log(`   🔴 Core route errors: ${coreErrors}`);
  console.log(`   ❌ Non-core errors: ${nonCoreErrors}`);
  console.log(`   ⚠️ Warnings: ${warnings}`);
  console.log(`${'='.repeat(60)}\n`);

  // Only fail if CORE routes have errors
  if (coreErrors > 0) {
    console.log('❌ SEO VALIDATION FAILED');
    console.log(`   ${coreErrors} critical error(s) on CORE routes must be fixed.\n`);
    console.log('   Core routes are essential for SEO. Fix before deploying.\n');
    process.exit(1);
  } else if (nonCoreErrors > 0) {
    console.log(`⚠️ SEO validation passed with ${nonCoreErrors} non-core error(s)`);
    console.log('   Non-core pages have issues but build continues.\n');
    process.exit(0);
  } else if (warnings > 0) {
    console.log(`⚠️ SEO validation passed with ${warnings} warning(s)\n`);
    process.exit(0);
  } else {
    console.log('✅ SEO VALIDATION PASSED - All pages have correct metadata!\n');
    process.exit(0);
  }
}

main();
