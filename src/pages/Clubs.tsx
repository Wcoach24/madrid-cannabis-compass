import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MapPin, Scale, Users, Plane, Shield, RefreshCw, FileText, ArrowRight, Star, CheckCircle2, Eye, ClipboardCheck, Award, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import QuickClubFinder from "@/components/QuickClubFinder";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

// Editorial picks with reasons - keyed by slug
const EDITORIAL_PICKS: Record<string, { reason: string; reasonEs: string }> = {
  "vallehermoso-club-social-madrid": { 
    reason: "Highest-rated club with premium lounge atmosphere",
    reasonEs: "Club mejor valorado con ambiente lounge premium"
  },
  "salamanca-social-club-madrid": { 
    reason: "Best for upscale experience in exclusive neighborhood",
    reasonEs: "Mejor para experiencia exclusiva en barrio elegante"
  },
  "barrio-pilar-social-club": { 
    reason: "Central location, ideal for first-time visitors",
    reasonEs: "Ubicación céntrica, ideal para primera visita"
  },
  "green-paradise-madrid": { 
    reason: "Most tourist-friendly with multilingual staff",
    reasonEs: "Más amigable para turistas con staff multilingüe"
  },
  "la-mesa-verde-madrid": { 
    reason: "Best value membership with welcoming community",
    reasonEs: "Mejor relación calidad-precio con comunidad acogedora"
  }
};

// District links for internal navigation
const FEATURED_DISTRICTS = [
  { slug: "centro", name: "Centro", landmark: "Near Sol & Gran Vía" },
  { slug: "chamberi", name: "Chamberí", landmark: "Elegant neighborhood" },
  { slug: "malasana", name: "Malasaña", landmark: "Hipster & artistic" },
  { slug: "retiro", name: "Retiro", landmark: "Near Retiro Park" },
  { slug: "salamanca", name: "Salamanca", landmark: "Premium district" },
  { slug: "atocha", name: "Atocha", landmark: "Near train station" },
];

// Essential guides for internal linking
const ESSENTIAL_GUIDES = [
  { slug: "best-cannabis-clubs-madrid-2025", titleKey: "clubs.guides.best" },
  { slug: "how-to-join-cannabis-club-madrid", titleKey: "clubs.guides.join" },
  { slug: "cannabis-laws-spain-2025", titleKey: "clubs.guides.legal" },
  { slug: "cannabis-club-madrid-tourists-2025-guide", titleKey: "clubs.guides.tourist" },
];

