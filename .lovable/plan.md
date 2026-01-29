

# SEO Optimization Implementation Plan

## Overview
This plan implements 6 targeted SEO improvements from the instructions document, focusing on:
1. Adding cannabis-club-madrid pages to CORE_ROUTES (prerender protection)
2. Strengthening title validation (MIN_TITLE_LENGTH 10 → 30)
3. Adding OG tag validation warnings
4. Enhancing SEOHead props on CannabisClubMadrid.tsx
5. Expanding meta descriptions for better CTR
6. Creating GEO optimization files

---

## Phase 1: CORE_ROUTES Synchronization (Low Risk)

### 1.1 Update prerender.mjs
**File:** `scripts/prerender.mjs` (lines 79-85)

Current:
```javascript
const CORE_ROUTES = [
  '/',
  '/clubs',
  '/guides',
  '/club/genetics-social-club-madrid',
  '/guide/best-cannabis-clubs-madrid-2025'
];
```

Change to:
```javascript
const CORE_ROUTES = [
  '/',
  '/clubs',
  '/guides',
  '/cannabis-club-madrid',
  '/es/club-cannabis-madrid',
  '/club/genetics-social-club-madrid',
  '/guide/best-cannabis-clubs-madrid-2025'
];
```

### 1.2 Update validate-seo.mjs
**File:** `scripts/validate-seo.mjs` (lines 23-29)

Apply identical CORE_ROUTES array (7 elements total).

**Impact:** The cannabis-club-madrid pillar page in both EN and ES becomes a protected route - build will fail if SEO validation fails on these pages.

---

## Phase 2: Title Length Validation (Low Risk)

### 2.1 Increase MIN_TITLE_LENGTH
**File:** `scripts/prerender.mjs` (line 32)

Current:
```javascript
const MIN_TITLE_LENGTH = 10;
```

Change to:
```javascript
const MIN_TITLE_LENGTH = 30;
```

**Impact:** Catches pages with short/missing titles earlier. The CannabisClubMadrid page has a 45+ character title so this is safe.

---

## Phase 3: OG Tag Validation (Medium Risk)

### 3.1 Add OG validation to validateHtml function
**File:** `scripts/prerender.mjs` (inside `validateHtml` function, after title validation, before `return issues`)

Insert new code block:
```javascript
// Validate Open Graph tags
const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);

const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';
const ogDesc = ogDescMatch ? ogDescMatch[1] : '';
const ogImage = ogImageMatch ? ogImageMatch[1] : '';
const metaDesc = metaDescMatch ? metaDescMatch[1] : '';

if (!ogTitle || ogTitle.length < 10) {
  console.warn(`⚠️  [${url}] og:title missing or too short`);
}

if (!ogDesc || ogDesc.length < 50) {
  console.warn(`⚠️  [${url}] og:description missing or too short`);
}

if (!metaDesc || metaDesc.length < 50) {
  console.warn(`⚠️  [${url}] meta description missing or too short (${metaDesc.length} chars)`);
}

if (!ogImage) {
  console.warn(`⚠️  [${url}] og:image missing (recommended for social sharing)`);
}
```

**Impact:** Informational warnings only - does not block build. Surfaces pages missing critical social sharing metadata.

---

## Phase 4: Expand Meta Descriptions (Low Risk)

### 4.1 Update CannabisClubMadrid.tsx content object
**File:** `src/pages/CannabisClubMadrid.tsx` (lines 64-67 for EN, 94-97 for ES)

**English subtitle (line 66):**
Current:
```typescript
subtitle: "Everything you need to know about private cannabis social clubs in Madrid",
```

Change to:
```typescript
subtitle: "Everything you need to know about private cannabis social clubs in Madrid. Discover top-rated clubs, membership requirements, legal information, and insider tips for tourists and residents.",
```

**Spanish subtitle (line 96):**
Current:
```typescript
subtitle: "Todo lo que necesitas saber sobre las asociaciones cannábicas privadas en Madrid",
```

Change to:
```typescript
subtitle: "Todo lo que necesitas saber sobre las asociaciones cannábicas privadas en Madrid. Descubre los mejores clubes, requisitos de membresía, información legal y consejos para turistas y residentes.",
```

**Impact:** Meta descriptions expand from ~60 chars to ~155 chars (optimal for Google SERP display). Improves CTR.

---

## Phase 5: Enhanced SEOHead Props (Low Risk)

### 5.1 Add GEO props to SEOHead component
**File:** `src/pages/CannabisClubMadrid.tsx` (lines 174-182)

