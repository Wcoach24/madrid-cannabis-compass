

# Code Splitting Optimization Plan - Reduce 7.4s Mobile LCP

## Overview
Implement code splitting by adding vendor chunks to Vite config and lazy loading below-the-fold components on the homepage. This reduces the initial JavaScript bundle size, allowing the hero section to render faster.

---

## Findings

The original plan references components that don't exist in this project (`FeaturedClubs`, `DistrictGrid`, `Newsletter`). Instead, the homepage uses these below-the-fold sections that can be lazy loaded:

| Component | Lines | Size (est.) | Imports |
|-----------|-------|-------------|---------|
| HomepageLegalSection | 89 | ~3KB | lucide-react |
| AvoidScamsSection | 63 | ~2KB | lucide-react |
| HowItWorksSection | 93 | ~3KB | lucide-react, Button |
| ClubTypesSection | 72 | ~2KB | lucide-react, Card |
| SafetyTipsSection | 57 | ~2KB | lucide-react |
| HomepageFAQ | 77 | ~3KB | Accordion (Radix) |

---

## Changes

### File 1: `vite.config.ts`

**Change: Expand manualChunks configuration**

**Lines 44-54**

Current:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Only vendor-react - let Vite handle page splitting via React.lazy()
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
      },
    },
  },
  chunkSizeWarningLimit: 500,
},
```

Change to:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-ui': [
          '@radix-ui/react-dialog',
          '@radix-ui/react-dropdown-menu',
          '@radix-ui/react-navigation-menu',
          '@radix-ui/react-select',
          '@radix-ui/react-slot',
          '@radix-ui/react-toast',
          '@radix-ui/react-accordion'
        ],
        'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
      },
    },
  },
  chunkSizeWarningLimit: 500,
},
```

**Impact**: Separates vendor dependencies into predictable chunks that can be cached independently and loaded in parallel.

---

### File 2: `src/pages/Index.tsx`

**Change 2.1: Add lazy and Suspense to imports**

**Line 1**

Current:
```javascript
import { useEffect, useState, useRef, startTransition } from "react";
```

Change to:
```javascript
import { useEffect, useState, useRef, startTransition, lazy, Suspense } from "react";
```

**Change 2.2: Replace static imports with lazy imports**

**Lines 14-19**

Current:
```javascript
// New SEO sections per PRD
import HomepageLegalSection from "@/components/home/HomepageLegalSection";
import AvoidScamsSection from "@/components/home/AvoidScamsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ClubTypesSection from "@/components/home/ClubTypesSection";
import SafetyTipsSection from "@/components/home/SafetyTipsSection";
import HomepageFAQ from "@/components/home/HomepageFAQ";
```

Change to:
```javascript
// Lazy load below-the-fold sections for better LCP
const HomepageLegalSection = lazy(() => import("@/components/home/HomepageLegalSection"));
const AvoidScamsSection = lazy(() => import("@/components/home/AvoidScamsSection"));
const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
const ClubTypesSection = lazy(() => import("@/components/home/ClubTypesSection"));
const SafetyTipsSection = lazy(() => import("@/components/home/SafetyTipsSection"));
const HomepageFAQ = lazy(() => import("@/components/home/HomepageFAQ"));
```

**Change 2.3: Add skeleton loader component**

Add after the lazy imports (around line 20):

```javascript
// Minimal skeleton for lazy-loaded sections
const SectionSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={`${height} bg-muted/30 animate-pulse rounded-lg`} />
);
```

**Change 2.4: Wrap lazy components with Suspense**

**Line 259 (HomepageLegalSection)**

Current:
```jsx
{/* 3. LEGAL CONTEXT SECTION - PRD Required */}
<HomepageLegalSection />
```

Change to:
```jsx
{/* 3. LEGAL CONTEXT SECTION - PRD Required */}
<Suspense fallback={<SectionSkeleton height="h-96" />}>
  <HomepageLegalSection />
</Suspense>
```

**Line 262 (AvoidScamsSection)**

Current:
```jsx
{/* 4. AVOID SCAMS SECTION - Trust Signal */}
<AvoidScamsSection />
```

Change to:
```jsx
{/* 4. AVOID SCAMS SECTION - Trust Signal */}
<Suspense fallback={<SectionSkeleton height="h-80" />}>
  <AvoidScamsSection />
</Suspense>
```

**Line 265 (HowItWorksSection)**

Current:
```jsx
{/* 5. HOW IT WORKS - Single 4-Step Flow (No Duplicates) */}
<HowItWorksSection />
```

Change to:
```jsx
{/* 5. HOW IT WORKS - Single 4-Step Flow (No Duplicates) */}
<Suspense fallback={<SectionSkeleton height="h-96" />}>
  <HowItWorksSection />
</Suspense>
```

**Line 366 (ClubTypesSection)**

Current:
```jsx
{/* 7. TYPES OF CANNABIS CLUBS */}
<ClubTypesSection />
```

Change to:
```jsx
{/* 7. TYPES OF CANNABIS CLUBS */}
<Suspense fallback={<SectionSkeleton height="h-80" />}>
  <ClubTypesSection />
</Suspense>
```

**Line 369 (SafetyTipsSection)**

Current:
```jsx
{/* 8. SAFETY TIPS */}
<SafetyTipsSection />
```

Change to:
```jsx
{/* 8. SAFETY TIPS */}
<Suspense fallback={<SectionSkeleton height="h-64" />}>
  <SafetyTipsSection />
</Suspense>
```

**Line 372 (HomepageFAQ)**

Current:
```jsx
{/* 9. FAQ SECTION - SEO-Driven */}
<HomepageFAQ />
```

Change to:
```jsx
{/* 9. FAQ SECTION - SEO-Driven */}
<Suspense fallback={<SectionSkeleton height="h-96" />}>
  <HomepageFAQ />
</Suspense>
```

---

## Summary

| File | Location | Change |
|------|----------|--------|
| `vite.config.ts` | Lines 44-54 | Expand manualChunks to split vendors |
| `src/pages/Index.tsx` | Line 1 | Add `lazy`, `Suspense` imports |
| `src/pages/Index.tsx` | Lines 14-19 | Convert static imports to lazy imports |
| `src/pages/Index.tsx` | After line 19 | Add `SectionSkeleton` component |
| `src/pages/Index.tsx` | Lines 259-372 | Wrap 6 sections with Suspense |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Initial JS bundle | All sections included | Only hero + above-fold |
| Vendor chunks | 1 (vendor-react) | 5 (react, supabase, ui, forms, utils) |
| Below-fold sections | Loaded immediately | Loaded on demand |
| Browser caching | Single large vendor chunk | Multiple cacheable chunks |
| Expected LCP reduction | - | 200-500ms |

---

## Technical Notes

- All 6 home section components already have `export default`, so they're compatible with `lazy()`
- The hero section and QuickAnswerBox remain eagerly loaded (above-the-fold)
- Featured clubs section is NOT lazy loaded because it's visible on initial scroll
- Vendor chunk splitting improves long-term caching (only changed chunks need re-download)
- The SectionSkeleton uses the same styling as the site's dark theme for seamless loading