const Clubs = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [districtFilter, setDistrictFilter] = useState(searchParams.get("district") || "all");
  const [touristFilter, setTouristFilter] = useState(searchParams.get("tourist") || "all");

  // Check if URL has filter parameters - if so, this is a noindex page
  const hasFilterParams = searchParams.has("district") || searchParams.has("tourist") || searchParams.has("q");

  useEffect(() => {
    fetchClubs();
  }, [districtFilter, touristFilter]);

  const fetchClubs = async () => {
    setLoading(true);
    
    let query = supabase
      .from("clubs")
      .select("id, slug, name, summary, district, rating_editorial, is_tourist_friendly, is_verified, languages, main_image_url, timetable, description, is_featured")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("rating_editorial", { ascending: false, nullsFirst: false });

    if (districtFilter !== "all") {
      query = query.eq("district", districtFilter);
    }

    if (touristFilter === "true") {
      query = query.eq("is_tourist_friendly", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching clubs:", error);
      setLoading(false);
      return;
    }

    if (data) {
      let filtered = data;
      
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = data.filter(club => 
          club.name.toLowerCase().includes(lowerQuery) ||
          club.description.toLowerCase().includes(lowerQuery) ||
          club.district.toLowerCase().includes(lowerQuery)
        );
      }
      
      setClubs(filtered);
    }
    
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClubs();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDistrictFilter("all");
    setTouristFilter("all");
  };

  // Separate featured (Editor's Picks) from regular clubs
  const featuredClubs = clubs.filter(club => club.is_featured || EDITORIAL_PICKS[club.slug]);
  const regularClubs = clubs.filter(club => !club.is_featured && !EDITORIAL_PICKS[club.slug]);

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/clubs");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Clubs", url: `${BASE_URL}/clubs` }
  ]);

  // ItemList schema for the clubs directory
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cannabis Clubs in Madrid",
    "description": "Comprehensive directory of verified cannabis social clubs in Madrid, Spain",
    "numberOfItems": clubs.length,
    "itemListElement": clubs.map((club, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "@id": `${BASE_URL}/club/${club.slug}`,
        "name": club.name,
        "url": `${BASE_URL}/club/${club.slug}`,
        "description": club.summary || club.description?.substring(0, 150),
        "image": club.main_image_url,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": club.district,
          "addressRegion": "Madrid",
          "addressCountry": "ES"
        },
        ...(club.rating_editorial ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": club.rating_editorial,
            "bestRating": "5",
            "ratingCount": "1"
          }
        } : {}),
        ...(club.is_verified ? { "badge": "Verified Club" } : {}),
        ...(club.is_tourist_friendly ? { "touristType": "International Tourists" } : {})
      }
    }))
  };

  // FAQPage schema for editorial sections
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": language === "es" ? "¿Es legal el cannabis en Madrid?" : "Is cannabis legal in Madrid?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === "es" 
            ? "El consumo de cannabis en espacios privados es legal en España. Los clubes sociales de cannabis operan como asociaciones privadas sin ánimo de lucro bajo la ley española. El consumo público sigue siendo ilegal con multas de hasta €30.000."
            : "Cannabis consumption in private spaces is legal in Spain. Cannabis social clubs operate as private non-profit associations under Spanish law. Public consumption remains illegal with fines up to €30,000."
        }
      },
      {
        "@type": "Question",
        "name": language === "es" ? "¿Cómo funcionan los clubes de cannabis en Madrid?" : "How do cannabis clubs work in Madrid?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === "es"
            ? "Los clubes de cannabis son asociaciones privadas de miembros. Para entrar, necesitas una invitación de un miembro existente. Las cuotas de membresía típicamente van de €20-€50/año."
            : "Cannabis clubs are private member associations. To enter, you need an invitation from an existing member. Membership fees typically range €20-€50/year."
        }
      },
      {
        "@type": "Question",
        "name": language === "es" ? "¿Pueden los turistas unirse a clubes de cannabis en Madrid?" : "Can tourists join cannabis clubs in Madrid?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === "es"
            ? "Sí, los turistas mayores de 21 años con identificación válida pueden unirse a la mayoría de los clubes. El acceso en el mismo día está disponible. No se requiere residencia española."
            : "Yes, tourists 21+ with valid ID can join most clubs. Same-day access is available. No Spanish residency required."
        }
      }
    ]
  };

  // Speakable schema
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["[data-speakable='true']", ".passage-answer", "h1", "h2"]
    }
  };

  // SEO: noindex for parameter pages, canonical always to clean URL
  const seoTitle = language === "es" 
    ? "Clubes Cannabis Madrid 2026 – Verificados y Legales"
    : "Cannabis Clubs Madrid 2026 – Verified, Legal & Explained";

  const seoDescription = language === "es"
    ? "Guía definitiva de clubes de cannabis en Madrid. 15+ asociaciones verificadas, proceso de membresía explicado, clubs por distrito. Acceso legal para turistas y residentes."
    : "The definitive guide to cannabis clubs in Madrid. 15+ verified associations, membership process explained, clubs by district. Legal access for tourists and residents.";

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/clubs", language)}`}
        keywords="cannabis clubs madrid, weed clubs madrid directory, verified cannabis clubs, madrid districts cannabis, how to join cannabis club madrid, cannabis legal madrid"
        hreflangLinks={hasFilterParams ? undefined : hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={hasFilterParams ? undefined : [breadcrumbSchema, itemListSchema, faqSchema, speakableSchema]}
        robots={hasFilterParams ? "noindex, follow" : undefined}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Editorial H1 */}
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6"
              data-speakable="true"
            >
              {t("clubs.hero.title")}
            </h1>
            <p 
              className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mb-8 passage-answer"
              data-speakable="true"
            >
              {t("clubs.hero.intro")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t("clubs.hero.badge1")}
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                {t("clubs.hero.badge2")}
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Plane className="w-4 h-4 mr-2" />
                {t("clubs.hero.badge3")}
              </Badge>
            </div>
            {/* Last Updated E-E-A-T Signal */}
            <p className="text-sm text-primary-foreground/70 mt-6">
              {t("clubs.lastUpdated")}
            </p>
          </div>
        </section>

        {/* Editorial Section 1: Is Cannabis Legal? */}
        <section id="legal" className="py-12 bg-background border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" data-speakable="true">
                {t("clubs.section.legal.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 passage-answer" data-speakable="true">
                {t("clubs.section.legal.text")}
              </p>
              <Link to={buildLanguageAwarePath("/guide/cannabis-laws-spain-2025", language)}>
                <Button variant="outline" className="group">
                  {t("clubs.section.legal.cta")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Section 2: How Cannabis Clubs Work */}
        <section id="how-it-works" className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" data-speakable="true">
                {t("clubs.section.howitworks.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 passage-answer" data-speakable="true">
                {t("clubs.section.howitworks.text")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={buildLanguageAwarePath("/how-it-works", language)}>
                  <Button variant="outline" className="group">
                    {t("clubs.section.howitworks.cta1")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to={buildLanguageAwarePath("/guide/how-to-join-cannabis-club-madrid", language)}>
                  <Button variant="ghost" className="group">
                    {t("clubs.section.howitworks.cta2")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Section 3: Best Areas / Districts */}
        <section id="districts" className="py-12 bg-background border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" data-speakable="true">
              {t("clubs.section.areas.title")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {FEATURED_DISTRICTS.map((district) => (
                <Link 
                  key={district.slug} 
                  to={buildLanguageAwarePath(`/clubs/${district.slug}`, language)}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">{district.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{district.landmark}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to={buildLanguageAwarePath("/clubs/near-me", language)}>
                <Button variant="outline">
                  {t("clubs.section.areas.viewall")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Section 4: Tourists vs Residents */}
        <section id="tourists" className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" data-speakable="true">
                {t("clubs.section.tourists.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 passage-answer" data-speakable="true">
                {t("clubs.section.tourists.text")}
              </p>
              <Link to={buildLanguageAwarePath("/guide/cannabis-club-madrid-tourists-2025-guide", language)}>
                <Button variant="outline" className="group">
                  {t("clubs.section.tourists.cta")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Editor's Picks Section */}
        {featuredClubs.length > 0 && (
          <section id="editors-picks" className="py-12 bg-gradient-to-br from-gold/5 to-gold/10 border-b">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-gold fill-gold" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  {t("clubs.editorspicks.title")}
                </h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-2xl">
                {t("clubs.editorspicks.subtitle")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredClubs.slice(0, 6).map((club) => (
                  <div key={club.id} className="relative">
                    <ClubCard
                      slug={club.slug}
                      name={club.name}
                      summary={club.summary}
                      district={club.district}
                      rating_editorial={club.rating_editorial}
                      is_tourist_friendly={club.is_tourist_friendly}
                      is_verified={club.is_verified}
                      languages={club.languages}
                      main_image_url={club.main_image_url}
                      timetable={club.timetable as any}
                      isEditorsPick={true}
                      editorsPickReason={
                        EDITORIAL_PICKS[club.slug]
                          ? (language === "es" ? EDITORIAL_PICKS[club.slug].reasonEs : EDITORIAL_PICKS[club.slug].reason)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quick Club Finder */}
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <QuickClubFinder />
            </Card>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section className="py-8 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={t("clubs.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("clubs.filter.district")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("clubs.filter.district.all")}</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Chamberí">Chamberí</SelectItem>
                  <SelectItem value="Retiro">Retiro</SelectItem>
                  <SelectItem value="Salamanca">Salamanca</SelectItem>
                  <SelectItem value="Chamartín">Chamartín</SelectItem>
                  <SelectItem value="Tetuán">Tetuán</SelectItem>
                  <SelectItem value="Arganzuela">Arganzuela</SelectItem>
                  <SelectItem value="Moncloa-Aravaca">Moncloa-Aravaca</SelectItem>
                </SelectContent>
              </Select>

              <Select value={touristFilter} onValueChange={setTouristFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("clubs.filter.tourist")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("clubs.filter.tourist.all")}</SelectItem>
                  <SelectItem value="true">{t("clubs.filter.tourist.yes")}</SelectItem>
                  <SelectItem value="false">{t("clubs.filter.tourist.no")}</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                {t("clubs.search.button")}
              </Button>
            </form>
          </div>
        </section>

        {/* All Clubs Listing */}
        <section id="clubs" className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              {t("clubs.allclubs.title")}
            </h2>
            {loading ? (
              <p className="text-center py-12 text-muted-foreground">{t("clubs.loading")}</p>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Show regular clubs first if filters active, otherwise show non-featured */}
                {(hasFilterParams ? clubs : regularClubs).map((club) => (
                  <ClubCard
                    key={club.id}
                    slug={club.slug}
                    name={club.name}
                    summary={club.summary}
                    district={club.district}
                    rating_editorial={club.rating_editorial}
                    is_tourist_friendly={club.is_tourist_friendly}
                    is_verified={club.is_verified}
                    languages={club.languages}
                    main_image_url={club.main_image_url}
                    timetable={club.timetable as any}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Essential Guides Section */}
        <section id="guides" className="py-12 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              {t("clubs.guides.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ESSENTIAL_GUIDES.map((guide) => (
                <Link 
                  key={guide.slug} 
                  to={buildLanguageAwarePath(`/guide/${guide.slug}`, language)}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                    <CardContent className="p-6">
                      <FileText className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {t(guide.titleKey)}
                      </h3>
                      <span className="text-sm text-primary flex items-center">
                        {t("clubs.guides.read")}
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* E-E-A-T Trust Section */}
        <section className="py-12 bg-background border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              {t("clubs.trust.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.trust.verified.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.trust.verified.text")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.trust.updated.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.trust.updated.text")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.trust.editorial.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.trust.editorial.text")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Verification Methodology Section - E-E-A-T */}
        <section className="py-12 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("clubs.verification.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
              {t("clubs.verification.intro")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <Eye className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.verification.step1.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.verification.step1.text")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <ClipboardCheck className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.verification.step2.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.verification.step2.text")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Award className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.verification.step3.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.verification.step3.text")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Clock className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t("clubs.verification.step4.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("clubs.verification.step4.text")}
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {t("clubs.verification.team")}
            </p>
          </div>
        </section>

        {/* Visible FAQ Section - Featured Snippet Target */}
        <section className="py-12 bg-background border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              {t("clubs.faq.visible.title")}
            </h2>
            <div className="max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {t("clubs.faq.visible.q1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t("clubs.faq.visible.a1")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {t("clubs.faq.visible.q2")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t("clubs.faq.visible.a2")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {t("clubs.faq.visible.q3")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t("clubs.faq.visible.a3")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Soft CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("clubs.cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("clubs.cta.text")}
            </p>
            <Link to={buildLanguageAwarePath("/how-it-works", language)}>
              <Button size="lg" className="group">
                {t("clubs.cta.button")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Clubs;