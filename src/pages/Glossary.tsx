import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

interface GlossaryTerm {
  term: string;
  definition: string;
  relatedTerms?: string[];
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Cannabis Social Club (CSC)",
    definition: "A private, non-profit association where adult members can consume cannabis in a tolerated, private environment in Spain. Clubs operate under Spanish constitutional rights to private association and personal consumption. Members must be invited, and walk-in access is prohibited.",
    relatedTerms: ["Private Association", "Membership Fee", "Invitation System"]
  },
  {
    term: "Decriminalization",
    definition: "A legal status where personal use of cannabis is not criminally prosecuted, though it may still be administratively regulated. In Spain, personal consumption in private spaces is decriminalized, while public consumption and sale remain illegal.",
    relatedTerms: ["Legal Grey Area", "Spanish Cannabis Law"]
  },
  {
    term: "Private Association",
    definition: "A legal entity under Spanish law (Article 22 of the Constitution) allowing groups to form for shared purposes. Cannabis social clubs operate as private associations, enabling collective cultivation and consumption for members only.",
    relatedTerms: ["Cannabis Social Club (CSC)", "Non-Profit Organization"]
  },
  {
    term: "Membership Fee",
    definition: "An annual fee (typically €20-50) paid to cannabis clubs covering operational costs and member privileges. This fee supports the club's non-profit operations and is separate from product costs.",
    relatedTerms: ["Cannabis Social Club (CSC)", "Invitation System"]
  },
  {
    term: "Invitation System",
    definition: "The required process where new members must be invited by existing members or use a facilitation service like Weed Madrid. This system maintains the private, non-commercial nature of cannabis clubs and ensures legal compliance.",
    relatedTerms: ["Cannabis Social Club (CSC)", "Private Association"]
  },
  {
    term: "Legal Grey Area",
    definition: "The ambiguous legal status of cannabis social clubs in Spain. While personal consumption in private is decriminalized and private associations are constitutionally protected, there is no specific legislation explicitly authorizing cannabis clubs.",
    relatedTerms: ["Decriminalization", "Spanish Cannabis Law"]
  },
  {
    term: "Spanish Cannabis Law",
    definition: "The legal framework governing cannabis in Spain, including Spanish Penal Code Article 368 (drug trafficking exemption for personal use), Organic Law 1/2015 (citizen security), and Supreme Court ruling STS 484/2015 (cannabis club criteria).",
    relatedTerms: ["Decriminalization", "Legal Grey Area"]
  },
  {
    term: "Tourist-Friendly Club",
    definition: "A cannabis social club that welcomes international visitors and typically has English-speaking staff. These clubs are accustomed to helping tourists navigate the membership process with foreign identification.",
    relatedTerms: ["Cannabis Social Club (CSC)", "Invitation System"]
  },
  {
    term: "Verified Club",
    definition: "A cannabis club that has been personally visited and vetted by Weed Madrid for safety, quality, legal compliance, and overall experience. Verified clubs meet strict standards for member safety and service quality.",
    relatedTerms: ["Cannabis Social Club (CSC)", "Editorial Rating"]
  },
  {
    term: "Editorial Rating",
    definition: "A quality assessment provided by Weed Madrid based on personal visits to each club. Ratings cover editorial quality, safety, ambience, and location on a 1-5 scale.",
    relatedTerms: ["Verified Club", "Cannabis Social Club (CSC)"]
  },
  {
    term: "Closed-Loop Distribution",
    definition: "The legal requirement that cannabis cultivated by a club can only be distributed to its own members and cannot be sold externally. This maintains the non-commercial nature of cannabis social clubs.",
    relatedTerms: ["Cannabis Social Club (CSC)", "Non-Profit Organization"]
  },
  {
    term: "Non-Profit Organization",
    definition: "The legal structure required for cannabis clubs in Spain. Clubs must operate without profit motive, with all funds going to operational costs and member services rather than shareholder returns.",
    relatedTerms: ["Private Association", "Cannabis Social Club (CSC)"]
  }
];

const Glossary = () => {
  const { language, t } = useLanguage();

  const pageTitle = language === "es" 
    ? "Glosario de Cannabis - Términos y Definiciones" 
    : "Cannabis Glossary - Terms and Definitions";
    
  const pageDescription = language === "es"
    ? "Guía completa de términos relacionados con los clubs de cannabis en Madrid. Definiciones claras de conceptos legales, membresía y más."
    : "Complete guide to cannabis club terminology in Madrid. Clear definitions of legal concepts, membership terms, and more.";

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/glossary");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: language === "es" ? "Glosario" : "Glossary", url: `${BASE_URL}/glossary` }
  ]);

  // DefinedTermSet schema for SEO
  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": pageTitle,
    "description": pageDescription,
    "url": `${BASE_URL}${buildLanguageAwarePath("/glossary", language)}`,
    "inLanguage": language === "es" ? "es" : "en",
    "hasDefinedTerm": GLOSSARY_TERMS.map(term => ({
      "@type": "DefinedTerm",
      "name": term.term,
      "description": term.definition,
      "inDefinedTermSet": `${BASE_URL}/glossary`
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={`${pageTitle} | Weed Madrid`}
        description={pageDescription}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/glossary", language)}`}
        keywords="cannabis glossary, cannabis club terms, CSC definition, spanish cannabis law, cannabis terminology"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        structuredData={[breadcrumbSchema, definedTermSetSchema]}
        geoTxtPath="/glossary.geo.txt"
        aiPriority="medium"
        contentSummary="Comprehensive glossary of cannabis social club terminology for Madrid, Spain"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {language === "es" ? "Glosario de Cannabis" : "Cannabis Glossary"}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {language === "es" 
                  ? "Términos y definiciones esenciales para entender los clubs de cannabis en Madrid"
                  : "Essential terms and definitions for understanding cannabis clubs in Madrid"}
              </p>
            </div>
          </div>
        </section>

        {/* Terms Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {GLOSSARY_TERMS.map((item, index) => (
                  <Card key={index} id={item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="scroll-mt-24">
                    <CardHeader>
                      <CardTitle className="text-xl text-primary" data-speakable="true">
                        {item.term}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4" data-speakable="true" data-answer="true">
                        {item.definition}
                      </p>
                      {item.relatedTerms && item.relatedTerms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-medium">
                            {language === "es" ? "Términos relacionados:" : "Related terms:"}
                          </span>
                          {item.relatedTerms.map((related, idx) => (
                            <a
                              key={idx}
                              href={`#${related.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {related}
                            </a>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                {language === "es" ? "¿Listo para visitar un club?" : "Ready to visit a club?"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === "es"
                  ? "Ahora que conoces la terminología, explora nuestra selección de clubs verificados en Madrid."
                  : "Now that you know the terminology, explore our selection of verified clubs in Madrid."}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to={buildLanguageAwarePath("/clubs", language)}>
                    {language === "es" ? "Ver Clubs" : "Browse Clubs"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to={buildLanguageAwarePath("/faq", language)}>
                    {language === "es" ? "Preguntas Frecuentes" : "FAQ"}
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

export default Glossary;
