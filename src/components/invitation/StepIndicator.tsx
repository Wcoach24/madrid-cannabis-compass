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
    <div className="w-full py-4 md:py-6">
      <div className="flex items-center justify-center gap-1 md:gap-2 px-2">
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
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isCurrent && "bg-primary text-primary-foreground ring-2 md:ring-4 ring-primary/20 scale-105 md:scale-110",
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
                    "w-4 md:w-8 h-0.5 transition-colors shrink-0",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-3 md:mt-4">
        <p className="text-xs md:text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
