import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { buildLanguageAwarePath, DEFAULT_INVITATION_CLUB_SLUG } from "@/lib/languageUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { InvitationWizard } from "@/components/invitation/InvitationWizard";
import { useEffect } from "react";

export default function InvitationForm() {
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Redirect old URLs to the centralized club for backward compatibility
  useEffect(() => {
    if (slug && slug !== DEFAULT_INVITATION_CLUB_SLUG) {
      navigate(buildLanguageAwarePath(`/invite/${DEFAULT_INVITATION_CLUB_SLUG}`, language), { replace: true });
    }
  }, [slug, language, navigate]);

  const { data: club, isLoading } = useQuery({
    queryKey: ["club", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const hreflangLinks = generateHreflangLinks(BASE_URL, `/invite/${slug}`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <p className="text-center">{t("clubs.loading", language)}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <p className="text-center">{t("clubs.nofound", language)}</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Service structured data for invitation facilitation
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${club.name} Cannabis Club Membership Invitation`,
    "provider": {
      "@type": "Organization",
      "name": "Weed Madrid"
    },
    "areaServed": {
      "@type": "City",
      "name": "Madrid",
      "addressCountry": "ES"
    },
    "serviceType": "Cannabis Social Club Invitation Facilitation",
    "description": `Request your invitation to ${club.name}, a verified cannabis social club in ${club.district}, Madrid. Fast approval process for tourists and residents.`,
    "isAccessibleForFree": true,
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${BASE_URL}/invite/${slug}`
    }
  };

  const pageTitle = `${t("invitation.title", language)} - ${club.name}`;
  const pageDescription = t("invitation.seo.description", language);

  return (
    <>
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
        canonical={`/invite/${slug}`}
        hreflangLinks={hreflangLinks}
        structuredData={serviceSchema}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <InvitationWizard 
            clubName={club.name}
            clubSlug={club.slug}
            language={language}
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
