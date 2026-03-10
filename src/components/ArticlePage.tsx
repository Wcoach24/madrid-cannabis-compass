import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Leaf,
  Calendar,
  Clock,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ArticleSection {
  id: string;
  heading: string;
  content: string;
}

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export interface ArticleProps {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  modifiedDate: string;
  readingTime: number;
  heroImage?: string;
  sections: ArticleSection[];
  faqs?: ArticleFAQ[];
  tags?: string[];
  relatedArticles?: {
    slug: string;
    title: string;
    description: string;
  }[];
  titleEs?: string;
  descriptionEs?: string;
  sectionsEs?: ArticleSection[];
  faqsEs?: ArticleFAQ[];
}

const ArticlePage = (props: ArticleProps) => {
  const { language } = useLanguage();
  const [tocOpen, setTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Select content based on language
  const title = language === "es" ? props.titleEs || props.title : props.title;
  const description =
    language === "es"
      ? props.descriptionEs || props.description
      : props.description;
  const sections =
    language === "es" ? props.sectionsEs || props.sections : props.sections;
  const faqs = language === "es" ? props.faqsEs || props.faqs : props.faqs;

  // Canonical URL and language-aware paths
  const baseUrl = "https://www.weedmadrid.com";
  const currentPath = buildLanguageAwarePath(`/blog/${props.slug}`, language);
  const canonicalUrl = `${baseUrl}${currentPath}`;

  // Hreflang links
  const enPath = buildLanguageAwarePath(`/blog/${props.slug}`, "en");
  const esPath = buildLanguageAwarePath(`/blog/${props.slug}`, "es");
  const hreflangLinks = [
    { lang: "en", href: `${baseUrl}${enPath}` },
    { lang: "es", href: `${baseUrl}${esPath}` },
    { lang: "x-default", href: `${baseUrl}${enPath}` },
  ];

  // Format dates
  const pubDate = new Date(props.publishDate);
  const modDate = new Date(props.modifiedDate);
  const pubDateStr = pubDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const modDateStr = modDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Structured data: BlogPosting
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: props.heroImage || `${baseUrl}/og-image.jpg`,
    datePublished: props.publishDate,
    dateModified: props.modifiedDate,
    author: {
      "@type": "Person",
      name: "WeedMadrid Editorial Team",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Weed Madrid",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
  };

  // Structured data: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  // Structured data: FAQPage
  let faqSchema = null;
  if (faqs && faqs.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  const structuredData = [blogPostingSchema, breadcrumbSchema];
  if (faqSchema) {
    structuredData.push(faqSchema);
  }

  // Track active section for TOC highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((section) =>
        document.getElementById(section.id)
      );
      const scrollPosition = window.scrollY + 100;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Scroll to section handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setTocOpen(false);
    }
  };

  return (
    <>
      <SEOHead
        title={`${title} | Weed Madrid`}
        description={description}
        canonical={canonicalUrl}
        ogImage={props.heroImage}
        keywords={props.tags?.join(", ")}
        structuredData={structuredData}
        hreflangLinks={hreflangLinks}
        htmlLang={language}
        citationTitle={title}
        citationAuthor="WeedMadrid Editorial Team"
        citationDate={props.publishDate}
        aiPriority="high"
        contentSummary={description}
        speakableSelectors={[".article-headline", ".article-description"]}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="bg-card/50 border-b border-border/50 sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                to={buildLanguageAwarePath("/", language)}
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                to={buildLanguageAwarePath("/blog", language)}
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{title}</span>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-8">
              {/* Hero Image */}
              {props.heroImage && (
                <div className="mb-8 -mx-4 md:mx-0 md:rounded-lg overflow-hidden">
                  <img
                    src={props.heroImage}
                    alt={title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-10">
                <h1 className="article-headline text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">
                  {title}
                </h1>

                <p className="article-description text-lg text-muted-foreground mb-6">
                  {description}
                </p>

                {/* Author Box */}
                <div className="bg-card border border-border/50 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Leaf className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        WeedMadrid Editorial Team
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Local cannabis culture experts based in Madrid
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{pubDateStr}</span>
                  </div>
                  <div>
                    <span className="text-xs">
                      Updated: {modDateStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{props.readingTime} min read</span>
                  </div>
                </div>

                {/* Tags */}
                {props.tags && props.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {props.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* Article Sections */}
              <div className="prose prose-invert max-w-none">
                {sections.map((section, idx) => (
                  <section key={section.id} className="mb-10">
                    <h2
                      id={section.id}
                      className="text-3xl font-display font-bold text-foreground mb-4 scroll-mt-24"
                    >
                      {section.heading}
                    </h2>
                    <div
                      className="text-lg leading-relaxed text-foreground/90"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                    {idx < sections.length - 1 && (
                      <hr className="my-8 border-border/50" />
                    )}
                  </section>
                ))}
              </div>

              {/* FAQ Section */}
              {faqs && faqs.length > 0 && (
                <section className="mt-12 pt-8 border-t border-border/50">
                  <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                      <details
                        key={idx}
                        className="bg-card border border-border/50 rounded-lg overflow-hidden group"
                      >
                        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <h3 className="text-lg font-semibold text-foreground">
                            {faq.question}
                          </h3>
                          <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-6 py-4 bg-muted/20 border-t border-border/50">
                          <p className="text-foreground/80 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA Block */}
              <section className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                  Ready to Visit a Cannabis Club in Madrid?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get started with an invitation request to one of Madrid's
                  premier cannabis social clubs.
                </p>
                <Link
                  to={buildLanguageAwarePath(
                    "/invite/vallehermoso-club-social-madrid",
                    language
                  )}
                >
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                    Request Invitation
                  </Button>
                </Link>
              </section>

              {/* Related Articles */}
              {props.relatedArticles && props.relatedArticles.length > 0 && (
                <section className="mt-12 pt-8 border-t border-border/50">
                  <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                    Related Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {props.relatedArticles.map((article) => (
                      <Link
                        key={article.slug}
                        to={buildLanguageAwarePath(
                          `/blog/${article.slug}`,
                          language
                        )}
                      >
                        <div className="bg-card border border-border/50 rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all h-full">
                          <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-3">
                            {article.description}
                          </p>
                          <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                            Read More
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar - Table of Contents */}
            <aside className="lg:col-span-4">
              {/* Mobile TOC Toggle */}
              <div className="lg:hidden mb-6">
                <Button
                  onClick={() => setTocOpen(!tocOpen)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>Table of Contents</span>
                  {tocOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* TOC Content */}
              {(tocOpen || true) && (
                <div className="hidden lg:block sticky top-24 bg-card border border-border/50 rounded-lg p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`block text-left text-sm py-2 px-3 rounded transition-all w-full ${
                          activeSection === section.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {section.heading}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Mobile TOC Collapsible */}
              {tocOpen && (
                <div className="lg:hidden mb-6 bg-card border border-border/50 rounded-lg p-6">
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`block text-left text-sm py-2 px-3 rounded transition-all w-full ${
                          activeSection === section.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {section.heading}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default ArticlePage;
