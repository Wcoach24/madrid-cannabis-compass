import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Languages, Globe, Instagram, Mail, Phone, ChevronLeft, Building, Clock, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import SEOHead from "@/components/SEOHead";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath, removeLanguageFromPath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { Timetable, isOpenNow, getDaysInOrder, getCurrentDay, formatTime } from "@/lib/timetableUtils";

const ClubDetail = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
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
    
    const { data } = await supabase
      .from("clubs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (data) {
      setClub(data);
      fetchRelatedClubs(data.district, data.id);
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
          <p className="text-muted-foreground">{t("clubs.loading")}</p>
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
            <h1 className="text-2xl font-bold mb-4">{t("clubs.nofound")}</h1>
            <Button asChild>
              <Link to={buildLanguageAwarePath("/clubs", language)}>{t("club.backtoclubs")}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPath = removeLanguageFromPath(window.location.pathname);
  const hreflangLinks = generateHreflangLinks(BASE_URL, currentPath);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/`
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
        "name": club.name,
        "item": `${BASE_URL}/club/${club.slug}`
      }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": club.name,
    "description": club.description,
    "url": `${BASE_URL}/club/${club.slug}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": club.address,
      "addressLocality": club.city,
      "postalCode": club.postal_code,
      "addressCountry": club.country
    },
    ...(club.latitude && club.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": club.latitude,
        "longitude": club.longitude
      }
    } : {}),
    ...(club.rating_editorial ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": club.rating_editorial,
        "bestRating": "5"
      }
    } : {})
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={club.seo_title || `${club.name} - ${t("clubs.title")}`}
        description={club.seo_description || club.summary}
        canonical={`${BASE_URL}${buildLanguageAwarePath(currentPath, language)}`}
        keywords={`${club.name}, cannabis club ${club.district}, ${club.city} cannabis`}
        ogImage={club.main_image_url}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={[breadcrumbSchema, localBusinessSchema]}
      />
      <Header />
      
      <main className="flex-1">
        {club.main_image_url && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img 
              src={club.main_image_url} 
              alt={club.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={buildLanguageAwarePath("/", language)}>{t("nav.home")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={buildLanguageAwarePath("/clubs", language)}>{t("nav.clubs")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{club.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link to={buildLanguageAwarePath("/clubs", language)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t("club.backtoclubs")}
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">{club.name}</h1>
              {club.is_verified && (
                <Badge variant="secondary">{t("club.verified")}</Badge>
              )}
              {club.is_tourist_friendly && (
                <Badge variant="outline">{t("club.touristfriendly")}</Badge>
              )}
            </div>

            {club.rating_editorial && (
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="text-lg font-semibold">{club.rating_editorial.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Mobile CTA - Appears first on mobile only */}
            <Card className="lg:hidden mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t("club.cta.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("club.cta.description")}
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {t("club.cta.urgency")}
                  </p>
                </div>
                <Button asChild className="w-full h-12 text-base shadow-md hover:shadow-lg transition-shadow">
                  <Link to={buildLanguageAwarePath(`/invite/${club.slug}`, language)}>
                    <UserPlus className="w-5 h-5 mr-2" />
                    {t("club.cta.button")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("club.about.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {club.description}
                  </p>
                </div>

                {/* What to Expect Section */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("club.expect.title")}</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("club.expect.atmosphere")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("club.expect.community")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("club.expect.products")}</span>
                    </li>
                  </ul>
                </div>

                {/* Membership Requirements */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("club.requirements.title")}</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("club.requirements.age")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("club.requirements.invitation")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("club.requirements.documentation")}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start">
                {/* Enhanced CTA Card - Desktop only (hidden on mobile) */}
                <Card className="hidden lg:block bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg">
                  <CardContent className="p-8 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{t("club.cta.title")}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("club.cta.description")}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        {t("club.cta.urgency")}
                      </p>
                    </div>
                    <Button asChild className="w-full h-12 text-base shadow-md hover:shadow-lg transition-shadow">
                      <Link to={buildLanguageAwarePath(`/invite/${club.slug}`, language)}>
                        <UserPlus className="w-5 h-5 mr-2" />
                        {t("club.cta.button")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Opening Hours Card - High Priority */}
                {club.timetable && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{t("club.hours.title")}</h3>
                      </div>
                      
                      {/* Open Now Badge */}
                      <div className="mb-4">
                        {isOpenNow(club.timetable as Timetable) ? (
                          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                            {t("club.hours.open_now")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {t("club.hours.closed_now")}
                          </Badge>
                        )}
                      </div>

                      {/* Daily Schedule */}
                      <div className="space-y-2">
                        {getDaysInOrder().map((day) => {
                          const timetable = club.timetable as Timetable;
                          const schedule = timetable[day as keyof Omit<Timetable, 'notes'>];
                          const isToday = getCurrentDay() === day;
                          
                          return (
                            <div
                              key={day}
                              className={`flex justify-between py-2 px-3 rounded-lg ${
                                isToday ? 'bg-accent/50 font-medium' : ''
                              }`}
                            >
                              <span className="capitalize">
                                {t(`club.hours.${day}`)}
                              </span>
                              {schedule?.closed ? (
                                <span className="text-muted-foreground">{t("club.hours.closed")}</span>
                              ) : schedule ? (
                                <span>
                                  {formatTime(schedule.open)} - {formatTime(schedule.close)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Notes */}
                      {club.timetable.notes && (club.timetable.notes as any)[language] && (
                        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                          {(club.timetable.notes as any)[language]}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">{t("club.location")}</p>
                        <p className="text-sm text-muted-foreground">{club.district}, {club.city}</p>
                      </div>
                    </div>

                    {club.languages && club.languages.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Languages className="w-5 h-5 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">{t("club.languages")}</p>
                          <p className="text-sm text-muted-foreground">{club.languages.join(", ").toUpperCase()}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">{t("club.type")}</p>
                        <p className="text-sm text-muted-foreground">Private Association</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(club.website_url || club.instagram_url || club.email || club.whatsapp_number) && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">{t("club.contact")}</h3>
                      <div className="space-y-3">
                        {club.website_url && (
                          <a 
                            href={club.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Globe className="w-4 h-4" />
                            {t("club.website")}
                          </a>
                        )}
                        {club.instagram_url && (
                          <a 
                            href={club.instagram_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Instagram className="w-4 h-4" />
                            {t("club.instagram")}
                          </a>
                        )}
                        {club.email && (
                          <a 
                            href={`mailto:${club.email}`}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Mail className="w-4 h-4" />
                            {t("club.email")}
                          </a>
                        )}
                        {club.whatsapp_number && (
                          <a 
                            href={`https://wa.me/${club.whatsapp_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Phone className="w-4 h-4" />
                            {t("club.whatsapp")}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{t("club.disclaimer.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("club.disclaimer.text")}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {relatedClubs.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">{t("club.related.title")} {club.district}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedClubs.map((relatedClub) => (
                  <ClubCard
                    key={relatedClub.id}
                    slug={relatedClub.slug}
                    name={relatedClub.name}
                    summary={relatedClub.summary}
                    district={relatedClub.district}
                    rating_editorial={relatedClub.rating_editorial}
                    is_tourist_friendly={relatedClub.is_tourist_friendly}
                    is_verified={relatedClub.is_verified}
                    languages={relatedClub.languages}
                    main_image_url={relatedClub.main_image_url}
                  />
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
