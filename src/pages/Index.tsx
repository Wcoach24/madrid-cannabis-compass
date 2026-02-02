import { useEffect, useState, useRef, startTransition, lazy, Suspense } from "react";
import LazyHydrate from 'react-lazy-hydration';
import { Link, useNavigate } from "react-router-dom";
// Supabase client is dynamically imported in fetchFeaturedClubs for bundle optimization
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Clock, CheckCircle, Users, Star, Zap } from "lucide-react";
// Lazy load Header and Footer for better LCP - static shells exist in index.html
const Header = lazy(() => import("@/components/Header"));
const Footer = lazy(() => import("@/components/Footer"));
import QuickClubFinder from "@/components/QuickClubFinder";
import QuickAnswerBox from "@/components/QuickAnswerBox";

// Lazy load below-the-fold sections for better LCP
const HomepageLegalSection = lazy(() => import("@/components/home/HomepageLegalSection"));
const AvoidScamsSection = lazy(() => import("@/components/home/AvoidScamsSection"));
const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
const ClubTypesSection = lazy(() => import("@/components/home/ClubTypesSection"));
const SafetyTipsSection = lazy(() => import("@/components/home/SafetyTipsSection"));
const HomepageFAQ = lazy(() => import("@/components/home/HomepageFAQ"));

// Minimal skeleton for lazy-loaded sections
const SectionSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={`${height} bg-muted/30 animate-pulse rounded-lg`} />
);

import logoWeedMadridWebp from "@/assets/logo-weed-madrid.webp";

import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";

import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath, DEFAULT_INVITATION_CLUB_SLUG } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { isOpenNow, Timetable } from "@/lib/timetableUtils";
import { trackQuickFinderUse, trackClubView } from "@/components/Analytics";
import { FEATURED_CLUBS_SEED } from "@/data/featuredClubs";

