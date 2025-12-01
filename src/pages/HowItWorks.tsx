import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { CheckCircle, Mail, UserCheck, Clock, Shield, FileCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";

const HowItWorks = () => {
  const { language, t } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/how-it-works");

  const steps = [
    {
      number: 1,
      icon: <UserCheck className="w-12 h-12 text-primary" />,
      title: t("howitworks.step1.title"),
      description: t("howitworks.step1.desc"),
      details: t("howitworks.step1.details")
    },
    {
      number: 2,
      icon: <FileCheck className="w-12 h-12 text-primary" />,
      title: t("howitworks.step2.title"),
      description: t("howitworks.step2.desc"),
      details: t("howitworks.step2.details")
    },
    {
      number: 3,
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: t("howitworks.step3.title"),
      description: t("howitworks.step3.desc"),
      details: t("howitworks.step3.details")
    },
    {
      number: 4,
      icon: <Mail className="w-12 h-12 text-primary" />,
      title: t("howitworks.step4.title"),
      description: t("howitworks.step4.desc"),
      details: t("howitworks.step4.details")
    },
    {
      number: 5,
      icon: <CheckCircle className="w-12 h-12 text-primary" />,
      title: t("howitworks.step5.title"),
      description: t("howitworks.step5.desc"),
      details: t("howitworks.step5.details")
    }
  ];

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": t("howitworks.title"),
    "description": t("howitworks.subtitle"),
    "inLanguage": language,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "itemListElement": {
        "@type": "HowToDirection",
        "text": step.details
      }
    }))
  };

  const faqs = [
    {
      question: t("howitworks.faq.q1"),
      answer: t("howitworks.faq.a1")
    },
    {
      question: t("howitworks.faq.q2"),
      answer: t("howitworks.faq.a2")
    },
    {
      question: t("howitworks.faq.q3"),
      answer: t("howitworks.faq.a3")
    },
    {
      question: t("howitworks.faq.q4"),
      answer: t("howitworks.faq.a4")
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": language,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [howToSchema, faqSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("howitworks.title") + " | Madrid Cannabis Clubs"}
        description={t("howitworks.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/how-it-works", language)}`}
        keywords="how to join cannabis club, cannabis invitation process, visit cannabis club madrid, membership requirements"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        ogLocaleAlternate={["en_US", "es_ES", "de_DE", "fr_FR"].filter(l => l !== (language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"))}
        structuredData={combinedSchema}
        speakableSelectors={["h1", "h2", ".step-title"]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
              <CheckCircle className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("howitworks.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("howitworks.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {steps.map((step, index) => (
                <Card key={step.number} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-bold text-primary">{step.number}</span>
                        <h2 className="text-2xl font-bold step-title">{step.title}</h2>
                      </div>
                      <p className="text-lg text-muted-foreground mb-3">{step.description}</p>
                      <p className="text-muted-foreground leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("howitworks.requirements.title")}</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("howitworks.requirements.age")}</h3>
                  <p className="text-sm text-muted-foreground">{t("howitworks.requirements.age.desc")}</p>
                </Card>
                <Card className="p-6 text-center">
                  <FileCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("howitworks.requirements.id")}</h3>
                  <p className="text-sm text-muted-foreground">{t("howitworks.requirements.id.desc")}</p>
                </Card>
                <Card className="p-6 text-center">
                  <UserCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("howitworks.requirements.invitation")}</h3>
                  <p className="text-sm text-muted-foreground">{t("howitworks.requirements.invitation.desc")}</p>
                </Card>
              </div>

              <h2 className="text-3xl font-bold mb-6">{t("howitworks.faq.title")}</h2>
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
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{t("howitworks.cta.title")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("howitworks.cta.desc")}
              </p>
              <Button asChild size="lg">
                <Link to={buildLanguageAwarePath("/clubs", language)}>
                  {t("howitworks.cta.button")}
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

export default HowItWorks;
