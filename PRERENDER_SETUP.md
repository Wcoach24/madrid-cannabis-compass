# Static Site Generation (SSG) Prerender Setup

This document explains how to set up and run prerendering for SEO-optimized static HTML output.

## Overview

The site uses Puppeteer-based prerendering to generate static HTML files with proper SEO metadata visible in "View Source". This ensures crawlers see:

- Correct `<title>` per page
- Correct `<meta description>` per page  
- Correct `<link rel="canonical">` pointing to the exact page URL
- Correct `<meta property="og:url">` matching the page URL
- Page-specific JSON-LD structured data
- Correct `<h1>` content

## Prerequisites

1. Node.js 18+ installed
2. Project dependencies installed: `npm install`
3. Environment variables set in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## How It Works

1. **Build**: Vite builds the SPA to `dist/`
2. **Serve**: A local server serves `dist/` temporarily
3. **Render**: Puppeteer visits each route and waits for React + SEOHead to hydrate
4. **Save**: The fully rendered HTML is saved to the correct path (e.g., `dist/club/slug/index.html`)

## Routes Prerendered

### Static Routes (all languages)
- `/` - Homepage
- `/clubs` - Club directory
- `/guides` - Article index
- `/faq` - FAQ page
- `/how-it-works` - Process explanation
- `/districts` - District listing
- `/legal` - Legal information
- `/safety` - Safety guidelines
- `/about` - About page
- `/contact` - Contact page
- `/knowledge` - Knowledge base
- `/cannabis-club-madrid` - Pillar page (EN)
- `/club-cannabis-madrid` - Pillar page (ES)

### Dynamic Routes (fetched from Supabase at build time)
- `/club/{slug}` - Individual club pages
- `/guide/{slug}` - Individual article pages (per language)
- `/district/{slug}` - District pages

### Languages
- English (default, no prefix)
- Spanish (`/es/...`)
- German (`/de/...`)
- French (`/fr/...`)
- Italian (`/it/...`)

## Running Prerender

### Manual Run

```bash
# 1. Build the Vite app
npm run build

# 2. Run prerender
node scripts/prerender.mjs
```

### Automated Build (CI/CD)

Add to your build script:

```json
{
  "scripts": {
    "build": "vite build",
    "postbuild": "node scripts/prerender.mjs",
    "build:production": "npm run build && node scripts/prerender.mjs"
  }
}
```

## Verification

After prerendering, verify the output:

### Check Club Page
```bash
cat dist/club/genetics-social-club-madrid/index.html | grep -E "<title>|<link rel=\"canonical\"|<meta property=\"og:url\""
```

Expected:
- `<title>` should contain the club name
- `<link rel="canonical">` should be `https://www.weedmadrid.com/club/genetics-social-club-madrid`
- `<meta property="og:url">` should match canonical

### Check Guide Page
```bash
cat dist/guide/best-cannabis-clubs-madrid-2025/index.html | grep -E "<title>|<link rel=\"canonical\"|<h1>"
```

Expected:
- `<title>` should contain the article title
- `<link rel="canonical">` should be the exact page URL
- `<h1>` should contain the article title

## Troubleshooting

### "dist/ directory not found"
Run `npm run build` before prerendering.

### "Missing VITE_SUPABASE_URL"
Ensure `.env` file exists with required variables.

### Timeout errors
Some pages may take longer to hydrate. The script waits up to 10 seconds per page.

### Missing routes
Check Supabase for articles with `status = 'published'` and clubs with `status = 'active'`.

## Deployment

### Vercel
The `vercel.json` is configured to serve prerendered HTML files directly. No SPA fallback is needed for prerendered routes.

### Other Hosts
Ensure your server:
1. Serves `index.html` files from directories (e.g., `/club/slug/` serves `/club/slug/index.html`)
2. Falls back to root `index.html` only for truly non-existent routes

## SEO Validation

Use these tools to verify:

1. **View Source** in browser - Check raw HTML
2. **Google Rich Results Test** - Validate structured data
3. **Facebook Sharing Debugger** - Check og:tags
4. **Google Search Console** - Monitor indexing
