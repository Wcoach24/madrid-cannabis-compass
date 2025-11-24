import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import ReactMarkdown from "react-markdown";

const FAQ = () => {
  const { language, t } = useLanguage();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, [language]);

  const fetchFAQs = async () => {
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .eq("language", language)
      .order("priority", { ascending: true });

    if (error) {
      console.error("Error fetching FAQs:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setFaqs(data);
    }
    
    setLoading(false);
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/faq");

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": language,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer_markdown
      }
    }))
  } : null;

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={t("faq.title") + " | Madrid Cannabis Clubs"}
        description={t("faq.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/faq", language)}`}
        keywords="cannabis club faq, madrid cannabis questions, join cannabis club, cannabis legal spain"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={faqSchema}
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
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("faq.loading")}</p>
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("faq.nofound")}</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-${index}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-lg font-medium pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                        <ReactMarkdown>{faq.answer_markdown}</ReactMarkdown>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
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
