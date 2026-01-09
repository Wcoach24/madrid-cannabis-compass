import { useEffect } from "react";
import { BASE_URL } from "@/lib/hreflangUtils";

/**
 * OrganizationSchema component - Adds site-wide Organization structured data
 * This should be included on every page to establish E-A-T signals
 */
const OrganizationSchema = () => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Weed Madrid Educational Project",
      "alternateName": ["Weed Madrid", "WeedMadrid.com"],
      "url": BASE_URL,
      "logo": `${BASE_URL}/logo.png`,
      "description": "Expert cannabis club directory and invitation service for Madrid, Spain. Connecting tourists and locals with verified cannabis social clubs through comprehensive guides and real-time information.",
      "email": "info@weedmadrid.com",
      "foundingDate": "2024",
      "founder": {
        "@type": "Organization",
        "name": "Weed Madrid Team"
      },
      "sameAs": [
        `${BASE_URL}/guides`,
        `${BASE_URL}/clubs`,
        `${BASE_URL}/about.txt`,
        `${BASE_URL}/api.txt`,
        "https://www.google.com/maps/place/?q=place_id:ChIJ7Z2SYXEpQg0R0_RjmwNLhGA"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "info@weedmadrid.com",
        "availableLanguage": ["English", "Spanish"],
        "areaServed": {
          "@type": "City",
          "name": "Madrid",
          "addressCountry": "ES"
        }
      },
      "areaServed": {
        "@type": "City",
        "name": "Madrid",
        "addressCountry": "ES"
      },
      "knowsAbout": [
        "Cannabis Social Clubs",
        "Spanish Cannabis Legislation",
        "Madrid Tourism",
        "Cannabis Club Membership",
        "Legal Cannabis Access Spain"
      ],
      "slogan": "Your Guide to Legal Cannabis Clubs in Madrid",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "250",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // Add schema to head
    const scriptId = 'organization-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    
    scriptTag.textContent = JSON.stringify(schema);

    return () => {
      // Cleanup on unmount (optional - schema can persist)
    };
  }, []);

  return null; // This component doesn't render anything
};

export default OrganizationSchema;