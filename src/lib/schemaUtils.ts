import { Language } from "@/lib/translations";
import { BASE_URL } from "@/lib/hreflangUtils";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Speakable Schema for voice search optimization
 * Helps Google Assistant and other voice assistants identify
 * the most relevant content to read aloud
 */
export const generateSpeakableSchema = (
  url: string,
  cssSelectors: string[] = ["h1", "[data-speakable='true']", "[data-answer='true']"]
) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": url,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": cssSelectors
    }
  };
};

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateLocalBusinessSchema = (club: {
  name: string;
  description: string;
  address: string;
  district: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  priceRange?: string;
  openingHours?: any;
  imageUrl?: string;
  website?: string;
}) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": club.name,
    "description": club.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": club.city,
      "addressRegion": club.district,
      "addressCountry": "ES"
    },
    "priceRange": club.priceRange || "€€"
  };

  if (club.postalCode) {
    schema.address.postalCode = club.postalCode;
  }

  if (club.latitude && club.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": club.latitude.toString(),
      "longitude": club.longitude.toString()
    };
  }

  if (club.imageUrl) {
    schema.image = club.imageUrl;
  }

  if (club.website) {
    schema.url = club.website;
  }

  if (club.openingHours) {
    schema.openingHoursSpecification = Object.entries(club.openingHours).map(([day, hours]: [string, any]) => {
      if (!hours || hours.closed) return null;
      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
        "opens": hours.open,
        "closes": hours.close
      };
    }).filter(Boolean);
  }

  return schema;
};

export const generateHowToSchema = (article: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; url?: string; image?: string }>;
  totalTime?: string;
  imageUrl?: string;
}) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": article.name,
    "description": article.description,
    "step": article.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url && { "url": step.url }),
      ...(step.image && { "image": step.image })
    }))
  };

  if (article.totalTime) {
    schema.totalTime = article.totalTime;
  }

  if (article.imageUrl) {
    schema.image = article.imageUrl;
  }

  return schema;
};

export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  author: string;
  authorBio?: string;
  publishedDate: string;
  modifiedDate: string;
  imageUrl?: string;
  url: string;
  language: Language;
}) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.headline,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Weed Madrid Educational Project",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "datePublished": article.publishedDate,
    "dateModified": article.modifiedDate,
    "inLanguage": article.language,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };

  if (article.authorBio) {
    schema.author.description = article.authorBio;
  }

  if (article.imageUrl) {
    schema.image = {
      "@type": "ImageObject",
      "url": article.imageUrl
    };
  }

  return schema;
};

export const generateFAQPageSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateCollectionPageSchema = (
  name: string,
  description: string,
  url: string,
  items: Array<{ name: string; url: string }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "url": item.url
      }))
    }
  };
};
