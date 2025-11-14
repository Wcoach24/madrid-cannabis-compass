import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const GuideDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

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
      .neq("id", currentId)
      .limit(3);

    if (data) setRelatedArticles(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
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
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <Link to="/guides" className="text-primary hover:underline">
            ← Back to Guides
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://lovable.dev/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Guides",
        "item": "https://lovable.dev/guides"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://lovable.dev/guide/${article.slug}`
      }
    ]
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.seo_description,
    image: article.cover_image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author_name,
      description: article.author_bio
    },
    publisher: {
      "@type": "Organization",
      name: "Madrid Cannabis Clubs Guide",
      logo: {
        "@type": "ImageObject",
        url: "https://lovable.dev/logo.png"
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://lovable.dev/guide/${article.slug}`
    },
    articleSection: article.category,
    keywords: article.tags?.join(", ")
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonical={article.canonical_url}
        ogImage={article.cover_image_url}
        structuredData={[breadcrumbSchema, blogPostingSchema]}
      />
      <Header />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/guides">Guides</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{article.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link 
            to="/guides" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guides
          </Link>

          {article.is_featured && (
            <Badge className="mb-4 bg-gold">Featured Guide</Badge>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          
          {article.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">{article.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            {article.author_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author_name}</span>
              </div>
            )}
            {article.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Published {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            {article.updated_at && article.updated_at !== article.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(article.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            <Badge variant="secondary">{article.category}</Badge>
          </div>

          {article.cover_image_url && (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-auto rounded-lg mb-8"
              loading="eager"
            />
          )}

          <div className="prose prose-lg max-w-none mb-12">
            <ReactMarkdown>{article.body_markdown}</ReactMarkdown>
          </div>

          {article.author_bio && (
            <div className="bg-muted p-6 rounded-lg mb-12">
              <h3 className="font-bold text-lg mb-2">About the Author</h3>
              <p className="text-sm"><strong>{article.author_name}</strong></p>
              <p className="text-sm text-muted-foreground mt-2">{article.author_bio}</p>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/guide/${related.slug}`}
                    className="group"
                  >
                    {related.cover_image_url && (
                      <img
                        src={related.cover_image_url}
                        alt={related.title}
                        className="w-full h-40 object-cover rounded-lg mb-3 group-hover:opacity-80 transition"
                        loading="lazy"
                      />
                    )}
                    <h3 className="font-semibold group-hover:text-primary transition">
                      {related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-xl font-bold mb-2">Looking for a Responsible Cannabis Club?</h3>
            <p className="text-muted-foreground mb-4">
              Explore verified cannabis social clubs in Madrid with our comprehensive directory.
            </p>
            <Link
              to="/clubs"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Browse Clubs
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default GuideDetail;
