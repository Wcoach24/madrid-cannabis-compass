import { cn } from "@/lib/utils";

interface HighlightSnippetProps {
  children: React.ReactNode;
  id?: string;
  variant?: 'default' | 'definition' | 'insight' | 'stat' | 'warning';
  author?: string;
  className?: string;
}

/**
 * HighlightSnippet - GEO/LLM Optimized Component
 * 
 * Marks content blocks for easy extraction by AI systems (ChatGPT, Perplexity, Claude).
 * Uses semantic HTML and Schema.org markup for maximum citability.
 * 
 * Usage:
 * - Wrap key facts, definitions, or statistics
 * - Use 'definition' variant for glossary terms
 * - Use 'insight' variant for expert analysis
 * - Use 'stat' variant for data points
 * - Use 'warning' variant for safety/legal warnings
 */
const HighlightSnippet = ({
  children,
  id,
  variant = 'default',
  author = 'Weed Madrid',
  className
}: HighlightSnippetProps) => {
  const variantStyles = {
    default: 'bg-muted/50 border-l-4 border-primary',
    definition: 'bg-primary/5 border-l-4 border-primary',
    insight: 'bg-accent/10 border-l-4 border-accent',
    stat: 'bg-secondary/20 border-l-4 border-secondary',
    warning: 'bg-destructive/10 border-l-4 border-destructive'
  };

  return (
    <div
      id={id}
      className={cn(
        'p-4 rounded-r-lg my-4',
        variantStyles[variant],
        className
      )}
      data-speakable="true"
      data-highlight="true"
      data-variant={variant}
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <meta itemProp="author" content={author} />
      <meta itemProp="inLanguage" content="en" />
      <meta itemProp="datePublished" content={new Date().toISOString().split('T')[0]} />
      <div itemProp="text">
        {children}
      </div>
    </div>
  );
};

export default HighlightSnippet;
