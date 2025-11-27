import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@/components/Analytics";
import Index from "./pages/Index";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import FAQ from "./pages/FAQ";
import Guides from "./pages/Guides";
import GuideDetail from "./pages/GuideDetail";
import Contact from "./pages/Contact";
import InvitationForm from "./pages/InvitationForm";
import Legal from "./pages/Legal";
import HowItWorks from "./pages/HowItWorks";
import Safety from "./pages/Safety";
import SeedData from "./pages/SeedData";
import GenerateArticles from "./pages/GenerateArticles";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInvitations from "./pages/AdminInvitations";
import AdminClubs from "./pages/AdminClubs";
import AdminGuides from "./pages/AdminGuides";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Analytics />
        <ScrollToTop />
        <LanguageProvider>
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
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/seed-data" element={<SeedData />} />
            <Route path="/generate-articles" element={<GenerateArticles />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/invitations" element={<AdminInvitations />} />
            <Route path="/admin/clubs" element={<AdminClubs />} />
            <Route path="/admin/guides" element={<AdminGuides />} />
            
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
            <Route path="/:lang/how-it-works" element={<HowItWorks />} />
            <Route path="/:lang/safety" element={<Safety />} />
            <Route path="/:lang/auth" element={<Auth />} />
            <Route path="/:lang/admin" element={<AdminDashboard />} />
            <Route path="/:lang/admin/invitations" element={<AdminInvitations />} />
            <Route path="/:lang/admin/clubs" element={<AdminClubs />} />
            <Route path="/:lang/admin/guides" element={<AdminGuides />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
