import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Star, 
  Languages, 
  Globe, 
  Instagram, 
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  Shield,
  Heart,
  MapPinned
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ClubDetail = () => {
  const { slug } = useParams();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedClubs, setRelatedClubs] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      fetchClub();
    }
  }, [slug]);

  const fetchClub = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (data) {
      setClub(data);
      fetchRelatedClubs(data.district, data.id);
      
      // Add schema.org JSON-LD
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": data.name,
        "description": data.description,
        "url": window.location.href,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.address,
          "addressLocality": data.city,
          "postalCode": data.postal_code,
          "addressCountry": data.country
        },
        ...(data.latitude && data.longitude ? {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": data.latitude,
            "longitude": data.longitude
          }
        } : {}),
        ...(data.instagram_url || data.website_url ? {
          "sameAs": [data.website_url, data.instagram_url].filter(Boolean)
        } : {})
      });
      document.head.appendChild(script);
    }
    
    setLoading(false);
  };

  const fetchRelatedClubs = async (district: string, currentId: number) => {
    const { data } = await supabase
      .from("clubs")
      .select("*")
      .eq("district", district)
      .eq("status", "active")
      .neq("id", currentId)
      .limit(3);
      
    if (data) {
      setRelatedClubs(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading club details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Club Not Found</h1>
            <Button asChild>
              <Link to="/clubs">Back to Clubs</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Image */}
        {club.main_image_url && (
          <div className="w-full h-64 md:h-96 overflow-hidden bg-muted">
            <img
              src={club.main_image_url}
              alt={club.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/clubs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Link>
          </Button>
        </div>

        {/* Club Header */}
        <section className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {club.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  {club.is_verified && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {club.is_tourist_friendly && (
                    <Badge variant="secondary">
                      Tourist Friendly
                    </Badge>
                  )}
                </div>
              </div>
              
              {club.rating_editorial && (
                <div className="text-center bg-muted px-6 py-3 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-6 h-6 fill-gold text-gold mr-1" />
                    <span className="text-3xl font-bold">{club.rating_editorial.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Editorial Rating</p>
                </div>
              )}
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">{club.address}</p>
                      <p className="text-sm text-muted-foreground">{club.district}, {club.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {club.languages && club.languages.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Languages className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Languages</h3>
                        <p className="text-sm text-muted-foreground">
                          {club.languages.map((l: string) => l.toUpperCase()).join(", ")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Type</h3>
                      <p className="text-sm text-muted-foreground">
                        Private Cultural Association
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Club</h2>
              <p className="text-muted-foreground leading-relaxed">
                {club.description}
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {club.website_url && (
                  <a 
                    href={club.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {club.instagram_url && (
                  <a 
                    href={club.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {club.email && (
                  <a 
                    href={`mailto:${club.email}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {club.email}
                  </a>
                )}
                {club.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${club.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Please note:</strong> Cannabis social clubs are private non-profit cultural associations. 
                Membership is required to access the club. This listing is for informational purposes only and does 
                not constitute an endorsement or invitation. Contact the club directly for membership information.
              </p>
            </div>
          </div>
        </section>

        {/* Related Clubs */}
        {relatedClubs.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Other Clubs in {club.district}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedClubs.map((related) => (
                  <Link key={related.id} to={`/club/${related.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{related.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {related.summary || related.description}
                        </p>
                        {related.rating_editorial && (
                          <div className="flex items-center text-sm">
                            <Star className="w-4 h-4 fill-gold text-gold mr-1" />
                            <span className="font-medium">{related.rating_editorial.toFixed(1)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ClubDetail;
