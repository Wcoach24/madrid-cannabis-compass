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

// Default/fallback values that indicate SEO was NOT properly set
const FALLBACK_INDICATORS = [
  'Best Cannabis Clubs Madrid 2025 | Legal Access Near You | Weed Madrid', // Default home title
  'content="https://www.weedmadrid.com">', // og:url pointing to home (not specific page)
];

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

  const title = titleMatch ? titleMatch[1] : '';
  const canonical = canonicalMatch ? canonicalMatch[1] : '';
  const ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';
  const h1 = h1Match ? h1Match[1] : '';
  const description = descriptionMatch ? descriptionMatch[1] : '';

  // Expected canonical URL
  const expectedCanonical = `${BASE_URL}${urlPath === '/' ? '' : urlPath}`;

  // Validation rules
  if (!title || title.length < 10) {
    issues.push(`❌ Missing or too short <title> (got: "${title}")`);
  }

  if (!canonical) {
    issues.push(`❌ Missing canonical link`);
  } else if (urlPath !== '/' && canonical === BASE_URL) {
    issues.push(`❌ Canonical pointing to home instead of page: ${canonical}`);
  } else if (!canonical.includes(urlPath.replace(/\/$/, '')) && urlPath !== '/') {
    issues.push(`⚠️ Canonical may be incorrect: ${canonical} (expected to contain ${urlPath})`);
  }

  if (!ogUrl) {
    issues.push(`❌ Missing og:url`);
  } else if (canonical && ogUrl !== canonical) {
    issues.push(`⚠️ og:url (${ogUrl}) doesn't match canonical (${canonical})`);
  }

  if (!h1) {
    issues.push(`⚠️ Missing <h1> tag`);
  }

  if (!description || description.length < 50) {
    issues.push(`⚠️ Missing or too short meta description`);
  }

  // Check for fallback indicators (means SEOHead didn't update properly)
  if (urlPath !== '/') {
    for (const indicator of FALLBACK_INDICATORS) {
      if (html.includes(indicator)) {
        issues.push(`❌ Contains fallback/home content: "${indicator.substring(0, 50)}..."`);
      }
    }
  }

  // Check for JSON-LD
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
