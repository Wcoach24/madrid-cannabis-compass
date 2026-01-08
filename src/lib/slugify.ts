/**
 * Robust slugify function for URL-safe strings
 * Removes diacritics, special characters, and normalizes to lowercase kebab-case
 */
export function slugifyDistrict(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    // Normalize and remove diacritics (accents)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove & and other special characters
    .replace(/[&]/g, '')
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim hyphens from start and end
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if a slug needs normalization (has diacritics or special chars)
 */
export function needsSlugNormalization(slug: string): boolean {
  if (!slug) return false;
  const normalized = slugifyDistrict(slug);
  return normalized !== slug;
}
