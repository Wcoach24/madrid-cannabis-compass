import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Train, Coffee, Users } from "lucide-react";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema, generateSpeakableSchema } from "@/lib/schemaUtils";

const DISTRICTS = [
  { slug: "centro", icon: MapPin },
  { slug: "malasana", icon: Coffee },
  { slug: "lavapies", icon: Users },
  { slug: "chamberi", icon: Train },
  { slug: "salamanca", icon: MapPin },
  { slug: "retiro", icon: MapPin },
  { slug: "tetuan", icon: Train },
];

const Districts = () => {
  const { t, language } = useLanguage();
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/districts");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t("nav.home"), url: BASE_URL },
    { name: t("districts.hero.title"), url: `${BASE_URL}${buildLanguageAwarePath("/districts", language)}` }
  ]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t("districts.meta.title"),
    "description": t("districts.meta.description"),
    "url": `https://www.weedmadrid.com${buildLanguageAwarePath("/districts", language)}`,
    "inLanguage": language,
    "hasPart": DISTRICTS.map(d => ({
      "@type": "Place",
      "name": t(`districts.${d.slug}.name`),
      "url": `https://www.weedmadrid.com${buildLanguageAwarePath(`/district/${d.slug}`, language)}`,
    })),
  };

  const speakableSchema = generateSpeakableSchema(
    `${BASE_URL}${buildLanguageAwarePath("/districts", language)}`,
    ["h1", "h2", "[data-speakable='true']"]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={t("districts.meta.title")}
        description={t("districts.meta.description")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/districts", language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={[breadcrumbSchema, schemaData, speakableSchema]}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("districts.hero.title")}</h1>
              <p className="text-xl text-muted-foreground mb-8">{t("districts.hero.subtitle")}</p>
            </div>
          </div>
        </section>

        {/* Districts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {DISTRICTS.map((district) => {
                const Icon = district.icon;
                return (
                  <Link 
                    key={district.slug}
                    to={buildLanguageAwarePath(`/district/${district.slug}`, language)}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle>{t(`districts.${district.slug}.name`)}</CardTitle>
                        </div>
                        <CardDescription>
                          {t(`districts.${district.slug}.tagline`)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t(`districts.${district.slug}.preview`)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">{t("districts.info.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("districts.info.description")}</p>
            <p className="text-sm text-muted-foreground">{t("districts.info.legal_note")}</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Districts;
