import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FloatingCTAProps {
  clubSlug: string;
  spotsRemaining?: number;
}

export const FloatingCTA = ({ clubSlug, spotsRemaining = 127 }: FloatingCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA after scrolling 800px (past hero section)
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    navigate("/invitation-form");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop: Bottom-right floating button */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-50 animate-fade-in">
        <Button
          size="lg"
          onClick={handleClick}
          className="shadow-2xl hover:scale-105 transition-transform duration-200 animate-pulse-glow group"
        >
          {t("club.requestInvitation")}
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        {spotsRemaining && (
          <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {spotsRemaining} {t("club.spotsLeft")}
          </div>
        )}
      </div>

      {/* Mobile: Sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl">
          <div className="container py-3 px-4 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{t("club.requestInvitation")}</span>
              {spotsRemaining && (
                <span className="text-xs text-muted-foreground">
                  {spotsRemaining} {t("club.spotsLeft")}
                </span>
              )}
            </div>
            <Button onClick={handleClick} size="lg" className="flex-shrink-0 group">
              {t("common.continue")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