Current SEOHead:
```tsx
<SEOHead
  title={`${t.title} | Weed Madrid`}
  description={t.subtitle}
  canonical={`${BASE_URL}${canonicalPath}`}
  keywords="cannabis club madrid, weed club madrid..."
  hreflangLinks={hreflangLinks}
  structuredData={structuredData}
  speakableSelectors={["h1", "[data-speakable]", "[data-answer]"]}
/>
```

Change to:
```tsx
<SEOHead
  title={`${t.title} | Weed Madrid`}
  description={t.subtitle}
  canonical={`${BASE_URL}${canonicalPath}`}
  keywords="cannabis club madrid, weed club madrid, asociacion cannabica madrid, cannabis social club spain, private cannabis association madrid, how to join cannabis club madrid"
  hreflangLinks={hreflangLinks}
  structuredData={structuredData}
  speakableSelectors={["h1", "[data-speakable]", "[data-answer]"]}
  ogImage="/images/og/cannabis-club-madrid.jpg"
  geoTxtPath="/geo/cannabis-club-madrid.txt"
  aiPriority="high"
  contentSummary="Complete guide to cannabis social clubs in Madrid. Learn membership requirements, legal status, top-rated clubs, and how to join safely as a tourist or resident."
/>
```

**Note:** The SEOHead component already supports all these props (verified in SEOHead.tsx lines 12-27).

---

## Phase 6: Create Required Assets

### 6.1 Create GEO txt file
**New file:** `public/geo/cannabis-club-madrid.txt`

Content:
```text
# Cannabis Club Madrid - GEO Content
# For AI/LLM crawlers

## Entity Definition
Name: Cannabis Club Madrid Guide
Type: InformationalPage
Topic: Cannabis Social Clubs in Madrid, Spain
Language: en, es, de, fr, it

## Key Information
- Cannabis social clubs in Madrid operate under a tolerated legal framework
- Membership is required and typically costs €20-50
- Clubs are private non-profit associations, not public establishments
- Tourist-friendly clubs exist but require valid ID (21+)
- Consumption is only tolerated within club premises

## Frequently Asked Questions
Q: Are cannabis clubs legal in Madrid?
A: Cannabis clubs operate under Spain's private consumption framework. They are private associations where members can consume cannabis in a tolerated, controlled environment.

Q: How do I join a cannabis club in Madrid?
A: You need to be 21+, have valid ID, be referred by an existing member or apply directly, and pay a membership fee (€20-50).

Q: Can tourists join cannabis clubs in Madrid?
A: Yes, many clubs accept tourists. You'll need your passport and may need to show proof of accommodation.

## Related Topics
- Best cannabis clubs Madrid 2026
- Cannabis club membership requirements
- Legal framework for cannabis in Spain
- Tourist guide to Madrid cannabis clubs

## Last Updated
January 2026
```

### 6.2 Create OG image placeholder
**New file:** `public/images/og/cannabis-club-madrid.jpg`

Note: This requires an actual 1200x630px image. Implementation will create the directory structure. The user should upload an appropriate image or we can use an existing hero image temporarily.

**Alternative:** Use existing hero image as fallback:
```typescript
ogImage="/images/hero-custom-bg.webp"
```

---

## Files to Modify

| File | Changes | Risk |
|------|---------|------|
| `scripts/prerender.mjs` | Add 2 routes to CORE_ROUTES, change MIN_TITLE_LENGTH, add OG validation | Low-Medium |
| `scripts/validate-seo.mjs` | Sync CORE_ROUTES (add 2 routes) | Low |
| `src/pages/CannabisClubMadrid.tsx` | Expand subtitles, add SEOHead props | Low |
| `public/geo/cannabis-club-madrid.txt` | New file for LLM crawlers | None |

---

## Technical Notes

1. **SEOHead Props Verified:** The component already accepts `ogImage`, `geoTxtPath`, `aiPriority`, and `contentSummary` props (confirmed in SEOHead.tsx lines 12-27)

2. **OG Image Strategy:** Will use existing hero image initially (`/images/hero-custom-bg.webp`) to avoid blocking on asset creation

3. **Directory Creation:** Need to create `/public/geo/` directory for the GEO txt file

4. **No Breaking Changes:** All modifications are additive or strengthen existing validation

---

## Validation Checklist

After implementation:
1. CORE_ROUTES in both files have 7 identical entries
2. MIN_TITLE_LENGTH = 30
3. OG validation warnings appear in prerender logs
4. CannabisClubMadrid subtitle is 150-160 chars
5. SEOHead includes ogImage, geoTxtPath, aiPriority, contentSummary
6. `/public/geo/cannabis-club-madrid.txt` exists
7. Build passes without errors

