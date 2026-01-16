import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Configuration
const GA_MEASUREMENT_ID = 'G-7QZTYWQP9F';

// Microsoft Clarity Configuration
const CLARITY_ID = 'uy7dw57fqo';

// Declare gtag and clarity functions for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
  }
}

export const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only load in production
    if (import.meta.env.PROD) {
      // Initialize dataLayer immediately so events can queue before scripts load
      if (!window.dataLayer) {
        window.dataLayer = [];
      }

      const loadAnalytics = () => {
        // Prevent duplicate script injections
        if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
          return;
        }

        // Load Google Analytics
        if (!window.gtag) {
          const script1 = document.createElement('script');
          script1.async = true;
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
          document.head.appendChild(script1);

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

        // Load Microsoft Clarity (prevent duplicates)
        if (!window.clarity && !document.querySelector('script[src*="clarity.ms"]')) {
          const clarityScript = document.createElement('script');
          clarityScript.innerHTML = `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `;
          document.head.appendChild(clarityScript);
        }
      };

      // Defer analytics until after page is fully loaded, then wait for idle time
      const deferredLoad = () => {
        if ('requestIdleCallback' in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(loadAnalytics, { timeout: 5000 });
        } else {
          setTimeout(loadAnalytics, 2000);
        }
      };

      // Wait for window.onload to avoid blocking LCP
      if (document.readyState === 'complete') {
        deferredLoad();
      } else {
        window.addEventListener('load', deferredLoad, { once: true });
      }
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
