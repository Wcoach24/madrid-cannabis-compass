import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import QuickClubFinder from "@/components/QuickClubFinder";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const Clubs = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [districtFilter, setDistrictFilter] = useState(searchParams.get("district") || "all");
  const [touristFilter, setTouristFilter] = useState(searchParams.get("tourist") || "all");

  useEffect(() => {
    fetchClubs();
  }, [districtFilter, touristFilter]);

  const fetchClubs = async () => {
    setLoading(true);
    
    let query = supabase
      .from("clubs")
      .select("id, slug, name, summary, district, rating_editorial, is_tourist_friendly, is_verified, languages, main_image_url, timetable, description, is_featured")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("rating_editorial", { ascending: false, nullsFirst: false });

    if (districtFilter !== "all") {
      query = query.eq("district", districtFilter);
    }

    if (touristFilter === "true") {
      query = query.eq("is_tourist_friendly", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching clubs:", error);
      setLoading(false);
      return;
    }

    if (data) {
      let filtered = data;
      
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = data.filter(club => 
          club.name.toLowerCase().includes(lowerQuery) ||
          club.description.toLowerCase().includes(lowerQuery) ||
          club.district.toLowerCase().includes(lowerQuery)
        );
      }
      
      setClubs(filtered);
    }
    
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClubs();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDistrictFilter("all");
    setTouristFilter("all");
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/clubs");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Clubs", url: `${BASE_URL}/clubs` }
  ]);

  // ItemList schema for the clubs directory
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cannabis Clubs in Madrid",
    "description": "Comprehensive directory of verified cannabis social clubs in Madrid, Spain",
    "numberOfItems": clubs.length,
    "itemListElement": clubs.map((club, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "@id": `${BASE_URL}/club/${club.slug}`,
        "name": club.name,
        "url": `${BASE_URL}/club/${club.slug}`,
        "description": club.summary || club.description?.substring(0, 150),
        "image": club.main_image_url,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": club.district,
          "addressRegion": "Madrid",
          "addressCountry": "ES"
        },
        ...(club.rating_editorial ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": club.rating_editorial,
            "bestRating": "5",
            "ratingCount": "1"
          }
        } : {}),
        ...(club.is_verified ? { "badge": "Verified Club" } : {}),
        ...(club.is_tourist_friendly ? { "touristType": "International Tourists" } : {})
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("clubs.title") + " | Madrid Cannabis Clubs"}
        description={t("clubs.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/clubs", language)}`}
        keywords="cannabis clubs madrid, weed clubs madrid directory, verified cannabis clubs, madrid districts cannabis"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={[breadcrumbSchema, itemListSchema]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("clubs.title")}
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              {t("clubs.subtitle")}
            </p>
          </div>
        </section>

        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            {/* Quick Club Finder */}
            <Card className="mb-8 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <QuickClubFinder />
            </Card>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={t("clubs.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("clubs.filter.district")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("clubs.filter.district.all")}</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Chamberí">Chamberí</SelectItem>
                  <SelectItem value="Retiro">Retiro</SelectItem>
                  <SelectItem value="Salamanca">Salamanca</SelectItem>
                  <SelectItem value="Chamartín">Chamartín</SelectItem>
                  <SelectItem value="Tetuán">Tetuán</SelectItem>
                  <SelectItem value="Arganzuela">Arganzuela</SelectItem>
                  <SelectItem value="Moncloa-Aravaca">Moncloa-Aravaca</SelectItem>
                </SelectContent>
              </Select>

              <Select value={touristFilter} onValueChange={setTouristFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("clubs.filter.tourist")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("clubs.filter.tourist.all")}</SelectItem>
                  <SelectItem value="true">{t("clubs.filter.tourist.yes")}</SelectItem>
                  <SelectItem value="false">{t("clubs.filter.tourist.no")}</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                {t("clubs.search.button")}
              </Button>
            </form>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-center py-12 text-muted-foreground">{t("clubs.loading")}</p>
            ) : clubs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl font-medium mb-2">{t("clubs.nofound")}</p>
                <p className="text-muted-foreground mb-6">{t("clubs.nofound.desc")}</p>
                <Button variant="outline" onClick={clearFilters}>
                  {t("clubs.filter.clear")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clubs.map((club) => (
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
                    timetable={club.timetable as any}
                  />
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

export default Clubs;
