import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { FileText, Users, AlertTriangle, Scale, Shield, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const Terms = () => {
  const { language } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/terms");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Terms of Service", url: `${BASE_URL}/terms` }
  ]);

  const sections = [
    {
      icon: Users,
      title: language === 'es' ? "Uso del Servicio" : language === 'de' ? "Nutzung des Dienstes" : "Service Usage",
      content: language === 'es'
        ? "Weed Madrid es una plataforma informativa que facilita conexiones entre usuarios adultos y clubes sociales de cannabis legalmente constituidos en Madrid. No vendemos, distribuimos ni promovemos el consumo de cannabis. Usted debe tener al menos 21 años para usar nuestros servicios."
        : language === 'de'
        ? "Weed Madrid ist eine Informationsplattform, die Verbindungen zwischen erwachsenen Nutzern und legal gegründeten Cannabis-Sozialclubs in Madrid erleichtert. Wir verkaufen, vertreiben oder bewerben keinen Cannabiskonsum. Sie müssen mindestens 21 Jahre alt sein, um unsere Dienste zu nutzen."
        : "Weed Madrid is an informational platform that facilitates connections between adult users and legally constituted cannabis social clubs in Madrid. We do not sell, distribute, or promote cannabis consumption. You must be at least 21 years old to use our services."
    },
    {
      icon: AlertTriangle,
      title: language === 'es' ? "Descargo de Responsabilidad" : language === 'de' ? "Haftungsausschluss" : "Disclaimer",
      content: language === 'es'
        ? "La información proporcionada es solo para fines educativos. No garantizamos la exactitud de la información sobre clubes individuales. Los usuarios son responsables de verificar el estatus legal y las condiciones de cualquier club antes de solicitar membresía."
        : language === 'de'
        ? "Die bereitgestellten Informationen dienen nur zu Bildungszwecken. Wir garantieren nicht die Genauigkeit der Informationen über einzelne Clubs. Benutzer sind dafür verantwortlich, den rechtlichen Status und die Bedingungen jedes Clubs vor der Mitgliedschaftsanfrage zu überprüfen."
        : "Information provided is for educational purposes only. We do not guarantee the accuracy of information about individual clubs. Users are responsible for verifying the legal status and conditions of any club before requesting membership."
    },
    {
      icon: Scale,
      title: language === 'es' ? "Cumplimiento Legal" : language === 'de' ? "Rechtliche Einhaltung" : "Legal Compliance",
      content: language === 'es'
        ? "Los usuarios deben cumplir con todas las leyes locales y nacionales aplicables. Los clubes de cannabis operan bajo un marco legal específico en España. El consumo público de cannabis sigue siendo ilegal. Al usar nuestra plataforma, acepta cumplir con todas las leyes aplicables."
        : language === 'de'
        ? "Benutzer müssen alle geltenden lokalen und nationalen Gesetze einhalten. Cannabis-Clubs operieren unter einem spezifischen rechtlichen Rahmen in Spanien. Der öffentliche Cannabiskonsum bleibt illegal. Durch die Nutzung unserer Plattform erklären Sie sich bereit, alle geltenden Gesetze einzuhalten."
        : "Users must comply with all applicable local and national laws. Cannabis clubs operate under a specific legal framework in Spain. Public cannabis consumption remains illegal. By using our platform, you agree to comply with all applicable laws."
    },
    {
      icon: Shield,
      title: language === 'es' ? "Protección de Datos" : language === 'de' ? "Datenschutz" : "Data Protection",
      content: language === 'es'
        ? "Su privacidad es importante para nosotros. Consulte nuestra Política de Privacidad para obtener información detallada sobre cómo recopilamos, usamos y protegemos su información personal de acuerdo con el GDPR."
        : language === 'de'
        ? "Ihre Privatsphäre ist uns wichtig. Bitte lesen Sie unsere Datenschutzrichtlinie für detaillierte Informationen darüber, wie wir Ihre persönlichen Daten gemäß der DSGVO erfassen, verwenden und schützen."
        : "Your privacy is important to us. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your personal information in accordance with GDPR."
    },
    {
      icon: CheckCircle,
      title: language === 'es' ? "Aceptación de Términos" : language === 'de' ? "Annahme der Bedingungen" : "Acceptance of Terms",
      content: language === 'es'
        ? "Al acceder y usar Weed Madrid, usted acepta estar sujeto a estos términos de servicio. Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios."
        : language === 'de'
        ? "Durch den Zugriff auf und die Nutzung von Weed Madrid erklären Sie sich an diese Nutzungsbedingungen gebunden. Wenn Sie mit einem Teil dieser Bedingungen nicht einverstanden sind, sollten Sie unsere Dienste nicht nutzen."
        : "By accessing and using Weed Madrid, you agree to be bound by these terms of service. If you disagree with any part of these terms, you should not use our services."
    },
    {
      icon: FileText,
      title: language === 'es' ? "Modificaciones" : language === 'de' ? "Änderungen" : "Modifications",
      content: language === 'es'
        ? "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. El uso continuado de nuestros servicios constituye la aceptación de los términos modificados."
        : language === 'de'
        ? "Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Änderungen treten sofort nach Veröffentlichung auf der Website in Kraft. Die fortgesetzte Nutzung unserer Dienste stellt die Annahme der geänderten Bedingungen dar."
        : "We reserve the right to modify these terms at any time. Changes will take effect immediately upon posting on the website. Continued use of our services constitutes acceptance of modified terms."
    }
  ];

  const title = language === 'es' ? "Términos de Servicio" : language === 'de' ? "Nutzungsbedingungen" : "Terms of Service";
  const subtitle = language === 'es'
    ? "Por favor lea estos términos cuidadosamente antes de usar nuestros servicios"
    : language === 'de'
    ? "Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unsere Dienste nutzen"
    : "Please read these terms carefully before using our services";
  const lastUpdated = language === 'es' ? "Última actualización" : language === 'de' ? "Letzte Aktualisierung" : "Last updated";

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={`${title} | Weed Madrid`}
        description={subtitle}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/terms", language)}`}
        keywords="terms of service, legal terms, user agreement, weed madrid, cannabis clubs"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        structuredData={breadcrumbSchema}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
              <FileText className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {title}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {subtitle}
              </p>
              <p className="text-sm text-primary-foreground/70 mt-4">
                {lastUpdated}: January 2025
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((section, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'es' ? "¿Tiene preguntas sobre estos términos?" : language === 'de' ? "Haben Sie Fragen zu diesen Bedingungen?" : "Have questions about these terms?"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'es'
                  ? "Nuestro equipo está disponible para ayudarle."
                  : language === 'de'
                  ? "Unser Team steht Ihnen zur Verfügung."
                  : "Our team is available to help you."}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild>
                  <Link to={buildLanguageAwarePath("/contact", language)}>
                    {language === 'es' ? "Contáctenos" : language === 'de' ? "Kontaktieren Sie uns" : "Contact Us"}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={buildLanguageAwarePath("/privacy", language)}>
                    {language === 'es' ? "Política de Privacidad" : language === 'de' ? "Datenschutzrichtlinie" : "Privacy Policy"}
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

export default Terms;
