import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { BookOpen, Calendar, User } from "lucide-react";

const Guides = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("language", "en")
      .order("published_at", { ascending: false });

    if (data) {
      setArticles(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Cannabis Culture Guides | Madrid Cannabis Clubs"
        description="In-depth articles and guides about cannabis social clubs in Madrid, Spanish cannabis law, membership requirements, and responsible use."
        canonical="https://lovable.dev/guides"
        keywords="cannabis guides madrid, cannabis social club guide, cannabis law spain, how to join cannabis club, cannabis tourism madrid"
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Cannabis Culture Guides
              </h1>
              <p className="text-xl text-primary-foreground/90">
                In-depth articles about cannabis social clubs, Spanish law, and responsible use
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading guides...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 max-w-2xl mx-auto">
                <p className="text-muted-foreground text-lg mb-4">
                  Comprehensive guides coming soon. Check back for articles about:
                </p>
                <ul className="text-left text-muted-foreground space-y-2 mb-8">
                  <li>• Best Cannabis Clubs in Madrid 2025</li>
                  <li>• How to Join a Cannabis Social Club</li>
                  <li>• Legal Status of Cannabis in Spain and Madrid</li>
                  <li>• Responsible Cannabis Use Guide</li>
                  <li>• Cannabis Tourism in Madrid</li>
                </ul>
                <Link
                  to="/clubs"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Browse Clubs Instead
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {articles.map((article) => (
                  <Link key={article.id} to={`/guide/${article.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                      {article.cover_image_url && (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          {article.is_featured && (
                            <Badge className="text-xs bg-gold text-accent-foreground">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {article.author_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {article.author_name}
                            </div>
                          )}
                          {article.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.published_at).toLocaleDateString()}
                            </div>
                          )}
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
