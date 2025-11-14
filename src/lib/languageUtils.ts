import { Language } from "@/lib/translations";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "es"];
export const DEFAULT_LANGUAGE: Language = "en";

export const getLanguageFromPath = (pathname: string): Language => {
  const pathParts = pathname.split("/").filter(Boolean);
  const firstPart = pathParts[0];
  
  if (SUPPORTED_LANGUAGES.includes(firstPart as Language)) {
    return firstPart as Language;
  }
  
  return DEFAULT_LANGUAGE;
};

export const removeLanguageFromPath = (pathname: string): string => {
  const pathParts = pathname.split("/").filter(Boolean);
  const firstPart = pathParts[0];
  
  if (SUPPORTED_LANGUAGES.includes(firstPart as Language)) {
    pathParts.shift();
  }
  
  return "/" + pathParts.join("/");
};

export const addLanguageToPath = (pathname: string, language: Language): string => {
  const cleanPath = removeLanguageFromPath(pathname);
  
  if (language === DEFAULT_LANGUAGE) {
    return cleanPath;
  }
  
  return `/${language}${cleanPath}`;
};

export const buildLanguageAwarePath = (path: string, language: Language): string => {
  if (language === DEFAULT_LANGUAGE) {
    return path;
  }
  return `/${language}${path}`;
};
