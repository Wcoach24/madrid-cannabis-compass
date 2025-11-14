# Page Update Guide - Multilingual Support

This guide shows exactly how to update each remaining page file with multilingual support.

## ✅ Already Updated

- src/components/Header.tsx
- src/components/Footer.tsx
- src/components/ClubCard.tsx
- src/components/SEOHead.tsx
- src/App.tsx
- src/pages/FAQ.tsx (needs completion - see below)

## 🔄 Pages to Update

### 1. Complete FAQ.tsx Update

The FAQ page needs the final touches. Replace lines 110-142 with:

```typescript
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-lg font-medium pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                        <ReactMarkdown>{faq.answer_markdown}</ReactMarkdown>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{t("faq.contact.title")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("faq.contact.desc")}
              </p>
              <Button asChild size="lg">
                <Link to={buildLanguageAwarePath("/contact", language)}>
                  {t("faq.contact.button")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
```

### 2. Update src/pages/Guides.tsx

Add imports at top:
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
```

Inside component:
```typescript
const Guides = () => {
  const { language, t } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [language]); // Add language dependency

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("language", language) // Filter by language
      .order("published_at", { ascending: false });
```

Update SEOHead:
```typescript
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/guides");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("guides.title") + " | Madrid Cannabis Clubs"}
        description={t("guides.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/guides", language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
      />
```

Update hero section:
```typescript
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("guides.title")}
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              {t("guides.subtitle")}
            </p>
```

Update loading/empty states:
```typescript
        {loading ? (
          <p className="text-center text-muted-foreground py-12">{t("guides.loading")}</p>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("guides.nofound")}</p>
        ) : (
```

Update article links:
```typescript
          <Link key={article.id} to={buildLanguageAwarePath(`/guide/${article.slug}`, language)}>
```

### 3. Update src/pages/GuideDetail.tsx

Add imports:
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath, removeLanguageFromPath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
```

Inside component:
```typescript
const GuideDetail = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug, language]); // Add language dependency
```

Update fetch to include language preference:
```typescript
  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("language", language) // Filter by language
      .single();
```

Update SEOHead:
```typescript
  const currentPath = removeLanguageFromPath(window.location.pathname);
  const hreflangLinks = generateHreflangLinks(BASE_URL, currentPath);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonical={`${BASE_URL}${buildLanguageAwarePath(currentPath, language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={[breadcrumbSchema, blogPostingSchema]}
      />
```

Update breadcrumbs and links:
```typescript
          <Link to={buildLanguageAwarePath("/", language)}>{t("nav.home")}</Link>
          <Link to={buildLanguageAwarePath("/guides", language)}>{t("nav.guides")}</Link>

          <Button variant="outline" asChild>
            <Link to={buildLanguageAwarePath("/guides", language)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("guide.backtoguides")}
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            {t("guide.by")} {article.author_name} • {t("guide.publishedon")} {new Date(article.published_at).toLocaleDateString(language)}
          </p>

          <h2 className="text-2xl font-bold mb-4">{t("guide.related.title")}</h2>

          <Button asChild size="lg">
            <Link to={buildLanguageAwarePath("/clubs", language)}>
              {t("guide.cta.button")}
            </Link>
          </Button>
```

### 4. Update src/pages/Clubs.tsx

Add imports:
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
```

Inside component:
```typescript
const Clubs = () => {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  // ... rest of state
```

Update SEOHead:
```typescript
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/clubs");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("clubs.title") + " | Madrid Cannabis Clubs"}
        description={t("clubs.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/clubs", language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
      />
```

Update hero and form:
```typescript
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("clubs.title")}
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              {t("clubs.subtitle")}
            </p>

                  placeholder={t("clubs.search.placeholder")}
                  
                <Button type="submit">
                  <Search className="w-4 h-4 mr-2" />
                  {t("clubs.search.button")}
                </Button>

                  <SelectValue placeholder={t("clubs.filter.district")} />
                  
                    <SelectItem value="all">{t("clubs.filter.district.all")}</SelectItem>
                    
                  <SelectValue placeholder={t("clubs.filter.tourist")} />
                  
                    <SelectItem value="all">{t("clubs.filter.tourist.all")}</SelectItem>
                    <SelectItem value="true">{t("clubs.filter.tourist.yes")}</SelectItem>
                    <SelectItem value="false">{t("clubs.filter.tourist.no")}</SelectItem>

        {loading ? (
          <p className="text-center py-12 text-muted-foreground">{t("clubs.loading")}</p>
        ) : clubs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-medium mb-2">{t("clubs.nofound")}</p>
            <p className="text-muted-foreground mb-6">{t("clubs.nofound.desc")}</p>
            <Button variant="outline" onClick={clearFilters}>
              {t("clubs.filter.clear")}
            </Button>
          </div>
```

### 5. Update src/pages/ClubDetail.tsx

Add imports:
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath, removeLanguageFromPath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
```

Inside component:
```typescript
const ClubDetail = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
```

Update SEOHead:
```typescript
  const currentPath = removeLanguageFromPath(window.location.pathname);
  const hreflangLinks = generateHreflangLinks(BASE_URL, currentPath);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={club.seo_title || `${club.name} - Madrid Cannabis Club`}
        description={club.seo_description || club.summary}
        canonical={`${BASE_URL}${buildLanguageAwarePath(currentPath, language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={[breadcrumbSchema, localBusinessSchema]}
      />
```

Update breadcrumbs and UI text:
```typescript
          <Link to={buildLanguageAwarePath("/", language)}>{t("nav.home")}</Link>
          <Link to={buildLanguageAwarePath("/clubs", language)}>{t("nav.clubs")}</Link>

          <Button variant="outline" asChild>
            <Link to={buildLanguageAwarePath("/clubs", language)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("club.backtoclubs")}
            </Link>
          </Button>

            <Badge variant="secondary">{t("club.verified")}</Badge>
            <Badge variant="outline">{t("club.touristfriendly")}</Badge>

                <MapPin className="w-4 h-4" />
                <span className="font-medium">{t("club.location")}</span>

                <Languages className="w-4 h-4" />
                <span className="font-medium">{t("club.languages")}</span>

                <Building className="w-4 h-4" />
                <span className="font-medium">{t("club.type")}</span>

            <h2 className="text-2xl font-bold mb-4">{t("club.contact")}</h2>

              <a href={club.website_url} target="_blank" rel="noopener noreferrer">
                {t("club.website")}
              </a>

              <a href={club.instagram_url} target="_blank" rel="noopener noreferrer">
                {t("club.instagram")}
              </a>

              <a href={`mailto:${club.email}`}>
                {t("club.email")}
              </a>

              <a href={`https://wa.me/${club.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                {t("club.whatsapp")}
              </a>

            <h3 className="font-semibold mb-2">{t("club.disclaimer.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("club.disclaimer.text")}</p>

          <h2 className="text-3xl font-bold mb-8">{t("club.related.title")} {club.district}</h2>
```

### 6. Update src/pages/Contact.tsx

Add imports:
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
```

Inside component:
```typescript
const Contact = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
```

Update SEOHead:
```typescript
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/contact");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("contact.title") + " | Madrid Cannabis Clubs"}
        description={t("contact.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/contact", language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
      />
```

Update hero and form:
```typescript
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("contact.subtitle")}
              </p>

                          <FormLabel>{t("contact.form.type")}</FormLabel>
                          
                            <SelectValue placeholder={t("contact.form.type")} />
                          
                            <SelectItem value="general">{t("contact.type.general")}</SelectItem>
                            <SelectItem value="club_submission">{t("contact.type.club")}</SelectItem>
                            <SelectItem value="partnership">{t("contact.type.partnership")}</SelectItem>

                          <FormLabel>{t("contact.form.name")}</FormLabel>
                          
                            placeholder={t("contact.form.name")}

                          <FormLabel>{t("contact.form.email")}</FormLabel>
                          
                            placeholder={t("contact.form.email")}

                          <FormLabel>{t("contact.form.club")}</FormLabel>
                          
                            placeholder={t("contact.form.club")}

                          <FormLabel>{t("contact.form.message")}</FormLabel>
                          
                            placeholder={t("contact.form.message")}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? t("contact.form.sending") : t("contact.form.send")}
                      </Button>
```

Update toast messages:
```typescript
      toast({
        title: t("contact.success"),
      });

      toast({
        title: t("contact.error"),
        variant: "destructive",
      });
```

### 7. Update src/pages/Index.tsx

Add imports:
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { useNavigate } from "react-router-dom";
```

Inside component:
```typescript
const Index = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredClubs, setFeaturedClubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
```

Update search handler:
```typescript
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(buildLanguageAwarePath(`/clubs?q=${encodeURIComponent(searchQuery)}`, language));
  };
```

Update SEOHead:
```typescript
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("home.title")}
        description={t("home.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/", language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Madrid Cannabis Clubs Guide",
          "description": t("home.subtitle"),
          "url": BASE_URL,
          "inLanguage": language,
        }}
      />
```

Update all hero section text:
```typescript
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t("home.title")}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                {t("home.subtitle")}
              </p>
              
                  placeholder={t("home.search.placeholder")}
                  
                <Button type="submit" size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  {t("home.search.button")}
                </Button>

                  <Scale className="w-8 h-8 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{t("home.features.legal")}</h3>
                  <p className="text-muted-foreground">{t("home.features.legal.desc")}</p>

                  <Heart className="w-8 h-8 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{t("home.features.verified")}</h3>
                  <p className="text-muted-foreground">{t("home.features.verified.desc")}</p>

                  <MapPin className="w-8 h-8 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{t("home.features.tourist")}</h3>
                  <p className="text-muted-foreground">{t("home.features.tourist.desc")}</p>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.featured.title")}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t("home.featured.subtitle")}</p>

              <Button asChild size="lg">
                <Link to={buildLanguageAwarePath("/clubs", language)}>
                  {t("home.featured.viewall")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.howitworks.title")}</h2>
          <p className="text-xl text-muted-foreground mb-12">{t("home.howitworks.subtitle")}</p>

                <h3 className="text-xl font-semibold mb-3">{t("home.howitworks.private.title")}</h3>
                <p className="text-muted-foreground">{t("home.howitworks.private.desc")}</p>

                <h3 className="text-xl font-semibold mb-3">{t("home.howitworks.membership.title")}</h3>
                <p className="text-muted-foreground">{t("home.howitworks.membership.desc")}</p>

                <h3 className="text-xl font-semibold mb-3">{t("home.howitworks.responsible.title")}</h3>
                <p className="text-muted-foreground">{t("home.howitworks.responsible.desc")}</p>

            <Button asChild size="lg" variant="outline">
              <Link to={buildLanguageAwarePath("/guides", language)}>
                {t("home.howitworks.readguide")}
              </Link>
            </Button>

          <h2 className="text-3xl md:text-4xl font-bold mb-12">{t("home.guides.title")}</h2>

                <h3 className="text-xl font-semibold mb-2">{t("home.guides.best.title")}</h3>
                <p className="text-muted-foreground">{t("home.guides.best.desc")}</p>

                <h3 className="text-xl font-semibold mb-2">{t("home.guides.join.title")}</h3>
                <p className="text-muted-foreground">{t("home.guides.join.desc")}</p>

                <h3 className="text-xl font-semibold mb-2">{t("home.guides.legal.title")}</h3>
                <p className="text-muted-foreground">{t("home.guides.legal.desc")}</p>
```

## 🚀 Testing After Updates

After updating all pages, test:

1. **Language Switching**: Click language selector on each page
2. **URL Structure**: Verify `/` and `/es/` routes work
3. **Content Loading**: Check articles and FAQs filter by language
4. **Links**: All internal links should preserve language
5. **SEO**: Check hreflang tags in browser dev tools
6. **Translations**: Verify all text appears in correct language
7. **Browser Detection**: Test auto-detection banner on fresh session

## 📝 Quick Reference

**Import block for all pages:**
```typescript
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
```

**Inside component:**
```typescript
const { language, t } = useLanguage();
const hreflangLinks = generateHreflangLinks(BASE_URL, "/your-path");
```

**For all Links:**
```typescript
<Link to={buildLanguageAwarePath("/path", language)}>
```

**For all text:**
```typescript
{t("translation.key")}
```

**For database queries (articles/FAQs):**
```typescript
.eq("language", language)
```
