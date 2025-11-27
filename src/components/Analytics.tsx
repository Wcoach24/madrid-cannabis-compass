import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Configuration
// IMPORTANT: Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID
// Find your ID at: https://analytics.google.com/analytics/web/ → Admin → Data Streams
// Or set as environment variable for production deployments
const GA_MEASUREMENT_ID = 'G-7QZTYWQP9F';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only load in production
    if (import.meta.env.PROD) {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      // Initialize gtag
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_path: window.location.pathname,
          cookie_flags: 'SameSite=None;Secure'
        });
      `;
      document.head.appendChild(script2);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

// Custom event tracking functions
export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Predefined event trackers for common actions
export const trackClubView = (clubSlug: string, clubName: string) => {
  trackEvent('view_club', {
    club_slug: clubSlug,
    club_name: clubName,
  });
};

export const trackInvitationRequest = (clubSlug: string) => {
  trackEvent('invitation_request', {
    club_slug: clubSlug,
  });
};

export const trackQuickFinderUse = (district?: string) => {
  trackEvent('quick_finder_use', {
    district: district || 'all',
  });
};

export const trackLanguageSwitch = (fromLang: string, toLang: string) => {
  trackEvent('language_switch', {
    from: fromLang,
    to: toLang,
  });
};

export const trackDistrictFilter = (district: string) => {
  trackEvent('district_filter', {
    district,
  });
};

export const trackInvitationFormStep = (step: number, stepName: string) => {
  trackEvent('invitation_form_step', {
    step_number: step,
    step_name: stepName,
  });
};

export const trackInvitationSubmit = (clubSlug: string, visitorCount: number) => {
  trackEvent('invitation_submit', {
    club_slug: clubSlug,
    visitor_count: visitorCount,
  });
};
