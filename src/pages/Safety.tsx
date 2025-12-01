import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { Shield, Heart, AlertTriangle, Phone, Brain, Users } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema, generateFAQPageSchema, generateArticleSchema } from "@/lib/schemaUtils";

const Safety = () => {
  const { language, t } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/safety");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Safety", url: `${BASE_URL}/safety` }
  ]);

  const articleSchema = generateArticleSchema({
    headline: t("safety.title"),
    description: t("safety.subtitle"),
    author: "Weed Madrid",
    publishedDate: "2024-01-01",
    modifiedDate: new Date().toISOString(),
    url: `${BASE_URL}${buildLanguageAwarePath("/safety", language)}`,
    language
  });

  const faqs = [
    {
      question: t("safety.faq.q1"),
      answer: t("safety.faq.a1")
    },
    {
      question: t("safety.faq.q2"),
      answer: t("safety.faq.a2")
    },
    {
      question: t("safety.faq.q3"),
      answer: t("safety.faq.a3")
    },
    {
      question: t("safety.faq.q4"),
      answer: t("safety.faq.a4")
    },
    {
      question: t("safety.faq.q5"),
      answer: t("safety.faq.a5")
    }
  ];

  const faqSchema = generateFAQPageSchema(faqs);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, articleSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("safety.title") + " | Madrid Cannabis Clubs"}
        description={t("safety.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/safety", language)}`}
        keywords="cannabis safety, responsible consumption, harm reduction, cannabis health risks, safe cannabis use"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={combinedSchema}
        speakableSelectors={["h1", "h2", ".safety-section"]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
              <Shield className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("safety.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("safety.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Responsible Consumption */}
              <div className="safety-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  {t("safety.responsible.title")}
                </h2>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("safety.responsible.intro")}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.responsible.point1")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.responsible.point2")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.responsible.point3")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.responsible.point4")}</p>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Health Considerations */}
              <div className="safety-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-primary" />
                  {t("safety.health.title")}
                </h2>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("safety.health.intro")}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">{t("safety.health.respiratory.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("safety.health.respiratory.desc")}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">{t("safety.health.mental.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("safety.health.mental.desc")}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">{t("safety.health.cardiovascular.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("safety.health.cardiovascular.desc")}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">{t("safety.health.interactions.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("safety.health.interactions.desc")}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* First-Time Visitors */}
              <div className="safety-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Brain className="w-8 h-8 text-primary" />
                  {t("safety.firsttime.title")}
                </h2>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("safety.firsttime.intro")}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.firsttime.point1")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.firsttime.point2")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.firsttime.point3")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("safety.firsttime.point4")}</p>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Emergency Information */}
              <div className="safety-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-primary" />
                  {t("safety.emergency.title")}
                </h2>
                <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("safety.emergency.intro")}
                  </p>
                  <div className="bg-card p-4 rounded-lg border-l-4 border-primary">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold text-lg">{t("safety.emergency.numbers.title")}</h3>
                    </div>
                    <ul className="space-y-2 ml-9">
                      <li className="text-muted-foreground">
                        <strong>112</strong> - {t("safety.emergency.numbers.general")}
                      </li>
                      <li className="text-muted-foreground">
                        <strong>061</strong> - {t("safety.emergency.numbers.medical")}
                      </li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("safety.emergency.advice")}
                  </p>
                </Card>
              </div>

              {/* FAQ Section */}
              <div className="safety-section">
                <h2 className="text-3xl font-bold mb-6">{t("safety.faq.title")}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-lg font-medium pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <p className="leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{t("safety.cta.title")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("safety.cta.desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {t("safety.cta.button.clubs")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to={buildLanguageAwarePath("/how-it-works", language)}>
                    {t("safety.cta.button.process")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Safety;
