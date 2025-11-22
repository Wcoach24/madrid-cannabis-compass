import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Mail, PartyPopper, Shield, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import logoWeedMadrid from "@/assets/logo-weed-madrid.png";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";

const Index = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredClubs, setFeaturedClubs] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedClubs();
  }, []);

  const fetchFeaturedClubs = async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("rating_editorial", { ascending: false })
      .limit(3);

    if (data) {
      setFeaturedClubs(data);
    }
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("home.title")}
        description={t("home.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/", language)}`}
        keywords="weed madrid, cannabis club madrid, weed club madrid, cannabis madrid, join cannabis club madrid, tourist cannabis madrid"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Weed Madrid",
          "description": t("home.subtitle"),
          "url": BASE_URL,
          "inLanguage": language,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${BASE_URL}/clubs?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Dark Luxury with Snoop Dogg Vibes */}
        <section className="relative py-24 md:py-40 overflow-hidden bg-weed-black">
          {/* Dark gradient overlay with smoke effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-weed-purple-dark/80 via-weed-black to-weed-purple-dark/60"></div>
          
          {/* Animated glow effects */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-weed-gold/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-weed-glow-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Logo - Larger with glow animation */}
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <img 
                  src={logoWeedMadrid} 
                  alt="Weed Madrid Logo" 
                  className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mx-auto drop-shadow-2xl shadow-gold animate-pulse"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.4))' }}
                />
              </div>
              
              {/* Headline - Massive with gold gradient and 3D shadow */}
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-gradient-gold text-glow text-3d animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                {t("home.hero.title")}
              </h1>
              
              {/* Subheadline - Luxury serif font */}
              <p className="font-luxury text-2xl md:text-3xl lg:text-4xl mb-12 text-weed-gold/80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                {t("home.hero.subtitle")}
              </p>
              
              {/* Single prominent gold CTA button */}
              <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <Button 
                  size="xl" 
                  variant="gold"
                  asChild
                >
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {t("home.hero.cta")}
                  </Link>
                </Button>
              </div>

              {/* Trust Signals - Rich badges with social proof */}
              <div className="flex flex-wrap justify-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                <div className="flex flex-col items-center gap-2 glass-effect px-6 py-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-weed-gold to-weed-gold-dark flex items-center justify-center shadow-gold">
                    <CheckCircle className="w-7 h-7 text-weed-black" />
                  </div>
                  <span className="text-sm font-bold text-weed-gold uppercase tracking-wide">Premium Verified</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 glass-effect px-6 py-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-weed-gold to-weed-gold-dark flex items-center justify-center shadow-gold">
                    <Shield className="w-7 h-7 text-weed-black" />
                  </div>
                  <span className="text-sm font-bold text-weed-gold uppercase tracking-wide">100% Legal</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 glass-effect px-6 py-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-weed-gold to-weed-gold-dark flex items-center justify-center shadow-gold">
                    <Clock className="w-7 h-7 text-weed-black" />
                  </div>
                  <span className="text-sm font-bold text-weed-gold uppercase tracking-wide">Same-Day Access</span>
                </div>
              </div>

              {/* Social Proof Counter */}
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-900">
                <p className="text-weed-gold/60 text-lg">
                  <span className="text-3xl font-bold text-weed-gold text-glow">5,000+</span> Members Already Inside
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - 3 Steps for Tourists */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">{t("home.howitworks.title")}</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("home.howitworks.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              <Card className="relative overflow-hidden border-2 hover:border-accent transition-all hover:shadow-xl">
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-neon">
                  1
                </div>
                <CardContent className="p-8 pt-20">
                  <Search className="w-16 h-16 text-primary mb-6" />
                  <h3 className="font-display text-2xl font-bold mb-3">{t("home.howitworks.private.title")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.howitworks.private.desc")}</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 hover:border-accent transition-all hover:shadow-xl">
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-neon">
                  2
                </div>
                <CardContent className="p-8 pt-20">
                  <Calendar className="w-16 h-16 text-primary mb-6" />
                  <h3 className="font-display text-2xl font-bold mb-3">{t("home.howitworks.membership.title")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.howitworks.membership.desc")}</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 hover:border-accent transition-all hover:shadow-xl">
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-neon">
                  3
                </div>
                <CardContent className="p-8 pt-20">
                  <PartyPopper className="w-16 h-16 text-primary mb-6" />
                  <h3 className="font-display text-2xl font-bold mb-3">{t("home.howitworks.responsible.title")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.howitworks.responsible.desc")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                <Link to={buildLanguageAwarePath("/clubs", language)}>
                  <Mail className="w-5 h-5 mr-2" />
                  Get Your Invitation Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Clubs */}
        {featuredClubs.length > 0 && (
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">{t("home.featured.title")}</h2>
                <p className="text-lg md:text-xl text-muted-foreground">{t("home.featured.subtitle")}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-8">
                {featuredClubs.map((club) => (
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
                  />
                ))}
              </div>

              <div className="text-center">
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {t("home.featured.viewall")}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Essential Guides - Simplified */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">{t("home.guides.title")}</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.best.title")}
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.join.title")}
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.legal.title")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
