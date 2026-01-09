import { Language, LANGUAGE_NAMES } from "@/lib/translations";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/languageUtils";

export interface HreflangLink {
  lang: string;
  href: string;
}

/**
 * Generates complete bidirectional hreflang links for SEO.
 * Includes x-default, self-reference, and regional variants.
 * 
 * @param baseUrl - The base URL (e.g., https://www.weedmadrid.com)
 * @param path - The path without language prefix (e.g., /clubs)
 * @param availableLanguages - Optional array of available languages for this page
 * @returns Array of HreflangLink objects with complete bidirectional references
 */
export const generateHreflangLinks = (
  baseUrl: string,
  path: string,
  availableLanguages?: Language[]
): HreflangLink[] => {
  const languages = availableLanguages || SUPPORTED_LANGUAGES;
  const links: HreflangLink[] = [];
  
  // Normalize path - remove trailing slash except for root
  const normalizedPath = path === "/" ? "" : path.replace(/\/$/, "");
  
  // Add x-default (points to English version - the default language)
  const defaultHref = `${baseUrl}${normalizedPath}`;
  links.push({
    lang: "x-default",
    href: defaultHref,
  });
  
  // Add each language version with self-reference and regional variants
  languages.forEach((lang) => {
    const langPath = lang === DEFAULT_LANGUAGE 
      ? normalizedPath 
      : `/${lang}${normalizedPath}`;
    const href = `${baseUrl}${langPath}`;
    
    // Add primary language code (self-reference included)
    links.push({
      lang: lang,
      href: href,
    });
    
    // Add regional variants for Spanish
    if (lang === "es") {
      links.push({ lang: "es-ES", href });
      links.push({ lang: "es-MX", href });
      links.push({ lang: "es-AR", href });
    }
    
    // Add regional variants for English
    if (lang === "en") {
      links.push({ lang: "en-US", href });
      links.push({ lang: "en-GB", href });
      links.push({ lang: "en-AU", href });
    }
    
    // Add regional variants for German
    if (lang === "de") {
      links.push({ lang: "de-DE", href });
      links.push({ lang: "de-AT", href });
      links.push({ lang: "de-CH", href });
    }
    
    // Add regional variants for French
    if (lang === "fr") {
      links.push({ lang: "fr-FR", href });
      links.push({ lang: "fr-BE", href });
      links.push({ lang: "fr-CH", href });
      links.push({ lang: "fr-CA", href });
    }
    
    // Add regional variants for Italian
    if (lang === "it") {
      links.push({ lang: "it-IT", href });
      links.push({ lang: "it-CH", href });
    }
  });
  
  return links;
};

export const BASE_URL = "https://www.weedmadrid.com";
