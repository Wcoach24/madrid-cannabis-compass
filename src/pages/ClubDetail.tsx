import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Globe, Instagram, Clock, UserPlus, CheckCircle, Users, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import SEOHead from "@/components/SEOHead";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath, removeLanguageFromPath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { Timetable, isOpenNow, getDaysInOrder, getCurrentDay, formatTime } from "@/lib/timetableUtils";
import { FloatingCTA } from "@/components/club/FloatingCTA";
import { HeroMetrics } from "@/components/club/HeroMetrics";

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
    if (data) setRelatedClubs(data);
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
  const timetable = club.opening_hours as Timetable | null;
  const openNow = timetable ? isOpenNow(timetable) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${club.name} - Madrid Cannabis Club`}
        description={club.description?.substring(0, 160) || `Visit ${club.name}, a cannabis social club in ${club.district}, Madrid.`}
        canonical={`${BASE_URL}/club/${club.slug}`}
        keywords={`${club.name}, ${club.district}, Madrid cannabis club`}
        ogImage={club.image_url}
        hreflangLinks={hreflangLinks}
      />
      <Header />

      {/* Hero with Overlay CTA */}
      {club.image_url && (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
          <img src={club.image_url} alt={club.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">{club.name}</h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6 drop-shadow-lg">{t("club.heroTagline")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                {club.editorial_rating && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-lg">{club.editorial_rating}</span>
                  </div>
                )}
                {club.verified && (
                  <Badge variant="secondary" className="bg-green-500/20 text-white border-green-400/30 backdrop-blur-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />{t("club.verified")}
                  </Badge>
                )}
                {club.tourist_friendly && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-white border-blue-400/30 backdrop-blur-sm">
                    <Users className="h-3 w-3 mr-1" />{t("club.touristFriendly")}
                  </Badge>
                )}
              </div>
              <HeroMetrics />
              <Button asChild size="lg" className="mt-8 text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform animate-pulse-glow group">
                <Link to={buildLanguageAwarePath("/invitation-form", language)}>
                  {t("club.requestInvitation")}<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to={buildLanguageAwarePath("/", language)}>{t("nav.home")}</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to={buildLanguageAwarePath("/clubs", language)}>{t("nav.clubs")}</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{club.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {club.description && (
                <Card><CardContent className="pt-6"><h2 className="text-2xl font-bold mb-4">{t("club.about.title")}</h2><p className="text-muted-foreground whitespace-pre-wrap">{club.description}</p></CardContent></Card>
              )}
              <Card><CardContent className="pt-6"><h2 className="text-2xl font-bold mb-4">{t("club.expect.title")}</h2><ul className="space-y-3"><li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" /><span>{t("club.expect.atmosphere")}</span></li><li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" /><span>{t("club.expect.community")}</span></li><li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" /><span>{t("club.expect.products")}</span></li></ul></CardContent></Card>
              <Card><CardContent className="pt-6"><h2 className="text-2xl font-bold mb-4">{t("club.requirements.title")}</h2><ul className="space-y-3"><li className="flex items-start gap-3"><UserPlus className="h-5 w-5 text-primary mt-0.5 shrink-0" /><span>{t("club.requirements.age")}</span></li><li className="flex items-start gap-3"><UserPlus className="h-5 w-5 text-primary mt-0.5 shrink-0" /><span>{t("club.requirements.invitation")}</span></li><li className="flex items-start gap-3"><UserPlus className="h-5 w-5 text-primary mt-0.5 shrink-0" /><span>{t("club.requirements.documentation")}</span></li></ul></CardContent></Card>
            </div>

            <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
              {timetable && (
                <Card><CardContent className="pt-6"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5" />{t("club.hours.title")}</h3>{openNow !== null && <Badge variant={openNow ? "default" : "secondary"}>{openNow ? t("club.hours.open_now") : t("club.hours.closed_now")}</Badge>}</div><div className="space-y-2">{getDaysInOrder().map((day) => { const hours = timetable[day.toLowerCase() as keyof Timetable]; const isToday = day === getCurrentDay(); return (<div key={day} className={`flex justify-between text-sm ${isToday ? "font-semibold text-primary" : ""}`}><span>{t(`club.hours.${day.toLowerCase()}`)}</span><span>{hours && typeof hours === 'object' && 'open' in hours && hours.open && hours.close ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : t("club.hours.closed")}</span></div>); })}</div></CardContent></Card>
              )}
              <Card><CardContent className="pt-6 space-y-4"><h3 className="text-lg font-semibold">{t("club.contact")}</h3>{club.address && (<div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-sm">{club.address}</p><p className="text-sm text-muted-foreground">{club.district}, Madrid</p></div></div>)}{club.website && (<Button asChild variant="outline" size="sm" className="w-full"><a href={club.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 mr-2" />{t("club.website")}</a></Button>)}{club.instagram && (<Button asChild variant="outline" size="sm" className="w-full"><a href={club.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4 mr-2" />{t("club.instagram")}</a></Button>)}</CardContent></Card>
            </div>
          </div>

          {relatedClubs.length > 0 && (
            <section className="mt-16"><h2 className="text-3xl font-bold mb-8">{t("club.related.title")} {club.district}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{relatedClubs.map((rc) => <ClubCard key={rc.id} {...rc} />)}</div></section>
          )}
        </div>
      </main>
      <FloatingCTA clubSlug={club.slug} />
      <Footer />
    </div>
  );
};

export default ClubDetail;
