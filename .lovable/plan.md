

# LCP Optimization Plan - Reduce 7.4s Mobile LCP

## Overview
Optimize Largest Contentful Paint by reducing JavaScript blocking, simplifying hydration timing, and using React's concurrent features for non-critical fetches.

---

## Changes

### File 1: `src/main.tsx`

**Change: Simplify triple requestAnimationFrame to single**

**Lines 9-18**

Current:
```javascript
// Signal hydration complete AFTER React has committed AND painted
// Triple-rAF ensures: 1) React commits, 2) Layout calculated, 3) Browser painted
// This triggers CSS to hide the static hero shell via: html.hydration-ready #hero-shell { display: none; }
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("hydration-ready");
    });
  });
});
```

Change to:
```javascript
// Signal hydration complete AFTER React has committed
// Single rAF is sufficient - React has already committed at this point
// This triggers CSS to hide the static hero shell via: html.hydration-ready #hero-shell { display: none; }
requestAnimationFrame(() => {
  document.documentElement.classList.add("hydration-ready");
});
```

**Impact**: Reduces delay by ~32ms (2 fewer animation frames at ~16ms each)

---

### File 2: `src/pages/Index.tsx`

**Change 2.1: Add startTransition import**

**Line 1**

Current:
```javascript
import { useEffect, useState, useRef } from "react";
```

Change to:
```javascript
import { useEffect, useState, useRef, startTransition } from "react";
```

**Change 2.2: Wrap fetch scheduling with startTransition**

**Lines 41-60**

Current:
```javascript
useEffect(() => {
  // Schedule Supabase fetch AFTER page load + idle (not critical path)
  const scheduleFetch = () => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const run = () => fetchFeaturedClubs();
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 1500);
    }
  };

  if (document.readyState === "complete") {
    scheduleFetch();
  } else {
    window.addEventListener("load", scheduleFetch, { once: true });
  }
}, []);
```

Change to:
```javascript
useEffect(() => {
  // Schedule Supabase fetch AFTER page load + idle (not critical path)
  // Wrapped in startTransition to mark as non-urgent and not block LCP
  const scheduleFetch = () => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const run = () => {
      startTransition(() => {
        fetchFeaturedClubs();
      });
    };
    
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 1500);
    }
  };

  if (document.readyState === "complete") {
    scheduleFetch();
  } else {
    window.addEventListener("load", scheduleFetch, { once: true });
  }
}, []);
```

**Impact**: React will treat the fetch and its state update as low-priority, preventing it from blocking the initial paint.

---

### File 3: `index.html`

**No changes needed** - Line 40 already has `fetchpriority="high"`:
```html
<link rel="preload" as="image" href="/images/hero-custom-bg.webp" type="image/webp" fetchpriority="high" />
```

---

## Summary

| File | Lines | Change |
|------|-------|--------|
| `src/main.tsx` | 9-18 | Simplify triple rAF to single rAF |
| `src/pages/Index.tsx` | 1 | Add `startTransition` import |
| `src/pages/Index.tsx` | 41-60 | Wrap fetch in `startTransition()` |
| `index.html` | 40 | Already correct (no change) |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| rAF delay | ~48ms (3 frames) | ~16ms (1 frame) |
| JS blocking during fetch | Yes | No (low-priority) |
| Hero preload priority | high | high (unchanged) |
| Expected LCP reduction | - | 100-500ms |

---

## Technical Notes

- `startTransition` marks state updates as non-urgent, allowing React to prioritize rendering
- The existing `requestIdleCallback` already defers the fetch, but `startTransition` ensures the subsequent render is also low-priority
- Single rAF is sufficient because React's `render()` is synchronous - by the time it returns, the DOM has been committed

