import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invitationRequestSchema } from "@/lib/invitationValidation";
import { toast } from "sonner";
import { Language } from "@/lib/translations";
import { StepIndicator } from "./StepIndicator";
import { Step1DateSelection } from "./steps/Step1DateSelection";
import { Step2VisitorInfo } from "./steps/Step2VisitorInfo";
import { Step3ContactInfo } from "./steps/Step3ContactInfo";
import { Step4LegalConfirmation } from "./steps/Step4LegalConfirmation";
import { Step5Review } from "./steps/Step5Review";
import { SuccessCelebration } from "./SuccessCelebration";
import { Card, CardContent } from "@/components/ui/card";

interface InvitationWizardProps {
  clubName: string;
  clubSlug: string;
  language: Language;
}

export interface FormData {
  visitDate: Date | undefined;
  visitorCount: number;
  visitorNames: string[];
  notes: string;
  email: string;
  phone: string;
  legalAgeConfirmed: boolean;
  legalKnowledgeConfirmed: boolean;
  gdprConsent: boolean;
}

export function InvitationWizard({ clubName, clubSlug, language }: InvitationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    visitDate: undefined,
    visitorCount: 1,
    visitorNames: [""],
    notes: "",
    email: "",
    phone: "",
    legalAgeConfirmed: false,
    legalKnowledgeConfirmed: false,
    gdprConsent: false
  });

  const totalSteps = 5;

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const handleNext = () => {
    markStepComplete(currentStep);
    setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleVisitorCountChange = (count: number) => {
    const newNames = [...formData.visitorNames];
    while (newNames.length < count) {
      newNames.push("");
    }
    updateFormData({ visitorCount: count, visitorNames: newNames });
  };

  const handleVisitorNameChange = (index: number, name: string) => {
    const newNames = [...formData.visitorNames];
    newNames[index] = name;
    updateFormData({ visitorNames: newNames });
  };

  const handleSubmit = async () => {
    if (!formData.visitDate) return;

    setIsSubmitting(true);

    try {
      // Validate with zod schema
      const validatedData = invitationRequestSchema.parse({
        club_slug: clubSlug,
        language,
        visit_date: formData.visitDate.toISOString().split('T')[0],
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        visitor_count: formData.visitorCount,
        visitor_names: formData.visitorNames.slice(0, formData.visitorCount).map(n => n.trim()),
        legal_age_confirmed: formData.legalAgeConfirmed,
        legal_knowledge_confirmed: formData.legalKnowledgeConfirmed,
        gdpr_consent: formData.gdprConsent,
        notes: formData.notes.trim() || undefined
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke("submit-invitation-request", {
        body: validatedData,
      });

      if (error) throw error;

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Submission error:", error);
      
      if (error.name === 'ZodError') {
        toast.error(language === 'es' ? "Por favor verifica todos los campos" : "Please check all fields");
      } else if (error.message?.includes("rate limit")) {
        toast.error(language === 'es' ? "Demasiadas solicitudes. Por favor espera unos minutos." : "Too many requests. Please wait a few minutes.");
      } else {
        toast.error(language === 'es' ? "Error al enviar la solicitud. Por favor intenta de nuevo." : "Error submitting request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If submitted successfully, show celebration
  if (submitted && formData.visitDate) {
    return (
      <SuccessCelebration
        visitorName={formData.visitorNames[0]}
        clubName={clubName}
        clubSlug={clubSlug}
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />

            <div className="mt-8">
              {currentStep === 1 && (
                <Step1DateSelection
                  selectedDate={formData.visitDate}
                  onDateChange={(date) => updateFormData({ visitDate: date })}
                  onNext={handleNext}
                  clubName={clubName}
                  language={language}
                />
              )}

              {currentStep === 2 && (
                <Step2VisitorInfo
                  visitorCount={formData.visitorCount}
                  visitorNames={formData.visitorNames}
                  notes={formData.notes}
                  onVisitorCountChange={handleVisitorCountChange}
                  onVisitorNameChange={handleVisitorNameChange}
                  onNotesChange={(notes) => updateFormData({ notes })}
                  onNext={handleNext}
                  onBack={handleBack}
                  language={language}
                />
              )}

              {currentStep === 3 && (
                <Step3ContactInfo
                  email={formData.email}
                  phone={formData.phone}
                  onEmailChange={(email) => updateFormData({ email })}
                  onPhoneChange={(phone) => updateFormData({ phone })}
                  onNext={handleNext}
                  onBack={handleBack}
                  language={language}
                />
              )}

              {currentStep === 4 && (
                <Step4LegalConfirmation
                  legalAgeConfirmed={formData.legalAgeConfirmed}
                  legalKnowledgeConfirmed={formData.legalKnowledgeConfirmed}
                  gdprConsent={formData.gdprConsent}
                  onLegalAgeChange={(checked) => updateFormData({ legalAgeConfirmed: checked })}
                  onLegalKnowledgeChange={(checked) => updateFormData({ legalKnowledgeConfirmed: checked })}
                  onGdprConsentChange={(checked) => updateFormData({ gdprConsent: checked })}
                  onNext={handleNext}
                  onBack={handleBack}
                  language={language}
                />
              )}

              {currentStep === 5 && formData.visitDate && (
                <Step5Review
                  visitDate={formData.visitDate}
                  visitorCount={formData.visitorCount}
                  visitorNames={formData.visitorNames}
                  email={formData.email}
                  phone={formData.phone}
                  notes={formData.notes}
                  onEdit={handleStepClick}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                  language={language}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
