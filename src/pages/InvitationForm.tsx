import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { generateHreflangLinks } from "@/lib/hreflangUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { InvitationWizard } from "@/components/invitation/InvitationWizard";

export default function InvitationForm() {
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();

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

  const hreflangLinks = generateHreflangLinks("https://lovable.dev", `/invite/${slug}`);

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

  const pageTitle = `${t("invitation.title", language)} - ${club.name}`;
  const pageDescription = t("invitation.seo.description", language);

  return (
    <>
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
        canonical={`/invite/${slug}`}
        hreflangLinks={hreflangLinks}
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
