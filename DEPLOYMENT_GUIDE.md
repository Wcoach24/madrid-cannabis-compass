# Deployment & Setup Guide
## Madrid Cannabis Clubs Guide

Complete guide to deploy and configure the production site.

---

## 📋 Prerequisites

- Lovable account with project access
- Supabase project connected
- Domain name (optional, for custom domain)
- Google Search Console account
- Google Analytics 4 account

---

## 🚀 Initial Setup

### 1. Seed the Database

**Visit:** `/seed-data`

Click "Seed Database" to populate:
- 5 verified cannabis clubs
- 8 FAQ entries with answers
- Initial club images

**Verify:** Check `/clubs` to see listings appear

### 2. Configure Domain (Optional)

1. Go to Lovable Project Settings → Domains
2. Click "Connect Domain"
3. Add your custom domain (e.g., `madridcannabisguide.com`)
4. Configure DNS records as instructed
5. Wait for SSL certificate provisioning (10-15 minutes)

### 3. Update URLs in Code

Replace `https://lovable.dev` with your actual domain in:
- `supabase/functions/generate-sitemap/index.ts` (line 15)
- `index.html` canonical tag
- All SEOHead components

### 4. Set Up Analytics

#### Google Analytics 4:
1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### Google Search Console:
1. Visit https://search.google.com/search-console
2. Add property (domain or URL prefix)
3. Verify ownership (HTML file upload or DNS)
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

---

## 📊 Content Population

### Method 1: Using AI Content Generator

1. Call the edge function to generate guide articles:

```javascript
const response = await supabase.functions.invoke('generate-guide-content', {
  body: {
    topic: "Best Cannabis Clubs in Madrid 2025",
    targetKeyword: "best cannabis clubs madrid",
    wordCount: 2000
  }
});
```

2. Insert the generated content into `articles` table via Supabase dashboard

### Method 2: Manual Entry

1. Go to Supabase Dashboard → Table Editor
2. Select `articles` table
3. Click "Insert row"
4. Fill in required fields:
   - `slug`: URL-friendly (e.g., "best-cannabis-clubs-madrid")
   - `title`: SEO-optimized title
   - `body_markdown`: Full article in Markdown
   - `language`: "en" or "es"
   - `category`: "guide", "law", "culture", etc.
   - `author_name`: Your name or "Editorial Team"
   - `status`: "published"
   - `published_at`: Current timestamp

### Recommended Articles to Create:

1. **Best Cannabis Clubs in Madrid (2025 Guide)**
   - Target: "best cannabis clubs madrid"
   - 2000+ words
   - Include club comparisons, ratings, district breakdown

2. **How to Join a Cannabis Club in Madrid**
   - Target: "join cannabis club madrid"
   - 1500+ words
   - Step-by-step process, requirements, what to expect

3. **Legal Status of Cannabis in Spain and Madrid**
   - Target: "cannabis legal spain"
   - 1800+ words
   - Law explanation, private association model, penalties

4. **Responsible Cannabis Use: A Cultural Perspective**
   - Target: "responsible cannabis use"
   - 1200+ words
   - Harm reduction, dosing, set and setting

5. **Cannabis Tourism in Madrid: What You Should Know**
   - Target: "cannabis tourism madrid"
   - 1500+ words
   - Tourist guide, etiquette, clubs that welcome tourists

---

## 🗺️ Add More Clubs

### Via Supabase Dashboard:

1. Go to `clubs` table
2. Click "Insert row"
3. Fill in all fields:

**Required:**
- `slug`: URL-safe name (e.g., "club-name-madrid")
- `name`: Full club name
- `description`: 300-500 word description
- `address`: Full street address
- `district`: Madrid district name
- `status`: "active"

**Optional but Recommended:**
- `summary`: 1-2 sentence summary
- `latitude`, `longitude`: For map integration
- `rating_editorial`: 1.0-5.0
- `is_tourist_friendly`: true/false
- `is_verified`: true/false
- `is_featured`: true/false (shows on homepage)
- `languages`: Array like `["es","en"]`
- `instagram_url`, `website_url`: Social/web links
- `main_image_url`: Club photo URL
- `seo_title`, `seo_description`: Custom SEO (optional)

### Via Contact Form:

Clubs can submit themselves via `/contact` form. Review submissions in `submissions` table.

---

## 🖼️ Adding Images

### Option 1: Use Existing Images
Upload to a CDN or use Supabase Storage, then reference URLs in `main_image_url` field.

### Option 2: Generate with AI (Recommended)
Use the image generation in Lovable to create editorial-style club photos.

### Option 3: External Image Hosting
- Unsplash (free, high-quality)
- Cloudinary (with transformations)
- Supabase Storage buckets

**Best practice:** Use WebP format, optimize for web (max 1920px width)

---

## 🌐 Sitemap & SEO

### Generate Fresh Sitemap

The sitemap auto-generates from database content.

