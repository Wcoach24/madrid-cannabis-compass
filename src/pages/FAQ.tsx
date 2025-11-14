import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
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

    if (data) {
      setFaqs(data);
      
      // Add FAQ schema.org JSON-LD
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer_markdown
          }
        }))
      };
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(faqSchema);
      document.head.appendChild(script);
    }
    
    setLoading(false);
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/faq");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("faq.title") + " | Madrid Cannabis Clubs"}
        description={t("faq.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/faq", language)}`}
        keywords="cannabis club faq, madrid cannabis questions, join cannabis club, cannabis legal spain"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
      />
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
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

        {/* FAQ Content */}
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
                      <AccordionTrigger className="text-left hover:no-underline py-6">
                        <span className="text-lg font-semibold pr-4">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                        {faq.answer_markdown}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {/* Additional Info */}
              <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Can't find the answer you're looking for? Feel free to reach out to us.
                </p>
                <a 
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
