import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  completedSteps: Set<number>;
}

export function StepIndicator({ currentStep, totalSteps, onStepClick, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = completedSteps.has(step);
          const isCurrent = step === currentStep;
          const isClickable = isCompleted || step < currentStep;

          return (
            <div key={step} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick?.(step)}
                disabled={!isClickable}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110",
                  isCompleted && !isCurrent && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step
                )}
              </button>
              {step < totalSteps && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1 transition-colors",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
