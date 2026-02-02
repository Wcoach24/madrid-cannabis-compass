

# Lazy Load Header & Footer Plan - Further LCP Optimization

## Overview
Convert Header and Footer to lazy-loaded components with progressive hydration to reduce main-thread blocking during initial hydration.

---

## Current State

| Component | Import Type | Render Wrapper | Has Default Export |
|-----------|-------------|----------------|-------------------|
| Header | Static (line 9) | None (line 168) | ✓ (line 95) |
| Footer | Static (line 10) | `<LazyHydrate whenIdle>` (line 492-494) | ✓ (line 172) |

---

## Changes

### File: `src/pages/Index.tsx`

**Change 1: Convert Header/Footer to lazy imports**

**Lines 9-10**

Current:
```javascript
import Header from "@/components/Header";
import Footer from "@/components/Footer";
```

Change to:
```javascript
// Lazy load Header and Footer for better LCP - static shells exist in index.html
const Header = lazy(() => import("@/components/Header"));
const Footer = lazy(() => import("@/components/Footer"));
```

**Change 2: Wrap Header with LazyHydrate whenIdle and Suspense**

**Line 168**

Current:
```jsx
<Header />
```

Change to:
```jsx
<LazyHydrate whenIdle>
  <Suspense fallback={null}>
    <Header />
  </Suspense>
</LazyHydrate>
```

Using `fallback={null}` because `index.html` already contains a static header shell for instant paint.

**Change 3: Add Suspense around Footer inside LazyHydrate**

**Lines 492-494**

Current:
```jsx
<LazyHydrate whenIdle>
  <Footer />
</LazyHydrate>
```

Change to:
```jsx
<LazyHydrate whenIdle>
  <Suspense fallback={null}>
    <Footer />
  </Suspense>
</LazyHydrate>
```

---

## Summary

| Location | Change |
|----------|--------|
| Lines 9-10 | Convert static imports to `lazy()` imports |
| Line 168 | Wrap Header with `<LazyHydrate whenIdle><Suspense fallback={null}>` |
| Lines 492-494 | Add `<Suspense fallback={null}>` inside existing LazyHydrate |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Header hydration | Immediate (blocking) | When browser idle |
| Footer hydration | When idle (no Suspense) | When idle (with Suspense) |
| Initial bundle | Includes Header + Footer JS | Deferred loading |
| LCP blocking | Header blocks critical path | Header deferred |

---

## Technical Notes

- `lazy()` requires `Suspense` wrapper for React to handle the async loading
- `fallback={null}` is safe because the static HTML shell in `index.html` provides immediate visual content
- `whenIdle` ensures both components hydrate when the browser has spare cycles, after LCP is stable
- The Header and Footer already have `export default`, so they're compatible with `lazy()`

