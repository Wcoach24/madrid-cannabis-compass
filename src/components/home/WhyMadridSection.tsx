import { Link } from "react-router-dom";
import { Globe, Leaf, Users, Shield, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";

/**
 * WhyMadridSection — Long-form content about why Madrid is a top cannabis tourism destination.
 * Adds ~800 words of unique, SEO-rich content to the homepage.
 * Targets "weed madrid", "cannabis tourism madrid", "why madrid cannabis" queries.
 */
const WhyMadridSection = () => {
  const { language } = useLanguage();
  const isSpanish = language === "es";

  const content = isSpanish ? {
    heading: "Por Qué Madrid Es el Destino Cannabis Número 1 en Europa",
    intro: "Madrid se ha consolidado como uno de los destinos más populares de Europa para el turismo cannábico, gracias a su marco legal único, su vibrante cultura y su red de clubs sociales de cannabis bien establecidos. A diferencia de Ámsterdam, donde los coffeeshops enfrentan restricciones crecientes, las asociaciones cannábicas de Madrid ofrecen un modelo más sostenible y privado para el consumo responsable de cannabis.",
    points: [
      {
        icon: Shield,
        title: "Marco Legal Claro",
        text: "España despenalizó el consumo privado de cannabis, creando un marco legal que permite a las asociaciones cannábicas operar como clubs privados de membresía. El Tribunal Supremo ha respaldado repetidamente la doctrina del 'consumo compartido', proporcionando seguridad jurídica tanto para los clubs como para sus miembros. Esto significa que puedes consumir cannabis legalmente dentro de un club registrado sin riesgo legal."
      },
      {
        icon: Users,
        title: "Comunidad y Cultura",
        text: "Los clubs de cannabis en Madrid no son simples dispensarios: son espacios sociales donde los miembros comparten experiencias, asisten a eventos y forman comunidad. Desde noches de música en vivo hasta talleres educativos sobre cultivo, estos clubs ofrecen una experiencia cultural rica que va más allá del simple consumo. Muchos clubs también organizan actividades solidarias y colaboran con la comunidad local."
      },
      {
        icon: Leaf,
        title: "Calidad Garantizada",
        text: "Los clubs de cannabis verificados en Madrid mantienen estándares estrictos de calidad. El cannabis se cultiva colectivamente por los miembros bajo condiciones controladas, garantizando productos libres de pesticidas y contaminantes. Muchos clubs ofrecen análisis de laboratorio de sus variedades, proporcionando transparencia total sobre niveles de THC, CBD y terpenos. Esta supervisión de calidad es algo que no encontrarás comprando en la calle."
      },
      {
        icon: Globe,
        title: "Accesible para Turistas",
        text: "A diferencia de otros destinos europeos que restringen el acceso a residentes locales, Madrid da la bienvenida a visitantes internacionales en sus clubs de cannabis. Los clubs orientados a turistas ofrecen personal multilingüe (inglés, francés, alemán, italiano), procesos de membresía simplificados e invitaciones que se procesan en 24-48 horas. Con conexiones de vuelo directas desde toda Europa, Madrid es fácilmente accesible para una escapada de fin de semana."
      },
      {
        icon: MapPin,
        title: "Ubicaciones Céntricas",
        text: "Los clubs de cannabis de Madrid están ubicados estratégicamente en los barrios más populares de la ciudad: Malasaña, Centro, Chamberí, Chueca y más. Esto significa que puedes combinar tu visita al club con las atracciones turísticas, la gastronomía y la vida nocturna que hacen de Madrid uno de los destinos más visitados de Europa. La red de metro conecta todos los barrios, facilitando el desplazamiento."
      },
      {
        icon: Clock,
        title: "Proceso Rápido y Seguro",
        text: "Obtener tu invitación a un club de cannabis en Madrid es un proceso sencillo y seguro. A través de nuestra plataforma verificada, puedes solicitar una invitación online, recibir confirmación en 24-48 horas y visitar el club con tu DNI o pasaporte. No hay intermediarios dudosos ni transacciones en la calle: todo se gestiona de forma profesional y transparente."
      }
    ],
    closing: "Madrid combina lo mejor de ambos mundos: un entorno legal seguro para el consumo de cannabis y una de las ciudades más vibrantes y acogedoras de Europa. Ya seas un viajero experimentado en turismo cannábico o un principiante curioso, los clubs sociales de cannabis de Madrid ofrecen una experiencia única que no encontrarás en ningún otro lugar."
  } : {
    heading: "Why Madrid Is Europe's #1 Cannabis Club Destination",
    intro: "Madrid has emerged as one of Europe's most popular destinations for cannabis tourism, thanks to its unique legal framework, vibrant culture, and well-established network of cannabis social clubs. Unlike Amsterdam, where coffeeshops face increasing restrictions, Madrid's cannabis associations offer a more sustainable and private model for responsible cannabis consumption.",
    points: [
      {
        icon: Shield,
        title: "Clear Legal Framework",
        text: "Spain decriminalized private cannabis consumption, creating a legal framework that allows cannabis associations to operate as private membership clubs. The Supreme Court has repeatedly upheld the 'shared consumption' doctrine, providing legal certainty for both clubs and their members. This means you can legally consume cannabis inside a registered club without legal risk."
      },
      {
        icon: Users,
        title: "Community & Culture",
        text: "Cannabis clubs in Madrid aren't just dispensaries — they're social spaces where members share experiences, attend events, and build community. From live music nights to educational workshops on cultivation, these clubs offer a rich cultural experience that goes beyond simple consumption. Many clubs also organize charitable activities and collaborate with the local community."
      },
      {
        icon: Leaf,
        title: "Guaranteed Quality",
        text: "Verified cannabis clubs in Madrid maintain strict quality standards. Cannabis is collectively grown by members under controlled conditions, ensuring products free from pesticides and contaminants. Many clubs offer laboratory analysis of their strains, providing full transparency on THC, CBD, and terpene levels. This quality oversight is something you won't find buying on the street."
      },
      {
        icon: Globe,
        title: "Tourist Accessible",
        text: "Unlike other European destinations that restrict access to local residents, Madrid welcomes international visitors to its cannabis clubs. Tourist-friendly clubs offer multilingual staff (English, French, German, Italian), streamlined membership processes, and invitations processed within 24-48 hours. With direct flight connections from across Europe, Madrid is easily accessible for a weekend getaway."
      },
      {
        icon: MapPin,
        title: "Central Locations",
        text: "Madrid's cannabis clubs are strategically located in the city's most popular neighborhoods: Malasaña, Centro, Chamberí, Chueca, and beyond. This means you can combine your club visit with the tourist attractions, gastronomy, and nightlife that make Madrid one of Europe's most visited cities. The metro network connects all neighborhoods, making getting around easy."
      },
      {
        icon: Clock,
        title: "Fast & Safe Process",
        text: "Getting your invitation to a cannabis club in Madrid is a straightforward and safe process. Through our verified platform, you can request an invitation online, receive confirmation within 24-48 hours, and visit the club with your ID or passport. No shady middlemen or street transactions — everything is managed professionally and transparently."
      }
    ],
    closing: "Madrid combines the best of both worlds: a safe legal environment for cannabis consumption and one of Europe's most vibrant and welcoming cities. Whether you're an experienced cannabis tourism traveler or a curious first-timer, Madrid's cannabis social clubs offer a unique experience you won't find anywhere else."
  };

  return (
    <section className="py-16 md:py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gradient-gold text-center">
            {content.heading}
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 text-center max-w-4xl mx-auto">
            {content.intro}
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {content.points.map((point, i) => {
              const Icon = point.icon;
              return (
                <div
                  key={i}
                  className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {point.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {point.text}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto mb-8">
            {content.closing}
          </p>

          <div className="text-center">
            <Link
              to={buildLanguageAwarePath(
                isSpanish ? "/club-cannabis-madrid" : "/cannabis-club-madrid",
                language
              )}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-lg underline underline-offset-4 transition-colors"
            >
              {isSpanish ? "Lee Nuestra Guía Completa de Cannabis Clubs" : "Read Our Complete Cannabis Club Guide"} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMadridSection;
