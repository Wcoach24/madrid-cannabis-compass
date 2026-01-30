

# LCP Optimization Plan - WebP Only (No PNG Fallbacks)

## Overview
Eliminate PNG fallbacks for hero background and logo to reduce LCP element render delay. Modern browsers (99%+ coverage) support WebP natively, making PNG fallbacks unnecessary overhead.

---

## Changes

### File 1: `src/pages/Index.tsx`

**Change 1.1: Hero Background Image (Line 160-165)**

Remove `image-set()` with PNG fallback, use direct WebP URL.

Current:
```jsx
<section className="relative py-20 md:py-32 overflow-hidden" style={{
  backgroundImage: 'image-set(url(/images/hero-custom-bg.webp) type("image/webp"), url(/images/hero-custom-bg.png) type("image/png"))',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}}>
```

Change to:
```jsx
<section className="relative py-20 md:py-32 overflow-hidden" style={{
  backgroundImage: 'url(/images/hero-custom-bg.webp)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}}>
```

**Change 1.2: Logo Image (Lines 172-182)**

Remove `<picture>` element with PNG fallback, use WebP directly with `<img>`.

Current:
```jsx
<picture translate="no">
  <source srcSet={logoWeedMadridWebp} type="image/webp" />
  <img 
    src={logoWeedMadrid} 
    alt="Weed Madrid - Madrid's trusted cannabis club directory..." 
    className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 md:mb-6 drop-shadow-2xl rounded-2xl"
    width="160"
    height="160"
    translate="no"
  />
</picture>
```

Change to:
```jsx
<img 
  src={logoWeedMadridWebp}
  alt="Weed Madrid - Madrid's trusted cannabis club directory and invitation guide for legal cannabis social clubs" 
  className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 md:mb-6 drop-shadow-2xl rounded-2xl"
  width="160"
  height="160"
  translate="no"
/>
```

**Change 1.3: Remove unused PNG import (Line 22)**

Current:
```jsx
import logoWeedMadrid from "@/assets/logo-weed-madrid.png";
```

Remove this line entirely (unused after changes).

---

### File 2: `index.html`

**Change 2.1: Static Hero Shell Background (Line 207)**

Remove `image-set()` syntax, use direct WebP URL.

Current:
```html
style="background-image: image-set(url('/images/hero-custom-bg.webp') 1x type('image/webp')); ..."
```

Change to:
```html
style="background-image: url('/images/hero-custom-bg.webp'); ..."
```

---

## Summary

| File | Location | Change |
|------|----------|--------|
| `src/pages/Index.tsx` | Line 22 | Remove PNG import |
| `src/pages/Index.tsx` | Lines 160-165 | Simplify backgroundImage to direct WebP |
| `src/pages/Index.tsx` | Lines 172-182 | Replace `<picture>` with simple `<img>` WebP |
| `index.html` | Line 207 | Simplify backgroundImage to direct WebP |

---

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| CSS parsing complexity | `image-set()` with type declarations | Simple `url()` |
| DOM elements for logo | 3 (`<picture>`, `<source>`, `<img>`) | 1 (`<img>`) |
| Browser compatibility | 99%+ (WebP) | 99%+ (unchanged) |
| LCP improvement | - | ~50-100ms faster |

---

## Technical Notes

- WebP support is 97%+ globally (caniuse.com)
- Safari 14+ (2020), Chrome 32+ (2014), Firefox 65+ (2019) all support WebP
- The preload in index.html (line 40) already targets only WebP, so this aligns the actual usage

