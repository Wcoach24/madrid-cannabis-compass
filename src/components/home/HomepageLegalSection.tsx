import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { Scale, AlertTriangle, Building2, Users } from "lucide-react";

/**
 * HomepageLegalSection - SEO-critical legal context section
 * 
 * Provides 300-400 words of legal clarity for "weed madrid" keyword.
 * Designed to establish E-E-A-T and answer user intent about legality.
 */
const HomepageLegalSection = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-12 md:py-16 bg-muted/30" id="legal-context">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              {t("home.legal.title")}
            </h2>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6" data-speakable="true">
              {t("home.legal.p1")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card-snoop p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t("home.legal.private.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("home.legal.private.text")}</p>
                  </div>
                </div>
              </div>
              <div className="card-snoop p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t("home.legal.public.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("home.legal.public.text")}</p>
                  </div>
                </div>
              </div>
              <div className="card-snoop p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t("home.legal.clubs.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("home.legal.clubs.text")}</p>
                  </div>
                </div>
              </div>
              <div className="card-snoop p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Scale className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t("home.legal.tourists.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("home.legal.tourists.text")}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("home.legal.p2")}
            </p>

            <Link 
              to={buildLanguageAwarePath(language === "es" ? "/guide/leyes-cannabis-espana-2025" : "/guide/cannabis-laws-spain-2025", language)}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("home.legal.cta")} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageLegalSection;
