import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, User, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath, removeLanguageFromPath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";

const GuideDetail = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug, language]);

  const fetchArticle = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("language", language)
      .maybeSingle();

    if (data) {
      setArticle(data);
      fetchRelatedArticles(data.category, data.id);
    }
    setLoading(false);
  };

  const fetchRelatedArticles = async (category: string, currentId: number) => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("category", category)
      .eq("status", "published")
      .eq("language", language)
      .neq("id", currentId)
      .limit(3);

    if (data) setRelatedArticles(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">{t("guides.loading")}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("guides.nofound")}</h1>
          <Button asChild>
            <Link to={buildLanguageAwarePath("/guides", language)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("guide.backtoguides")}
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPath = removeLanguageFromPath(window.location.pathname);
  const hreflangLinks = generateHreflangLinks(BASE_URL, currentPath);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Guides",
        "item": `${BASE_URL}/guides`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${BASE_URL}/guide/${article.slug}`
      }
    ]
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt || article.seo_description,
    "image": article.cover_image_url,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "inLanguage": language,
    "author": {
      "@type": "Person",
      "name": article.author_name,
      "description": article.author_bio
    },
    "publisher": {
      "@type": "Organization",
      "name": "Madrid Cannabis Clubs Guide"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/guide/${article.slug}`
    },
    "articleSection": article.category,
    "keywords": article.tags?.join(", ")
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonical={`${BASE_URL}${buildLanguageAwarePath(currentPath, language)}`}
        keywords={article.tags?.join(", ")}
        ogImage={article.cover_image_url}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={[breadcrumbSchema, blogPostingSchema]}
      />
      <Header />
      
      <main className="flex-1">
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={buildLanguageAwarePath("/", language)}>{t("nav.home")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={buildLanguageAwarePath("/guides", language)}>{t("nav.guides")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{article.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Button variant="outline" size="sm" asChild className="mb-6">
              <Link to={buildLanguageAwarePath("/guides", language)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t("guide.backtoguides")}
              </Link>
            </Button>

            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">{article.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
              {article.subtitle && (
                <p className="text-xl text-muted-foreground mb-6">{article.subtitle}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{t("guide.by")} {article.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t("guide.publishedon")} {new Date(article.published_at).toLocaleDateString(language)}</span>
                </div>
              </div>
            </header>

            {article.cover_image_url && (
              <div className="mb-12 rounded-lg overflow-hidden">
                <img 
                  src={article.cover_image_url} 
                  alt={article.title}
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              <ReactMarkdown>{article.body_markdown}</ReactMarkdown>
            </div>

            {article.author_bio && (
              <Card className="mb-12 bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{t("guide.authorbio")}</h3>
                  <p className="text-sm text-muted-foreground">{article.author_bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-3xl font-bold mb-8">{t("guide.related.title")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((related) => (
                  <Link key={related.id} to={buildLanguageAwarePath(`/guide/${related.slug}`, language)}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      {related.cover_image_url && (
                        <img 
                          src={related.cover_image_url} 
                          alt={related.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      )}
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2 line-clamp-2">{related.title}</h3>
                        {related.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{related.excerpt}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">{t("guide.cta.title")}</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">{t("guide.cta.desc")}</p>
            <Button asChild size="lg" variant="secondary">
              <Link to={buildLanguageAwarePath("/clubs", language)}>
                {t("guide.cta.button")}
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GuideDetail;
