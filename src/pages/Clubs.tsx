import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import SEOHead from "@/components/SEOHead";

const Clubs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
      .select("*")
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

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Cannabis Clubs Directory Madrid | Verified Social Clubs"
        description="Browse verified cannabis social clubs in Madrid. Filter by district, tourist-friendly options, and ratings. Independent reviews and detailed information."
        canonical="https://lovable.dev/clubs"
        keywords="cannabis clubs madrid, weed clubs madrid directory, verified cannabis clubs, madrid districts cannabis"
      />
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="py-12 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Cannabis Clubs in Madrid
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              Browse verified cannabis social clubs across Madrid districts
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search clubs by name, district, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="Chamberí">Chamberí</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Retiro">Retiro</SelectItem>
                  <SelectItem value="Salamanca">Salamanca</SelectItem>
                  <SelectItem value="Malasaña">Malasaña</SelectItem>
                  <SelectItem value="Lavapiés">Lavapiés</SelectItem>
                </SelectContent>
              </Select>

              <Select value={touristFilter} onValueChange={setTouristFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tourist Friendly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clubs</SelectItem>
                  <SelectItem value="true">Tourist Friendly</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading clubs...</p>
              </div>
            ) : clubs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No clubs found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setDistrictFilter("all");
                  setTouristFilter("all");
                  fetchClubs();
                }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Found {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
                  </p>
                </div>
                
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
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Clubs;
