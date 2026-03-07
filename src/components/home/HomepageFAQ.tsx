import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * HomepageFAQ - SEO-driven FAQ section
 * 
 * Uses the mandatory questions from PRD for featured snippet eligibility.
 * Structured for FAQPage schema.
 */
const HomepageFAQ = () => {
  const { language, t } = useLanguage();

  const faqs = [
    {
      question: t("home.faq.seo.q1"),
      answer: t("home.faq.seo.a1"),
    },
    {
      question: t("home.faq.seo.q2"),
      answer: t("home.faq.seo.a2"),
    },
    {
      question: t("home.faq.seo.q3"),
      answer: t("home.faq.seo.a3"),
    },
    {
      question: t("home.faq.seo.q4"),
      answer: t("home.faq.seo.a4"),
    },
    {
      question: t("home.faq.seo.q5"),
      answer: t("home.faq.seo.a5"),
    },
    {
      question: t("home.faq.seo.q6"),
      answer: t("home.faq.seo.a6"),
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/30" id="faq">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{t("home.faq.title")}</h2>
            <p className="text-muted-foreground">{t("home.faq.subtitle")}</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="card-snoop rounded-xl border-0 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5" data-answer="true">
                  {faq.answer}
                  {index === 0 && (
                    <Link to={buildLanguageAwarePath("/clubs", language)} className="block mt-3 text-primary hover:underline font-medium text-sm">
                      → {t("nav.clubs")}
                    </Link>
                  )}
                  {index === 3 && (
                    <Link to={buildLanguageAwarePath("/clubs", language)} className="block mt-3 text-primary hover:underline font-medium text-sm">
                      → {t("nav.clubs")}
                    </Link>
                  )}
                  {index === 5 && (
                    <Link to={buildLanguageAwarePath("/guide/how-to-join-a-cannabis-club-in-madrid", language)} className="block mt-3 text-primary hover:underline font-medium text-sm">
                      → {t("guides.cards.howtojoin.title") || "How to Join a Cannabis Club"}
                    </Link>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <Link 
              to={buildLanguageAwarePath("/faq", language)}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("home.faq.viewall")} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageFAQ;
