import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { Scale, Shield, FileText, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema, generateFAQPageSchema, generateArticleSchema } from "@/lib/schemaUtils";

const Legal = () => {
  const { language, t } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/legal");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Legal", url: `${BASE_URL}/legal` }
  ]);

  const articleSchema = generateArticleSchema({
    headline: t("legal.title"),
    description: t("legal.subtitle"),
    author: "Weed Madrid",
    publishedDate: "2024-01-01",
    modifiedDate: new Date().toISOString(),
    url: `${BASE_URL}${buildLanguageAwarePath("/legal", language)}`,
    language
  });

  const faqs = [
    {
      question: t("legal.faq.q1"),
      answer: t("legal.faq.a1")
    },
    {
      question: t("legal.faq.q2"),
      answer: t("legal.faq.a2")
    },
    {
      question: t("legal.faq.q3"),
      answer: t("legal.faq.a3")
    },
    {
      question: t("legal.faq.q4"),
      answer: t("legal.faq.a4")
    },
    {
      question: t("legal.faq.q5"),
      answer: t("legal.faq.a5")
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
        title={t("legal.title") + " | Madrid Cannabis Clubs"}
        description={t("legal.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/legal", language)}`}
        keywords="cannabis law spain, spanish cannabis legislation, private associations, jurisprudence, cannabis legal madrid"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={combinedSchema}
        speakableSelectors={["h1", "h2", ".legal-section"]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
              <Scale className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("legal.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("legal.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Legal Framework */}
              <div className="legal-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  {t("legal.framework.title")}
                </h2>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.framework.p1")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.framework.p2")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.framework.p3")}
                  </p>
                </Card>
              </div>

              {/* Jurisprudence */}
              <div className="legal-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Scale className="w-8 h-8 text-primary" />
                  {t("legal.jurisprudence.title")}
                </h2>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.jurisprudence.p1")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.jurisprudence.p2")}
                  </p>
                </Card>
              </div>

              {/* Privacy Protection */}
              <div className="legal-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  {t("legal.privacy.title")}
                </h2>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.privacy.p1")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.privacy.p2")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("legal.privacy.p3")}
                  </p>
                </Card>
              </div>

              {/* Transparency Statement */}
              <div className="legal-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-primary" />
                  {t("legal.transparency.title")}
                </h2>
                <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("legal.transparency.point1")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("legal.transparency.point2")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("legal.transparency.point3")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("legal.transparency.point4")}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="text-muted-foreground">{t("legal.transparency.point5")}</p>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* FAQ Section */}
              <div className="legal-section">
                <h2 className="text-3xl font-bold mb-6">{t("legal.faq.title")}</h2>
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
              <h2 className="text-3xl font-bold mb-4">{t("legal.cta.title")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("legal.cta.desc")}
              </p>
              <Button asChild size="lg">
                <Link to={buildLanguageAwarePath("/clubs", language)}>
                  {t("legal.cta.button")}
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

export default Legal;
