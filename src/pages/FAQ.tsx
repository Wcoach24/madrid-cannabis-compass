import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema, generateFAQPageSchema, generateSpeakableSchema } from "@/lib/schemaUtils";

const FAQ_CATEGORIES = ["basics", "membership", "law", "safety", "medical"] as const;

const FAQ_STRUCTURE = {
  basics: ["q1", "q2", "q3", "q4"],
  membership: ["q1", "q2", "q3", "q4"],
  law: ["q1", "q2", "q3", "q4"],
  safety: ["q1", "q2", "q3"],
  medical: ["q1", "q2", "q3"],
} as const;

const FAQ = () => {
  const { language, t } = useLanguage();

  // Build FAQ data from translations
  const faqData = FAQ_CATEGORIES.map(category => ({
    category,
    categoryName: t(`faq.category.${category}`),
    questions: FAQ_STRUCTURE[category].map(qKey => ({
      question: t(`faq.${category}.${qKey}`),
      answer: t(`faq.${category}.${qKey.replace('q', 'a')}`),
    })),
  }));

  // Flatten for schema
  const allFaqs = faqData.flatMap(cat => cat.questions);

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/faq");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "FAQ", url: `${BASE_URL}/faq` }
  ]);

  const faqSchema = generateFAQPageSchema(allFaqs);
  const speakableSchema = generateSpeakableSchema(
    `${BASE_URL}${buildLanguageAwarePath("/faq", language)}`,
    ["h1", "h2", ".accordion-content p"]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("faq.title") + " | Madrid Cannabis Clubs"}
        description={t("faq.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/faq", language)}`}
        keywords="cannabis club faq, madrid cannabis questions, join cannabis club, cannabis legal spain"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US", "de_DE", "fr_FR"] : language === "de" ? ["en_US", "es_ES", "fr_FR"] : language === "fr" ? ["en_US", "es_ES", "de_DE"] : ["es_ES", "de_DE", "fr_FR"]}
        structuredData={[breadcrumbSchema, faqSchema, speakableSchema]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <HelpCircle className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("faq.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("faq.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {faqData.map(({ category, categoryName, questions }) => (
                  <div key={category} id={category} className="scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>
                    <Accordion type="single" collapsible className="space-y-4">
                      {questions.map((faq, index) => (
                        <AccordionItem 
                          key={`${category}-${index}`} 
                          value={`${category}-${index}`}
                          className="bg-card border border-border rounded-lg px-6"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="text-lg font-medium pr-4">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                            <p>{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{t("faq.contact.title")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("faq.contact.desc")}
              </p>
              <Button asChild size="lg">
                <Link to={buildLanguageAwarePath("/contact", language)}>
                  {t("faq.contact.button")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
