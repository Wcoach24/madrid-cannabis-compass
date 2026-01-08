#!/usr/bin/env node
/**
 * Production Smoke Test
 * 
 * Tests that production URLs return correct SEO metadata.
 * Run after deployment to verify SSG is working.
 * 
 * Usage: node scripts/smoke-test.mjs [base-url]
 * Default: https://www.weedmadrid.com
 */

const BASE_URL = process.argv[2] || 'https://www.weedmadrid.com';

// Test cases with expected content
const TEST_CASES = [
  // Clubs
  {
    path: '/club/genetics-social-club-madrid',
    checks: {
      title: 'Genetics Social Club',
      canonical: '/club/genetics-social-club-madrid',
      h1: 'Genetics',
    }
  },
  {
    path: '/es/club/genetics-social-club-madrid',
    checks: {
      title: 'Genetics Social Club',
      canonical: '/es/club/genetics-social-club-madrid',
      h1: 'Genetics',
    }
  },
  // Guides
  {
    path: '/guide/best-cannabis-clubs-madrid-2025',
    checks: {
      title: 'Best Cannabis Clubs',
      canonical: '/guide/best-cannabis-clubs-madrid-2025',
      jsonld: 'BlogPosting',
    }
  },
  // Static pages
  {
    path: '/clubs',
    checks: {
      title: 'Clubs',
      canonical: '/clubs',
    }
  },
  {
    path: '/es/clubs',
    checks: {
      title: 'Club',
      canonical: '/es/clubs',
    }
  },
  {
    path: '/faq',
    checks: {
      title: 'FAQ',
      canonical: '/faq',
    }
  },
  {
    path: '/districts',
    checks: {
      title: 'District',
      canonical: '/districts',
    }
  },
  // Home
  {
    path: '/',
    checks: {
      title: 'Madrid',
      canonical: BASE_URL,
    }
  },
  {
    path: '/es',
    checks: {
      title: 'Madrid',
      canonical: '/es',
    }
  },
  {
    path: '/de',
    checks: {
      title: 'Madrid',
      canonical: '/de',
    }
  },
];

async function testUrl(testCase) {
  const url = `${BASE_URL}${testCase.path}`;
  const results = { url, passed: true, failures: [] };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' }
    });

    if (!res.ok) {
      results.passed = false;
      results.failures.push(`HTTP ${res.status}`);
      return results;
    }

    const html = await res.text();

    // Check title
    if (testCase.checks.title) {
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';
      if (!title.toLowerCase().includes(testCase.checks.title.toLowerCase())) {
        results.passed = false;
        results.failures.push(`Title missing "${testCase.checks.title}" (got: "${title}")`);
      }
    }

    // Check canonical
    if (testCase.checks.canonical) {
      const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
      const canonical = canonicalMatch ? canonicalMatch[1] : '';
      const expectedCanonical = testCase.checks.canonical.startsWith('http') 
        ? testCase.checks.canonical 
        : `${BASE_URL}${testCase.checks.canonical}`;
      
      if (!canonical.includes(testCase.checks.canonical.replace(/^\//, ''))) {
        results.passed = false;
        results.failures.push(`Canonical incorrect (got: "${canonical}", expected to contain: "${testCase.checks.canonical}")`);
      }
    }

    // Check H1
    if (testCase.checks.h1) {
      const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
      const h1 = h1Match ? h1Match[1] : '';
      if (!h1.toLowerCase().includes(testCase.checks.h1.toLowerCase())) {
        results.passed = false;
        results.failures.push(`H1 missing "${testCase.checks.h1}" (got: "${h1}")`);
      }
    }

    // Check JSON-LD type
    if (testCase.checks.jsonld) {
      if (!html.includes(testCase.checks.jsonld)) {
        results.passed = false;
        results.failures.push(`JSON-LD missing "${testCase.checks.jsonld}"`);
      }
    }

    // Check og:url matches canonical
    const ogUrlMatch = html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]*)"[^>]*>/i);
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
    if (ogUrlMatch && canonicalMatch) {
      if (ogUrlMatch[1] !== canonicalMatch[1]) {
        results.passed = false;
        results.failures.push(`og:url (${ogUrlMatch[1]}) doesn't match canonical (${canonicalMatch[1]})`);
      }
    }

    // Check for SPA shell indicators (bad)
    if (testCase.path !== '/' && html.includes('<div id="root"></div>')) {
      results.passed = false;
      results.failures.push('Contains empty #root (SPA shell, not prerendered)');
    }

  } catch (e) {
    results.passed = false;
    results.failures.push(`Fetch error: ${e.message}`);
  }

  return results;
}

async function main() {
  console.log(`\n🧪 Running SEO Smoke Tests against ${BASE_URL}\n`);
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
    console.log('❌ Smoke tests FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ All smoke tests PASSED\n');
    process.exit(0);
  }
}

main();
