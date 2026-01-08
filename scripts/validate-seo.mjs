#!/usr/bin/env node
/**
 * SEO Validation Script
 * 
 * Validates that prerendered HTML files have correct SEO metadata.
 * Run after prerender to ensure all pages are correctly generated.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.weedmadrid.com';

const HOME_TITLE = 'Best Cannabis Clubs Madrid 2025 | Legal Access Near You | Weed Madrid';
const HOME_TITLE_PREFIX = 'Best Cannabis Clubs Madrid 2025 | Legal Access Near You';
const HOME_DESCRIPTION = 'Find the best cannabis clubs in Madrid 2025. Legal, verified clubs with tourist-friendly access. Same-day invitations. Complete guide to Madrid\'s cannabis scene.';

// Routes that are allowed to use the "home" title/description patterns
const HOME_PATHS = new Set(['/', '/es', '/de', '/fr', '/it']);

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
  const isHomeLike = HOME_PATHS.has(urlPath);

  // --- Strict rules (fail build) ---

  // 1) Title must exist
  if (!title || title.length < 10) {
    issues.push(`❌ Missing or too short <title> (got: "${title}")`);
  }

  // 2) Canonical MUST exist and MUST be exact
  if (!canonical) {
    issues.push(`❌ Missing canonical link`);
  } else if (canonical !== expectedCanonical) {
    issues.push(`❌ Canonical mismatch: ${canonical} (expected exactly ${expectedCanonical})`);
  }

  // 3) og:url MUST exist and MUST match canonical exactly
  if (!ogUrl) {
    issues.push(`❌ Missing og:url`);
  } else if (canonical && ogUrl !== canonical) {
    issues.push(`❌ og:url (${ogUrl}) must match canonical exactly (${canonical})`);
  }

  // 4) For non-home routes, forbid any "home fallback" smell
  if (!isHomeLike) {
    if (title === HOME_TITLE || title.startsWith(HOME_TITLE_PREFIX)) {
      issues.push(`❌ <title> looks like HOME fallback (got: "${title}")`);
    }

    if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
      issues.push(`❌ Canonical must not point to HOME on internal pages (${canonical})`);
    }

    if (description && description === HOME_DESCRIPTION) {
      issues.push(`❌ Meta description looks like HOME fallback`);
    }
  }

  // --- Warnings (don’t fail build) ---

  if (!h1) {
    issues.push(`⚠️ Missing <h1> tag`);
  }

  if (!description || description.length < 50) {
    issues.push(`⚠️ Missing or too short meta description`);
  }

  if (!html.includes('application/ld+json')) {
    issues.push(`⚠️ Missing JSON-LD structured data`);
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
          if (issue.startsWith('❌')) errors++;
          else if (issue.startsWith('⚠️')) warnings++;
        });
      }
    }
  }
}

function main() {
  console.log('\n🔍 Validating SEO in prerendered HTML files...\n');

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found');
    process.exit(1);
  }

  walkDir(DIST_DIR);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Validation Summary`);
  console.log(`   Files validated: ${validated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}`);
  console.log(`${'='.repeat(50)}\n`);

  if (errors > 0) {
    console.log('❌ SEO validation FAILED - fix errors before deploying\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️ SEO validation passed with warnings\n');
    process.exit(0);
  } else {
    console.log('✅ SEO validation PASSED\n');
    process.exit(0);
  }
}

main();
