

# Sitemap Cleanup - CORRECTED Implementation Plan

## Critical Discovery
The sitemap is generated from `scripts/routes-inventory.mjs`, **NOT** from `supabase/functions/generate-sitemap/index.ts`. The previous changes to the Edge Function don't affect the static sitemap that Google indexes.

---

## File to Modify: `scripts/routes-inventory.mjs`

### Change 1: Reduce Districts from 12 to 6
**Lines 48-61**

**Current:**
```javascript
export const SUPPORTED_DISTRICT_SLUGS = [
  'centro',
  'chamberi', 
  'malasana',
  'retiro',
  'tetuan',
  'usera',
  'atocha',
  'moncloa-aravaca',
  'arganzuela',
  'fuencarral-el-pardo',
  'salamanca',
  'chamartin',
];
```

**Change to:**
```javascript
// 6 districts with high search volume (prioritized for indexation)
// Includes malasana and lavapies for SEO value
export const SUPPORTED_DISTRICT_SLUGS = [
  'centro',
  'chamberi', 
  'malasana',
  'lavapies',
  'tetuan',
  'arganzuela',
];
```

---

### Change 2: Limit District Pages to EN/ES Only & Remove `/clubs/{district}`
**Lines 212-234**

**Current:**
```javascript
// 4. District pages - only for districts with full DISTRICT_CONFIG support
for (const district of dynamicData.districts) {
  // Only generate routes for supported districts to avoid timeouts
  const isSupported = SUPPORTED_DISTRICT_SLUGS.includes(district);
  
  // District detail page - always generate (uses translations fallback)
  urls.push({ path: `/district/${district}`, lang: 'en', type: 'district', slug: district });
  for (const lang of LANGUAGES) {
    if (lang !== 'en') {
      urls.push({ path: `/${lang}/district/${district}`, lang, type: 'district', slug: district });
    }
  }
  
  // Clubs by district page - only for supported districts
  if (isSupported) {
    urls.push({ path: `/clubs/${district}`, lang: 'en', type: 'clubs-district', slug: district });
    for (const lang of LANGUAGES) {
      if (lang !== 'en') {
        urls.push({ path: `/${lang}/clubs/${district}`, lang, type: 'clubs-district', slug: district });
      }
    }
  }
}
```

**Change to:**
```javascript
// 4. District pages - only for supported districts with high search volume
// Only EN and ES to focus crawl budget on quality pages
const DISTRICT_LANGUAGES = ['en', 'es'];

for (const district of dynamicData.districts) {
  const isSupported = SUPPORTED_DISTRICT_SLUGS.includes(district);
  
  // Only generate routes for supported districts
  if (!isSupported) continue;
  
  // District detail page - only EN and ES
  urls.push({ path: `/district/${district}`, lang: 'en', type: 'district', slug: district });
  urls.push({ path: `/es/district/${district}`, lang: 'es', type: 'district', slug: district });
  
  // NOTE: /clubs/{district} removed to avoid duplicate content with /district/{district}
}
```

---

## Summary of Changes

| Change | Impact |
|--------|--------|
| 12 → 6 districts | Removes URLs for usera, retiro, atocha, moncloa-aravaca, fuencarral-el-pardo, salamanca, chamartin |
| Remove `/clubs/{district}` | Eliminates 60 duplicate URLs |
| Only EN/ES for districts | Removes DE/FR/IT district variants (-18 URLs) |

**Total: ~114 URLs eliminated from sitemap**

---

## Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `scripts/routes-inventory.mjs` | 48-61 | Reduce SUPPORTED_DISTRICT_SLUGS to 6 |
| `scripts/routes-inventory.mjs` | 212-234 | Limit districts to EN/ES, remove /clubs/{district} |

---

## No Additional Files Needed

- `src/pages/District.tsx` - Already has `robots={clubs && clubs.length === 0 ? "noindex, follow" : undefined}` from previous edit ✅
- `supabase/functions/generate-sitemap/index.ts` - Already updated (useful for API access but not for static sitemap) ✅

---

## Verification After Build

1. Run build to regenerate sitemap in `dist/sitemap.xml`
2. Verify total URLs is ~120-150 (before ~290)
3. Verify NO:
   - `/clubs/centro`, `/clubs/malasana`, etc.
   - `/de/district/`, `/fr/district/`, `/it/district/`
   - Districts: `usera`, `chamartin`, `salamanca`, `retiro`
4. Resubmit sitemap to Google Search Console

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Total sitemap URLs | ~290 | ~120-150 |
| District variants | ~120 | 12 (6×2) |
| `/clubs/{district}` URLs | 60 | 0 |
| Expected indexation | 18% | 60%+ |

