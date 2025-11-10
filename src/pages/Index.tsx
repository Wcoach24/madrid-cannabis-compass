import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Scale, Heart, MapPin, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import heroImage from "@/assets/hero-main.jpg";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  const [featuredClubs, setFeaturedClubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeaturedClubs();
  }, []);

  const fetchFeaturedClubs = async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("rating_editorial", { ascending: false })
      .limit(3);

    if (data) {
      setFeaturedClubs(data);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to clubs page with search query
    window.location.href = `/clubs?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Madrid Cannabis Clubs Guide | Independent Cultural & Legal Information"
        description="Comprehensive guide to cannabis social clubs in Madrid. Independent reviews, legal information, and cultural insights about private cannabis associations in Spain."
        canonical="https://lovable.dev/"
        keywords="cannabis club madrid, weed club madrid, cannabis social club, madrid cannabis, join cannabis club madrid, best cannabis clubs madrid"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Madrid Cannabis Clubs Guide",
          "description": "Independent cultural and legal guide to cannabis social clubs in Madrid",
          "url": "https://lovable.dev"
        }}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Cannabis social club interior" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-forest-light/90 to-primary/95"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Madrid Cannabis Clubs Guide
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
                Independent cultural and legal guide to cannabis social clubs in Madrid
              </p>
              
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search clubs by name, district, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background/95 backdrop-blur h-12 text-base"
                  />
                  <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-background/10 backdrop-blur px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4" />
                  <span>15+ Verified Clubs</span>
                </div>
                <div className="flex items-center gap-2 bg-background/10 backdrop-blur px-4 py-2 rounded-full">
                  <Scale className="w-4 h-4" />
                  <span>Legal Information</span>
                </div>
                <div className="flex items-center gap-2 bg-background/10 backdrop-blur px-4 py-2 rounded-full">
                  <Heart className="w-4 h-4" />
                  <span>Independent Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Clubs */}
        {featuredClubs.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Featured Clubs
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Verified cannabis social clubs with excellent ratings and member experiences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {featuredClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    slug={club.slug}
                    name={club.name}
                    summary={club.summary}
                    district={club.district}
                    rating_editorial={club.rating_editorial}
                    is_tourist_friendly={club.is_tourist_friendly}
                    is_verified={club.is_verified}
                    languages={club.languages}
                    main_image_url={club.main_image_url}
                  />
                ))}
              </div>

              <div className="text-center">
                <Button asChild size="lg" variant="outline">
                  <Link to="/clubs">
                    View All Clubs
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Cannabis Clubs Work
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Understanding the private association model in Spain
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Private Association</h3>
                  <p className="text-muted-foreground">
                    Cannabis clubs are private non-profit cultural associations, not commercial businesses
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Membership Required</h3>
                  <p className="text-muted-foreground">
                    You must be invited and become a member to access the club and its facilities
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Responsible Use</h3>
                  <p className="text-muted-foreground">
                    Clubs promote responsible consumption in a safe, controlled environment
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" variant="default">
                <Link to="/guides">
                  Read Full Guide
                  <BookOpen className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Essential Guides */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Essential Guides
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to know about cannabis culture and legality in Madrid
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Link to="/guides/best-cannabis-clubs-madrid">
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6">
                    <BookOpen className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Best Cannabis Clubs in Madrid</h3>
                    <p className="text-muted-foreground text-sm">
                      Comprehensive guide to the top-rated cannabis social clubs in Madrid
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/guides/how-to-join">
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6">
                    <Heart className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-xl font-semibold mb-2">How to Join a Cannabis Club</h3>
                    <p className="text-muted-foreground text-sm">
                      Step-by-step guide to becoming a member of a cannabis social club
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/guides/legal-status">
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6">
                    <Scale className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Legal Status in Spain</h3>
                    <p className="text-muted-foreground text-sm">
                      Understanding the legal framework for cannabis in Madrid and Spain
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
