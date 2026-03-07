import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, Shield, Users, Award, MapPin } from "lucide-react";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const About = () => {
  const { t, language } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, '/about');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t('nav.home'), url: BASE_URL },
    { name: t('about.title'), url: `${BASE_URL}/about` }
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Weed Madrid",
    "alternateName": "Weed Madrid Educational Project",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`,
    "description": t('about.orgDescription'),
    "foundingDate": "2019",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Madrid",
        "addressCountry": "ES"
      }
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-632-332-050",
      "contactType": "customer service",
      "availableLanguage": ["English", "Spanish", "German", "French"]
    },
    "sameAs": [
      "https://www.instagram.com/weedmadrid"
    ]
  };

  const teamMembers = [
    {
      name: "Carlos M.",
      role: t('about.team.carlos.role'),
      bio: t('about.team.carlos.bio'),
      experience: "6+ years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "María L.",
      role: t('about.team.maria.role'),
      bio: t('about.team.maria.bio'),
      experience: "5+ years",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "David R.",
      role: t('about.team.david.role'),
      bio: t('about.team.david.bio'),
      experience: "4+ years",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "10,000+", label: t('about.stats.tourists') },
    { number: "15+", label: t('about.stats.clubs') },
    { number: "5+", label: t('about.stats.years') },
    { number: "24h", label: t('about.stats.response') }
  ];

  return (
    <>
      <SEOHead
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        canonical={`${BASE_URL}${language !== 'en' ? `/${language}` : ''}/about`}
        keywords="weed madrid team, cannabis club guide madrid, madrid cannabis experts, weed madrid about us"
        hreflangLinks={hreflangLinks}
        structuredData={[organizationSchema, breadcrumbSchema]}
        htmlLang={language}
        fullContentLanguages={['en', 'es']}
        ogLocale={language === 'es' ? 'es_ES' : language === 'de' ? 'de_DE' : language === 'fr' ? 'fr_FR' : language === 'it' ? 'it_IT' : 'en_US'}
        ogLocaleAlternate={['en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT'].filter(l => l !== (language === 'es' ? 'es_ES' : language === 'de' ? 'de_DE' : language === 'fr' ? 'fr_FR' : language === 'it' ? 'it_IT' : 'en_US'))}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              <MapPin className="w-3 h-3 mr-1" />
              Madrid, España
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              {t('about.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('about.subtitle')}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Mission Statement */}
          <section className="mb-16">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-start gap-4 mb-6">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {t('about.mission.description')}
                    </p>
                    <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        ⚠️ {t('about.mission.disclaimer')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Users className="w-3 h-3 mr-1" />
                {t('about.team.badge')}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">{t('about.team.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('about.team.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <img 
                        src={member.image} 
                        alt={`${member.name} - ${member.role}`}
                        className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary/20"
                      />
                      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                      <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                      <p className="text-muted-foreground text-sm mb-3">{member.bio}</p>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Award className="w-3 h-3" />
                        {member.experience} {t('about.team.experience')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-16">
            <Card className="bg-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('about.contact.title')}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <a 
                    href="https://wa.me/34632332050" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-6 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle className="w-8 h-8 text-green-500 mb-3" />
                    <span className="font-semibold">WhatsApp</span>
                    <span className="text-sm text-muted-foreground">+34 632 332 050</span>
                  </a>
                  <a 
                    href="tel:+34632332050"
                    className="flex flex-col items-center p-6 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Phone className="w-8 h-8 text-primary mb-3" />
                    <span className="font-semibold">{t('about.contact.phone')}</span>
                    <span className="text-sm text-muted-foreground">+34 632 332 050</span>
                  </a>
                  <a 
                    href="mailto:info@weedmadrid.com"
                    className="flex flex-col items-center p-6 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <Mail className="w-8 h-8 text-blue-500 mb-3" />
                    <span className="font-semibold">Email</span>
                    <span className="text-sm text-muted-foreground">info@weedmadrid.com</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Trust Badges */}
          <section className="text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                {t('about.badges.verified')}
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {t('about.badges.local')}
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                {t('about.badges.trusted')}
              </Badge>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;
