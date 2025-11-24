import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
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

  // Determine if this is a HowTo article
  const isHowToArticle = article.title.toLowerCase().includes("how to") || 
                         article.category.toLowerCase().includes("how-to") ||
                         article.slug.includes("how-to");

  // Use NewsArticle for time-sensitive content, BlogPosting for evergreen
  const isTimeSensitive = article.title.includes('2025') || article.category === 'legal';
  const articleType = isTimeSensitive ? 'NewsArticle' : 'BlogPosting';

  // HowTo Schema for step-by-step guides
  const howToSchema = isHowToArticle ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": article.title,
    "description": article.subtitle || article.excerpt,
    "image": article.cover_image_url,
    "totalTime": "PT15M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Check Legal Requirements",
        "text": "Verify you meet the age requirement (21+) and have valid identification documents.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Find a Verified Club",
        "text": "Browse our directory of verified cannabis clubs and select one based on your preferred district and amenities.",
        "position": 2,
        "url": `${BASE_URL}/clubs`
      },
      {
        "@type": "HowToStep",
        "name": "Request Club Invitation",
        "text": "Submit an invitation request through the club's official contact method or our platform.",
        "position": 3,
        "url": `${BASE_URL}/invitation`
      },
      {
        "@type": "HowToStep",
        "name": "Provide Required Documents",
        "text": "Submit your ID, contact information, and any additional documents required by the club.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Await Approval",
        "text": "The club will review your application, typically taking 1-3 business days.",
        "position": 5
      },
      {
        "@type": "HowToStep",
        "name": "Visit the Club",
        "text": "Once approved, visit the club in person with your original documents to complete membership registration.",
        "position": 6
      },
      {
        "@type": "HowToStep",
        "name": "Pay Membership Fee",
        "text": "Pay the one-time or annual membership fee as specified by the club.",
        "position": 7
      },
      {
        "@type": "HowToStep",
        "name": "Sign Membership Agreement",
        "text": "Review and sign the club's rules, legal terms, and membership agreement.",
        "position": 8
      }
    ]
  } : null;

  // BlogPosting Schema - More specific than Article for SEO
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": articleType,
    "headline": article.title,
    "alternativeHeadline": article.subtitle,
    "description": article.excerpt || article.seo_description,
    "image": {
      "@type": "ImageObject",
      "url": article.cover_image_url,
      "width": 1200,
      "height": 630
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "isAccessibleForFree": true,
    "inLanguage": language,
    "author": {
      "@type": "Person",
      "name": article.author_name,
      "description": article.author_bio,
      "jobTitle": "Cannabis Tourism Expert",
      "url": `${BASE_URL}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Weed Madrid",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
        "width": 200,
        "height": 200
      },
      "email": "info@weedmadrid.com",
      "sameAs": [BASE_URL]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/guide/${article.slug}`
    },
    "articleSection": article.category,
    "articleBody": article.body_markdown,
    "wordCount": article.body_markdown.split(' ').length,
    "keywords": article.tags?.join(", "),
    "about": {
      "@type": "Thing",
      "name": "Cannabis Social Clubs Madrid"
    },
    "mentions": article.body_markdown.includes("cannabis club") ? {
      "@type": "Place",
      "name": "Madrid Cannabis Clubs",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Madrid",
        "addressCountry": "ES"
      }
    } : undefined,
    "citation": article.body_markdown.includes("STS 484/2015") ? [
      {
        "@type": "Legislation",
        "name": "Spanish Supreme Court STS 484/2015",
        "legislationJurisdiction": "Spain"
      },
      {
        "@type": "Legislation",
        "name": "Organic Law 1/2015",
        "legislationJurisdiction": "Spain"
      }
    ] : undefined,
    "timeRequired": `PT${Math.ceil(article.body_markdown.split(' ').length / 200)}M`
  };

  // Extract FAQ schema if article contains FAQ section
  const extractFAQSchema = (markdown: string) => {
    const faqRegex = /##\s+Frequently Asked Questions[\s\S]*?###\s+(.+?)\n\n([\s\S]+?)(?=###|##|$)/g;
    const faqs: Array<{question: string; answer: string}> = [];
    let match;

    while ((match = faqRegex.exec(markdown)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim().replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
      faqs.push({ question, answer });
    }

    if (faqs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  };

  const faqSchema = extractFAQSchema(article.body_markdown);
  
  // Build schemas array with all applicable schemas
  const allSchemas = [
    breadcrumbSchema,
    blogPostingSchema,
    ...(howToSchema ? [howToSchema] : []),
    ...(faqSchema ? [faqSchema] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonical={`${BASE_URL}${buildLanguageAwarePath(currentPath, language)}`}
        keywords={article.tags?.join(", ")}
        ogImage={article.cover_image_url}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={allSchemas}
        speakableSelectors={["h1", "article .text-muted-foreground", ".markdown-content > p:first-of-type", ".markdown-content h2"]}
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
                  alt={`${article.title} - Comprehensive guide about ${article.category} for cannabis clubs in Madrid, Spain`}
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
                          alt={`${related.title} - Related article about cannabis clubs in Madrid`}
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
