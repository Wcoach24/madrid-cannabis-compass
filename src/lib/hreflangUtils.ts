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
  
  // Add each language version - ONLY primary language codes, no regional variants (CAMBIO 4)
  languages.forEach((lang) => {
    const langPath = lang === DEFAULT_LANGUAGE 
      ? normalizedPath 
      : `/${lang}${normalizedPath}`;
    const href = `${baseUrl}${langPath}`;
    
    // Add primary language code only (es, en, de, fr, it)
    links.push({
      lang: lang,
      href: href,
    });
  });
  
  return links;
};

export const BASE_URL = "https://www.weedmadrid.com";
