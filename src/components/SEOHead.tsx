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
  speakableSelectors?: string[];
  // Robots directive (noindex, follow, etc.)
  robots?: string;
  // GEO: Generative Engine Optimization props
  citationTitle?: string;
  citationAuthor?: string;
  citationDate?: string;
  geoTxtPath?: string;
  aiPriority?: 'high' | 'medium' | 'low';
  contentSummary?: string;
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
  ogLocaleAlternate = [],
  speakableSelectors = [],
  robots,
  // GEO props
  citationTitle,
  citationAuthor,
  citationDate,
  geoTxtPath,
  aiPriority,
  contentSummary
}: SEOHeadProps) => {
  useEffect(() => {
    // SSG/SEO signal: mark NOT ready while head is being updated
    document.documentElement.setAttribute('data-seo-ready', 'false');

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
    
    // CAMBIO 3: robots directive siempre en <head>
    if (robots) {
      updateMetaTag('robots', robots);
    }
    
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:locale', ogLocale, 'property');
    
    // OG Image with dimensions (GEO improvement)
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property');
      updateMetaTag('og:image:width', '1200', 'property');
      updateMetaTag('og:image:height', '630', 'property');
      updateMetaTag('og:image:alt', title, 'property');
    }

    // CRITICAL: Set og:url to canonical URL
    if (canonical) {
      updateMetaTag('og:url', canonical, 'property');
    }

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

    // og:site_name for brand consistency
    updateMetaTag('og:site_name', 'Weed Madrid', 'property');

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (ogImage) updateMetaTag('twitter:image', ogImage);

    // ============================================
    // GEO: Generative Engine Optimization meta tags
    // ============================================
    
    // Citation meta tags (academic style for AI extraction)
    updateMetaTag('citation_title', citationTitle || title);
    updateMetaTag('citation_author', citationAuthor || 'Weed Madrid Team');
    updateMetaTag('citation_publication_date', citationDate || '2026');
    updateMetaTag('citation_publisher', 'Weed Madrid');
    
    // AI-specific meta tags
    updateMetaTag('ai-crawl-priority', aiPriority || 'medium');
    if (contentSummary) {
      updateMetaTag('llm-content-summary', contentSummary);
    }
    if (geoTxtPath) {
      updateMetaTag('ai-content-files', `${geoTxtPath}, /llm.txt`);
    }

    // Link alternate for GEO txt file
    if (geoTxtPath) {
      let geoLink = document.querySelector('link[rel="alternate"][type="text/plain"]') as HTMLLinkElement;
      if (!geoLink) {
        geoLink = document.createElement('link');
        geoLink.setAttribute('rel', 'alternate');
        geoLink.setAttribute('type', 'text/plain');
        geoLink.setAttribute('title', 'AI-optimized content');
        document.head.appendChild(geoLink);
      }
      geoLink.setAttribute('href', geoTxtPath);
    }

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

    // Update hreflang links with complete bidirectional references
    // Remove existing hreflang links first
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(link => link.remove());
    
    if (hreflangLinks && hreflangLinks.length > 0) {
      hreflangLinks.forEach(({ lang, href }) => {
        const linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'alternate');
        linkElement.setAttribute('hreflang', lang);
        linkElement.setAttribute('href', href);
        document.head.appendChild(linkElement);
      });
    }

    // Add structured data - only remove SEOHead-created scripts, not external ones like OrganizationSchema
    if (structuredData) {
      // CAMBIO 2: Solo eliminar scripts creados por SEOHead (con data-seohead="true")
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-seohead="true"]');
      existingScripts.forEach(script => script.remove());

      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];

      const enrichedData = dataArray.map((data: any) => {
        if (
          speakableSelectors.length > 0 &&
          (data['@type'] === 'Article' || data['@type'] === 'BlogPosting' || data['@type'] === 'NewsArticle')
        ) {
          return {
            ...data,
            speakable: {
              "@type": "SpeakableSpecification",
              "cssSelector": speakableSelectors
            }
          };
        }
        return data;
      });

      enrichedData.forEach((data) => {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        // CAMBIO 2: Marcar scripts creados por SEOHead para no eliminar schemas externos
        scriptElement.setAttribute('data-seohead', 'true');
        scriptElement.textContent = JSON.stringify(data);
        document.head.appendChild(scriptElement);
      });
    }

    // CRITICAL: Use double requestAnimationFrame to ensure DOM is fully painted
    // before signaling SEO ready. This guarantees title/canonical/og:url are in DOM.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-seo-ready', 'true');
      });
    });
  }, [title, description, canonical, ogImage, keywords, structuredData, hreflangLinks, ogLocale, ogLocaleAlternate, speakableSelectors, robots, citationTitle, citationAuthor, citationDate, geoTxtPath, aiPriority, contentSummary]);

  return null;
};

export default SEOHead;
