import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Scale, Heart, MapPin, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import heroImage from "@/assets/hero-main.jpg";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";

const Index = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredClubs, setFeaturedClubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(buildLanguageAwarePath(`/clubs?q=${encodeURIComponent(searchQuery)}`, language));
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("home.title")}
        description={t("home.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/", language)}`}
        keywords="cannabis club madrid, weed club madrid, cannabis social club, madrid cannabis, join cannabis club madrid, best cannabis clubs madrid"
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
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${BASE_URL}/clubs?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Cannabis social club interior" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-forest-light/90 to-primary/95"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t("home.title")}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                {t("home.subtitle")}
              </p>
              
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={t("home.search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background/95 backdrop-blur h-12 text-base"
                  />
                  <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Search className="w-5 h-5 mr-2" />
                    {t("home.search.button")}
                  </Button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-background/10 backdrop-blur p-6 rounded-lg">
                  <Scale className="w-8 h-8 mb-4 mx-auto text-primary-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t("home.features.legal")}</h3>
                  <p className="text-sm text-primary-foreground/80">{t("home.features.legal.desc")}</p>
                </div>
                <div className="bg-background/10 backdrop-blur p-6 rounded-lg">
                  <Heart className="w-8 h-8 mb-4 mx-auto text-primary-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t("home.features.verified")}</h3>
                  <p className="text-sm text-primary-foreground/80">{t("home.features.verified.desc")}</p>
                </div>
                <div className="bg-background/10 backdrop-blur p-6 rounded-lg">
                  <MapPin className="w-8 h-8 mb-4 mx-auto text-primary-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t("home.features.tourist")}</h3>
                  <p className="text-sm text-primary-foreground/80">{t("home.features.tourist.desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Clubs */}
        {featuredClubs.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.featured.title")}</h2>
                <p className="text-xl text-muted-foreground">{t("home.featured.subtitle")}</p>
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
                <Button asChild size="lg">
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {t("home.featured.viewall")}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.howitworks.title")}</h2>
              <p className="text-xl text-muted-foreground">{t("home.howitworks.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Scale className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t("home.howitworks.private.title")}</h3>
                  <p className="text-muted-foreground">{t("home.howitworks.private.desc")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Heart className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t("home.howitworks.membership.title")}</h3>
                  <p className="text-muted-foreground">{t("home.howitworks.membership.desc")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t("home.howitworks.responsible.title")}</h3>
                  <p className="text-muted-foreground">{t("home.howitworks.responsible.desc")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" variant="outline">
                <Link to={buildLanguageAwarePath("/guides", language)}>
                  {t("home.howitworks.readguide")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Essential Guides */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">{t("home.guides.title")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BookOpen className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t("home.guides.best.title")}</h3>
                  <p className="text-muted-foreground">{t("home.guides.best.desc")}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Heart className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t("home.guides.join.title")}</h3>
                  <p className="text-muted-foreground">{t("home.guides.join.desc")}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Scale className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t("home.guides.legal.title")}</h3>
                  <p className="text-muted-foreground">{t("home.guides.legal.desc")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