const Index = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredClubs, setFeaturedClubs] = useState<any[]>(FEATURED_CLUBS_SEED);
  const [clubsLoading, setClubsLoading] = useState(false);
  const didFetchRef = useRef(false);
  const [finderDialogOpen, setFinderDialogOpen] = useState(false);

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

  const fetchFeaturedClubs = async () => {
    try {
      // Dynamic import - Supabase SDK (~50-100KB) only loads when this runs
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase
        .from("clubs")
        .select("slug, name, summary, district, rating_editorial, is_tourist_friendly, is_verified, languages, main_image_url, timetable")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("rating_editorial", { ascending: false })
        .limit(3);

      // Only update if we got valid data - never wipe the seed
      if (data && data.length > 0) {
        setFeaturedClubs(data);
      }
    } catch (error) {
      // Silently fail - keep seed data
      console.warn("Featured clubs fetch failed, using seed data");
    }
    setClubsLoading(false);
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/");
  
  // Generate FAQPage schema for structured data
  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t("home.faq.seo.q1"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("home.faq.seo.a1")
        }
      },
      {
        "@type": "Question",
        "name": t("home.faq.seo.q2"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("home.faq.seo.a2")
        }
      },
      {
        "@type": "Question",
        "name": t("home.faq.seo.q3"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("home.faq.seo.a3")
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("home.title")}
        description={t("home.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/", language)}`}
        keywords="weed madrid, weed clubs madrid, weed in madrid, cannabis club madrid, how to get weed in madrid safely, cannabis social club madrid, madrid cannabis association, social club cannabis madrid, private cannabis clubs madrid"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        ogImage={`${BASE_URL}/logo.png`}
        // GEO props
        geoTxtPath="/home.geo.txt"
        aiPriority="high"
        contentSummary="Guide to verified cannabis social clubs in Madrid, Spain. Same-day invitation service for tourists 21+."
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${BASE_URL}/#website`,
              "url": BASE_URL,
              "name": "Weed Madrid",
              "description": t("home.subtitle"),
              "inLanguage": language,
              "publisher": { "@id": `${BASE_URL}/#organization` },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${BASE_URL}/clubs?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            },
            faqSchema
          ]
        }}
      />
      <LazyHydrate whenIdle>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
      </LazyHydrate>
      
      <main className="flex-1">
        {/* 1. HERO SECTION - Intent Clarification */}
        <section className="relative py-20 md:py-32 overflow-hidden" style={{
          backgroundImage: 'url(/images/hero-custom-bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Dark Overlay for Background */}
          <div className="absolute inset-0 bg-black/50 z-[1]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6 md:mb-8">
                <img 
                  src={logoWeedMadridWebp}
                  alt="Weed Madrid - Madrid's trusted cannabis club directory and invitation guide for legal cannabis social clubs" 
                  className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 md:mb-6 drop-shadow-2xl rounded-2xl"
                  width="160"
                  height="160"
                  translate="no"
                />
              </div>
              
              {/* H1 - PRD Required */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight text-gradient-logo">
                {t("home.h1")}
              </h1>
              
              {/* H2 Subtitle - PRD Required */}
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 md:mb-10 text-foreground/80 px-4" role="doc-subtitle">
                {t("home.h2")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4" style={{ minHeight: '56px' }}>
                <Dialog open={finderDialogOpen} onOpenChange={setFinderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto shadow-xl hover:shadow-neon transition-all hover:scale-105"
                      onClick={() => trackQuickFinderUse()}
                    >
                      <Search className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                      {t("home.search.button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <QuickClubFinder onClose={() => setFinderDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
                  asChild
                >
                  <Link to={buildLanguageAwarePath("/guides", language)}>
                    {t("home.howitworks.readguide")}
                  </Link>
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 px-2">
                <div className="flex items-center gap-2 md:gap-3 glass-effect px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-gold text-sm md:text-base">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{t("home.features.legal")}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 glass-effect px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-gold text-sm md:text-base">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{t("home.features.verified")}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 glass-effect px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-gold text-sm md:text-base">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{t("home.features.sameday")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. QUICK ANSWER BOX - Featured Snippet Target (PRD-Compliant) */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <QuickAnswerBox
                title={t("home.quickanswer.title")}
                answer={t("home.quickanswer.text")}
                variant="featured-snippet"
              />
            </div>
          </div>
        </section>

        {/* 3. LEGAL CONTEXT SECTION - PRD Required */}
        <LazyHydrate whenVisible>
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <HomepageLegalSection />
          </Suspense>
        </LazyHydrate>

        {/* 4. AVOID SCAMS SECTION - Trust Signal */}
        <LazyHydrate whenVisible>
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <AvoidScamsSection />
          </Suspense>
        </LazyHydrate>

        {/* 5. HOW IT WORKS - Single 4-Step Flow (No Duplicates) */}
        <LazyHydrate whenVisible>
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <HowItWorksSection />
          </Suspense>
        </LazyHydrate>

        {/* 6. FEATURED CLUBS */}
        {featuredClubs.length > 0 && (
          <section className="py-16 md:py-20 bg-background" id="featured-clubs">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-12 px-4">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-gradient-gold">
                  {t("home.featured.title")}
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-luxury">
                  {t("home.featured.subtitle")}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-6 md:mb-8">
                {featuredClubs.map((club, index) => {
                  const clubIsOpen = club.timetable ? isOpenNow(club.timetable as Timetable) : false;
                  
                  return (
                    <div key={club.slug} className="card-snoop group relative overflow-hidden rounded-2xl cursor-pointer">
                      {/* OPEN NOW Badge - using semantic green for status */}
                      {clubIsOpen && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                          <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 shadow-lg">
                            {t("clubcard.open_now")}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Club Image with zoom effect */}
                      <div className="relative h-56 md:h-64 overflow-hidden">
                        <picture translate="no">
                          <source 
                            srcSet={club.main_image_url?.replace(/\.(jpg|jpeg|png)$/i, '.webp')} 
                            type="image/webp" 
                          />
                          <img 
                            src={club.main_image_url || "/placeholder.svg"} 
                            alt={club.name}
                            className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
                            translate="no"
                          />
                        </picture>
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80 md:group-hover:opacity-90 transition-opacity"></div>
                        
                        {/* Club info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <h3 className="font-display text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-foreground">{club.name}</h3>
                          <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-base md:text-lg ${i < Math.floor(club.rating_editorial || 0) ? 'text-primary' : 'text-muted-foreground/30'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-primary font-bold text-base md:text-lg">{club.rating_editorial?.toFixed(1)}</span>
                          </div>
                          <p className="text-muted-foreground text-xs md:text-sm mb-1">📍 {club.district}</p>
                          {club.is_tourist_friendly && (
                            <span className="inline-block text-xs bg-primary/20 text-primary px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-primary/30">
                              {t("home.features.tourist")}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Get Invitation Button */}
                      <div className="p-4 md:p-6">
                        <Button 
                          asChild 
                          variant="gold" 
                          className="w-full text-base md:text-lg py-5 md:py-6 shadow-gold md:group-hover:shadow-gold-intense transition-all"
                        >
                          <Link 
                            to="/invite/vallehermoso-club-social-madrid"
                            onClick={() => trackClubView(club.slug, club.name)}
                          >
                            {t("home.featured.getinvitation")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <Button asChild size="lg" variant="glow" className="text-lg px-10 py-6 h-auto">
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {t("home.featured.viewall")}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* 7. TYPES OF CANNABIS CLUBS */}
        <LazyHydrate whenVisible>
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <ClubTypesSection />
          </Suspense>
        </LazyHydrate>

        {/* 8. SAFETY TIPS */}
        <LazyHydrate whenVisible>
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            <SafetyTipsSection />
          </Suspense>
        </LazyHydrate>

        {/* 9. FAQ SECTION - SEO-Driven */}
        <LazyHydrate whenVisible>
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <HomepageFAQ />
          </Suspense>
        </LazyHydrate>

        {/* 10. GUIDES / INTERNAL LINKS */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">{t("home.guides.title")}</h2>
              
              {/* Primary Pillar Page Link */}
              <div className="mb-8">
                <Link 
                  to={buildLanguageAwarePath(language === "es" ? "/club-cannabis-madrid" : "/cannabis-club-madrid", language)}
                  className="inline-flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {language === "es" ? "Guía Completa: Club de Cannabis Madrid 2026" : "Complete Guide: Cannabis Club Madrid 2026"}
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
                <Link 
                  to={buildLanguageAwarePath(language === "es" ? "/guide/mejores-clubs-cannabis-madrid-2025" : "/guide/best-cannabis-clubs-madrid-2025", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.best.title")}
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  to={buildLanguageAwarePath(language === "es" ? "/guide/como-unirse-club-cannabis-madrid" : "/guide/how-to-join-cannabis-club-madrid", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.join.title")}
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  to={buildLanguageAwarePath(language === "es" ? "/guide/leyes-cannabis-espana-2025" : "/guide/cannabis-laws-spain-2025", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.legal.title")}
                </Link>
              </div>
              
              <div className="mt-6">
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("home.faq.viewall")} →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Section - Trust Signals */}
        <section className="py-10 md:py-14 bg-black border-y border-primary/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t("home.stats.clubs")}</p>
                <p className="text-sm md:text-base text-muted-foreground">{t("home.stats.clubs.label")}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t("home.stats.tourists")}</p>
                <p className="text-sm md:text-base text-muted-foreground">{t("home.stats.tourists.label")}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t("home.stats.approval")}</p>
                <p className="text-sm md:text-base text-muted-foreground">{t("home.stats.approval.label")}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t("home.stats.legal")}</p>
                <p className="text-sm md:text-base text-muted-foreground">{t("home.stats.legal.label")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LazyHydrate whenIdle>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </LazyHydrate>
    </div>
  );
};

export default Index;
