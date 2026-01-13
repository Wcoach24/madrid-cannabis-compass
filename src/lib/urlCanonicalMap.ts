/**
 * URL Canonical Map
 * 
 * Maps legacy URLs to their canonical counterparts.
 * Used to ensure internal links always point to the correct 200 URLs.
 */

export const LEGACY_TO_CANONICAL: Record<string, string> = {
  // Guide redirects
  '/how-to-join-cannabis-club-madrid': '/guide/how-to-join-cannabis-club-madrid',
  '/best-cannabis-clubs-madrid': '/guide/best-cannabis-clubs-madrid-2025',
  '/complete-guide-cannabis-clubs-madrid': '/guide/complete-guide-cannabis-clubs-madrid',
  '/cannabis-tourism-madrid': '/guide/cannabis-tourism-madrid-guide',
  '/cannabis-laws-spain-2025': '/guide/cannabis-laws-spain-2025',
  
  // Guides plural -> singular
  '/guides/how-to-join-cannabis-club-madrid': '/guide/how-to-join-cannabis-club-madrid',
  '/guides/cannabis-laws-spain-2025': '/guide/cannabis-laws-spain-2025',
  '/guides/best-cannabis-clubs-madrid-2025': '/guide/best-cannabis-clubs-madrid-2025',
  
  // Invitation routes -> clubs (these should not be linked)
  '/invitation': '/clubs',
  // Note: /invite/* are dynamic, handled separately
  
  // District redirects
  '/district/lavapies': '/district/centro',
  
  // Club redirects (legacy slugs)
  '/clubs/club-tetuan': '/club/norte-verde-association',
  '/clubs/club-retiro': '/club/retiro-botanico-club',
  '/clubs/club-atocha': '/club/atocha-leaf-society',
  '/clubs/club-greenhouse': '/club/genetics-social-club-madrid',
  '/clubs/club-latina': '/club/lavapies-cannabis-association-madrid',
  '/clubs/club-granvia': '/club/gran-via-green-circle',
  '/clubs/club-vallehermoso': '/club/vallehermoso-club-social-madrid',
  '/clubs/club-malasana': '/club/malasana-private-club',
  '/clubs/club-wellness': '/club/chamberi-wellness-association',
};

/**
 * Check if a path is a legacy route that should be avoided
 */
export function isLegacyRoute(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  
  // Direct match
  if (LEGACY_TO_CANONICAL[normalizedPath]) {
    return true;
  }
  
  // Check /invite/* pattern
  if (normalizedPath.startsWith('/invite/')) {
    return true;
  }
  
  // Check /clubs/club-* pattern
  if (normalizedPath.startsWith('/clubs/club-')) {
    return true;
  }
  
  return false;
}

/**
 * Get the canonical URL for a legacy path
 */
export function getCanonicalPath(path: string): string {
  const normalizedPath = path.toLowerCase();
  
  // Check direct mapping
  if (LEGACY_TO_CANONICAL[normalizedPath]) {
    return LEGACY_TO_CANONICAL[normalizedPath];
  }
  
  // /invite/* -> /clubs
  if (normalizedPath.startsWith('/invite/')) {
    return '/clubs';
  }
  
  return path;
}

/**
 * Routes that should NEVER be linked internally
 * (they redirect or are noindex)
 */
export const NO_LINK_ROUTES = [
  '/invitation',
  '/invite/',
];

/**
 * Check if a route should never be linked
 */
export function shouldNotLink(path: string): boolean {
  return NO_LINK_ROUTES.some(route => 
    path === route || path.startsWith(route)
  );
}
