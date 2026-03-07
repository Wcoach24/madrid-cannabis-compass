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
      whatIsText: "A cannabis club in Madrid (also called 'asociación cannábica' or 'cannabis social club') is a private, non-profit association where members collectively cultivate and share cannabis for personal use. Unlike commercial dispensaries found in other countries, Spanish cannabis clubs function as closed membership societies with strict entry requirements. These clubs operate in a legal grey area under Spanish law, which permits private consumption among consenting adults but prohibits public sale or distribution. The Supreme Court of Spain has established legal precedent for the 'shared consumption' doctrine that protects these associations. To become a member, you must be 21 years or older and receive an invitation from an existing member. This invitation system ensures clubs remain private associations rather than public businesses. First-time visitors undergo a verification process including ID check and a brief orientation about club rules. Madrid hosts diverse types of cannabis social clubs, from intimate local associations with small memberships to larger social spaces with lounges, events, and community activities. Some clubs cater specifically to tourists and international visitors, offering English-speaking staff and streamlined membership processes for foreigners.",
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
      legalText: "Cannabis clubs in Madrid operate under a unique legal framework shaped by decades of Spanish jurisprudence. While cannabis is not technically legal in Spain, the Constitutional Court has consistently protected private consumption among consenting adults, forming the foundation for asociaciones cannábicas. The legal model relies on key principles: consumption must occur in private spaces away from public view; all members must be legal adults (21+ in Madrid clubs); associations must operate on a non-profit basis; and cannabis cannot be shared with non-members. Spain's Organic Law 4/2015 establishes administrative sanctions for public consumption but explicitly exempts private use. Madrid's cannabis club scene has grown since the early 2010s, with approximately 50+ registered associations operating today. Each club must register with local authorities and maintain detailed membership records. For international visitors, it's important to understand that while club membership is possible, consuming cannabis in public spaces or transporting it remains prohibited.",
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
        { q: "Is it safe to visit cannabis clubs as a tourist?", a: "Yes, verified cannabis clubs are safe environments with security measures, quality-tested products, and professional staff. We only partner with reputable, established associations." },
        { q: "What happens on my first visit to a cannabis club?", a: "On your first visit, you'll present your ID and invitation at the entrance. Staff will verify your identity, explain the club rules, and guide you through the membership registration. After completing paperwork, you can access the club's facilities and speak with staff about available options." },
        { q: "What types of cannabis clubs exist in Madrid?", a: "Madrid offers diverse club types: intimate neighborhood associations with a local community feel, larger social clubs with lounges and events, premium clubs with exclusive amenities, and tourist-friendly clubs with multilingual staff and streamlined processes for international visitors." },
        { q: "Which Madrid districts have the most cannabis clubs?", a: "Cannabis clubs are spread throughout Madrid, with concentrations in central districts like Centro (including Malasaña and Lavapiés), Chamberí, Salamanca, and Tetuán. Each neighborhood offers different vibes, from bohemian to upscale." },
        { q: "Do I need to speak Spanish to join a cannabis club?", a: "No, many clubs in Madrid have English-speaking staff and cater to international visitors. Tourist-friendly clubs specifically offer services in multiple languages including English, French, German, and Italian." },
        { q: "Can I visit multiple cannabis clubs in Madrid?", a: "Yes, you can be a member of multiple cannabis clubs in Madrid. Each club requires separate registration and membership, but there's no legal restriction on belonging to several associations." },
        { q: "What amenities do cannabis clubs typically offer?", a: "Amenities vary by club but commonly include comfortable lounge areas, consumption spaces, social areas for members to interact, and some clubs offer events, music, games, or educational workshops. Premium clubs may have additional facilities like private rooms or outdoor terraces." }
      ]
    },
    es: {
      title: "Cannabis Club Madrid | Guía Clubs Sociales 2026",
      subtitle: "Guía completa de clubs sociales de cannabis en Madrid - cómo unirse, requisitos y clubs verificados",
      quickAnswer: "Los clubs sociales de cannabis en Madrid (también conocidos como 'asociaciones cannábicas') son asociaciones privadas solo para miembros donde los adultos pueden consumir cannabis legalmente. Los turistas pueden unirse a estos clubs sociales con una invitación válida de un miembro existente. El proceso de membresía tarda 24-48 horas.",
      whatIsTitle: "¿Qué es un Club de Cannabis en Madrid?",
      whatIsText: "Un club de cannabis en Madrid (también conocido como 'asociación cannábica' o 'club social de cannabis') es una asociación privada sin ánimo de lucro donde los miembros cultivan y comparten colectivamente cannabis para uso personal. A diferencia de los dispensarios comerciales de otros países, los clubs de cannabis españoles funcionan como sociedades de membresía cerrada con estrictos requisitos de entrada. Estos clubes operan en una zona gris legal bajo la ley española, que permite el consumo privado entre adultos pero prohíbe la venta o distribución pública. El Tribunal Supremo de España ha establecido precedentes legales para la doctrina del 'consumo compartido' que protege estas asociaciones. Para ser miembro, debes tener 21 años o más y recibir una invitación de un miembro existente. Este sistema de invitaciones garantiza que los clubes sigan siendo asociaciones privadas en lugar de negocios públicos. Los visitantes primerizos pasan por un proceso de verificación que incluye comprobación de identidad y una breve orientación sobre las normas del club. Madrid alberga diversos tipos de clubs sociales de cannabis, desde asociaciones locales íntimas con pocos miembros hasta espacios sociales más grandes con salones, eventos y actividades comunitarias. Algunos clubes atienden específicamente a turistas y visitantes internacionales, ofreciendo personal que habla inglés y procesos de membresía simplificados para extranjeros.",
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
      legalText: "Los clubs de cannabis en Madrid operan bajo un marco legal único formado por décadas de jurisprudencia española. Aunque el cannabis no es técnicamente legal en España, el Tribunal Constitucional ha protegido consistentemente el consumo privado entre adultos, estableciendo la base legal para las asociaciones cannábicas. El modelo legal se basa en principios clave: el consumo debe realizarse en espacios privados lejos de la vista pública; todos los miembros deben ser adultos legales (21+ en clubes de Madrid); las asociaciones deben operar sin ánimo de lucro; y el cannabis no puede compartirse con no miembros. La Ley Orgánica 4/2015 establece sanciones administrativas por consumo público pero exime explícitamente el uso privado. La escena de clubs de cannabis en Madrid ha crecido desde principios de los 2010, con aproximadamente más de 50 asociaciones registradas operando actualmente. Cada club debe registrarse ante las autoridades locales y mantener registros detallados de membresía. Para visitantes internacionales, es importante entender que aunque la membresía en clubes es posible, consumir cannabis en espacios públicos o transportarlo sigue estando prohibido.",
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
        { q: "¿Es seguro visitar clubs de cannabis como turista?", a: "Sí, los clubs de cannabis verificados son entornos seguros con medidas de seguridad, productos probados de calidad y personal profesional. Solo nos asociamos con asociaciones reputadas y establecidas." },
        { q: "¿Qué pasa en mi primera visita a un club de cannabis?", a: "En tu primera visita, presentarás tu identificación e invitación en la entrada. El personal verificará tu identidad, explicará las normas del club y te guiará en el proceso de registro de membresía. Después de completar el papeleo, podrás acceder a las instalaciones del club y hablar con el personal sobre las opciones disponibles." },
        { q: "¿Qué tipos de clubs de cannabis existen en Madrid?", a: "Madrid ofrece diversos tipos de clubes: asociaciones de barrio íntimas con un ambiente comunitario local, clubs sociales más grandes con salones y eventos, clubs premium con amenidades exclusivas, y clubs orientados a turistas con personal multilingüe y procesos simplificados para visitantes internacionales." },
        { q: "¿Qué distritos de Madrid tienen más clubs de cannabis?", a: "Los clubs de cannabis están distribuidos por todo Madrid, con concentraciones en distritos centrales como Centro (incluyendo Malasaña y Lavapiés), Chamberí, Salamanca y Tetuán. Cada barrio ofrece diferentes ambientes, desde bohemio hasta exclusivo." },
        { q: "¿Necesito hablar español para unirme a un club de cannabis?", a: "No, muchos clubs en Madrid tienen personal que habla inglés y atienden a visitantes internacionales. Los clubs orientados a turistas específicamente ofrecen servicios en varios idiomas incluyendo inglés, francés, alemán e italiano." },
        { q: "¿Puedo visitar múltiples clubs de cannabis en Madrid?", a: "Sí, puedes ser miembro de múltiples clubs de cannabis en Madrid. Cada club requiere registro y membresía por separado, pero no hay restricción legal para pertenecer a varias asociaciones." },
        { q: "¿Qué amenidades ofrecen típicamente los clubs de cannabis?", a: "Las amenidades varían según el club pero comúnmente incluyen áreas de descanso cómodas, espacios de consumo, áreas sociales para que los miembros interactúen, y algunos clubs ofrecen eventos, música, juegos o talleres educativos. Los clubs premium pueden tener instalaciones adicionales como salas privadas o terrazas exteriores." }
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
        htmlLang={language}
        fullContentLanguages={['en', 'es']}
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
