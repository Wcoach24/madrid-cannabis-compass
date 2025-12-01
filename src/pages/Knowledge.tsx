import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Scale, 
  Shield, 
  HelpCircle, 
  MapPin, 
  FileText,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
}

const Knowledge = () => {
  const { language, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [language]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("slug, title, excerpt, category")
      .eq("language", language)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/knowledge");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Knowledge Hub", url: `${BASE_URL}/knowledge` }
  ]);

  const pillarPages = [
    {
      title: t("knowledge.pillar.legal.title"),
      description: t("knowledge.pillar.legal.desc"),
      icon: Scale,
      href: buildLanguageAwarePath("/legal", language),
      color: "text-primary"
    },
    {
      title: t("knowledge.pillar.howitworks.title"),
      description: t("knowledge.pillar.howitworks.desc"),
      icon: BookOpen,
      href: buildLanguageAwarePath("/how-it-works", language),
      color: "text-forest-dark"
    },
    {
      title: t("knowledge.pillar.safety.title"),
      description: t("knowledge.pillar.safety.desc"),
      icon: Shield,
      href: buildLanguageAwarePath("/safety", language),
      color: "text-forest-light"
    }
  ];

  const faqCategories = [
    { name: t("knowledge.faq.basics"), anchor: "#basics", icon: HelpCircle },
    { name: t("knowledge.faq.membership"), anchor: "#membership", icon: FileText },
    { name: t("knowledge.faq.legal"), anchor: "#law", icon: Scale },
    { name: t("knowledge.faq.safety"), anchor: "#safety", icon: Shield },
  ];

  const districts = [
    "Centro", "Chamberí", "Salamanca", "Retiro", 
    "Tetuán", "Chamartín", "Moncloa-Aravaca"
  ];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t("knowledge.title"),
    "description": t("knowledge.subtitle"),
    "inLanguage": language,
    "url": `${BASE_URL}${buildLanguageAwarePath("/knowledge", language)}`,
    "hasPart": [
      ...pillarPages.map(page => ({
        "@type": "WebPage",
        "name": page.title,
        "description": page.description,
        "url": `${BASE_URL}${page.href}`
      })),
      ...articles.slice(0, 10).map(article => ({
        "@type": "Article",
        "headline": article.title,
        "description": article.excerpt || "",
        "url": `${BASE_URL}${buildLanguageAwarePath(`/guide/${article.slug}`, language)}`
      }))
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("knowledge.title") + " | Madrid Cannabis Clubs"}
        description={t("knowledge.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/knowledge", language)}`}
        keywords="cannabis knowledge, madrid cannabis guide, cannabis education, cannabis social clubs information"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={[breadcrumbSchema, collectionSchema]}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <Sparkles className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("knowledge.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("knowledge.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Pillar Pages Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("knowledge.pillar.title")}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {pillarPages.map((page, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <page.icon className={`w-12 h-12 mb-4 ${page.color}`} />
                      <CardTitle>{page.title}</CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={page.href}>{t("knowledge.pillar.read")}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guides Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("knowledge.guides.title")}</h2>
              {loading ? (
                <p className="text-center text-muted-foreground">{t("guides.loading")}</p>
              ) : articles.length === 0 ? (
                <p className="text-center text-muted-foreground">{t("guides.nofound")}</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {articles.map((article) => (
                    <Card key={article.slug} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          <Link 
                            to={buildLanguageAwarePath(`/guide/${article.slug}`, language)}
                            className="hover:text-primary transition-colors"
                          >
                            {article.title}
                          </Link>
                        </CardTitle>
                        {article.excerpt && (
                          <CardDescription className="line-clamp-2">
                            {article.excerpt}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
              <div className="text-center mt-8">
                <Button asChild size="lg">
                  <Link to={buildLanguageAwarePath("/guides", language)}>
                    {t("knowledge.guides.viewall")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("knowledge.faq.title")}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {faqCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Link 
                        to={buildLanguageAwarePath(`/faq${category.anchor}`, language)}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <category.icon className="w-8 h-8 text-primary flex-shrink-0" />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to={buildLanguageAwarePath("/faq", language)}>
                    {t("knowledge.faq.viewall")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Districts Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("knowledge.districts.title")}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {districts.map((district) => (
                  <Card key={district} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Link 
                        to={buildLanguageAwarePath(`/district/${district.toLowerCase().replace(/\s+/g, '-')}`, language)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                        <CardTitle className="text-base">{district}</CardTitle>
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to={buildLanguageAwarePath("/districts", language)}>
                    {t("knowledge.districts.viewall")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/10 to-forest-light/10 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl md:text-3xl mb-4">
                    {t("knowledge.cta.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("knowledge.cta.desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link to={buildLanguageAwarePath("/clubs", language)}>
                      {t("nav.clubs")}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to={buildLanguageAwarePath("/contact", language)}>
                      {t("nav.contact")}
                    </Link>
                  </Button>
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

export default Knowledge;
