import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSuggestion from "@/components/LanguageSuggestion";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import FAQ from "./pages/FAQ";
import Guides from "./pages/Guides";
import GuideDetail from "./pages/GuideDetail";
import Contact from "./pages/Contact";
import InvitationForm from "./pages/InvitationForm";
import SeedData from "./pages/SeedData";
import GenerateArticles from "./pages/GenerateArticles";
import Auth from "./pages/Auth";
import AdminInvitations from "./pages/AdminInvitations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <LanguageProvider>
          <LanguageSuggestion />
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
            <Route path="/seed-data" element={<SeedData />} />
            <Route path="/generate-articles" element={<GenerateArticles />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/invitations" element={<AdminInvitations />} />
            
            {/* Language-prefixed routes */}
            <Route path="/:lang" element={<Index />} />
            <Route path="/:lang/clubs" element={<Clubs />} />
            <Route path="/:lang/club/:slug" element={<ClubDetail />} />
            <Route path="/:lang/invite/:slug" element={<InvitationForm />} />
            <Route path="/:lang/faq" element={<FAQ />} />
            <Route path="/:lang/guides" element={<Guides />} />
            <Route path="/:lang/guide/:slug" element={<GuideDetail />} />
            <Route path="/:lang/contact" element={<Contact />} />
            <Route path="/:lang/auth" element={<Auth />} />
            <Route path="/:lang/admin/invitations" element={<AdminInvitations />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
