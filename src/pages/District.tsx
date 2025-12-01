import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ClubCard from "@/components/ClubCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Train, Clock, Info, ArrowLeft } from "lucide-react";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { Button } from "@/components/ui/button";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const District = () => {
  const { district } = useParams<{ district: string }>();
  const { t, language } = useLanguage();

  // Fetch clubs in this district
  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs", district],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("status", "active")
        .ilike("district", district?.replace("-", " ") || "")
        .order("is_featured", { ascending: false })
        .order("rating_editorial", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (!district) {
    return null;
  }

  const districtKey = district.toLowerCase();
  const districtName = t(`districts.${districtKey}.name`);
  const hreflangLinks = generateHreflangLinks(BASE_URL, `/district/${district}`);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t("nav.home"), url: BASE_URL },
    { name: t("districts.hero.title"), url: `${BASE_URL}${buildLanguageAwarePath("/districts", language)}` },
    { name: districtName, url: `${BASE_URL}${buildLanguageAwarePath(`/district/${district}`, language)}` }
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": t(`districts.${districtKey}.seo.title`),
    "description": t(`districts.${districtKey}.seo.description`),
    "author": {
      "@type": "Organization",
      "name": "Weed Madrid",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Weed Madrid",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.weedmadrid.com/logo.png",
      },
    },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString(),
    "inLanguage": language,
  };

  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    "name": districtName,
    "containedInPlace": {
      "@type": "City",
      "name": "Madrid",
      "containedInPlace": {
        "@type": "Country",
        "name": "Spain",
      },
    },
    "description": t(`districts.${districtKey}.overview`),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={t(`districts.${districtKey}.seo.title`)}
        description={t(`districts.${districtKey}.seo.description`)}
        canonical={`${BASE_URL}${buildLanguageAwarePath(`/district/${district}`, language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={[breadcrumbSchema, articleSchema, placeSchema]}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <Link to={buildLanguageAwarePath("/districts", language)}>
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("districts.back_to_districts")}
              </Button>
            </Link>
            
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{districtName}</h1>
              <p className="text-xl text-muted-foreground">{t(`districts.${districtKey}.tagline`)}</p>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <p className="text-lg leading-relaxed">{t(`districts.${districtKey}.overview`)}</p>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-card rounded-lg p-6 border">
                  <MapPin className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{t("districts.features.atmosphere")}</h3>
                  <p className="text-sm text-muted-foreground">{t(`districts.${districtKey}.atmosphere`)}</p>
                </div>
                
                <div className="bg-card rounded-lg p-6 border">
                  <Train className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{t("districts.features.transport")}</h3>
                  <p className="text-sm text-muted-foreground">{t(`districts.${districtKey}.transport`)}</p>
                </div>
                
                <div className="bg-card rounded-lg p-6 border">
                  <Clock className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{t("districts.features.vibe")}</h3>
                  <p className="text-sm text-muted-foreground">{t(`districts.${districtKey}.vibe`)}</p>
                </div>
              </div>

              {/* What to Expect */}
              <div className="bg-muted/30 rounded-lg p-8 mb-12">
                <h2 className="text-2xl font-bold mb-4">{t("districts.what_to_expect.title")}</h2>
                <p className="text-muted-foreground mb-6">{t(`districts.${districtKey}.what_to_expect`)}</p>
                
                <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-2">{t("districts.legal_reminder.title")}</p>
                      <p className="text-sm text-muted-foreground">{t("districts.legal_reminder.description")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Tips */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6">{t("districts.local_tips.title")}</h2>
                <div className="space-y-4">
                  {(t(`districts.${districtKey}.tips`) as string).split("|").map((tip: string, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clubs in District */}
        {clubs && clubs.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-2">{t("districts.clubs_section.title")}</h2>
                <p className="text-muted-foreground mb-8">{t("districts.clubs_section.subtitle")}</p>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {clubs.map((club) => (
                      <ClubCard 
                        key={club.id}
                        slug={club.slug}
                        name={club.name}
                        summary={club.summary || undefined}
                        district={club.district}
                        rating_editorial={club.rating_editorial || undefined}
                        is_tourist_friendly={club.is_tourist_friendly || false}
                        is_verified={club.is_verified || false}
                        languages={club.languages || undefined}
                        main_image_url={club.main_image_url || undefined}
                        timetable={club.timetable as any}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{t("districts.cta.title")}</h2>
              <p className="text-muted-foreground mb-8">{t("districts.cta.description")}</p>
              <Link to={buildLanguageAwarePath("/how-it-works", language)}>
                <Button size="lg">{t("districts.cta.button")}</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default District;
