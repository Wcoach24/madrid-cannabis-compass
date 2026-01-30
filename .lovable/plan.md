

# Progressive Hydration Plan - Reduce 7.9s Mobile LCP

## Overview
Implement progressive hydration using `react-lazy-hydration` to defer hydration of below-the-fold components until they're needed. This allows the LCP to be marked as stable BEFORE React hydrates the entire page.

---

## How It Works

Currently, React hydrates ALL components immediately, even those far below the fold. This blocks the main thread and delays LCP stability.

```text
Current Flow:
┌─────────────────────────────────────────────────────────┐
│  Load HTML → Load JS → Hydrate EVERYTHING → LCP Stable │
│                        └───────────────────────────────┘
│                         ~2-3 seconds blocked
└─────────────────────────────────────────────────────────┘

With Progressive Hydration:
┌────────────────────────────────────────────────────────────────────────┐
│  Load HTML → Load JS → Hydrate Hero Only → LCP Stable → Hydrate Rest  │
│                        └─────────────────┘             └────────────┘
│                         ~200ms                          On-demand
└────────────────────────────────────────────────────────────────────────┘
```

---

## Changes

### Step 1: Install Package

```bash
npm install react-lazy-hydration
```

---

### Step 2: Modify `src/pages/Index.tsx`

**Change 2.1: Add import for LazyHydrate**

Add after line 1:

```javascript
import LazyHydrate from 'react-lazy-hydration';
```

**Change 2.2: Wrap all Suspense-wrapped sections with LazyHydrate whenVisible**

| Section | Current Line | Change |
|---------|--------------|--------|
| HomepageLegalSection | 263-266 | Wrap with `<LazyHydrate whenVisible>` |
| AvoidScamsSection | 268-271 | Wrap with `<LazyHydrate whenVisible>` |
| HowItWorksSection | 273-276 | Wrap with `<LazyHydrate whenVisible>` |
| ClubTypesSection | 376-379 | Wrap with `<LazyHydrate whenVisible>` |
| SafetyTipsSection | 381-384 | Wrap with `<LazyHydrate whenVisible>` |
| HomepageFAQ | 386-389 | Wrap with `<LazyHydrate whenVisible>` |

Example transformation:

```jsx
// BEFORE (Line 263-266)
{/* 3. LEGAL CONTEXT SECTION - PRD Required */}
<Suspense fallback={<SectionSkeleton height="h-96" />}>
  <HomepageLegalSection />
</Suspense>

// AFTER
{/* 3. LEGAL CONTEXT SECTION - PRD Required */}
<LazyHydrate whenVisible>
  <Suspense fallback={<SectionSkeleton height="h-96" />}>
    <HomepageLegalSection />
  </Suspense>
</LazyHydrate>
```

**Change 2.3: Wrap Footer with LazyHydrate whenIdle**

Line 479:

```jsx
// BEFORE
<Footer />

// AFTER
<LazyHydrate whenIdle>
  <Footer />
</LazyHydrate>
```

---

## Summary

| Location | Change |
|----------|--------|
| Package | Install `react-lazy-hydration` |
| Line 2 | Add `import LazyHydrate from 'react-lazy-hydration'` |
| Lines 263-266 | Wrap HomepageLegalSection with `<LazyHydrate whenVisible>` |
| Lines 268-271 | Wrap AvoidScamsSection with `<LazyHydrate whenVisible>` |
| Lines 273-276 | Wrap HowItWorksSection with `<LazyHydrate whenVisible>` |
| Lines 376-379 | Wrap ClubTypesSection with `<LazyHydrate whenVisible>` |
| Lines 381-384 | Wrap SafetyTipsSection with `<LazyHydrate whenVisible>` |
| Lines 386-389 | Wrap HomepageFAQ with `<LazyHydrate whenVisible>` |
| Line 479 | Wrap Footer with `<LazyHydrate whenIdle>` |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Initial hydration scope | Entire page (~15 components) | Hero + QuickAnswer only (~4 components) |
| Main thread blocking | ~2-3 seconds | ~200-500ms |
| Below-fold hydration | Immediate | On viewport entry |
| Footer hydration | Immediate | When browser is idle |
| Expected LCP improvement | 7.9s | ~4-5s target |

---

## Technical Notes

- `whenVisible` uses IntersectionObserver (supported in all modern browsers)
- `whenIdle` uses requestIdleCallback (polyfill not included, but gracefully degrades)
- The Suspense boundaries remain inside LazyHydrate to handle lazy-loaded chunks
- The static HTML is still rendered on initial load - only JavaScript hydration is deferred
- This works because the current setup is a SPA, so the static shell in `index.html` provides instant visual content

---

## Hydration Priority Order

1. **Immediate**: Header, Hero section, QuickAnswerBox, Featured Clubs (above-fold)
2. **whenVisible**: All lazy-loaded sections (hydrated as user scrolls)
3. **whenIdle**: Footer (hydrated when browser has spare cycles)

