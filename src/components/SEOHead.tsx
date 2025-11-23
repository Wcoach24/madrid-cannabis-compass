import { useEffect } from "react";

export interface HreflangLink {
  lang: string;
  href: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
  structuredData?: object | object[];
  hreflangLinks?: HreflangLink[];
  ogLocale?: string;
  ogLocaleAlternate?: string[];
}

const SEOHead = ({ 
  title, 
  description, 
  canonical, 
  ogImage,
  keywords,
  structuredData,
  hreflangLinks,
  ogLocale = "en_US",
  ogLocaleAlternate = []
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:locale', ogLocale, 'property');
    if (ogImage) updateMetaTag('og:image', ogImage, 'property');
    
    // Add og:locale:alternate for other languages
    ogLocaleAlternate.forEach((locale, index) => {
      const existingAlternates = document.querySelectorAll('meta[property="og:locale:alternate"]');
      let element = existingAlternates[index] as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', 'og:locale:alternate');
        document.head.appendChild(element);
      }
      element.setAttribute('content', locale);
    });
    
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (ogImage) updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);
    }

    // Add RSS feed link
    let rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
    if (!rssLink) {
      rssLink = document.createElement('link');
      rssLink.setAttribute('rel', 'alternate');
      rssLink.setAttribute('type', 'application/rss+xml');
      rssLink.setAttribute('title', 'Weed Madrid RSS Feed');
      document.head.appendChild(rssLink);
    }
    rssLink.setAttribute('href', 'https://www.weedmadrid.com/api/rss');

    // Update hreflang links
    if (hreflangLinks && hreflangLinks.length > 0) {
      // Remove existing hreflang links
      const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
      existingHreflangs.forEach(link => link.remove());

      // Add new hreflang links
      hreflangLinks.forEach(({ lang, href }) => {
        const linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'alternate');
        linkElement.setAttribute('hreflang', lang);
        linkElement.setAttribute('href', href);
        document.head.appendChild(linkElement);
      });
    }

    // Add structured data (support both single object and array of objects)
    if (structuredData) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());

      // Add new structured data
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data) => {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.textContent = JSON.stringify(data);
        document.head.appendChild(scriptElement);
      });
    }
  }, [title, description, canonical, ogImage, keywords, structuredData, hreflangLinks, ogLocale, ogLocaleAlternate]);

  return null;
};

export default SEOHead;
