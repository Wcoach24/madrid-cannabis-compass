import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { ShieldAlert, XCircle, CheckCircle } from "lucide-react";

/**
 * AvoidScamsSection - Trust Signal Component (PRD Required)
 * 
 * Builds E-E-A-T by warning users about common scams
 * and linking to detailed scam prevention page.
 */
const AvoidScamsSection = () => {
  const { language, t } = useLanguage();

  const warnings = [
    t("home.scams.warning1"),
    t("home.scams.warning2"),
    t("home.scams.warning3"),
    t("home.scams.warning4"),
  ];

  return (
    <section className="py-12 md:py-16 bg-destructive/5" id="avoid-scams">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              {t("home.scams.title")}
            </h2>
          </div>

          <ul className="space-y-3 mb-6">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{warning}</span>
              </li>
            ))}
          </ul>

          <div className="card-snoop p-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <p className="text-muted-foreground">{t("home.scams.safe")}</p>
            </div>
          </div>

          <Link 
            to={buildLanguageAwarePath("/safety/scams", language)}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("home.scams.cta")} →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AvoidScamsSection;
