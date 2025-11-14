import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ["en", "es"];
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
    
    const browserLang = navigator.language.split("-")[0];
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

  useEffect(() => {
    const pathLang = getLanguageFromPath();
    setLanguageState(pathLang);
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
