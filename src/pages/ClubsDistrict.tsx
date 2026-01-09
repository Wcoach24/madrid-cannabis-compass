import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { slugifyDistrict, needsSlugNormalization } from "@/lib/slugify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ClubCard from "@/components/ClubCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Navigation, Info } from "lucide-react";

// Complete district config for all 12 districts
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
    description: "Find cannabis clubs near Retiro Park and Salamanca district. Premium clubs in Madrid's most elegant neighborhood with peaceful atmosphere.",
    landmarks: "Retiro Park, Puerta de Alcalá, Calle Serrano, Goya Metro",
    metaKeywords: "cannabis club retiro, weed near retiro park, cannabis salamanca madrid"
  },
  tetuan: {
    name: "Tetuán",
    seoTitle: "Cannabis Clubs in Tetuán Madrid 2025 | Traditional Neighborhood",
    description: "Discover authentic cannabis clubs in Tetuán, a traditional Madrid neighborhood near Plaza Castilla. Local atmosphere with genuine Spanish character.",
    landmarks: "Plaza Castilla, Cuatro Caminos, Bravo Murillo, Paseo de la Castellana",
    metaKeywords: "cannabis club tetuan, weed club cuatro caminos, tetuan madrid cannabis"
  },
  usera: {
    name: "Usera",
    seoTitle: "Cannabis Clubs in Usera Madrid 2025 | Multicultural District",
    description: "Find cannabis clubs in Usera, Madrid's diverse multicultural district. Community-focused clubs with international atmosphere and authentic local vibe.",
    landmarks: "Plaza de Usera, Marcelo Usera, Oporto Metro, Chinatown",
    metaKeywords: "cannabis club usera, weed club south madrid, usera cannabis association"
  },
  atocha: {
    name: "Atocha",
    seoTitle: "Cannabis Clubs Near Atocha Station Madrid 2025 | Central Location",
    description: "Cannabis clubs near Atocha train station in central Madrid. Convenient for travelers with easy access to clubs. Tourist-friendly with verified associations.",
    landmarks: "Atocha Station, Reina Sofía Museum, Paseo del Prado, Lavapiés",
    metaKeywords: "cannabis club atocha, weed near atocha station, atocha madrid cannabis"
  },
  "moncloa-aravaca": {
    name: "Moncloa-Aravaca",
    seoTitle: "Cannabis Clubs in Moncloa-Aravaca Madrid 2025 | University District",
    description: "Find cannabis clubs in Moncloa-Aravaca, Madrid's university district. Young atmosphere near Ciudad Universitaria with student-friendly cannabis associations.",
    landmarks: "Ciudad Universitaria, Faro de Moncloa, Parque del Oeste, Argüelles",
    metaKeywords: "cannabis club moncloa, weed club university madrid, moncloa cannabis association"
  },
  arganzuela: {
    name: "Arganzuela",
    seoTitle: "Cannabis Clubs in Arganzuela Madrid 2025 | Madrid Río Area",
    description: "Discover cannabis clubs in Arganzuela near Madrid Río and Matadero cultural center. Modern neighborhood with creative atmosphere and riverside location.",
    landmarks: "Madrid Río, Matadero, Paseo de la Chopera, Legazpi",
    metaKeywords: "cannabis club arganzuela, weed club madrid rio, arganzuela cannabis madrid"
  },
  "fuencarral-el-pardo": {
    name: "Fuencarral-El Pardo",
    seoTitle: "Cannabis Clubs in Fuencarral Madrid 2025 | Northern District",
    description: "Find cannabis clubs in Fuencarral-El Pardo in northern Madrid. Residential area with local neighborhood clubs and authentic Spanish atmosphere.",
    landmarks: "Montecarmelo, Las Tablas, El Pardo, Tres Olivos",
    metaKeywords: "cannabis club fuencarral, weed club north madrid, fuencarral cannabis association"
  },
  salamanca: {
    name: "Salamanca",
    seoTitle: "Cannabis Clubs in Salamanca Madrid 2025 | Luxury District",
    description: "Premium cannabis clubs in Salamanca, Madrid's most exclusive neighborhood. High-end associations near Serrano street with sophisticated atmosphere.",
    landmarks: "Calle Serrano, Calle Goya, Velázquez, Príncipe de Vergara",
    metaKeywords: "cannabis club salamanca, weed club luxury madrid, salamanca cannabis premium"
  },
  chamartin: {
    name: "Chamartín",
    seoTitle: "Cannabis Clubs in Chamartín Madrid 2025 | Business District",
    description: "Find cannabis clubs in Chamartín, Madrid's business district near Santiago Bernabéu. Professional atmosphere with premium cannabis associations.",
    landmarks: "Santiago Bernabéu, AZCA, Paseo de la Castellana, Chamartín Station",
    metaKeywords: "cannabis club chamartin, weed club bernabeu, chamartin cannabis madrid"
  }
};

const ClubsDistrict = () => {
  const { district } = useParams<{ district: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  // Normalize slug if it has accents or special characters
  useEffect(() => {
    if (district && needsSlugNormalization(district)) {
      const normalized = slugifyDistrict(district);
      const newPath = buildLanguageAwarePath(`/clubs/${normalized}`, language);
      navigate(newPath, { replace: true });
    }
  }, [district, language, navigate]);

  const districtKey = district?.toLowerCase() || '';
  const districtConfig = DISTRICT_CONFIG[districtKey];

  // Fetch clubs in this district - match by slugified district name
  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs", district],
    queryFn: async () => {
      if (!district) return [];
      
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("rating_editorial", { ascending: false });

      if (error) throw error;
      
      // Filter by slugified district name to handle accents properly
      return (data || []).filter(club => 
        slugifyDistrict(club.district) === districtKey
      );
    },
    enabled: !!district
  });

  // Get display name - use config or capitalize slug
  const districtDisplayName = districtConfig?.name || 
    districtKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // SEO values with fallbacks
  const seoTitle = districtConfig?.seoTitle || 
    `Cannabis Clubs in ${districtDisplayName} Madrid 2025 | Weed Madrid`;
  const seoDescription = districtConfig?.description || 
    `Find verified cannabis clubs in ${districtDisplayName}, Madrid. Browse local cannabis social clubs and request membership invitations. Tourist-friendly options available.`;
  const metaKeywords = districtConfig?.metaKeywords || 
    `cannabis club ${districtKey}, weed ${districtKey} madrid, ${districtKey} cannabis association`;
  const landmarks = districtConfig?.landmarks || districtDisplayName;

  const canonicalPath = `${BASE_URL}${buildLanguageAwarePath(`/clubs/${district}`, language)}`;
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
        "name": `${districtDisplayName} District`,
        "item": canonicalPath
      }
    ]
  };

  // Always render SEOHead to ensure prerender succeeds
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalPath}
        keywords={metaKeywords}
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
                  Cannabis Clubs in {districtDisplayName}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-4">
                {seoDescription}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span>Near: {landmarks}</span>
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
                    <p className="font-semibold mb-2">About {districtDisplayName} Cannabis Clubs</p>
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
                    {clubs.length} {clubs.length === 1 ? 'Club' : 'Clubs'} in {districtDisplayName}
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
                  <p className="text-xl font-medium mb-2">No clubs found in {districtDisplayName}</p>
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
                Request your invitation to cannabis clubs in {districtDisplayName}. Fast approval, same-day access.
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