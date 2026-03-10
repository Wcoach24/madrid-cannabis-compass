import { Link } from "react-router-dom";
import { Plane, CreditCard, AlertTriangle, Clock, Utensils, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";

/**
 * CannabisTourismGuide — Practical tips for cannabis tourists visiting Madrid.
 * Adds ~700 words of unique content targeting "cannabis tourism madrid" queries.
 */
const CannabisTourismGuide = () => {
  const { language } = useLanguage();
  const isSpanish = language === "es";

  const content = isSpanish ? {
    heading: "Guía Práctica para el Turismo Cannábico en Madrid",
    subtitle: "Todo lo que necesitas saber antes de visitar un club de cannabis en Madrid",
    tips: [
      {
        icon: Plane,
        title: "Antes de Llegar",
        text: "Solicita tu invitación a un club de cannabis al menos 48 horas antes de tu llegada a Madrid. Esto te da tiempo para recibir la confirmación y planificar tu visita. Los vuelos directos desde las principales ciudades europeas llegan al aeropuerto de Barajas, conectado al centro por metro en 30 minutos. Trae tu pasaporte o DNI en vigor: es obligatorio para el registro en el club."
      },
      {
        icon: CreditCard,
        title: "Presupuesto y Pagos",
        text: "La cuota de membresía inicial oscila entre 20-50€ según el club. La contribución por cannabis va de 8-15€ por gramo, con opciones premium disponibles. La mayoría de clubs solo aceptan efectivo por privacidad, así que retira dinero de un cajero antes de tu visita. No necesitas gastar una fortuna: un presupuesto de 50-80€ cubre la membresía más una primera visita cómoda."
      },
      {
        icon: Clock,
        title: "Horarios y Mejores Momentos",
        text: "Los clubs de cannabis en Madrid suelen abrir de 12:00 a 00:00, aunque los horarios varían. Las tardes entre semana (16:00-19:00) son ideales para visitantes primerizos: hay menos gente y el personal tiene más tiempo para orientarte. Los fines de semana por la noche pueden ser más animados con eventos sociales y música. Consulta los horarios específicos de cada club en nuestra guía antes de ir."
      },
      {
        icon: AlertTriangle,
        title: "Evita Estafas en la Calle",
        text: "Nunca compres cannabis a vendedores callejeros en Madrid. Además de ser ilegal, los productos suelen estar adulterados con sustancias peligrosas. Los 'gancho' o intermediarios que ofrecen marihuana cerca de zonas turísticas como Sol o Gran Vía son estafadores conocidos. Usa solo clubs verificados con membresía formal. Si alguien te aborda en la calle ofreciendo hierba, ignóralo y reporta el incidente."
      },
      {
        icon: Languages,
        title: "Barrera Idiomática",
        text: "No necesitas hablar español para disfrutar de los clubs de cannabis en Madrid. Los clubs orientados a turistas tienen personal que habla inglés, y muchos también ofrecen atención en francés, alemán e italiano. Nuestra plataforma gestiona todo el proceso de invitación en tu idioma. Dicho esto, aprender algunas palabras básicas en español siempre es apreciado por el personal local."
      },
      {
        icon: Utensils,
        title: "Combina con la Cultura Madrileña",
        text: "Madrid es mucho más que clubs de cannabis. Aprovecha tu visita para explorar el Museo del Prado, pasear por el Retiro, disfrutar de la gastronomía en Malasaña o ver un atardecer desde el Templo de Debod. Los mejores barrios para clubs de cannabis — Malasaña, Chueca, Centro — también son los más vibrantes culturalmente. Planifica tu día combinando cultura, gastronomía y tu visita al club."
      }
    ]
  } : {
    heading: "Practical Cannabis Tourism Guide for Madrid",
    subtitle: "Everything you need to know before visiting a cannabis club in Madrid",
    tips: [
      {
        icon: Plane,
        title: "Before You Arrive",
        text: "Request your cannabis club invitation at least 48 hours before arriving in Madrid. This gives you time to receive confirmation and plan your visit. Direct flights from major European cities arrive at Barajas Airport, connected to the city center by metro in 30 minutes. Bring your valid passport or national ID card — it's required for club registration."
      },
      {
        icon: CreditCard,
        title: "Budget & Payments",
        text: "Initial membership fees range from €20-50 depending on the club. Cannabis contributions run €8-15 per gram, with premium options available. Most clubs accept cash only for privacy, so withdraw from an ATM before your visit. You don't need to spend a fortune — a budget of €50-80 covers membership plus a comfortable first visit."
      },
      {
        icon: Clock,
        title: "Timing & Best Hours",
        text: "Cannabis clubs in Madrid typically open from 12:00 to 00:00, though hours vary. Weekday afternoons (4:00-7:00 PM) are ideal for first-time visitors — fewer crowds and staff have more time to orient you. Weekend evenings can be livelier with social events and music. Check specific club hours in our guide before going."
      },
      {
        icon: AlertTriangle,
        title: "Avoid Street Scams",
        text: "Never buy cannabis from street sellers in Madrid. Besides being illegal, products are often adulterated with dangerous substances. The 'gancho' or middlemen offering weed near tourist areas like Sol or Gran Vía are known scammers. Use only verified clubs with formal membership. If someone approaches you on the street offering weed, ignore them and report the incident."
      },
      {
        icon: Languages,
        title: "Language Barrier",
        text: "You don't need to speak Spanish to enjoy cannabis clubs in Madrid. Tourist-oriented clubs have English-speaking staff, and many also offer service in French, German, and Italian. Our platform handles the entire invitation process in your language. That said, learning a few basic Spanish words is always appreciated by local staff."
      },
      {
        icon: Utensils,
        title: "Combine with Madrid's Culture",
        text: "Madrid is much more than cannabis clubs. Use your visit to explore the Prado Museum, stroll through Retiro Park, enjoy the gastronomy in Malasaña, or watch a sunset from the Temple of Debod. The best neighborhoods for cannabis clubs — Malasaña, Chueca, Centro — are also the most culturally vibrant. Plan your day combining culture, food, and your club visit."
      }
    ]
  };

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-foreground text-center">
            {content.heading}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            {content.subtitle}
          </p>

          <div className="space-y-6">
            {content.tips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div
                  key={i}
                  className="flex gap-4 md:gap-6 p-5 md:p-6 bg-card border border-border/50 rounded-xl"
                >
                  <div className="p-3 rounded-xl bg-primary/10 h-fit shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {tip.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to={buildLanguageAwarePath("/safety/scams", language)}
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
            >
              {isSpanish ? "Lee nuestra guía completa para evitar estafas" : "Read our complete scam avoidance guide"} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CannabisTourismGuide;
