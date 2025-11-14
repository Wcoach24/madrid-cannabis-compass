import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks } from "@/lib/hreflangUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { invitationRequestSchema } from "@/lib/invitationValidation";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Mail, Phone, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const InvitationForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    visit_date: "",
    email: "",
    phone: "",
    visitor_count: 1,
    visitor_names: [""],
    legal_age_confirmed: false,
    legal_knowledge_confirmed: false,
    gdpr_consent: false,
    notes: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: club, isLoading } = useQuery({
    queryKey: ['club', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const hreflangLinks = generateHreflangLinks("https://lovable.dev", `/invite/${slug}`);

  const handleVisitorCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(10, count));
    setFormData(prev => ({
      ...prev,
      visitor_count: newCount,
      visitor_names: Array(newCount).fill("").map((_, i) => prev.visitor_names[i] || "")
    }));
  };

  const handleVisitorNameChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      visitor_names: prev.visitor_names.map((name, i) => i === index ? value : name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate with Zod
      const validationData = {
        club_slug: slug,
        language,
        ...formData,
      };
      
      const validated = invitationRequestSchema.parse(validationData);

      // Submit to edge function
      const { data, error } = await supabase.functions.invoke('submit-invitation-request', {
        body: {
          ...validated,
          ip_address: null, // Will be captured server-side
          user_agent: navigator.userAgent,
        }
      });

      if (error) {
        if (error.message.includes('Rate limit')) {
          toast.error(t("invitation.error.ratelimit", language));
        } else {
          toast.error(t("invitation.error.message", language));
        }
        console.error('Submission error:', error);
        return;
      }

      setSubmitSuccess(true);
      toast.success(t("invitation.success.message", language));
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        toast.error(t("invitation.error.message", language));
      } else {
        console.error('Unexpected error:', error);
        toast.error(t("invitation.error.message", language));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/invite/${slug}`}
        hreflangLinks={hreflangLinks}
      />
      <Header />
      
      <main className="flex-1 container py-8 max-w-4xl">
        {submitSuccess ? (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{t("invitation.success.title", language)}</CardTitle>
                  <CardDescription className="mt-2">{t("invitation.success.message", language)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate(buildLanguageAwarePath(`/club/${slug}`, language))}
                className="w-full"
              >
                {t("invitation.success.backtoclubs", language)}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">{t("invitation.title", language)}</h1>
              <p className="text-xl text-muted-foreground mb-4">{club.name}</p>
              <p className="text-muted-foreground">{t("invitation.subtitle", language)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Visit Date */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="visit_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("invitation.form.visitdate", language)}
                    </Label>
                    <Input
                      id="visit_date"
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {errors.visit_date && (
                      <p className="text-sm text-destructive">{errors.visit_date}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("club.contact", language)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("invitation.form.email", language)}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t("invitation.form.phone", language)}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+34612345678"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Visitor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t("invitation.form.visitorcount", language)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.visitor_count}
                    onChange={(e) => handleVisitorCountChange(parseInt(e.target.value) || 1)}
                  />
                  {errors.visitor_count && (
                    <p className="text-sm text-destructive">{errors.visitor_count}</p>
                  )}

                  <div className="space-y-2">
                    <Label>{t("invitation.form.visitornames", language)}</Label>
                    {formData.visitor_names.map((name, index) => (
                      <Input
                        key={index}
                        placeholder={`${t("contact.form.name", language)} ${index + 1}`}
                        value={name}
                        onChange={(e) => handleVisitorNameChange(index, e.target.value)}
                        required
                      />
                    ))}
                    {errors.visitor_names && (
                      <p className="text-sm text-destructive">{errors.visitor_names}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("invitation.form.notes", language)}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t("invitation.form.notes.placeholder", language)}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Legal Disclaimers */}
              <Card className="border-2 border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    {t("invitation.legal.title", language)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTitle>{t("invitation.legal.title", language)}</AlertTitle>
                    <AlertDescription className="mt-2 text-sm">
                      {t("invitation.legal.disclaimer", language)}
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertDescription className="text-sm">
                      {t("invitation.legal.gdpr", language)}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="legal_age"
                        checked={formData.legal_age_confirmed}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, legal_age_confirmed: checked as boolean }))
                        }
                      />
                      <label htmlFor="legal_age" className="text-sm leading-tight cursor-pointer">
                        {t("invitation.legal.age", language)} {" "}
                        <span className="text-destructive">{t("invitation.legal.age.required", language)}</span>
                      </label>
                    </div>
                    {errors.legal_age_confirmed && (
                      <p className="text-sm text-destructive ml-6">{errors.legal_age_confirmed}</p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="legal_knowledge"
                        checked={formData.legal_knowledge_confirmed}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, legal_knowledge_confirmed: checked as boolean }))
                        }
                      />
                      <label htmlFor="legal_knowledge" className="text-sm leading-tight cursor-pointer">
                        {t("invitation.legal.law", language)} {" "}
                        <span className="text-destructive">{t("invitation.legal.law.required", language)}</span>
                      </label>
                    </div>
                    {errors.legal_knowledge_confirmed && (
                      <p className="text-sm text-destructive ml-6">{errors.legal_knowledge_confirmed}</p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="gdpr_consent"
                        checked={formData.gdpr_consent}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, gdpr_consent: checked as boolean }))
                        }
                      />
                      <label htmlFor="gdpr_consent" className="text-sm leading-tight cursor-pointer">
                        {t("invitation.legal.gdprconsent", language)} {" "}
                        <span className="text-destructive">{t("invitation.legal.gdprconsent.required", language)}</span>
                      </label>
                    </div>
                    {errors.gdpr_consent && (
                      <p className="text-sm text-destructive ml-6">{errors.gdpr_consent}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("invitation.form.submitting", language) : t("invitation.form.submit", language)}
              </Button>
            </form>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default InvitationForm;
