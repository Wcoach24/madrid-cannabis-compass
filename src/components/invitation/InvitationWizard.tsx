import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { AlreadySubmittedMessage } from "./AlreadySubmittedMessage";
import { Card, CardContent } from "@/components/ui/card";

interface InvitationWizardProps {
  clubName: string;
  clubSlug: string;
  language: Language;
}

export interface FormData {
  visitDate: Date | undefined;
  visitorCount: number;
  visitorFirstNames: string[];
  visitorLastNames: string[];
  notes: string;
  email: string;
  phone: string;
  legalAgeConfirmed: boolean;
  legalKnowledgeConfirmed: boolean;
  gdprConsent: boolean;
}

interface StoredSubmission {
  email: string;
  timestamp: number;
  clubSlug: string;
  invitationCode: string;
}

const STORAGE_KEY = 'weedmadrid_invitation_submitted';

export function InvitationWizard({ clubName, clubSlug, language }: InvitationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [storedInvitationCode, setStoredInvitationCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    visitDate: undefined,
    visitorCount: 1,
    visitorFirstNames: [""],
    visitorLastNames: [""],
    notes: "",
    email: "",
    phone: "",
    legalAgeConfirmed: false,
    legalKnowledgeConfirmed: false,
    gdprConsent: false
  });

  // Check if user recently submitted for this club
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const submission: StoredSubmission = JSON.parse(stored);
        const hourAgo = Date.now() - 3600 * 1000;
        
        if (submission.timestamp > hourAgo && submission.clubSlug === clubSlug) {
          setAlreadySubmitted(true);
          setStoredInvitationCode(submission.invitationCode);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [clubSlug]);

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
    const newFirstNames = [...formData.visitorFirstNames];
    const newLastNames = [...formData.visitorLastNames];
    while (newFirstNames.length < count) {
      newFirstNames.push("");
      newLastNames.push("");
    }
    updateFormData({ visitorCount: count, visitorFirstNames: newFirstNames, visitorLastNames: newLastNames });
  };

  const handleVisitorFirstNameChange = (index: number, name: string) => {
    const newNames = [...formData.visitorFirstNames];
    newNames[index] = name;
    updateFormData({ visitorFirstNames: newNames });
  };

  const handleVisitorLastNameChange = (index: number, name: string) => {
    const newNames = [...formData.visitorLastNames];
    newNames[index] = name;
    updateFormData({ visitorLastNames: newNames });
  };

  const handleSubmit = async () => {
    if (!formData.visitDate) return;

    setIsSubmitting(true);

    try {
      // Validate with zod schema
      const validatedData = invitationRequestSchema.parse({
        club_slug: clubSlug,
        language,
        visit_date: format(formData.visitDate, 'yyyy-MM-dd'),
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

      // Handle duplicate response from backend
      if (data.is_duplicate) {
        toast.info(
          language === 'es' 
            ? "Ya tienes una invitación pendiente. ¡Revisa tu email!" 
            : "You already have a pending invitation. Check your email!"
        );
      }

      // Store in localStorage to prevent re-filling
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          timestamp: Date.now(),
          clubSlug,
          invitationCode: data.invitation_code
        }));
      } catch (e) {
        // Ignore localStorage errors
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Submission error:", error);
      
      if (error.name === 'ZodError') {
        toast.error(language === 'es' ? "Por favor verifica todos los campos" : "Please check all fields");
      } else if (error.message?.includes("rate limit") || error.message?.includes("ALREADY_SUBMITTED")) {
        toast.error(language === 'es' ? "Ya enviaste una solicitud. Por favor revisa tu email o espera 1 hora." : "You already submitted a request. Please check your email or wait 1 hour.");
      } else {
        toast.error(language === 'es' ? "Error al enviar la solicitud. Por favor intenta de nuevo." : "Error submitting request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestNew = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore localStorage errors
    }
    setAlreadySubmitted(false);
    setStoredInvitationCode(null);
  };

  // If user already submitted recently for this club, show message
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          <AlreadySubmittedMessage
            invitationCode={storedInvitationCode}
            language={language}
            onRequestNew={handleRequestNew}
          />
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4">
        <Card className="max-w-3xl mx-auto overflow-hidden">
          <CardContent className="p-4 md:p-6 lg:p-8">
            <div className="focus:outline-none">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
              />
            </div>

            <div className="mt-6 md:mt-8">
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
