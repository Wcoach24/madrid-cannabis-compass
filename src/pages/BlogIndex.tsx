import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { ARTICLES } from "@/data/articles";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { Calendar, Clock } from "lucide-react";

const Header = lazy(() => import("@/components/Header"));
const Footer = lazy(() => import("@/components/Footer"));

const BlogIndex = () => {
  const { language, t } = useLanguage();
  const articleSlugs = Object.keys(ARTICLES);
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/blog");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Cannabis Blog Madrid | Guides, Laws & Club Reviews (2026)"
        description="Read our latest articles about cannabis social clubs in Madrid. Laws, guides, reviews, and everything you need to know about legal cannabis in Spain."
        canonical={`${BASE_URL}/blog`}
        hreflangLinks={hreflangLinks}
      />
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient-logo">
              Cannabis Blog Madrid
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              {language === "es"
                ? "Guías, leyes, reseñas y todo sobre los clubs de cannabis en Madrid."
                : "Guides, laws, reviews and everything about cannabis social clubs in Madrid."}
            </p>

            <div className="grid gap-6">
              {articleSlugs.map((slug) => {
                const article = ARTICLES[slug];
                const title = language === "es" && article.titleEs ? article.titleEs : article.title;
                const desc = language === "es" && article.descriptionEs ? article.descriptionEs : article.description;

                return (
                  <Link
                    key={slug}
                    to={buildLanguageAwarePath(`/blog/${slug}`, language)}
                    className="group block p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all"
                  >
                    <h2 className="font-display text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {title}
                    </h2>
                    {desc && (
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {desc}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                      {article.publishDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(article.publishDate).toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {article.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {article.readingTime} min read
                        </span>
                      )}
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 border border-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default BlogIndex;
