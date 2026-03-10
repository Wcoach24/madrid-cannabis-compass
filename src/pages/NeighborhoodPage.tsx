import { useLocation, Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { NEIGHBORHOODS, NEIGHBORHOOD_SLUGS, type NeighborhoodData } from "@/data/neighborhoodContent";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  Train,
  Shield,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Landmark,
  AlertTriangle,
  Users,
  Star,
} from "lucide-react";

/**
 * NeighborhoodPage — Static SEO landing page for "weed [neighborhood] madrid"
 *
 * ZERO Supabase dependency. All content from neighborhoodContent.ts.
 * Prerendered by puppeteer for full SSG/SEO.
 *
 * NOTE: We extract the slug from the URL via regex instead of useParams
 * because React Router v6 does NOT support sub-segment params like
 * /weed-:slug-madrid. The :slug only works as a full segment (after /).
 */
const NeighborhoodPage = () => {
  const location = useLocation();
  const { language } = useLanguageContext();
  const langPrefix = language === "en" ? "" : `/${language}`;

  // Extract slug from URL: /weed-{slug}-madrid or /:lang/weed-{slug}-madrid
  const slugMatch = location.pathname.match(/\/weed-(.+)-madrid$/);
  const slug = slugMatch?.[1];

  const neighborhood = slug ? NEIGHBORHOODS[slug] : undefined;

  // 404 if slug not found
  if (!neighborhood) {
    return <Navigate to="/clubs" replace />;
  }

  const { seo, faqs } = neighborhood;

  // Build canonical URL
  const pagePath = `/weed-${neighborhood.slug}-madrid`;
  const canonical = `${BASE_URL}${langPrefix}${pagePath}`;

  // Hreflang links for all language versions
  const hreflangLinks = generateHreflangLinks(BASE_URL, pagePath);

  // FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // LocalBusiness + TouristAttraction composite schema
  const localSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${neighborhood.nameWithAccent}, Madrid`,
    description: seo.description,
    touristType: ["Cannabis tourism", "Cultural tourism"],
    geo: {
      "@type": "GeoCoordinates",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
    isAccessibleForFree: true,
    url: canonical,
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cannabis Clubs",
        item: `${BASE_URL}/clubs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Weed in ${neighborhood.nameWithAccent}`,
        item: canonical,
      },
    ],
  };

  // Related neighborhoods for internal linking
  const relatedNeighborhoods = NEIGHBORHOOD_SLUGS
    .filter((s) => s !== neighborhood.slug)
    .slice(0, 4)
    .map((s) => NEIGHBORHOODS[s]);

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonical={canonical}
        keywords={`weed ${neighborhood.name.toLowerCase()} madrid, cannabis club ${neighborhood.name.toLowerCase()}, marijuana ${neighborhood.name.toLowerCase()} madrid, cannabis social club ${neighborhood.name.toLowerCase()}`}
        structuredData={[faqSchema, localSchema, breadcrumbSchema]}
        hreflangLinks={hreflangLinks}
        ogLocale="en_US"
        ogLocaleAlternate={["es_ES", "de_DE", "fr_FR", "it_IT"]}
        htmlLang={language}
        fullContentLanguages={["en"]}
        citationTitle={seo.title}
        citationAuthor="Weed Madrid"
        citationDate="2026-03-10"
        aiPriority="high"
        contentSummary={`Guide to finding cannabis social clubs in ${neighborhood.nameWithAccent}, Madrid. Covers how to join, what to expect, safety tips, and local recommendations.`}
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav
          className="max-w-4xl mx-auto px-4 pt-6 pb-2"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                to={`${langPrefix}/`}
                className="hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5" />
            <li>
              <Link
                to={`${langPrefix}/clubs`}
                className="hover:text-primary transition-colors"
              >
                Clubs
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5" />
            <li className="text-foreground font-medium">
              {neighborhood.nameWithAccent}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              {neighborhood.nameWithAccent}, Madrid
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gradient-primary mb-6 leading-tight">
              {seo.h1}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {seo.description}
            </p>

            {/* Metro stations */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {neighborhood.metroStations.map((station) => (
                <span
                  key={station}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 text-sm"
                >
                  <Train className="w-3.5 h-3.5 text-primary" />
                  {station}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8"
              >
                <Link to="/invite/vallehermoso-club-social-madrid">
                  Get Your Invitation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8"
              >
                <Link to={`${langPrefix}/clubs`}>
                  Browse All Clubs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-20 space-y-16">
          {/* Introduction */}
          <section>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {neighborhood.intro}
            </p>
          </section>

          {/* Why This Area */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                Why {neighborhood.nameWithAccent} for Cannabis Clubs?
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {neighborhood.whyThisArea}
            </p>
          </section>

          {/* How to Find */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                How to Find Cannabis Clubs in {neighborhood.nameWithAccent}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {neighborhood.howToFind}
            </p>
          </section>

          {/* What to Expect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                What to Expect Inside a {neighborhood.nameWithAccent} Cannabis Club
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {neighborhood.whatToExpect}
            </p>
          </section>

          {/* Safety Tips */}
          <section className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                Safety Tips for {neighborhood.nameWithAccent}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {neighborhood.safetyTips}
            </p>
          </section>

          {/* Local Insider Tip */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                Local Insider Tip
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {neighborhood.localInsiderTip}
            </p>
          </section>

          {/* Nearby Attractions */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                What Else to Do Near {neighborhood.nameWithAccent}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Combine your cannabis club visit with exploring these nearby
              attractions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {neighborhood.nearbyAttractions.map((attraction) => (
                <div
                  key={attraction}
                  className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border/50"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{attraction}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                FAQ — Weed in {neighborhood.nameWithAccent}
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-5"
                >
                  <AccordionTrigger className="text-left text-base font-medium py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-display text-gradient-primary mb-4">
              Ready to Join a Cannabis Club in {neighborhood.nameWithAccent}?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Get a verified invitation to a trusted cannabis social club in
              Madrid. Same-day approval available. 21+ with valid ID required.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-6"
            >
              <Link to="/invite/vallehermoso-club-social-madrid">
                Get Your Invitation Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </section>

          {/* Related Neighborhoods (Internal Linking) */}
          <section>
            <h2 className="text-2xl md:text-3xl font-display text-foreground mb-6">
              Explore Other Neighborhoods
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedNeighborhoods.map((n) => (
                <Link
                  key={n.slug}
                  to={`${langPrefix}/weed-${n.slug}-madrid`}
                  className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-200"
                >
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      Weed in {n.nameWithAccent}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {n.metroStations.slice(0, 2).join(", ")} metro
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* Additional Internal Links */}
          <nav className="flex flex-wrap justify-center gap-4 pt-8 border-t border-border/50">
            <Link
              to={`${langPrefix}/clubs`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              All Cannabis Clubs →
            </Link>
            <Link
              to={`${langPrefix}/guide/how-to-join-cannabis-club-madrid`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              How to Join a Club →
            </Link>
            <Link
              to={`${langPrefix}/guide/cannabis-laws-spain-2025`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Cannabis Laws in Spain →
            </Link>
            <Link
              to={`${langPrefix}/cannabis-club-madrid`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Cannabis Club Madrid Guide →
            </Link>
          </nav>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NeighborhoodPage;
