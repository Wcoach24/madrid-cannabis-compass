import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@/components/Analytics";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { NEIGHBORHOOD_SLUGS } from "@/data/neighborhoodContent";

// Critical homepage - load immediately
import Index from "./pages/Index";

// Lazy load all other pages for better initial bundle size
const Clubs = lazy(() => import("./pages/Clubs"));
const ClubDetail = lazy(() => import("./pages/ClubDetail"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Guides = lazy(() => import("./pages/Guides"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const InvitationForm = lazy(() => import("./pages/InvitationForm"));
const Legal = lazy(() => import("./pages/Legal"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Safety = lazy(() => import("./pages/Safety"));
const SeedData = lazy(() => import("./pages/SeedData"));
const GenerateArticles = lazy(() => import("./pages/GenerateArticles"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminInvitations = lazy(() => import("./pages/AdminInvitations"));
const AdminClubs = lazy(() => import("./pages/AdminClubs"));
const AdminGuides = lazy(() => import("./pages/AdminGuides"));
const Districts = lazy(() => import("./pages/Districts"));
const District = lazy(() => import("./pages/District"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const ClubsNearMe = lazy(() => import("./pages/ClubsNearMe"));
const ClubsDistrict = lazy(() => import("./pages/ClubsDistrict"));
const BulkGenerate = lazy(() => import("./pages/BulkGenerate"));
const TranslateContent = lazy(() => import("./pages/TranslateContent"));
const Shop = lazy(() => import("./pages/Shop"));
const About = lazy(() => import("./pages/About"));
const ScamWarning = lazy(() => import("./pages/ScamWarning"));
const CannabisClubMadrid = lazy(() => import("./pages/CannabisClubMadrid"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Glossary = lazy(() => import("./pages/Glossary"));
const NeighborhoodPage = lazy(() => import("./pages/NeighborhoodPage"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading fallback - matches the site's dark theme
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Hook to mark document as hydrated
 * Shell is hidden via CSS when hydration-ready class is added in main.tsx
 */
function useHydrationMarker() {
  useEffect(() => {
    // Mark as hydrated for SSG detection
    // Shell hiding is handled by CSS rule: html.hydration-ready #hero-shell { display: none; }
    document.documentElement.setAttribute('data-hydrated', 'true');
  }, []);
}

const App = () => {
  useHydrationMarker();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Analytics />
          <ScrollToTop />
          <LanguageProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Default English routes */}
              <Route path="/" element={<Index />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/club/:slug" element={<ClubDetail />} />
              <Route path="/invite/:slug" element={<InvitationForm />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guide/:slug" element={<GuideDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/seed-data" element={<SeedData />} />
              <Route path="/generate-articles" element={<GenerateArticles />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/invitations" element={<AdminInvitations />} />
              <Route path="/admin/clubs" element={<AdminClubs />} />
              <Route path="/admin/guides" element={<AdminGuides />} />
              <Route path="/districts" element={<Districts />} />
              <Route path="/district/:district" element={<District />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/clubs/near-me" element={<ClubsNearMe />} />
              <Route path="/clubs/:district" element={<ClubsDistrict />} />
              <Route path="/bulk-generate" element={<BulkGenerate />} />
              <Route path="/translate-content" element={<TranslateContent />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/safety/scams" element={<ScamWarning />} />
              <Route path="/cannabis-club-madrid" element={<CannabisClubMadrid />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/*
                Neighborhood routes — explicit paths for each neighborhood.
                React Router v6 does NOT support sub-segment params like
                /weed-:slug-madrid, so we generate a static route per slug.
                NeighborhoodPage extracts the slug from the URL via regex.
              */}
              {NEIGHBORHOOD_SLUGS.map((slug) => (
                <Route
                  key={`neighborhood-${slug}`}
                  path={`/weed-${slug}-madrid`}
                  element={<NeighborhoodPage />}
                />
              ))}

              {/* Language-prefixed routes */}
              <Route path="/:lang" element={<Index />} />
              <Route path="/:lang/clubs" element={<Clubs />} />
              <Route path="/:lang/club/:slug" element={<ClubDetail />} />
              <Route path="/:lang/invite/:slug" element={<InvitationForm />} />
              <Route path="/:lang/faq" element={<FAQ />} />
              <Route path="/:lang/guides" element={<Guides />} />
              <Route path="/:lang/guide/:slug" element={<GuideDetail />} />
              <Route path="/:lang/contact" element={<Contact />} />
              <Route path="/:lang/legal" element={<Legal />} />
              <Route path="/:lang/privacy" element={<Privacy />} />
              <Route path="/:lang/terms" element={<Terms />} />
              <Route path="/:lang/how-it-works" element={<HowItWorks />} />
              <Route path="/:lang/safety" element={<Safety />} />
              <Route path="/:lang/auth" element={<Auth />} />
              <Route path="/:lang/admin" element={<AdminDashboard />} />
              <Route path="/:lang/admin/invitations" element={<AdminInvitations />} />
              <Route path="/:lang/admin/clubs" element={<AdminClubs />} />
              <Route path="/:lang/admin/guides" element={<AdminGuides />} />
              <Route path="/:lang/districts" element={<Districts />} />
              <Route path="/:lang/district/:district" element={<District />} />
              <Route path="/:lang/knowledge" element={<Knowledge />} />
              <Route path="/:lang/clubs/near-me" element={<ClubsNearMe />} />
              <Route path="/:lang/clubs/:district" element={<ClubsDistrict />} />
              <Route path="/:lang/shop" element={<Shop />} />
              <Route path="/:lang/about" element={<About />} />
              <Route path="/:lang/safety/scams" element={<ScamWarning />} />
              <Route path="/:lang/club-cannabis-madrid" element={<CannabisClubMadrid />} />
              {/* Legacy alias for already indexed URLs */}
              <Route path="/:lang/cannabis-club-madrid" element={<CannabisClubMadrid />} />
              <Route path="/:lang/glossary" element={<Glossary />} />
              <Route path="/:lang/blog/:slug" element={<BlogPost />} />

              {/* Language-prefixed neighborhood routes */}
              {NEIGHBORHOOD_SLUGS.map((slug) => (
                <Route
                  key={`lang-neighborhood-${slug}`}
                  path={`/:lang/weed-${slug}-madrid`}
                  element={<NeighborhoodPage />}
                />
              ))}

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            <WhatsAppWidget />
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
