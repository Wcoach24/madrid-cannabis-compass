import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import OrganizationSchema from "@/components/OrganizationSchema";
import { Shield, Lock, Eye, UserCheck, FileText, Mail } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const Privacy = () => {
  const { language, t } = useLanguage();

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/privacy");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Privacy Policy", url: `${BASE_URL}/privacy` }
  ]);

  const sections = [
    {
      icon: Eye,
      title: language === 'es' ? "Información que Recopilamos" : language === 'de' ? "Informationen, die wir sammeln" : "Information We Collect",
      content: language === 'es' 
        ? "Recopilamos información que usted proporciona directamente, como nombre, correo electrónico y número de teléfono cuando solicita una invitación a un club. También recopilamos datos de uso anónimos para mejorar nuestros servicios."
        : language === 'de'
        ? "Wir erfassen Informationen, die Sie direkt angeben, wie Name, E-Mail und Telefonnummer, wenn Sie eine Club-Einladung anfordern. Wir erfassen auch anonyme Nutzungsdaten zur Verbesserung unserer Dienste."
        : "We collect information you provide directly, such as name, email, and phone number when requesting a club invitation. We also collect anonymous usage data to improve our services."
    },
    {
      icon: Lock,
      title: language === 'es' ? "Cómo Usamos Su Información" : language === 'de' ? "Wie wir Ihre Informationen verwenden" : "How We Use Your Information",
      content: language === 'es'
        ? "Usamos su información para procesar solicitudes de invitación, comunicarnos con usted sobre su solicitud, y mejorar nuestros servicios. Nunca vendemos su información personal a terceros."
        : language === 'de'
        ? "Wir verwenden Ihre Informationen zur Bearbeitung von Einladungsanfragen, zur Kommunikation über Ihre Anfrage und zur Verbesserung unserer Dienste. Wir verkaufen Ihre persönlichen Daten niemals an Dritte."
        : "We use your information to process invitation requests, communicate with you about your request, and improve our services. We never sell your personal information to third parties."
    },
    {
      icon: Shield,
      title: language === 'es' ? "Protección de Datos" : language === 'de' ? "Datenschutz" : "Data Protection",
      content: language === 'es'
        ? "Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración o destrucción. Sus datos se almacenan de forma segura con encriptación."
        : language === 'de'
        ? "Wir implementieren technische und organisatorische Sicherheitsmaßnahmen zum Schutz Ihrer persönlichen Daten vor unbefugtem Zugriff, Änderung oder Zerstörung. Ihre Daten werden sicher mit Verschlüsselung gespeichert."
        : "We implement technical and organizational security measures to protect your personal information against unauthorized access, alteration, or destruction. Your data is stored securely with encryption."
    },
    {
      icon: UserCheck,
      title: language === 'es' ? "Sus Derechos GDPR" : language === 'de' ? "Ihre GDPR-Rechte" : "Your GDPR Rights",
      content: language === 'es'
        ? "Bajo el GDPR, usted tiene derecho a acceder, rectificar, eliminar y portar sus datos personales. También puede retirar su consentimiento en cualquier momento contactándonos."
        : language === 'de'
        ? "Nach der DSGVO haben Sie das Recht auf Zugang, Berichtigung, Löschung und Übertragbarkeit Ihrer persönlichen Daten. Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie uns kontaktieren."
        : "Under GDPR, you have the right to access, rectify, delete, and port your personal data. You can also withdraw your consent at any time by contacting us."
    },
    {
      icon: FileText,
      title: language === 'es' ? "Cookies y Seguimiento" : language === 'de' ? "Cookies und Tracking" : "Cookies and Tracking",
      content: language === 'es'
        ? "Usamos cookies esenciales para el funcionamiento del sitio y cookies analíticas para entender cómo se usa nuestro sitio. Puede gestionar sus preferencias de cookies en cualquier momento."
        : language === 'de'
        ? "Wir verwenden essentielle Cookies für den Betrieb der Website und analytische Cookies, um zu verstehen, wie unsere Website genutzt wird. Sie können Ihre Cookie-Einstellungen jederzeit verwalten."
        : "We use essential cookies for site functionality and analytics cookies to understand how our site is used. You can manage your cookie preferences at any time."
    },
    {
      icon: Mail,
      title: language === 'es' ? "Contacto" : language === 'de' ? "Kontakt" : "Contact Us",
      content: language === 'es'
        ? "Para cualquier pregunta sobre esta política de privacidad o para ejercer sus derechos, contáctenos en privacy@weedmadrid.com o a través de nuestro formulario de contacto."
        : language === 'de'
        ? "Bei Fragen zu dieser Datenschutzrichtlinie oder zur Ausübung Ihrer Rechte kontaktieren Sie uns unter privacy@weedmadrid.com oder über unser Kontaktformular."
        : "For any questions about this privacy policy or to exercise your rights, contact us at privacy@weedmadrid.com or through our contact form."
    }
  ];

  const title = language === 'es' ? "Política de Privacidad" : language === 'de' ? "Datenschutzrichtlinie" : "Privacy Policy";
  const subtitle = language === 'es' 
    ? "Cómo protegemos y manejamos su información personal"
    : language === 'de'
    ? "Wie wir Ihre persönlichen Daten schützen und verarbeiten"
    : "How we protect and handle your personal information";
  const lastUpdated = language === 'es' ? "Última actualización" : language === 'de' ? "Letzte Aktualisierung" : "Last updated";

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SEOHead
        title={`${title} | Weed Madrid`}
        description={subtitle}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/privacy", language)}`}
        keywords="privacy policy, GDPR, data protection, personal information, cookies, weed madrid"
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : language === "de" ? "de_DE" : language === "fr" ? "fr_FR" : "en_US"}
        structuredData={breadcrumbSchema}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
              <Shield className="w-16 h-16 mx-auto mb-6" />
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
                {language === 'es' ? "¿Tiene preguntas?" : language === 'de' ? "Haben Sie Fragen?" : "Have Questions?"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'es' 
                  ? "Estamos aquí para ayudarle con cualquier inquietud sobre privacidad."
                  : language === 'de'
                  ? "Wir sind hier, um Ihnen bei Datenschutzfragen zu helfen."
                  : "We're here to help with any privacy concerns."}
              </p>
              <Button asChild>
                <Link to={buildLanguageAwarePath("/contact", language)}>
                  {language === 'es' ? "Contáctenos" : language === 'de' ? "Kontaktieren Sie uns" : "Contact Us"}
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

export default Privacy;
