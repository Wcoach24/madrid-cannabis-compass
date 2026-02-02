

# Lazy Load QuickClubFinder & QuickAnswerBox Plan

## Overview
Convert `QuickClubFinder` and `QuickAnswerBox` from static imports to lazy imports with progressive hydration. These components are below the hero title and are not part of the LCP critical path.

---

## Current State

| Component | Import Location | Render Location | Export Type |
|-----------|----------------|-----------------|-------------|
| QuickClubFinder | Line 12 (static) | Line 225 (inside Dialog) | `export default function` ✓ |
| QuickAnswerBox | Line 13 (static) | Lines 263-267 | `export default` ✓ |

Both components have compatible `export default` declarations and can be lazy loaded.

---

## Changes

### File: `src/pages/Index.tsx`

**Change 1: Convert static imports to lazy imports**

**Lines 12-13**

Current:
```javascript
import QuickClubFinder from "@/components/QuickClubFinder";
import QuickAnswerBox from "@/components/QuickAnswerBox";
```

Change to:
```javascript
// Lazy load below-hero components - not part of LCP
const QuickClubFinder = lazy(() => import("@/components/QuickClubFinder"));
const QuickAnswerBox = lazy(() => import("@/components/QuickAnswerBox"));
```

**Change 2: Wrap QuickClubFinder with Suspense (inside Dialog)**

**Line 225** (inside `<DialogContent>`)

Current:
```jsx
<DialogContent className="sm:max-w-md">
  <QuickClubFinder onClose={() => setFinderDialogOpen(false)} />
</DialogContent>
```

Change to:
```jsx
<DialogContent className="sm:max-w-md">
  <Suspense fallback={<div className="h-48 bg-muted/30 animate-pulse rounded-lg" />}>
    <QuickClubFinder onClose={() => setFinderDialogOpen(false)} />
  </Suspense>
</DialogContent>
```

Note: `QuickClubFinder` is inside a Dialog which only opens on user interaction, so we don't need `LazyHydrate whenVisible` - it only loads when the dialog opens.

**Change 3: Wrap QuickAnswerBox with LazyHydrate whenVisible and Suspense**

**Lines 259-270** (Quick Answer Box section)

Current:
```jsx
{/* 2. QUICK ANSWER BOX - Featured Snippet Target (PRD-Compliant) */}
<section className="py-8 md:py-12 bg-background">
  <div className="container mx-auto px-4">
    <div className="max-w-4xl mx-auto">
      <QuickAnswerBox
        title={t("home.quickanswer.title")}
        answer={t("home.quickanswer.text")}
        variant="featured-snippet"
      />
    </div>
  </div>
</section>
```

Change to:
```jsx
{/* 2. QUICK ANSWER BOX - Featured Snippet Target (PRD-Compliant) */}
<section className="py-8 md:py-12 bg-background">
  <div className="container mx-auto px-4">
    <div className="max-w-4xl mx-auto">
      <LazyHydrate whenVisible>
        <Suspense fallback={<div className="h-24 bg-muted/30 animate-pulse rounded-lg" />}>
          <QuickAnswerBox
            title={t("home.quickanswer.title")}
            answer={t("home.quickanswer.text")}
            variant="featured-snippet"
          />
        </Suspense>
      </LazyHydrate>
    </div>
  </div>
</section>
```

---

## Summary

| Location | Change |
|----------|--------|
| Lines 12-13 | Convert static imports to `lazy()` imports |
| Line 225 | Wrap `QuickClubFinder` in `<Suspense>` inside Dialog |
| Lines 263-267 | Wrap `QuickAnswerBox` in `<LazyHydrate whenVisible><Suspense>` |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| QuickClubFinder in initial bundle | ✓ (includes Supabase client import) | ✗ (loads on dialog open) |
| QuickAnswerBox in initial bundle | ✓ | ✗ (loads when visible) |
| QuickClubFinder hydration | Immediate | On dialog open |
| QuickAnswerBox hydration | Immediate | When enters viewport |
| Additional bundle reduction | - | ~15-25KB (includes Select components, Supabase usage) |

---

## Technical Notes

- `QuickClubFinder` imports `supabase` statically - by lazy loading this component, we also defer that import chain
- The Dialog only opens on user click, so `QuickClubFinder` JS will only load when needed
- `QuickAnswerBox` uses `whenVisible` because it's positioned below the hero and may not be in the initial viewport on mobile
- Both components already have `export default`, so they're compatible with `lazy()`
- The fallback skeletons use `animate-pulse` for a consistent loading experience

