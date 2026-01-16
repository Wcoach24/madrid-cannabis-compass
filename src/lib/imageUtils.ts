/**
 * Generates responsive image srcset and sizes for club card images.
 * Club images are displayed at different sizes based on viewport:
 * - Mobile: ~100% viewport width (1 column grid)
 * - Tablet: ~50% viewport width (2 column grid)  
 * - Desktop: ~33% viewport width (3 column grid)
 */

export interface ResponsiveImageConfig {
  srcSet: string;
  sizes: string;
}

/**
 * Generate srcset for club card images.
 * Uses the same image but tells browser the intrinsic size for better selection.
 * 
 * For clubs, images are served at ~1814px wide but displayed at:
 * - Mobile: ~400px
 * - Tablet: ~350px  
 * - Desktop: ~450px
 */
export function getClubCardImageConfig(imageUrl: string): ResponsiveImageConfig {
  // Club images in /images/clubs/ are ~1814px wide WebP files
  // We provide size hints so browser can make smart decisions
  
  // Since we have single-size images, we tell the browser the actual size
  // This helps the browser not request oversized images on retina displays
  const srcSet = `${imageUrl} 1814w`;
  
  // Sizes tells the browser how big the image will be displayed:
  // - Below 640px (mobile): full width minus padding (~calc(100vw - 32px))
  // - 640-1024px (tablet): half width for 2-col grid (~calc(50vw - 24px))
  // - Above 1024px (desktop): third width for 3-col grid (~calc(33vw - 24px))
  const sizes = '(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 24px), calc(33vw - 24px)';
  
  return { srcSet, sizes };
}

/**
 * Generate optimized srcset for images with multiple size variants.
 * Use this when you have pre-generated responsive image variants.
 * 
 * @param basePath - Base path without extension (e.g., "/images/clubs/club-name")
 * @param extension - File extension (default: "webp")
 * @param widths - Array of available widths (default: [400, 800, 1200])
 */
export function getResponsiveSrcSet(
  basePath: string,
  extension: string = 'webp',
  widths: number[] = [400, 800, 1200]
): ResponsiveImageConfig {
  const srcSet = widths
    .map(w => `${basePath}-${w}.${extension} ${w}w`)
    .join(', ');
  
  const sizes = '(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 24px), calc(33vw - 24px)';
  
  return { srcSet, sizes };
}
