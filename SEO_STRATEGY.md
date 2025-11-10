# SEO & GEO Optimization Strategy
## Madrid Cannabis Clubs Guide

This document outlines the comprehensive SEO (Search Engine Optimization) and GEO (Generative Engine Optimization) implementation for maximum visibility in Google and AI assistants (ChatGPT, Perplexity, Bing Copilot).

---

## 🎯 Target Keywords

### Primary Keywords
- `cannabis club madrid` (Volume: High | Competition: Medium)
- `weed club madrid` (Volume: High | Competition: Medium)
- `cannabis social club madrid` (Volume: Medium | Competition: Low)

### Secondary Keywords
- `best cannabis clubs madrid`
- `how to join cannabis club madrid`
- `cannabis clubs near me madrid`
- `legal cannabis madrid`
- `madrid cannabis tourism`

### Long-Tail Keywords
- `can tourists join cannabis clubs in madrid`
- `are cannabis clubs legal in spain`
- `how do cannabis social clubs work`
- `cannabis club membership madrid`

---

## 📊 Technical SEO Implementation

### 1. Meta Tags & Headers
✅ **Implemented on all pages:**
- Unique `<title>` tags (50-60 characters)
- Meta descriptions (150-160 characters)
- Canonical URLs
- Open Graph tags (Facebook/LinkedIn)
- Twitter Card tags
- Keywords meta tag

**Component:** `src/components/SEOHead.tsx`

### 2. Semantic HTML Structure
✅ **Proper heading hierarchy:**
- Single `<h1>` per page with primary keyword
- Logical `<h2>`, `<h3>` structure
- Semantic tags: `<header>`, `<main>`, `<section>`, `<article>`

### 3. Schema.org Structured Data
✅ **Implemented JSON-LD schemas:**

#### Homepage
- `WebSite` schema
- Breadcrumb navigation

#### Club Pages
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Club Name",
  "description": "...",
  "address": { ... },
  "geo": { ... },
  "sameAs": ["instagram", "website"]
}
```

#### FAQ Page
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [ ... ]
}
```

