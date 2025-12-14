import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, CheckCircle, XCircle, MapPin, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const ScamWarning = () => {
  const { t, language } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, '/safety/scams');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t('nav.home'), url: 'https://www.weedmadrid.com' },
    { name: t('nav.safety'), url: 'https://www.weedmadrid.com/safety' },
    { name: t('scams.title'), url: 'https://www.weedmadrid.com/safety/scams' }
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('scams.faq.q1'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('scams.faq.a1')
        }
      },
      {
        "@type": "Question",
        "name": t('scams.faq.q2'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('scams.faq.a2')
        }
      },
      {
        "@type": "Question",
        "name": t('scams.faq.q3'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('scams.faq.a3')
        }
      }
    ]
  };

  const scamTypes = [
    {
      title: t('scams.types.street.title'),
      description: t('scams.types.street.description'),
      locations: ["Puerta del Sol", "Gran Vía", "Plaza Mayor", "Malasaña"],
      danger: "high"
    },
    {
      title: t('scams.types.flyers.title'),
      description: t('scams.types.flyers.description'),
      locations: [t('scams.types.flyers.locations')],
      danger: "medium"
    },
    {
      title: t('scams.types.online.title'),
      description: t('scams.types.online.description'),
      locations: [t('scams.types.online.locations')],
      danger: "high"
    },
    {
      title: t('scams.types.fake.title'),
      description: t('scams.types.fake.description'),
      locations: [t('scams.types.fake.locations')],
      danger: "medium"
    }
  ];

  const safetyChecklist = [
    t('scams.checklist.item1'),
    t('scams.checklist.item2'),
    t('scams.checklist.item3'),
    t('scams.checklist.item4'),
    t('scams.checklist.item5'),
    t('scams.checklist.item6')
  ];

  const redFlags = [
    t('scams.redflags.item1'),
    t('scams.redflags.item2'),
    t('scams.redflags.item3'),
    t('scams.redflags.item4'),
    t('scams.redflags.item5')
  ];

  return (
    <>
      <SEOHead
        title={t('scams.seoTitle')}
        description={t('scams.seoDescription')}
        canonical={`https://www.weedmadrid.com${language !== 'en' ? `/${language}` : ''}/safety/scams`}
        keywords="cannabis scams madrid, weed scams spain, fake cannabis clubs madrid, avoid street dealers madrid, safe cannabis madrid"
        hreflangLinks={hreflangLinks}
        structuredData={[faqSchema, breadcrumbSchema]}
        ogLocale={language === 'es' ? 'es_ES' : language === 'de' ? 'de_DE' : language === 'fr' ? 'fr_FR' : 'en_US'}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <Badge variant="destructive" className="mb-4">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {t('scams.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('scams.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('scams.subtitle')}
            </p>
          </section>

          {/* Main Warning Alert */}
          <Alert variant="destructive" className="mb-12 border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">{t('scams.mainWarning.title')}</AlertTitle>
            <AlertDescription className="mt-2 text-base">
              {t('scams.mainWarning.description')}
            </AlertDescription>
          </Alert>

          {/* Scam Types */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">{t('scams.types.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {scamTypes.map((scam, index) => (
                <Card key={index} className={`border-2 ${scam.danger === 'high' ? 'border-destructive/50' : 'border-yellow-500/50'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className={`w-5 h-5 ${scam.danger === 'high' ? 'text-destructive' : 'text-yellow-500'}`} />
                        {scam.title}
                      </CardTitle>
                      <Badge variant={scam.danger === 'high' ? 'destructive' : 'secondary'}>
                        {scam.danger === 'high' ? t('scams.danger.high') : t('scams.danger.medium')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{scam.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {scam.locations.map((location, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Two Column: Checklist + Red Flags */}
          <section className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Safety Checklist */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  {t('scams.checklist.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{t('scams.checklist.subtitle')}</p>
                <ul className="space-y-3">
                  {safetyChecklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Red Flags */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" />
                  {t('scams.redflags.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{t('scams.redflags.subtitle')}</p>
                <ul className="space-y-3">
                  {redFlags.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* What To Do */}
          <section className="mb-16">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{t('scams.safe.title')}</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      {t('scams.safe.description')}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild>
                        <Link to="/clubs">
                          {t('scams.safe.cta.clubs')}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/how-it-works">
                          {t('scams.safe.cta.howto')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Emergency Contact */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('scams.emergency.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('scams.emergency.description')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="https://wa.me/34632332050" target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp: +34 632 332 050
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:112">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('scams.emergency.police')}: 112
                </a>
              </Button>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ScamWarning;
