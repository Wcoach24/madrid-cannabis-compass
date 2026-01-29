

# Fix 404 and Soft 404 Errors Implementation Plan

## Overview
This plan fixes 4 true 404 errors and 2 soft 404 issues detected in Google Search Console, following the exact specifications in the instructions document.

---

## Issues Summary

### True 404 Errors (4 pages)
| URL | Cause | Solution |
|-----|-------|----------|
| `/fr/guide/best-weed-clubs-madrid-top-10-2025` | French guide doesn't exist | 301 redirect to EN |
| `/de/guide/best-weed-clubs-madrid-top-10-2025` | German guide doesn't exist | 301 redirect to EN |
| `/de/invite/vallehermoso-club-social-madrid` | DE invite route doesn't exist | 301 redirect to EN |
| `/club/lavapies-social-collective` | Already has redirect | No code change needed |

### Soft 404 Errors (2 pages)
| URL | Cause | Solution |
|-----|-------|----------|
| `/clubs?district=tetuan` | No clubs in Tetuán district | Improve empty state UX |
| `/faq/medical-cannabis-spain` | Using 302 redirect | Change to 301 |

---

## Phase 1: Change FAQ Redirect to Permanent (Lowest Risk)

### File: `vercel.json`
**Lines 146-149** - Change `permanent: false` to `permanent: true`

Current:
```json
{
  "source": "/faq/:slug",
  "destination": "/faq",
  "permanent": false
}
```

Change to:
```json
{
  "source": "/faq/:slug",
  "destination": "/faq",
  "permanent": true
}
```

**Impact:** `/faq/medical-cannabis-spain` will return 301 instead of 302, removing the soft 404 signal.

---

## Phase 2: Add Guide Redirects for Legacy Slugs (Low Risk)

### File: `vercel.json`
**After line 214** (after the last redirect in the array) - Add new redirects

Add these redirects:
```json
{
  "source": "/fr/guide/best-weed-clubs-madrid-top-10-2025",
  "destination": "/guide/best-cannabis-clubs-madrid-2025",
  "permanent": true
},
{
  "source": "/de/guide/best-weed-clubs-madrid-top-10-2025",
  "destination": "/guide/best-cannabis-clubs-madrid-2025",
  "permanent": true
},
{
  "source": "/it/guide/best-weed-clubs-madrid-top-10-2025",
  "destination": "/guide/best-cannabis-clubs-madrid-2025",
  "permanent": true
},
{
  "source": "/:lang/guide/best-weed-clubs-madrid-top-10-2025",
  "destination": "/guide/best-cannabis-clubs-madrid-2025",
  "permanent": true
}
```

**Impact:** All language variations of the old guide slug redirect to the canonical English version.

---

## Phase 3: Add Invite Route Redirects (Low Risk)

### File: `vercel.json`
**In the redirects array** - Add invite route redirects for all non-EN languages

Add these redirects:
```json
{
  "source": "/de/invite/:slug*",
  "destination": "/invite/:slug*",
  "permanent": true
},
{
  "source": "/fr/invite/:slug*",
  "destination": "/invite/:slug*",
  "permanent": true
},
{
  "source": "/it/invite/:slug*",
  "destination": "/invite/:slug*",
  "permanent": true
},
{
  "source": "/es/invite/:slug*",
  "destination": "/invite/:slug*",
  "permanent": true
}
```

**Impact:** Any localized invite URLs redirect to the canonical English path.

---

## Phase 4: Improve Empty District UX (Medium Risk)

### 4.1 Add New Translations
**File: `src/lib/translations.ts`**

Add these new translation keys for all 5 languages:

**English (after `clubs.nofound.desc`):**
```typescript
"clubs.noClubsInDistrict": "No clubs currently available in this district",
"clubs.tryOtherDistricts": "Try browsing other districts or view all available clubs.",
"clubs.viewAllClubs": "View All Clubs",
"clubs.readGuide": "Read Our Guide",
```

**Spanish:**
```typescript
"clubs.noClubsInDistrict": "No hay clubes disponibles actualmente en este distrito",
"clubs.tryOtherDistricts": "Prueba a explorar otros distritos o ver todos los clubes disponibles.",
"clubs.viewAllClubs": "Ver Todos los Clubs",
"clubs.readGuide": "Leer Nuestra Guía",
```

