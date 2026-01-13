# SEO Verification Guide

## Pre-Deploy Validation

Before deploying, run the following commands to validate SEO:

```bash
# Full SEO validation pipeline
npm run seo:check
```

This runs:
1. `npm run build` - Builds the production bundle
2. `node scripts/prerender.mjs` - Prerenders all routes to static HTML
3. `node scripts/seo-audit-dist.mjs` - Validates SEO in /dist

## Individual Scripts

```bash
# Build only
npm run build

# Prerender only (requires build first)
node scripts/prerender.mjs

# SEO audit only (requires prerender first)
node scripts/seo-audit-dist.mjs

# Existing SEO validation (validates canonical, title, og:url)
node scripts/validate-seo.mjs
```

## What SEO Audit Checks

| Check | Description | Exit on Fail |
|-------|-------------|--------------|
| H1 Count | Exactly 1 H1 per page (excluding noscript) | Yes |
| Meta Robots | Must be in `<head>`, not `<body>` | Yes |
| Query Links | No internal `href` with `?` params | Yes |
| Non-WWW Links | No `weedmadrid.com` (must be `www.weedmadrid.com`) | Yes |
| Legacy Links | No links to redirecting routes | Yes |
| H2 before H1 | Warning only | No |

## Output Files

- `seo-audit-report.json` - Full JSON report with all issues
- `dist/__prerender_debug__/` - Debug HTML dumps for failed prerenders

## Common Issues

### 1. Multiple H1s
Usually caused by H1 in index.html loader/noscript AND page component.
The audit script excludes `<noscript>` content from H1 count.

### 2. Meta Robots in Body
Happens when using `{condition && <meta name="robots" .../>}` in JSX.
Fix: Pass `robots` prop to `SEOHead` component instead.

### 3. Query Links
Links like `/clubs?district=centro` should be `/clubs/centro`.
Check components for `to={...?...}` patterns.

### 4. Legacy Links
Routes in `vercel.json` redirects should not be linked internally.
See `src/lib/urlCanonicalMap.ts` for the mapping.

## Adding to CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: SEO Validation
  run: npm run seo:check
```

The script exits with code 1 on any critical error.
