import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGE_NAMES, Language } from "@/lib/translations";

const DISMISSED_KEY = "language-suggestion-dismissed";

const LanguageSuggestion = () => {
  const { language, setLanguage } = useLanguage();
  const [show, setShow] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState<Language | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      return;
    }

    const browserLang = navigator.language.split("-")[0] as Language;
    
    // Only show if browser language is Spanish and current page is English
    if (browserLang === "es" && language === "en") {
      setSuggestedLanguage(browserLang);
      setShow(true);
    }
  }, [language]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleSwitch = () => {
    if (suggestedLanguage) {
      setLanguage(suggestedLanguage);
    }
    handleDismiss();
  };

  if (!show || !suggestedLanguage) {
    return null;
  }

  return (
    <Alert className="fixed bottom-4 right-4 max-w-md z-50 shadow-lg border-primary/50">
      <div className="flex items-start gap-3">
        <AlertDescription className="flex-1">
          This page is available in <strong>{LANGUAGE_NAMES[suggestedLanguage]}</strong>.
          <div className="flex gap-2 mt-2">
            <Button onClick={handleSwitch} size="sm">
              Switch to {LANGUAGE_NAMES[suggestedLanguage]}
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm">
              Stay in English
            </Button>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default LanguageSuggestion;
