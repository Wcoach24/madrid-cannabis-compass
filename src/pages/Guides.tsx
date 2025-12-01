import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { BookOpen, Calendar, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const Guides = () => {
  const { language, t } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [language]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("language", language)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setArticles(data);
    }
    
    setLoading(false);
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/guides");

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t("nav.home"), url: BASE_URL },
    { name: t("guides.title"), url: `${BASE_URL}${buildLanguageAwarePath("/guides", language)}` }
  ]);

  // ItemList schema for the articles directory
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cannabis Guides and Articles - Madrid",
    "description": "Comprehensive guides about cannabis clubs, laws, and tourism in Madrid, Spain",
    "numberOfItems": articles.length,
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "@id": `${BASE_URL}/guide/${article.slug}`,
        "headline": article.title,
        "url": `${BASE_URL}/guide/${article.slug}`,
        "description": article.excerpt,
        "image": article.cover_image_url,
        "datePublished": article.published_at,
        "author": {
          "@type": "Person",
          "name": article.author_name
        },
        "publisher": {
          "@type": "Organization",
          "name": "Weed Madrid"
        }
      }
    }))
  };

  // Get proper locale for OG tags
  const getOgLocale = () => {
    switch (language) {
      case 'es': return 'es_ES';
      case 'de': return 'de_DE';
      case 'fr': return 'fr_FR';
      default: return 'en_US';
    }
  };

  const getOgLocaleAlternates = () => {
    const locales = ['en_US', 'es_ES', 'de_DE', 'fr_FR'];
    return locales.filter(l => l !== getOgLocale());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("guides.title") + " | Madrid Cannabis Clubs"}
        description={t("guides.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/guides", language)}`}
        keywords="cannabis guides madrid, cannabis social club guide, cannabis law spain, how to join cannabis club, cannabis tourism madrid"
        hreflangLinks={hreflangLinks}
        ogLocale={getOgLocale()}
        ogLocaleAlternate={getOgLocaleAlternates()}
        structuredData={[breadcrumbSchema, itemListSchema]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("guides.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("guides.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("guides.loading")}</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("guides.nofound")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {articles.map((article) => (
                  <Link key={article.id} to={buildLanguageAwarePath(`/guide/${article.slug}`, language)}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                      {article.cover_image_url && (
                        <ImageWithSkeleton
                          src={article.cover_image_url}
                          alt={`${article.title} - Cannabis guide for Madrid covering ${article.category}`}
                          aspectRatio="video"
                          className="transition-transform hover:scale-105 duration-300"
                          loading="lazy"
                        />
                      )}
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">
                          {article.category}
                        </Badge>
                        <h2 className="text-xl font-bold mb-3 line-clamp-2">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{article.author_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(article.published_at).toLocaleDateString(language)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Guides;
