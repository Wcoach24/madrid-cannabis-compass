

# Sitemap Cleanup Implementation Plan (Approved with 6 Districts)

## Overview
Reduce sitemap from ~290 URLs to ~120 URLs to improve Google indexation ratio from 18% to 60%+.

**Modification Approved:** Use 6 high-search-volume districts instead of 4.

---

## Phase 1: Remove `/clubs/{district}` Duplicates

**File:** `supabase/functions/generate-sitemap/index.ts`
**Lines 131-135**

Current code generates BOTH `/district/` AND `/clubs/` URLs for each district, creating duplicate content.

**Current:**
```javascript
districts.forEach(district => {
  staticPages.push({ path: `/district/${district}`, priority: '0.7', changefreq: 'weekly' });
  staticPages.push({ path: `/clubs/${district}`, priority: '0.7', changefreq: 'weekly' });
});
```

**Change to:**
```javascript
districts.forEach(district => {
  staticPages.push({ path: `/district/${district}`, priority: '0.7', changefreq: 'weekly' });
});
```

**Impact:** Removes 60 duplicate URLs

---

## Phase 2: Use 6 High-Volume Districts (User's Choice)

**File:** `supabase/functions/generate-sitemap/index.ts`
**Lines 121-126**

**Current:**
```javascript
const districts = [
  'centro', 'chamberi', 'malasana', 'retiro', 'tetuan', 'usera',
  'atocha', 'moncloa-aravaca', 'arganzuela', 'fuencarral-el-pardo',
  'salamanca', 'chamartin'
];
```

**Change to:**
```javascript
// 6 districts with high search volume (prioritized for indexation)
// Includes malasana and lavapies for SEO value despite having fewer clubs
const districts = [
  'centro', 'chamberi', 'malasana', 'lavapies', 'tetuan', 'arganzuela'
];
```

**Impact:** Reduces from 12 to 6 districts in sitemap

---

## Phase 3: Limit District Languages to EN + ES

**File:** `supabase/functions/generate-sitemap/index.ts`

**Step 3.1 - Add districtLanguages after line 137:**
```javascript
const languages = ['', '/es', '/de', '/fr', '/it'];
const districtLanguages = ['', '/es']; // Only EN and ES for district pages
```

**Step 3.2 - Modify staticPages.forEach (lines 157-167):**

**Current:**
```javascript
staticPages.forEach(page => {
  languages.forEach(lang => {
```

**Change to:**
```javascript
staticPages.forEach(page => {
  const pageLangs = page.path.startsWith('/district/') ? districtLanguages : languages;
  pageLangs.forEach(lang => {
```

**Impact:** Removes 18 URLs (3 languages × 6 districts)

---

## Phase 4: Add noindex Safety for Empty Districts

**File:** `src/pages/District.tsx`
**Lines 102-110**

Add conditional `robots` prop to prevent empty pages from being indexed.

**Current:**
```tsx
<SEOHead
  title={t(`districts.${districtKey}.seo.title`)}
  description={t(`districts.${districtKey}.seo.description`)}
  canonical={`${BASE_URL}${buildLanguageAwarePath(`/district/${district}`, language)}`}
```

**Change to:**
```tsx
<SEOHead
  title={t(`districts.${districtKey}.seo.title`)}
  description={t(`districts.${districtKey}.seo.description`)}
  canonical={`${BASE_URL}${buildLanguageAwarePath(`/district/${district}`, language)}`}
  robots={clubs && clubs.length === 0 ? "noindex, follow" : undefined}
```

---

## Files to Modify

| File | Changes | Risk |
|------|---------|------|
| `supabase/functions/generate-sitemap/index.ts` | Remove /clubs/ duplicates, use 6 districts, add districtLanguages | Low |
| `src/pages/District.tsx` | Add conditional robots noindex (1 line) | Very Low |

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Total sitemap URLs | ~290 | ~120-150 |
| District variants | 120 (12×2×5) | 12 (6×2) |
| Duplicate /clubs/ URLs | 60 | 0 |
| Expected indexation | 18% | 60%+ |

---

## Districts Included (6)

| District | Reason |
|----------|--------|
| Centro | 5 active clubs |
| Chamberí | 6 active clubs |
| Tetuán | 2 active clubs |
| Arganzuela | 2 active clubs |
| Malasaña | High search volume |
| Lavapiés | High search volume |

---

## Post-Deploy Verification

1. Visit `/api/generate-sitemap`
2. Confirm no `/clubs/centro`, `/clubs/malasana` URLs
3. Confirm no `/de/district/`, `/fr/district/`, `/it/district/` URLs
4. Count total URLs (should be ~120-150)
5. Resubmit sitemap to Google Search Console

