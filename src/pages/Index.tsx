import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Mail, PartyPopper, Shield, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import QuickClubFinder from "@/components/QuickClubFinder";
import logoWeedMadrid from "@/assets/logo-weed-madrid.png";
import SEOHead from "@/components/SEOHead";
import StatsCounter from "@/components/StatsCounter";
import OrganizationSchema from "@/components/OrganizationSchema";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { isOpenNow, Timetable } from "@/lib/timetableUtils";
import { trackQuickFinderUse, trackClubView } from "@/components/Analytics";

const Index = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredClubs, setFeaturedClubs] = useState<any[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [clubCount, setClubCount] = useState(0);
  const [finderDialogOpen, setFinderDialogOpen] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: "Mike Thompson",
      city: "USA",
      photo: "https://i.pravatar.cc/150?img=12",
      quote: "Amazing experience! Got my invitation within 24 hours and the club was exactly as described. Professional, clean, and welcoming to tourists.",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      city: "London",
      photo: "https://i.pravatar.cc/150?img=5",
      quote: "Best cannabis club experience in Madrid. The team helped me through the entire process. Highly recommend for international visitors!",
      rating: 5
    },
    {
      name: "Lucas Müller",
      city: "Germany",
      photo: "https://i.pravatar.cc/150?img=33",
      quote: "Safe, legal, and professional. Everything was transparent and the club atmosphere was fantastic. Will definitely visit again!",
      rating: 5
    },
    {
      name: "Emma Dubois",
      city: "France",
      photo: "https://i.pravatar.cc/150?img=9",
      quote: "The invitation process was super easy. Great selection of clubs and very tourist-friendly. Made my Madrid trip unforgettable!",
      rating: 5
    },
    {
      name: "James Wilson",
      city: "Australia",
      photo: "https://i.pravatar.cc/150?img=15",
      quote: "Couldn't believe how smooth the whole process was. From getting the invitation to enjoying the club - everything was perfect!",
      rating: 5
    },
    {
      name: "Sophie Martin",
      city: "Canada",
      photo: "https://i.pravatar.cc/150?img=20",
      quote: "As a tourist, I was nervous about the legalities. This service made everything clear and easy. The club was top-notch!",
      rating: 5
    }
  ];

  useEffect(() => {
    fetchFeaturedClubs();
    
    // Testimonial carousel
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    // Stats counter animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible) {
          setStatsVisible(true);
          animateCount(0, 5000, setMemberCount, 2000);
          animateCount(0, 24, setClubCount, 2000);
        }
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      clearInterval(interval);
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsVisible]);

  const animateCount = (start: number, end: number, setter: (value: number) => void, duration: number) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setter(current);
      if (progress === 1) clearInterval(timer);
    }, 16);
  };

  const fetchFeaturedClubs = async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("slug, name, summary, district, rating_editorial, is_tourist_friendly, is_verified, languages, main_image_url, timetable")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("rating_editorial", { ascending: false })
      .limit(3);

    if (data) {
      setFeaturedClubs(data);
    }
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/");

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("home.title")}
        description={t("home.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/", language)}`}
        keywords="weed madrid, cannabis club madrid, weed club madrid, cannabis madrid, join cannabis club madrid, tourist cannabis madrid"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Weed Madrid",
          "description": t("home.subtitle"),
          "url": BASE_URL,
          "inLanguage": language,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${BASE_URL}/clubs?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Dark Luxury with Smoke Animation */}
        <section className="relative py-20 md:py-32 overflow-hidden" style={{
          backgroundImage: 'url(/images/hero-custom-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Dark Overlay for Background - Layer 1 */}
          <div className="absolute inset-0 bg-black/50 z-[1]"></div>
          
          {/* Animated Smoke/Haze Particles - Layer 2 */}
          <div className="absolute inset-0 z-[2]">
            <div className="smoke-particle smoke-1"></div>
            <div className="smoke-particle smoke-2"></div>
            <div className="smoke-particle smoke-3"></div>
            <div className="smoke-particle smoke-4"></div>
            <div className="smoke-particle smoke-5"></div>
          </div>
          
          {/* Ambient Glow Layer - Layer 3 */}
          <div className="ambient-glow z-[3]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <img 
                  src={logoWeedMadrid} 
                  alt="Weed Madrid - Madrid's trusted cannabis club directory and invitation guide for legal cannabis social clubs" 
                  className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 md:mb-6 drop-shadow-2xl"
                />
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight text-gradient-logo animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                {t("home.title")}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 md:mb-10 text-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 px-4">
                {t("home.subtitle")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 px-4">
                <Dialog open={finderDialogOpen} onOpenChange={setFinderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto shadow-xl hover:shadow-neon transition-all hover:scale-105"
                      onClick={() => trackQuickFinderUse()}
                    >
                      <Search className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                      {t("home.search.button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-4 sm:p-6">
                    <QuickClubFinder onClose={() => setFinderDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
                  asChild
                >
                  <Link to={buildLanguageAwarePath("/guides", language)}>
                    {t("home.howitworks.readguide")}
                  </Link>
                </Button>
              </div>

              {/* Trust Signals - Luxury Badges */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 px-2">
                <div className="flex items-center gap-2 md:gap-3 glass-effect px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-gold text-sm md:text-base">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{t("home.features.legal")}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 glass-effect px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-gold text-sm md:text-base">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{t("home.features.verified")}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 glass-effect px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-gold text-sm md:text-base">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">Same-Day Access</span>
                </div>
              </div>

              {/* Social Proof Counter */}
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-900 px-4">
                <div className="inline-flex items-center gap-2 glass-effect px-6 md:px-8 py-3 md:py-4 rounded-full border border-primary/20">
                  <div className="flex -space-x-2 md:-space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 border-2 border-primary"></div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/30 border-2 border-primary"></div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/40 border-2 border-primary"></div>
                  </div>
                  <span className="text-foreground font-semibold text-sm md:text-base lg:text-lg">Join 5,000+ Members</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Dark Luxury with Gold Pattern */}
        <section className="relative py-16 md:py-20 bg-black overflow-hidden">
          {/* Subtle gold pattern background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212, 175, 55, 0.3) 35px, rgba(212, 175, 55, 0.3) 36px)',
          }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 md:mb-16 px-4">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 text-gradient-gold">{t("home.howitworks.title")}</h2>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-luxury">
                {t("home.howitworks.subtitle")}
              </p>
            </div>

            <div className="relative max-w-6xl mx-auto mb-8 md:mb-12">
              {/* Connecting lines between steps (hidden on mobile) */}
              <div className="hidden md:block absolute top-24 left-1/4 w-1/4 h-0.5 bg-gradient-to-r from-primary/50 to-primary/30 connector-line" style={{ animationDelay: '0.5s' }}></div>
              <div className="hidden md:block absolute top-24 right-1/4 w-1/4 h-0.5 bg-gradient-to-r from-primary/30 to-primary/50 connector-line" style={{ animationDelay: '1s' }}></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Step 1 */}
                <div className="card-snoop relative overflow-hidden rounded-2xl p-6 md:p-8">
                  <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-weed-gold-dark flex items-center justify-center text-3xl md:text-4xl font-bold text-black shadow-gold-intense">
                    1
                  </div>
                  <div className="pt-20 md:pt-24 text-center">
                    <Search className="w-16 h-16 md:w-20 md:h-20 text-primary mb-4 md:mb-6 mx-auto" strokeWidth={1.5} />
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">{t("home.howitworks.private.title")}</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{t("home.howitworks.private.desc")}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="card-snoop relative overflow-hidden rounded-2xl p-6 md:p-8">
                  <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-weed-gold-dark flex items-center justify-center text-3xl md:text-4xl font-bold text-black shadow-gold-intense">
                    2
                  </div>
                  <div className="pt-20 md:pt-24 text-center">
                    <Calendar className="w-16 h-16 md:w-20 md:h-20 text-primary mb-4 md:mb-6 mx-auto" strokeWidth={1.5} />
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">{t("home.howitworks.membership.title")}</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{t("home.howitworks.membership.desc")}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="card-snoop relative overflow-hidden rounded-2xl p-6 md:p-8">
                  <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-weed-gold-dark flex items-center justify-center text-3xl md:text-4xl font-bold text-black shadow-gold-intense">
                    3
                  </div>
                  <div className="pt-20 md:pt-24 text-center">
                    <PartyPopper className="w-16 h-16 md:w-20 md:h-20 text-primary mb-4 md:mb-6 mx-auto" strokeWidth={1.5} />
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">{t("home.howitworks.responsible.title")}</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{t("home.howitworks.responsible.desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center px-4">
              <Button asChild size="lg" variant="gold" className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 h-auto md:text-xl shadow-gold-intense hover:shadow-gold-intense hover:scale-105 w-full sm:w-auto">
                <Link to={buildLanguageAwarePath("/clubs", language)}>
                  <Mail className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  Get Your Invitation Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Counter */}
        <StatsCounter ref={statsRef} memberCount={memberCount} clubCount={clubCount} />

        {/* Featured Clubs - Luxury Photo Cards */}
        {featuredClubs.length > 0 && (
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-12 px-4">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 text-gradient-gold">{t("home.featured.title")}</h2>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-luxury">{t("home.featured.subtitle")}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-6 md:mb-8">{featuredClubs.map((club, index) => {
                  const clubIsOpen = club.timetable ? isOpenNow(club.timetable as Timetable) : false;
                  
                  return (
                  <div key={club.slug} className="card-snoop group relative overflow-hidden rounded-2xl cursor-pointer">
                    {/* OPEN NOW Badge */}
                    {clubIsOpen && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                        <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 shadow-lg">
                          {t("clubcard.open_now")}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Club Image with zoom effect */}
                    <div className="relative h-56 md:h-64 overflow-hidden">
                      <img 
                        src={club.main_image_url || "/placeholder.svg"} 
                        alt={club.name}
                        className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
                      />
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80 md:group-hover:opacity-90 transition-opacity"></div>
                      
                      {/* Club info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <h3 className="font-display text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-foreground">{club.name}</h3>
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-base md:text-lg ${i < Math.floor(club.rating_editorial || 0) ? 'text-primary' : 'text-muted-foreground/30'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-primary font-bold text-base md:text-lg">{club.rating_editorial?.toFixed(1)}</span>
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm mb-1">📍 {club.district}</p>
                        {club.is_tourist_friendly && (
                          <span className="inline-block text-xs bg-primary/20 text-primary px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-primary/30">
                            Tourist Friendly
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Get Invitation Button */}
                    <div className="p-4 md:p-6">
                      <Button 
                        asChild 
                        variant="gold" 
                        className="w-full text-base md:text-lg py-5 md:py-6 shadow-gold md:group-hover:shadow-gold-intense transition-all"
                        onClick={() => trackClubView(club.slug, club.name)}
                      >
                        <Link to={buildLanguageAwarePath(`/invite/${club.slug}`, language)}>
                          Get Invitation
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
              </div>

              <div className="text-center">
                <Button asChild size="lg" variant="glow" className="text-lg px-10 py-6 h-auto">
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {t("home.featured.viewall")}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-black relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-black to-background"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8 md:mb-12 px-4">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 text-gradient-gold">What Our Members Say</h2>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-luxury">Real experiences from real travelers</p>
            </div>

            <div className="max-w-4xl mx-auto px-4">
              <div className="relative">
                {/* Testimonial Card */}
                <div className="card-snoop p-6 md:p-8 lg:p-12 rounded-3xl min-h-[350px] md:min-h-[400px] flex flex-col justify-between">
                  <div>
                    <Quote className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4 md:mb-6 opacity-50" />
                    <p className="text-lg md:text-xl lg:text-2xl text-foreground mb-6 md:mb-8 font-luxury leading-relaxed">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4">
                    <img 
                      src={testimonials[currentTestimonial].photo} 
                      alt={testimonials[currentTestimonial].name}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-primary shadow-gold"
                    />
                    <div>
                      <h4 className="font-display text-lg md:text-xl text-foreground">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-sm md:text-base text-muted-foreground">{testimonials[currentTestimonial].city}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <span key={i} className="text-primary text-base md:text-lg">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons - Touch-friendly on mobile */}
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-16 w-12 h-12 md:w-14 md:h-14 rounded-full glass-effect border-2 border-primary/30 flex items-center justify-center text-primary hover:border-primary hover:shadow-gold transition-all active:scale-95 touch-manipulation"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-16 w-12 h-12 md:w-14 md:h-14 rounded-full glass-effect border-2 border-primary/30 flex items-center justify-center text-primary hover:border-primary hover:shadow-gold transition-all active:scale-95 touch-manipulation"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6 md:mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 rounded-full transition-all touch-manipulation ${
                      index === currentTestimonial 
                        ? 'bg-primary w-8 shadow-gold' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-3'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* As Seen On Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-muted-foreground mb-2">As Seen On</h3>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-5xl mx-auto">
              {/* Placeholder logos - replace with actual media outlet logos */}
              {['TripAdvisor', 'Lonely Planet', 'Forbes Travel', 'Vice', 'High Times', 'Leafly'].map((outlet, index) => (
                <div
                  key={index}
                  className="group relative px-6 py-4 rounded-lg transition-all hover:scale-110"
                >
                  <span className="text-2xl font-bold text-muted-foreground/40 group-hover:text-primary transition-colors duration-300 filter grayscale group-hover:grayscale-0">
                    {outlet}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-primary/20 rounded-lg -z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Essential Guides - Simplified */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">{t("home.guides.title")}</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.best.title")}
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.join.title")}
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  to={buildLanguageAwarePath("/guides", language)}
                  className="text-lg text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t("home.guides.legal.title")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
