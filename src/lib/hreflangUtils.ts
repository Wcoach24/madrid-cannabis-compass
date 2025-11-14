import { Language, LANGUAGE_NAMES } from "@/lib/translations";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/languageUtils";

export interface HreflangLink {
  lang: string;
  href: string;
}

export const generateHreflangLinks = (
  baseUrl: string,
  path: string,
  availableLanguages?: Language[]
): HreflangLink[] => {
  const languages = availableLanguages || SUPPORTED_LANGUAGES;
  const links: HreflangLink[] = [];
  
  // Add x-default (points to English version)
  links.push({
    lang: "x-default",
    href: `${baseUrl}${path}`,
  });
  
  // Add each language version
  languages.forEach((lang) => {
    const langPath = lang === DEFAULT_LANGUAGE ? path : `/${lang}${path}`;
    
    links.push({
      lang: lang,
      href: `${baseUrl}${langPath}`,
    });
    
    // Add regional variants for Spanish
    if (lang === "es") {
      links.push({
        lang: "es-ES",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "es-MX",
        href: `${baseUrl}${langPath}`,
      });
    }
    
    // Add regional variants for English
    if (lang === "en") {
      links.push({
        lang: "en-US",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "en-GB",
        href: `${baseUrl}${langPath}`,
      });
    }
  });
  
  return links;
};

export const BASE_URL = "https://lovable.dev"; // TODO: Update this to your production domain
