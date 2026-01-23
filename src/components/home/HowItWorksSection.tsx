import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { Search, FileText, Mail, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * HowItWorksSection - Single consolidated 4-step process
 * 
 * Per PRD: MAX 4 steps, no duplicate flows.
 * Replaces both old 3-step and FiveStepProcess.
 */
const HowItWorksSection = () => {
  const { language, t } = useLanguage();

  const steps = [
    {
      number: 1,
      icon: Search,
      title: t("home.howitworks.step1.title"),
      desc: t("home.howitworks.step1.desc"),
    },
    {
      number: 2,
      icon: FileText,
      title: t("home.howitworks.step2.title"),
      desc: t("home.howitworks.step2.desc"),
    },
    {
      number: 3,
      icon: Mail,
      title: t("home.howitworks.step3.title"),
      desc: t("home.howitworks.step3.desc"),
    },
    {
      number: 4,
      icon: PartyPopper,
      title: t("home.howitworks.step4.title"),
      desc: t("home.howitworks.step4.desc"),
    },
  ];

  return (
    <section className="relative py-16 md:py-20 bg-black overflow-hidden" id="how-it-works">
      {/* Subtle gold pattern background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212, 175, 55, 0.3) 35px, rgba(212, 175, 55, 0.3) 36px)',
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16 px-4">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-gradient-gold">
            {t("home.howitworks.title")}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-luxury">
            {t("home.howitworks.subtitle")}
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto mb-8 md:mb-12">
          {/* Connecting lines between steps (hidden on mobile) */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step) => (
              <div key={step.number} className="card-snoop relative overflow-hidden rounded-2xl p-6">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-weed-gold-dark flex items-center justify-center text-2xl md:text-3xl font-bold text-black shadow-gold-intense z-10">
                  {step.number}
                </div>
                <div className="pt-16 md:pt-20 text-center">
                  <step.icon className="w-12 h-12 md:w-14 md:h-14 text-primary mb-4 mx-auto" strokeWidth={1.5} />
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center px-4">
          <Button asChild size="lg" variant="gold" className="text-base md:text-lg px-8 md:px-10 py-6 h-auto shadow-gold-intense hover:shadow-gold-intense hover:scale-105 w-full sm:w-auto">
            <Link to={buildLanguageAwarePath("/clubs", language)}>
              <Mail className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              {t("home.cta.invitation")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
