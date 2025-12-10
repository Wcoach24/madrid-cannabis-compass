import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ClubCard from "@/components/ClubCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Navigation, Info } from "lucide-react";

const DISTRICT_CONFIG: Record<string, { 
  name: string; 
  seoTitle: string; 
  description: string;
  landmarks: string;
  metaKeywords: string;
}> = {
  centro: {
    name: "Centro",
    seoTitle: "Cannabis Clubs Near Puerta del Sol Madrid 2025 | Centro District",
    description: "Find cannabis clubs in Centro Madrid near Puerta del Sol, Gran Vía, and Plaza Mayor. Tourist-friendly clubs with same-day access. Legal and verified.",
    landmarks: "Puerta del Sol, Gran Vía, Plaza Mayor, Calle Preciados",
    metaKeywords: "cannabis club puerta del sol, weed near gran via, centro madrid cannabis, cannabis club sol"
  },
  chamberi: {
    name: "Chamberí",
    seoTitle: "Cannabis Clubs Near Chamberí Madrid 2025 | Bravo Murillo Area",
    description: "Find cannabis clubs in Chamberí district near Plaza de Chamberí and Bravo Murillo. Local neighborhood clubs with authentic Madrid atmosphere.",
    landmarks: "Plaza de Chamberí, Bravo Murillo, Calle Ponzano, Ríos Rosas Metro",
    metaKeywords: "cannabis club chamberi, weed club bravo murillo, chamberi cannabis madrid"
  },
  malasana: {
    name: "Malasaña",
    seoTitle: "Cannabis Clubs Near Malasaña Madrid 2025 | Trendy Neighborhood",
    description: "Find cannabis clubs in Malasaña Madrid's hipster district. Near Plaza Dos de Mayo and Tribunal Metro. Vibrant nightlife and artistic atmosphere.",
    landmarks: "Plaza Dos de Mayo, Tribunal Metro, Calle Fuencarral, San Bernardo",
    metaKeywords: "cannabis club malasana, weed malasana madrid, cannabis hipster madrid"
  },
  retiro: {
    name: "Retiro",
    seoTitle: "Cannabis Clubs Near Retiro Park Madrid 2025 | Upscale District",
    description: "Find cannabis clubs near Retiro Park and Salamanca district. Premium clubs in Madrid's most elegant neighborhood.",
    landmarks: "Retiro Park, Puerta de Alcalá, Calle Serrano, Goya Metro",
    metaKeywords: "cannabis club retiro, weed near retiro park, cannabis salamanca madrid"
  }
};

const ClubsDistrict = () => {
  const { district } = useParams<{ district: string }>();
  const { t, language } = useLanguage();

  const districtConfig = district ? DISTRICT_CONFIG[district.toLowerCase()] : null;

  // Fetch clubs in this district
  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs", district],
    queryFn: async () => {
      if (!districtConfig) return [];
      
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("status", "active")
        .ilike("district", districtConfig.name)
        .order("is_featured", { ascending: false })
        .order("rating_editorial", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!districtConfig
  });

  if (!district || !districtConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>District not found</p>
      </div>
    );
  }

  const hreflangLinks = generateHreflangLinks(BASE_URL, `/clubs/${district}`);

  // LocalBusiness schema for each club
  const localBusinessSchemas = clubs?.map(club => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": club.name,
    "description": club.summary || club.description,
    "url": `${BASE_URL}/club/${club.slug}`,
    "image": club.main_image_url,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": club.address,
      "addressLocality": club.district,
      "addressRegion": "Madrid",
      "postalCode": club.postal_code,
      "addressCountry": "ES"
    },
    "geo": club.latitude && club.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": club.latitude,
      "longitude": club.longitude
    } : undefined,
    "aggregateRating": club.rating_editorial ? {
      "@type": "AggregateRating",
      "ratingValue": club.rating_editorial,
      "bestRating": "5",
      "ratingCount": "1"
    } : undefined,
    "priceRange": "€€"
  })) || [];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Clubs",
        "item": `${BASE_URL}/clubs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${districtConfig.name} District`,
        "item": `${BASE_URL}/clubs/${district}`
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={districtConfig.seoTitle}
        description={districtConfig.description}
        canonical={`${BASE_URL}${buildLanguageAwarePath(`/clubs/${district}`, language)}`}
        keywords={districtConfig.metaKeywords}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={[breadcrumbSchema, ...localBusinessSchemas]}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <Link to={buildLanguageAwarePath("/clubs/near-me", language)}>
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to District Guide
              </Button>
            </Link>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Cannabis Clubs in {districtConfig.name}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-4">
                {districtConfig.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span>Near: {districtConfig.landmarks}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info Box */}
        <section className="py-8 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">About {districtConfig.name} Cannabis Clubs</p>
                    <p className="text-sm text-muted-foreground">
                      {clubs && clubs.length > 0 
                        ? `${clubs.length} verified ${clubs.length === 1 ? 'club' : 'clubs'} in this district. All clubs require membership invitation. Tourist-friendly options available.`
                        : "This district currently has no active club listings. Check nearby districts or browse all clubs."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clubs Listing */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : clubs && clubs.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold mb-6">
                    {clubs.length} {clubs.length === 1 ? 'Club' : 'Clubs'} in {districtConfig.name}
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {clubs.map((club) => (
                      <ClubCard
                        key={club.id}
                        slug={club.slug}
                        name={club.name}
                        summary={club.summary || undefined}
                        district={club.district}
                        rating_editorial={club.rating_editorial || undefined}
                        is_tourist_friendly={club.is_tourist_friendly || false}
                        is_verified={club.is_verified || false}
                        languages={club.languages || undefined}
                        main_image_url={club.main_image_url || undefined}
                        timetable={club.timetable as any}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl font-medium mb-2">No clubs found in {districtConfig.name}</p>
                  <p className="text-muted-foreground mb-6">
                    Try browsing clubs in other districts or view all available clubs.
                  </p>
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    <Button>Browse All Clubs</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Visit?</h2>
              <p className="text-muted-foreground mb-8">
                Request your invitation to cannabis clubs in {districtConfig.name}. Fast approval, same-day access.
              </p>
              <Link to={buildLanguageAwarePath("/how-it-works", language)}>
                <Button size="lg">Get Your Invitation</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClubsDistrict;
