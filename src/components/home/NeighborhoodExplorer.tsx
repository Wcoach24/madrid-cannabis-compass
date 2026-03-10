import { Link } from "react-router-dom";
import { MapPin, Train, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { NEIGHBORHOODS, NEIGHBORHOOD_SLUGS } from "@/data/neighborhoodContent";

/**
 * NeighborhoodExplorer — Homepage section linking to all neighborhood pages.
 * Massive internal linking boost + adds ~600 words of unique content.
 * ZERO Supabase dependency.
 */
const NeighborhoodExplorer = () => {
  const { language } = useLanguage();

  const introText = language === "es"
    ? "Madrid tiene una escena diversa de clubs de cannabis distribuida por toda la ciudad. Cada barrio ofrece una experiencia diferente, desde la cultura bohemia de Malasaña hasta la elegancia de Chamberí. Explora los barrios a continuación para encontrar clubs cerca de las zonas que más te interesan."
    : "Madrid's cannabis club scene is spread across the city's diverse neighborhoods, each offering a unique vibe and experience. From the bohemian streets of Malasaña to the elegant avenues of Chamberí, every district has its own character. Explore the neighborhoods below to find cannabis clubs near the areas you're most interested in visiting.";

  const headingText = language === "es"
    ? "Cannabis Clubs por Barrio en Madrid"
    : "Cannabis Clubs by Neighborhood in Madrid";

  const subText = language === "es"
    ? "Encuentra clubs sociales de cannabis en tu barrio favorito de Madrid"
    : "Find cannabis social clubs in your favorite Madrid neighborhood";

  return (
    <section className="py-16 md:py-20 bg-background" id="neighborhoods">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-gradient-gold">
            {headingText}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {subText}
          </p>
        </div>

        <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-10 text-center text-base md:text-lg">
          {introText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {NEIGHBORHOOD_SLUGS.map((slug) => {
            const n = NEIGHBORHOODS[slug];
            if (!n) return null;
            return (
              <Link
                key={slug}
                to={buildLanguageAwarePath(`/weed-${slug}-madrid`, language)}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/50 p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {n.nameWithAccent}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "es" ? "Cannabis clubs y más" : "Cannabis clubs & more"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {n.metroStations.slice(0, 3).map((station) => (
                    <span
                      key={station}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"
                    >
                      <Train className="w-3 h-3" />
                      {station}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {n.intro.substring(0, 120)}...
                </p>

                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  {language === "es" ? "Explorar barrio" : "Explore neighborhood"}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NeighborhoodExplorer;
