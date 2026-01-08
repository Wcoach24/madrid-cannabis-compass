#!/usr/bin/env node
/**
 * Production Smoke Test
 * 
 * Verifies that production URLs return correct SEO metadata.
 * Run after deployment to ensure SSG is working correctly.
 * 
 * Usage: node scripts/smoke-test.mjs [base-url]
 * Default: https://www.weedmadrid.com
 */

const BASE_URL = process.argv[2] || 'https://www.weedmadrid.com';

const HOME_TITLE_PREFIX = 'Best Cannabis Clubs Madrid 2025';

// Test cases with expected content
const TEST_CASES = [
  // Home pages (allowed to have home title)
  {
    path: '/',
    checks: {
      titleContains: 'Madrid',
      canonicalExact: BASE_URL,
      h1: true,
      jsonld: 'Organization',
    }
  },
  {
    path: '/es',
    checks: {
      canonicalExact: `${BASE_URL}/es`,
      h1: true,
    }
  },
  // Static pages (must NOT have home title)
  {
    path: '/clubs',
    checks: {
      canonicalExact: `${BASE_URL}/clubs`,
      h1: true,
      notHomeTitle: true,
    }
  },
  {
    path: '/es/clubs',
    checks: {
      canonicalExact: `${BASE_URL}/es/clubs`,
      h1: true,
      notHomeTitle: true,
    }
  },
  {
    path: '/faq',
    checks: {
      canonicalExact: `${BASE_URL}/faq`,
      h1: true,
      notHomeTitle: true,
      jsonld: 'FAQPage',
    }
  },
  {
    path: '/districts',
    checks: {
      canonicalExact: `${BASE_URL}/districts`,
      h1: true,
      notHomeTitle: true,
    }
  },
  // Club detail pages
  {
    path: '/club/meltz-cannabis-club-madrid',
    checks: {
      titleContains: 'Meltz',
      canonicalExact: `${BASE_URL}/club/meltz-cannabis-club-madrid`,
      h1: true,
      notHomeTitle: true,
      jsonld: 'LocalBusiness',
    }
  },
  {
    path: '/es/club/meltz-cannabis-club-madrid',
    checks: {
      canonicalExact: `${BASE_URL}/es/club/meltz-cannabis-club-madrid`,
      h1: true,
      notHomeTitle: true,
    }
  },
  // District pages
  {
    path: '/district/chamberi',
    checks: {
      titleContains: 'Chamberí',
      canonicalExact: `${BASE_URL}/district/chamberi`,
      h1: true,
      notHomeTitle: true,
    }
  },
  // Guide pages
  {
    path: '/guides',
    checks: {
      canonicalExact: `${BASE_URL}/guides`,
      h1: true,
      notHomeTitle: true,
    }
  },
];

async function testUrl(testCase) {
  const url = `${BASE_URL}${testCase.path}`;
  const results = { url, passed: true, failures: [] };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
    });

    if (!res.ok) {
      results.passed = false;
      results.failures.push(`HTTP ${res.status}`);
      return results;
    }

    const html = await res.text();

    // Extract SEO elements
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
    const ogUrlMatch = html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]*)"[^>]*>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
    const ogUrl = ogUrlMatch ? ogUrlMatch[1].trim() : '';
    const h1 = h1Match ? h1Match[1].trim() : '';

    // Check title contains
    if (testCase.checks.titleContains) {
      if (!title.toLowerCase().includes(testCase.checks.titleContains.toLowerCase())) {
        results.passed = false;
        results.failures.push(`Title should contain "${testCase.checks.titleContains}" (got: "${title}")`);
      }
    }

    // Check canonical is EXACT
    if (testCase.checks.canonicalExact) {
      if (canonical !== testCase.checks.canonicalExact) {
        results.passed = false;
        results.failures.push(`Canonical must be EXACTLY "${testCase.checks.canonicalExact}" (got: "${canonical}")`);
      }
    }

    // og:url must match canonical exactly
    if (canonical && ogUrl !== canonical) {
      results.passed = false;
      results.failures.push(`og:url "${ogUrl}" must match canonical "${canonical}"`);
    }

    // H1 must exist
    if (testCase.checks.h1 && !h1) {
      results.passed = false;
      results.failures.push('Missing H1 tag');
    }

    // CRITICAL: For non-home pages, title must NOT be home title
    if (testCase.checks.notHomeTitle) {
      if (title.startsWith(HOME_TITLE_PREFIX)) {
        results.passed = false;
        results.failures.push(`CRITICAL: Title is HOME fallback! ("${title}")`);
      }
    }

    // Check JSON-LD type
    if (testCase.checks.jsonld) {
      const jsonldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/gi);
      if (!jsonldMatch) {
        results.passed = false;
        results.failures.push(`Missing JSON-LD`);
      } else {
        const hasType = jsonldMatch.some(m => m.includes(testCase.checks.jsonld));
        if (!hasType) {
          results.passed = false;
          results.failures.push(`JSON-LD should contain "${testCase.checks.jsonld}"`);
        }
      }
    }

    // Check for SPA shell (very bad)
    if (html.includes('<div id="root"></div>') || 
        html.includes('<div id="root"> </div>') ||
        (html.includes('id="root"') && html.includes('>Loading...<'))) {
      results.passed = false;
      results.failures.push('CRITICAL: Contains unhydrated SPA shell');
    }

  } catch (e) {
    results.passed = false;
    results.failures.push(`Fetch error: ${e.message}`);
  }

  return results;
}

async function main() {
  console.log(`\n🧪 Production SEO Smoke Test`);
  console.log(`📍 Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    const result = await testUrl(testCase);
    
    if (result.passed) {
      console.log(`✅ ${testCase.path}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.path}`);
      result.failures.forEach(f => console.log(`   └─ ${f}`));
      failed++;
    }
  }

  console.log('='.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ SMOKE TEST FAILED\n');
    process.exit(1);
  }

  console.log('✅ SMOKE TEST PASSED\n');
  process.exit(0);
}

main();
