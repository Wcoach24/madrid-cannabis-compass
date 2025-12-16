import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export type Language = "en" | "es" | "de" | "fr" | "it";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ["en", "es", "de", "fr", "it"];
const DEFAULT_LANGUAGE: Language = "en";
const STORAGE_KEY = "preferred-language";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const detectBrowserLanguage = (): Language => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
    
    const browserLang = navigator.language.toLowerCase().split("-")[0];
    
    // Map language codes to supported languages
    if (browserLang === "de" || navigator.language.toLowerCase().startsWith("de-")) {
      return "de";
    }
    if (browserLang === "fr" || navigator.language.toLowerCase().startsWith("fr-")) {
      return "fr";
    }
    if (browserLang === "it" || navigator.language.toLowerCase().startsWith("it-")) {
      return "it";
    }
    if (browserLang === "es" || navigator.language.toLowerCase().startsWith("es-")) {
      return "es";
    }
    
    if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
      return browserLang as Language;
    }
    
    return DEFAULT_LANGUAGE;
  };

  const getLanguageFromPath = (): Language => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const firstPart = pathParts[0];
    
    if (SUPPORTED_LANGUAGES.includes(firstPart as Language)) {
      return firstPart as Language;
    }
    
    return DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState<Language>(getLanguageFromPath);

  // Automatic language detection and redirection on first visit
  useEffect(() => {
    const pathLang = getLanguageFromPath();
    const detectedLang = detectBrowserLanguage();
    const hasStoredPreference = localStorage.getItem(STORAGE_KEY);
    
    // Only redirect if user has no stored preference and browser language differs from path
    if (!hasStoredPreference && detectedLang !== pathLang) {
      const pathParts = location.pathname.split("/").filter(Boolean);
      
      // Remove existing language prefix if present
      if (SUPPORTED_LANGUAGES.includes(pathParts[0] as Language)) {
        pathParts.shift();
      }
      
      // Add detected language prefix (unless it's default English)
      const newPath = detectedLang === DEFAULT_LANGUAGE 
        ? "/" + pathParts.join("/") 
        : `/${detectedLang}/${pathParts.join("/")}`;
      
      // Store the detected language as preference
      localStorage.setItem(STORAGE_KEY, detectedLang);
      
      // Redirect to correct language path
      navigate(newPath.replace(/\/+/g, "/") || "/", { replace: true });
    }
  }, []); // Run once on mount

  useEffect(() => {
    const pathLang = getLanguageFromPath();
    setLanguageState(pathLang);
    
    // Update HTML lang attribute and ensure translate is blocked
    document.documentElement.lang = pathLang;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
    
    const pathParts = location.pathname.split("/").filter(Boolean);
    const currentLang = SUPPORTED_LANGUAGES.includes(pathParts[0] as Language) ? pathParts[0] : null;
    
    let newPath = location.pathname;
    if (currentLang) {
      pathParts[0] = lang;
      newPath = "/" + pathParts.join("/");
    } else {
      newPath = lang === DEFAULT_LANGUAGE ? location.pathname : `/${lang}${location.pathname}`;
    }
    
    navigate(newPath);
  };

  const t = (key: string): string => {
    // This will be implemented in translations.ts
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
};
