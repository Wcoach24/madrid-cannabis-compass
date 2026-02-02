

# Defer Supabase Client Loading Plan - Reduce Initial Bundle

## Overview
Convert the static Supabase client import to a dynamic import so the ~50-100KB Supabase SDK is not included in the initial JavaScript bundle. This defers the SDK loading until user interaction or when the browser has idle time.

---

## Current State

Based on the codebase, `src/pages/Index.tsx` has:
- Static import of Supabase client at the top of the file
- Usage in a `useEffect` to fetch featured clubs data
- The fetch is already wrapped in `startTransition` and deferred via `requestIdleCallback`

---

## Changes

### File: `src/pages/Index.tsx`

**Change 1: Remove static Supabase import**

Find and remove this import (should be around line 3-4):

```javascript
// REMOVE THIS LINE:
import { supabase } from "@/integrations/supabase/client";
```

**Change 2: Convert to dynamic import inside useEffect**

The current `useEffect` that fetches featured clubs needs to dynamically import Supabase instead of using the static import.

Find the section that looks like this:

```javascript
useEffect(() => {
  // ... logic that uses supabase
  const fetchLatest = async () => {
    const { supabase } = await import("@/integrations/supabase/client"); // if already dynamic, keep it
    // OR if it references static import:
    const { data } = await supabase
      .from("clubs")
      .select("...")
      // ...
  };
  // ...
}, []);
```

If the `useEffect` body references the static `supabase` import, update it to use dynamic import:

```javascript
useEffect(() => {
  const fetchLatest = async () => {
    // Dynamic import - Supabase only loads when this function runs
    const { supabase } = await import("@/integrations/supabase/client");

    const { data } = await supabase
      .from("clubs")
      .select("id, name, slug, district, cover_image, is_featured, is_verified, rating_editorial, is_open_now, hours_today")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("rating_editorial", { ascending: false })
      .limit(6);
    
    // ... rest of the logic remains the same
  };

  // Existing deferred execution pattern
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      startTransition(() => {
        fetchLatest();
      });
    });
  } else {
    // Fallback for Safari
    window.addEventListener('load', () => {
      startTransition(() => {
        fetchLatest();
      });
    }, { once: true });
  }
}, []);
```

**Change 3: Verify startTransition is imported**

Ensure the React import includes `startTransition`:

```javascript
import { useEffect, useState, useRef, startTransition, lazy, Suspense } from "react";
```

---

## Summary

| Location | Change |
|----------|--------|
| Top of file | Remove static `import { supabase }` |
| useEffect body | Add `const { supabase } = await import(...)` inside async function |
| React import | Verify `startTransition` is included (already present) |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Supabase in initial bundle | ✓ (~50-100KB) | ✗ (deferred) |
| Initial JS parse time | Includes Supabase SDK | Excludes Supabase SDK |
| Data fetch timing | After idle callback | Same (after idle callback) |
| LCP blocking | Supabase parsed before LCP | Supabase parsed after LCP |

---

## Technical Notes

- The dynamic `import()` returns a Promise that resolves to the module
- We destructure `{ supabase }` from the imported module since it's a named export
- The existing `requestIdleCallback` + `startTransition` pattern already defers execution
- This change ensures the SDK code itself is also deferred, not just the execution
- The featured clubs data is seeded from `src/data/featuredClubs.ts`, so the UI renders immediately with seed data while Supabase loads in the background