**German:**
```typescript
"clubs.noClubsInDistrict": "Derzeit keine Clubs in diesem Bezirk verfügbar",
"clubs.tryOtherDistricts": "Versuchen Sie, andere Bezirke zu erkunden oder alle verfügbaren Clubs anzuzeigen.",
"clubs.viewAllClubs": "Alle Clubs Anzeigen",
"clubs.readGuide": "Unseren Guide Lesen",
```

**French:**
```typescript
"clubs.noClubsInDistrict": "Aucun club actuellement disponible dans ce quartier",
"clubs.tryOtherDistricts": "Essayez d'explorer d'autres quartiers ou consultez tous les clubs disponibles.",
"clubs.viewAllClubs": "Voir Tous les Clubs",
"clubs.readGuide": "Lire Notre Guide",
```

**Italian:**
```typescript
"clubs.noClubsInDistrict": "Nessun club attualmente disponibile in questo distretto",
"clubs.tryOtherDistricts": "Prova a esplorare altri distretti o visualizza tutti i club disponibili.",
"clubs.viewAllClubs": "Vedi Tutti i Club",
"clubs.readGuide": "Leggi la Nostra Guida",
```

### 4.2 Improve Empty State Component
**File: `src/pages/Clubs.tsx`**
**Lines 501-508** - Replace the empty state with an enhanced version

Current:
```tsx
) : clubs.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-xl font-medium mb-2">{t("clubs.nofound")}</p>
    <p className="text-muted-foreground mb-6">{t("clubs.nofound.desc")}</p>
    <Button variant="outline" onClick={clearFilters}>
      {t("clubs.filter.clear")}
    </Button>
  </div>
)
```

Change to:
```tsx
) : clubs.length === 0 ? (
  <div className="text-center py-12">
    {districtFilter !== "all" ? (
      <>
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("clubs.noClubsInDistrict")}</h3>
        <p className="text-muted-foreground mb-6">{t("clubs.tryOtherDistricts")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={buildLanguageAwarePath("/clubs", language)}>
            <Button variant="default">
              {t("clubs.viewAllClubs")}
            </Button>
          </Link>
          <Link to={buildLanguageAwarePath(language === "es" ? "/club-cannabis-madrid" : "/cannabis-club-madrid", language)}>
            <Button variant="outline">
              {t("clubs.readGuide")}
            </Button>
          </Link>
        </div>
      </>
    ) : (
      <>
        <p className="text-xl font-medium mb-2">{t("clubs.nofound")}</p>
        <p className="text-muted-foreground mb-6">{t("clubs.nofound.desc")}</p>
        <Button variant="outline" onClick={clearFilters}>
          {t("clubs.filter.clear")}
        </Button>
      </>
    )}
  </div>
)
```

**Impact:** When visiting `/clubs?district=tetuan`, users see a helpful message with links instead of a bare "no results" message, which signals to Google this is a meaningful page, not a soft 404.

---

## Files to Modify

| File | Changes | Risk |
|------|---------|------|
| `vercel.json` | 1 change (FAQ 302→301), 8 new redirects | Low |
| `src/lib/translations.ts` | 20 new translation keys (4 per language × 5 languages) | Low |
| `src/pages/Clubs.tsx` | Enhanced empty state component | Medium |

---

## Technical Notes

1. **No routing changes needed** - All redirects are handled at the Vercel edge layer before React loads
2. **Existing redirect confirmed** - `/club/lavapies-social-collective` already redirects correctly (line 96-99 in vercel.json)
3. **Prerender unaffected** - These are redirect/UX changes, not new indexable routes
4. **Language-aware linking** - The Cannabis Club Guide link respects the Spanish vs English path convention

---

## Validation Checklist

After implementation:
1. [ ] Visit `/faq/medical-cannabis-spain` - should return 301 (not 302)
2. [ ] Visit `/fr/guide/best-weed-clubs-madrid-top-10-2025` - should redirect to `/guide/best-cannabis-clubs-madrid-2025`
3. [ ] Visit `/de/invite/vallehermoso-club-social-madrid` - should redirect to `/invite/vallehermoso-club-social-madrid`
4. [ ] Visit `/clubs?district=tetuan` - should show enhanced empty state with links
5. [ ] Test empty state in Spanish: `/es/clubs?district=tetuan`

---

## Post-Deploy Actions

1. Go to Google Search Console → URL Inspection
2. Request re-indexation for each of the 6 problem URLs
3. Wait 1-2 weeks for GSC to update and clear the errors

---

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| True 404 errors | 4 | 0 |
| Soft 404 errors | 2 | 0 |
| Pages with problems | 6 | 0 |