**Access via:**
- Edge function: Call `generate-sitemap` function
- Static version: `public/sitemap.xml` (fallback)

**Submit to:**
1. Google Search Console
2. Bing Webmaster Tools
3. Update URL in robots.txt

### Monitor SEO Performance

**Google Search Console:**
- Performance → Queries: Track keyword rankings
- Coverage: Check for indexing errors
- Enhancements: Schema markup validation

**Target Metrics (90 days):**
- Top 3 for "cannabis club madrid"
- Top 5 for "weed club madrid"
- 5,000+ monthly organic visitors

---

## 🔒 Security Checklist

### Database (RLS Policies)

✅ **Verify Row Level Security is enabled:**
```sql
-- Public can view active clubs
SELECT * FROM clubs WHERE status = 'active';

-- Public can view published articles
SELECT * FROM articles WHERE status = 'published';

-- Public can view all FAQ
SELECT * FROM faq;

-- Public can insert submissions (contact form)
INSERT INTO submissions (type, name, email, message);
```

### Input Validation

✅ **Contact form uses Zod schema validation:**
- Email format checked
- Input length limits enforced
- XSS prevention via sanitization

### API Security

✅ **Edge functions are public (no auth required):**
- `seed-data`: verify_jwt = false
- `generate-sitemap`: verify_jwt = false
- `generate-guide-content`: verify_jwt = false

---

## 📱 Testing Checklist

### Pre-Launch Tests

- [ ] All pages load correctly
- [ ] Mobile responsive (test on real devices)
- [ ] Forms submit successfully
- [ ] Images load and are optimized
- [ ] Links work (no 404s)
- [ ] SEO meta tags present on all pages
- [ ] Schema.org validation passes
- [ ] Sitemap generates correctly
- [ ] robots.txt accessible
- [ ] Page speed <3s (PageSpeed Insights)
- [ ] Lighthouse score >90

### Post-Launch Monitoring

**Week 1:**
- Check Google Search Console for crawl errors
- Monitor server logs for 404s or 500s
- Test contact form submissions
- Verify analytics tracking

**Month 1:**
- Review top landing pages
- Check keyword rankings
- Monitor organic traffic growth
- Fix any technical SEO issues

---

## 🚨 Troubleshooting

### Issue: Clubs not showing on homepage
**Solution:** Check that clubs have `is_featured = true` and `status = 'active'`

### Issue: Sitemap not updating
**Solution:** Redeploy edge function, check logs for errors

### Issue: Forms not submitting
**Solution:** Verify RLS policy allows anonymous INSERT on `submissions` table

### Issue: Images not loading
**Solution:** Check CORS settings, verify image URLs are accessible

### Issue: Poor Google rankings
**Solution:** 
1. Check Google Search Console for issues
2. Verify schema markup with validator
3. Add more quality content
4. Build backlinks

---

## 📈 Growth Strategy

### Month 1-2: Foundation
- Complete all pillar content (5 articles)
- Reach 15 club listings
- Submit to directories (Bing, Google)
- Set up social media profiles

### Month 3-4: Content & Links
- Publish 2 articles per month
- Guest post on local Madrid blogs
- Press release distribution
- Start building citations

### Month 5-6: Optimization
- Spanish version launch
- Add video content
- Create interactive map
- Build email newsletter

### Month 7-12: Scale
- Expand to other Spanish cities
- Create mobile app
- Partnerships with clubs
- Events calendar feature

---

## 💡 Advanced Features (Future)

### Interactive Map
- Integrate Mapbox or Leaflet
- Plot all club locations
- Popups with club info
- Filter by district/features

### User Reviews (with auth)
- Supabase Auth integration
- User-submitted ratings
- Moderation system
- Verified member badges

### Events System
- Club events calendar
- RSVP functionality
- Integration with club social media

### Newsletter
- Mailerlite or Supabase integration
- Weekly cannabis culture digest
- New club announcements

---

## 📞 Support & Resources

### Documentation
- SEO Strategy: See `SEO_STRATEGY.md`
- Lovable Docs: https://docs.lovable.dev/
- Supabase Docs: https://supabase.com/docs

### Key Edge Functions
```bash
# Seed database
curl -X POST https://[project-ref].supabase.co/functions/v1/seed-data

# Generate sitemap
curl https://[project-ref].supabase.co/functions/v1/generate-sitemap

# Generate article content
curl -X POST https://[project-ref].supabase.co/functions/v1/generate-guide-content \
  -H "Content-Type: application/json" \
  -d '{"topic": "...", "targetKeyword": "...", "wordCount": 1500}'
```

### Monitoring Links
- Search Console: https://search.google.com/search-console
- Analytics: https://analytics.google.com/
- PageSpeed: https://pagespeed.web.dev/
- Schema Validator: https://validator.schema.org/

---

**Last Updated:** 2025-01-10  
**Version:** 1.0
