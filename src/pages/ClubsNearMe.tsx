import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Star, CheckCircle } from "lucide-react";

const DISTRICTS = [
  {
    slug: "centro",
    name: "Centro",
    description: "Near Puerta del Sol, Gran Vía, and Plaza Mayor",
    clubCount: 3,
    keywords: "puerta del sol, gran via, centro madrid"
  },
  {
    slug: "chamberi",
    name: "Chamberí",
    description: "Near Plaza de Chamberí and Bravo Murillo",
    clubCount: 2,
    keywords: "chamberi, bravo murillo"
  },
  {
    slug: "malasana",
    name: "Malasaña",
    description: "Trendy neighborhood with vibrant nightlife",
    clubCount: 2,
    keywords: "malasana, hipster madrid, plaza dos de mayo"
  },
  {
    slug: "retiro",
    name: "Retiro",
    description: "Near Retiro Park and upscale shopping",
    clubCount: 1,
    keywords: "retiro park, retiro madrid"
  },
  {
    slug: "all",
    name: "All Districts",
    description: "Browse all cannabis clubs in Madrid",
    clubCount: 9,
    keywords: "all cannabis clubs madrid"
  }
];

const ClubsNearMe = () => {
  const { t, language } = useLanguage();
  const hreflangLinks = generateHreflangLinks(BASE_URL, "/clubs/near-me");

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cannabis Clubs Near Me in Madrid",
    "description": "Find cannabis clubs near your location in Madrid. Organized by district for easy navigation.",
    "numberOfItems": DISTRICTS.length,
    "itemListElement": DISTRICTS.map((district, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Place",
        "name": `Cannabis Clubs in ${district.name}`,
        "description": district.description,
        "url": `${BASE_URL}${buildLanguageAwarePath(`/clubs/${district.slug}`, language)}`
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Cannabis Clubs Near Me Madrid 2025 | Find Clubs By Location"
        description="Find cannabis clubs near you in Madrid. Search by district: Centro, Chamberí, Malasaña, Retiro. Interactive map and verified club listings."
        canonical={`${BASE_URL}${buildLanguageAwarePath("/clubs/near-me", language)}`}
        keywords="cannabis club near me madrid, weed club near me, cannabis clubs by district madrid, find cannabis club madrid"
        hreflangLinks={hreflangLinks}
        structuredData={[schemaData]}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Navigation className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Cannabis Clubs Near Me Madrid
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Find verified cannabis clubs by district. Legal, safe, and tourist-friendly access.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Answer Box (GEO Optimization) */}
        <section className="py-8 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
                <h2 className="text-lg font-semibold mb-3">🔍 Quick Answer</h2>
                <p className="text-muted-foreground mb-4">
                  There are <strong>9+ verified cannabis clubs</strong> across Madrid's main districts. 
                  Centro (Puerta del Sol area) has the highest concentration with 3 clubs. 
                  Chamberí and Malasaña each have 2 clubs. All clubs require membership invitation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Tourist Friendly
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Same-Day Access
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    100% Legal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Districts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-2 text-center">Find Clubs By District</h2>
              <p className="text-muted-foreground text-center mb-12">
                Choose your location to see nearby cannabis clubs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {DISTRICTS.map((district) => (
                  <Link 
                    key={district.slug}
                    to={buildLanguageAwarePath(
                      district.slug === "all" ? "/clubs" : `/clubs/${district.slug}`, 
                      language
                    )}
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <MapPin className="h-8 w-8 text-primary" />
                          <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {district.clubCount} {district.clubCount === 1 ? "Club" : "Clubs"}
                          </span>
                        </div>
                        <CardTitle className="text-2xl">{district.name}</CardTitle>
                        <CardDescription className="text-base">
                          {district.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          View Clubs →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section (GEO Optimization) */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-background rounded-lg p-6 border">
                  <h3 className="font-semibold mb-2">Which district has the most cannabis clubs?</h3>
                  <p className="text-muted-foreground">
                    Centro district (near Puerta del Sol and Gran Vía) has the highest concentration with 3 verified clubs. 
                    It's also the most accessible for tourists staying in central Madrid.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-6 border">
                  <h3 className="font-semibold mb-2">Can tourists visit cannabis clubs in Madrid?</h3>
                  <p className="text-muted-foreground">
                    Yes. All clubs listed accept international visitors with valid passport or EU ID. 
                    You need to request an invitation 24-48 hours in advance.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-6 border">
                  <h3 className="font-semibold mb-2">How do I find the closest club to my hotel?</h3>
                  <p className="text-muted-foreground">
                    Use our district guide above to identify your area. Centro covers most central hotels. 
                    Each district page shows exact club locations and metro stations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Ready to Visit?</h2>
              <p className="text-muted-foreground mb-8">
                Request your invitation to any Madrid cannabis club. Fast approval, same-day access available.
              </p>
              <Link to={buildLanguageAwarePath("/how-it-works", language)}>
                <Button size="lg" className="mr-4">Get Your Invitation</Button>
              </Link>
              <Link to={buildLanguageAwarePath("/clubs", language)}>
                <Button size="lg" variant="outline">Browse All Clubs</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClubsNearMe;
