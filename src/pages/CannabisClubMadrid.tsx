import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ClubCard from "@/components/ClubCard";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { BASE_URL } from "@/lib/hreflangUtils";
import { 
  Scale, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Timetable } from "@/lib/timetableUtils";
import { Json } from "@/integrations/supabase/types";
interface Club {
  id: number;
  name: string;
  slug: string;
  district: string;
  summary: string | null;
  main_image_url: string | null;
  rating_editorial: number | null;
  is_tourist_friendly: boolean | null;
  is_verified: boolean | null;
  languages: string[] | null;
  timetable: Json | null;
}

const CannabisClubMadrid = () => {
  const { language } = useLanguageContext();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const langPrefix = language === "en" ? "" : `/${language}`;

  useEffect(() => {
    const fetchClubs = async () => {
      const { data } = await supabase
        .from("clubs")
        .select("id, name, slug, district, summary, main_image_url, rating_editorial, is_tourist_friendly, is_verified, languages, timetable")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("rating_editorial", { ascending: false })
        .limit(6);
      
      setClubs(data || []);
      setLoading(false);
    };
    fetchClubs();
  }, []);

  const isSpanish = language === "es";
  
  const content = {
    en: {
      title: "Cannabis Club Madrid | Social Club Guide 2026",
      subtitle: "Complete guide to cannabis social clubs in Madrid - how to join, requirements & verified clubs",
      quickAnswer: "Cannabis social clubs in Madrid (also known as 'asociaciones cannábicas' or weed social clubs) are private, members-only associations where adults can legally consume cannabis. Tourists can join these social clubs with a valid invitation from an existing member. The membership process takes 24-48 hours.",
      whatIsTitle: "What is a Cannabis Club in Madrid?",
      whatIsText: "A cannabis club in Madrid is a private, non-profit association where members collectively cultivate and share cannabis for personal use. These clubs operate in a legal grey area under Spanish law, which permits private consumption but prohibits public sale. Members must be 21+ and invited by an existing member.",
      howToJoinTitle: "How to Join a Cannabis Club",
      howToJoinSteps: [
        { title: "Request Invitation", desc: "Submit your details through our verified club network" },
        { title: "Verification", desc: "Club staff verify your age (21+) and identity" },
        { title: "Visit & Register", desc: "Visit the club in person to complete membership" },
        { title: "Enjoy Responsibly", desc: "Access cannabis in a private, safe environment" }
      ],
      topClubsTitle: "Top Rated Cannabis Clubs in Madrid",
      viewAllClubs: "View All Clubs",
      legalTitle: "Legal Framework in Spain 2026",
      legalText: "Cannabis clubs operate under Spanish jurisprudence that protects private consumption. Key points: consumption must be private, members must be adults, clubs are non-profit, and no external sales are permitted. Madrid has approximately 50+ registered associations.",
      ctaTitle: "Ready to Join a Cannabis Club?",
      ctaText: "Get your verified invitation to a trusted Madrid cannabis club today.",
      ctaButton: "Get Invitation",
      faqTitle: "Frequently Asked Questions",
      faqs: [
        { q: "Are cannabis clubs legal in Madrid?", a: "Cannabis clubs operate in a legal grey area. Private consumption is decriminalized in Spain, and these non-profit associations provide a legal framework for members to collectively cultivate and consume cannabis privately." },
        { q: "Can tourists join cannabis clubs in Madrid?", a: "Yes, tourists can join cannabis clubs in Madrid with a valid invitation from an existing member. You must be 21+ and present valid ID. Most clubs welcome international visitors with English-speaking staff." },
        { q: "How much does it cost to join?", a: "Initial membership fees typically range from €20-50, plus a contribution for cannabis (usually €8-15 per gram). Each club sets its own pricing structure." },
        { q: "What do I need to bring?", a: "You need valid photo ID (passport for tourists), your invitation confirmation, and cash for the membership fee and any contributions." },
        { q: "How long does the invitation process take?", a: "Most invitations are processed within 24-48 hours. Same-day invitations are available at select partner clubs for urgent requests." },
        { q: "Is it safe to visit cannabis clubs as a tourist?", a: "Yes, verified cannabis clubs are safe environments with security measures, quality-tested products, and professional staff. We only partner with reputable, established associations." }
      ]
    },
    es: {
      title: "Club de Cannabis Madrid | Guía Club Social 2026",
      subtitle: "Guía completa de clubs sociales de cannabis en Madrid - cómo unirse, requisitos y clubs verificados",
      quickAnswer: "Los clubs sociales de cannabis en Madrid (también conocidos como 'asociaciones cannábicas') son asociaciones privadas solo para miembros donde los adultos pueden consumir cannabis legalmente. Los turistas pueden unirse a estos clubs sociales con una invitación válida de un miembro existente. El proceso de membresía tarda 24-48 horas.",
      whatIsTitle: "¿Qué es un Club de Cannabis en Madrid?",
      whatIsText: "Un club de cannabis en Madrid es una asociación privada sin ánimo de lucro donde los miembros cultivan y comparten colectivamente cannabis para uso personal. Estos clubes operan en una zona gris legal bajo la ley española, que permite el consumo privado pero prohíbe la venta pública. Los miembros deben ser mayores de 21 años e invitados por un miembro existente.",
      howToJoinTitle: "Cómo Unirse a un Club de Cannabis",
      howToJoinSteps: [
        { title: "Solicitar Invitación", desc: "Envía tus datos a través de nuestra red de clubes verificados" },
        { title: "Verificación", desc: "El personal del club verifica tu edad (21+) e identidad" },
        { title: "Visitar y Registrarse", desc: "Visita el club en persona para completar la membresía" },
        { title: "Disfruta Responsablemente", desc: "Accede a cannabis en un entorno privado y seguro" }
      ],
      topClubsTitle: "Clubs de Cannabis Mejor Valorados en Madrid",
      viewAllClubs: "Ver Todos los Clubs",
      legalTitle: "Marco Legal en España 2026",
      legalText: "Las asociaciones cannábicas operan bajo la jurisprudencia española que protege el consumo privado. Puntos clave: el consumo debe ser privado, los miembros deben ser adultos, los clubes no tienen ánimo de lucro y no se permiten ventas externas. Madrid tiene aproximadamente más de 50 asociaciones registradas.",
      ctaTitle: "¿Listo para Unirte a un Club de Cannabis?",
      ctaText: "Obtén tu invitación verificada a un club de cannabis de confianza en Madrid hoy.",
      ctaButton: "Obtener Invitación",
      faqTitle: "Preguntas Frecuentes",
      faqs: [
        { q: "¿Son legales los clubs de cannabis en Madrid?", a: "Las asociaciones cannábicas operan en una zona gris legal. El consumo privado está despenalizado en España, y estas asociaciones sin ánimo de lucro proporcionan un marco legal para que los miembros cultiven y consuman cannabis de forma privada colectivamente." },
        { q: "¿Pueden los turistas unirse a clubs de cannabis en Madrid?", a: "Sí, los turistas pueden unirse a clubs de cannabis en Madrid con una invitación válida de un miembro existente. Debes tener 21+ años y presentar un documento de identidad válido. La mayoría de los clubes dan la bienvenida a visitantes internacionales con personal que habla inglés." },
        { q: "¿Cuánto cuesta unirse?", a: "Las cuotas de membresía inicial suelen oscilar entre 20-50€, más una contribución por el cannabis (normalmente 8-15€ por gramo). Cada club establece su propia estructura de precios." },
        { q: "¿Qué necesito llevar?", a: "Necesitas un documento de identidad con foto válido (pasaporte para turistas), tu confirmación de invitación y efectivo para la cuota de membresía y cualquier contribución." },
        { q: "¿Cuánto tarda el proceso de invitación?", a: "La mayoría de las invitaciones se procesan en 24-48 horas. Las invitaciones del mismo día están disponibles en clubes asociados seleccionados para solicitudes urgentes." },
        { q: "¿Es seguro visitar clubs de cannabis como turista?", a: "Sí, los clubs de cannabis verificados son entornos seguros con medidas de seguridad, productos probados de calidad y personal profesional. Solo nos asociamos con asociaciones reputadas y establecidas." }
      ]
    }
  };

  const t = isSpanish ? content.es : content.en;

  const canonicalPath = isSpanish ? "/es/club-cannabis-madrid" : "/cannabis-club-madrid";
  const hreflangLinks = [
    { lang: "en", href: `${BASE_URL}/cannabis-club-madrid` },
    { lang: "es", href: `${BASE_URL}/es/club-cannabis-madrid` },
    { lang: "x-default", href: `${BASE_URL}/cannabis-club-madrid` }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": t.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": t.title, "item": `${BASE_URL}${canonicalPath}` }
    ]
  };
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t.title,
    "description": t.subtitle,
    "url": `${BASE_URL}${canonicalPath}`,
    "inLanguage": isSpanish ? "es" : "en",
    "dateModified": new Date().toISOString(),
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "[data-speakable]", "[data-answer]"]
    }
  };

  const structuredData = [faqSchema, breadcrumbSchema, webPageSchema];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${t.title} | Weed Madrid`}
        description={t.subtitle}
        canonical={`${BASE_URL}${canonicalPath}`}
        keywords="cannabis club madrid, social club madrid, weed club madrid, cannabis social club madrid, asociacion cannabica madrid, social club weed madrid, private cannabis association madrid, how to join cannabis club madrid, madrid weed social club"
        hreflangLinks={hreflangLinks}
        structuredData={structuredData}
        speakableSelectors={["h1", "[data-speakable]", "[data-answer]"]}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <nav className="mb-8 text-sm text-muted-foreground">
              <Link to={langPrefix || "/"} className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{t.title}</span>
            </nav>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground" data-speakable="true">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8">
              {t.subtitle}
            </p>
            
            {/* Quick Answer Box */}
            <div className="bg-card border border-primary/20 rounded-xl p-6 max-w-3xl shadow-lg" data-answer="true">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground leading-relaxed">
                  {t.quickAnswer}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Is Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-foreground">{t.whatIsTitle}</h2>
            <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed" data-speakable="true">
              {t.whatIsText}
            </p>
          </div>
        </section>

        {/* How To Join Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-foreground text-center">{t.howToJoinTitle}</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {t.howToJoinSteps.map((step, i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to={`${langPrefix}/guide/${isSpanish ? 'como-unirse-club-cannabis-madrid' : 'how-to-join-cannabis-club-madrid'}`}>
                <Button variant="outline" className="gap-2">
                  {isSpanish ? "Leer Guía Completa" : "Read Full Guide"} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Top Clubs Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-foreground">{t.topClubsTitle}</h2>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {clubs.map(club => (
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
                      timetable={club.timetable as Timetable | null}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <Link to={`${langPrefix}/clubs`}>
                    <Button size="lg" className="gap-2">
                      {t.viewAllClubs} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Legal Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-4 max-w-4xl">
              <Scale className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">{t.legalTitle}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed" data-speakable="true">
                  {t.legalText}
                </p>
                <Link to={`${langPrefix}/guide/${isSpanish ? 'leyes-cannabis-espana-2025' : 'cannabis-laws-spain-2025'}`} className="inline-block mt-4">
                  <Button variant="link" className="p-0 gap-2 text-primary">
                    {isSpanish ? "Ver Marco Legal Completo" : "View Full Legal Framework"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-foreground text-center">{t.faqTitle}</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {t.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-foreground">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground" data-answer="true">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">{t.ctaTitle}</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              {t.ctaText}
            </p>
            <Link to={`${langPrefix}/clubs`}>
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                {t.ctaButton} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CannabisClubMadrid;
