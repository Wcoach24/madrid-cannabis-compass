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
    
    // Add regional variants for German
    if (lang === "de") {
      links.push({
        lang: "de-DE",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "de-AT",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "de-CH",
        href: `${baseUrl}${langPath}`,
      });
    }
    
    // Add regional variants for French
    if (lang === "fr") {
      links.push({
        lang: "fr-FR",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "fr-BE",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "fr-CH",
        href: `${baseUrl}${langPath}`,
      });
    }
    
    // Add regional variants for Italian
    if (lang === "it") {
      links.push({
        lang: "it-IT",
        href: `${baseUrl}${langPath}`,
      });
      links.push({
        lang: "it-CH",
        href: `${baseUrl}${langPath}`,
      });
    }
  });
  
  return links;
};

export const BASE_URL = "https://www.weedmadrid.com";