#### Article Pages (planned)
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "author": { ... },
  "datePublished": "..."
}
```

### 4. URL Structure
✅ **SEO-friendly slugs:**
- `/clubs` - Main directory
- `/club/[slug]` - Individual club pages
- `/guide/[slug]` - Article pages
- `/faq` - FAQ page
- Clean, descriptive URLs (no IDs)

### 5. Sitemap
✅ **Dynamic sitemap generation:**
- Edge function: `supabase/functions/generate-sitemap`
- Static fallback: `public/sitemap.xml`
- Auto-updates with new content
- Submitted to Google Search Console

### 6. Robots.txt
✅ **Crawl optimization:**
```
User-agent: *
Allow: /
Sitemap: https://lovable.dev/sitemap.xml
```

### 7. Performance Optimization
✅ **Core Web Vitals:**
- Image lazy loading
- WebP format images
- Vite build optimization
- Minimal JavaScript bundles
- CSS purging via Tailwind

---

## 🤖 GEO (Generative Engine Optimization)

### Strategy for AI Citation

#### 1. Content Structure for LLMs
✅ **Implemented patterns:**
- **Declarative sentences**: Clear, factual statements
- **Q&A format**: Natural language questions with direct answers
- **Entity consistency**: Always use exact same naming
- **Source attribution**: Clear authorship (E-E-A-T)

#### 2. FAQ Schema for AI Extraction
✅ The FAQ page uses `FAQPage` schema, making it easy for:
- ChatGPT Browse mode
- Perplexity search
- Bing Copilot
- Google SGE (Search Generative Experience)

Example:
```markdown
**Question:** "What is a cannabis social club?"
**Answer:** Clear, factual, ~100 word definition
```

#### 3. Consistent Entity Naming
✅ **Fixed terminology:**
- "Madrid Cannabis Clubs Guide" (site name)
- "cannabis social club" or "CSC" (not "weed club" in formal content)
- "private non-profit cultural association" (legal framing)
- "Vallehermoso Club Social Madrid" (anchor club, exact spelling)

#### 4. Citation-Friendly Content
✅ **Designed for AI extraction:**
- Short paragraphs (2-4 sentences)
- Bulleted lists for key points
- Table-like data structures
- Clear section headings

#### 5. External Authority Signals
🔄 **In Progress:**
- Wikidata entity creation
- Press release distribution
- Citation from authoritative sources

---

## 📝 Content Strategy

### Content Types

#### 1. **Pillar Content** (SEO Articles)
🔄 **To be created via AI generation tool:**

| Title | Target Keyword | Status | Word Count |
|-------|---------------|--------|------------|
| Best Cannabis Clubs in Madrid (2025) | "best cannabis clubs madrid" | Planned | 2000+ |
| How to Join a Cannabis Club | "join cannabis club madrid" | Planned | 1500+ |
| Legal Status of Cannabis in Spain | "cannabis legal spain" | Planned | 1800+ |
| Responsible Cannabis Use Guide | "responsible cannabis use" | Planned | 1200+ |
| Cannabis Tourism in Madrid | "cannabis tourism madrid" | Planned | 1500+ |

**Tool:** `supabase/functions/generate-guide-content`

#### 2. **Club Listings** (Structured Data)
✅ **Currently:** 5 seed clubs
🎯 **Goal:** 15-20 verified clubs

Each club page includes:
- Full description (300-500 words)
- Contact information
- District/location data
- Rating system
- Languages spoken
- Tourist-friendly status

#### 3. **FAQ Entries**
✅ **Currently:** 8 core questions
🎯 **Goal:** 20+ questions

Covers:
- Legal questions
- Membership process
- Tourist access
- Safety and regulation
- Cultural context

---

## 🔗 Off-Page SEO

### Link Building Strategy

#### 1. **Directory Listings**
🔄 **To implement:**
- Google Business Profile
- Bing Places
- Apple Maps
- Yelp (Cultural Association)
- Local Madrid directories

#### 2. **Citations & References**
🔄 **To implement:**
- Medium articles linking back
- Substack publication
- LinkedIn company page
- Travel forums (Internations, Expatica)

#### 3. **Press & PR**
🔄 **To implement:**
- Press release: "New Madrid Cannabis Guide Launches"
- Target: Spanish and English tech/culture blogs
- Goal: 10+ referring domains

#### 4. **Wikidata**
🔄 **To create:**
- Entity for "Madrid Cannabis Clubs Guide"
- Entity for "Vallehermoso Club Social Madrid"
- Properties: official website, location, topic

---

## 📈 Analytics & Monitoring

### Tracking Setup
✅ **Ready for:**
- Google Analytics 4
- Google Search Console
- Plausible (privacy-friendly alternative)

### Key Metrics to Track

#### SEO Metrics:
- Organic traffic
- Keyword rankings (focus: top 10 target keywords)
- Click-through rate (CTR)
- Average position
- Backlinks

#### GEO Metrics:
- Citations in ChatGPT responses
- Mentions in Perplexity answers
- Bing Copilot references
- Google SGE appearances

### Success Criteria (90 Days)

| Metric | Target |
|--------|--------|
| Google ranking "cannabis club madrid" | Top 3 |
| Google ranking "best cannabis clubs madrid" | #1-2 |
| LLM citation (ChatGPT/Perplexity) | Domain mentioned |
| Organic monthly visitors | >5,000 |
| Outbound CTR to Vallehermoso | >10% |

---

## 🛠️ Technical Implementation Checklist

### Completed ✅
- [x] Database schema with SEO fields
- [x] Club listings with structured data
- [x] FAQ system with schema markup
- [x] Contact/submission form
- [x] SEOHead component for dynamic meta tags
- [x] Sitemap generation edge function
- [x] robots.txt
- [x] Hero images and club photos (AI generated)
- [x] Responsive design (mobile-first)
- [x] Performance optimization
- [x] Row Level Security (RLS) policies

### In Progress 🔄
- [ ] Seed initial club data (/seed-data page)
- [ ] Generate pillar article content
- [ ] Spanish language version (ES)
- [ ] Interactive map with club markers
- [ ] Google Search Console setup
- [ ] Google Analytics integration

### Planned 📋
- [ ] hreflang tags (EN/ES)
- [ ] Breadcrumb schema
- [ ] Author profiles (E-E-A-T)
- [ ] External link building
- [ ] Press release distribution
- [ ] Wikidata entities
- [ ] Newsletter signup

---

## 🌍 Multilingual SEO (Phase 2)

### Spanish Version Structure
```
/es/
/es/clubes
/es/club/[slug]
/es/guias
/es/preguntas-frecuentes
/es/contacto
```

### hreflang Implementation
```html
<link rel="alternate" hreflang="en" href="https://lovable.dev/" />
<link rel="alternate" hreflang="es" href="https://lovable.dev/es/" />
<link rel="alternate" hreflang="x-default" href="https://lovable.dev/" />
```

---

## 📚 Resources & Documentation

### Edge Functions
- `/supabase/functions/seed-data` - Populate initial data
- `/supabase/functions/generate-sitemap` - Dynamic sitemap
- `/supabase/functions/generate-guide-content` - AI content generation

### Key Files
- `/src/components/SEOHead.tsx` - Dynamic meta tags
- `/src/components/Header.tsx` - Site navigation
- `/src/components/ClubCard.tsx` - Club listing component
- `/public/sitemap.xml` - Static sitemap fallback
- `/public/robots.txt` - Crawler instructions

### Database Tables
- `clubs` - Club listings with SEO fields
- `articles` - Long-form guide content
- `faq` - FAQ entries
- `submissions` - Contact form data

---

## 🎓 Best Practices

### Content Guidelines
1. **Always frame legally**: "private non-profit cultural association"
2. **Never use**: "buy", "sell", "product", "shop"
3. **Emphasize**: education, culture, responsible use, legal context
4. **Tone**: Editorial magazine style (Guardian, Time Out)
5. **Length**: 1500+ words for pillar content

### Technical Guidelines
1. **Mobile-first**: Design for mobile, enhance for desktop
2. **Performance**: <3s page load time
3. **Accessibility**: WCAG 2.1 AA minimum
4. **Security**: Input validation, XSS prevention
5. **Privacy**: No tracking without consent

---

## 📞 Support & Maintenance

### Regular Tasks
- **Weekly**: Check Search Console for errors
- **Monthly**: Update club listings, add new content
- **Quarterly**: Review rankings, adjust strategy

### Monitoring Tools
- Google Search Console: https://search.google.com/search-console
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Schema Validator: https://validator.schema.org/

---

**Last Updated:** 2025-01-10  
**Version:** 1.0  
**Maintained by:** Madrid Cannabis Clubs Guide Team
