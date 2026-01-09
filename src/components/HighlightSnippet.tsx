import { cn } from "@/lib/utils";

interface HighlightSnippetProps {
  children: React.ReactNode;
  id?: string;
  variant?: "default" | "definition" | "insight" | "stat";
  className?: string;
  author?: string;
}

/**
 * HighlightSnippet - GEO-optimized component for AI-citable content blocks
 * 
 * Use this component to mark important content that should be easily
 * extractable by AI systems and voice assistants.
 * 
 * @example
 * <HighlightSnippet variant="definition">
 *   Cannabis social clubs are private, non-profit associations...
 * </HighlightSnippet>
 */
const HighlightSnippet = ({ 
  children, 
  id, 
  variant = "default",
  className,
  author = "Weed Madrid Team"
}: HighlightSnippetProps) => {
  const variantStyles = {
    default: "bg-accent/10 border-l-4 border-primary p-4 rounded-r-lg",
    definition: "bg-blue-950/30 border border-blue-800/50 p-4 rounded-lg",
    insight: "bg-green-950/30 border border-green-800/50 p-4 rounded-lg",
    stat: "bg-purple-950/30 border border-purple-800/50 p-4 rounded-lg"
  };

  return (
    <div 
      id={id}
      className={cn("snippet-block my-4", variantStyles[variant], className)}
      data-speakable="true"
      data-ai-extract="true"
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <meta itemProp="author" content={author} />
      <meta itemProp="publisher" content="Weed Madrid" />
      <meta itemProp="inLanguage" content="en" />
      <div itemProp="text">{children}</div>
    </div>
  );
};

export default HighlightSnippet;
