import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { Shield, CheckCircle } from "lucide-react";

/**
 * SafetyTipsSection - Safety guidelines for users
 * 
 * Reinforces responsible use messaging and builds trust.
 */
const SafetyTipsSection = () => {
  const { language, t } = useLanguage();

  const safetyTips = [
    t("home.safety.tip1"),
    t("home.safety.tip2"),
    t("home.safety.tip3"),
    t("home.safety.tip4"),
  ];

  return (
    <section className="py-12 md:py-16 bg-background" id="safety-tips">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {t("home.safety.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {safetyTips.map((tip, index) => (
              <div key={index} className="card-snoop p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              </div>
            ))}
          </div>

          <Link 
            to={buildLanguageAwarePath("/safety", language)}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("home.safety.cta")} →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SafetyTipsSection;
