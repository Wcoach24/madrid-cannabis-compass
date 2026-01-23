import { CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAnswerBoxProps {
  title?: string;
  answer: string;
  highlights?: string[];
  badges?: Array<{ label: string; icon?: "check" | "info" }>;
  className?: string;
  /** 
   * PRD-compliant variant for featured snippets
   * When true: renders only H2 + plain paragraph (no highlights, badges, CTA)
   */
  variant?: "default" | "featured-snippet";
}

/**
 * QuickAnswerBox - GEO/LLM Optimized Component
 * 
 * Designed for direct extraction by AI systems (ChatGPT, Perplexity, Bing Copilot).
 * Provides concise, citation-ready answers at the top of pillar articles.
 * 
 * Featured Snippet Variant (PRD-compliant):
 * - ≤45 words, plain paragraph
 * - No CTA, no branding, neutral tone
 * - Only H2 question + answer paragraph
 */
const QuickAnswerBox = ({
  title = "🔍 Quick Answer",
  answer,
  highlights = [],
  badges = [],
  className,
  variant = "default"
}: QuickAnswerBoxProps) => {
  // PRD-compliant Featured Snippet mode: minimal, extract-friendly
  if (variant === "featured-snippet") {
    return (
      <div 
        className={cn(
          "bg-background rounded-lg p-6 border-l-4 border-primary shadow-sm",
          className
        )}
        data-speakable="true"
        aria-label="Quick answer summary"
      >
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="text-muted-foreground" data-answer="true">
          {answer}
        </p>
      </div>
    );
  }

  // Default mode with highlights and badges
  return (
    <div 
      className={cn(
        "bg-background rounded-lg p-6 border-l-4 border-primary shadow-sm",
        className
      )}
      data-speakable="true"
      aria-label="Quick answer summary"
    >
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      
      <p className="text-muted-foreground mb-4" data-answer="true">
        {answer}
      </p>

      {highlights.length > 0 && (
        <ul className="space-y-2 mb-4">
          {highlights.map((highlight, index) => (
            <li 
              key={index} 
              className="flex items-start gap-2 text-sm"
              data-highlight="true"
            >
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <span 
              key={index}
              className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full"
            >
              {badge.icon === "info" ? (
                <Info className="h-3 w-3" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              {badge.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickAnswerBox;
