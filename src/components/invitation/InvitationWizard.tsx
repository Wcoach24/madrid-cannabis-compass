import { useState } from "react";
import { StepIndicator } from "./StepIndicator";
import { Step1DateSelection } from "./steps/Step1DateSelection";
import { Step2VisitorInfo } from "./steps/Step2VisitorInfo";
import { Step3ContactInfo } from "./steps/Step3ContactInfo";
import { Card, CardContent } from "@/components/ui/card";

interface InvitationWizardProps {
  clubName: string;
  clubSlug: string;
  language: string;
}

export interface FormData {
  visitDate: Date | undefined;
  visitorCount: number;
  visitorNames: string[];
  notes: string;
  email: string;
  phone: string;
}

export function InvitationWizard({ clubName, clubSlug, language }: InvitationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<FormData>({
    visitDate: undefined,
    visitorCount: 1,
    visitorNames: [""],
    notes: "",
    email: "",
    phone: ""
  });

  const totalSteps = 3; // We'll add more steps later

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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
