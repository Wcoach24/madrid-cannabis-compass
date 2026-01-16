import { useState, ImgHTMLAttributes } from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  webpSrc?: string;
  aspectRatio?: "video" | "square" | "portrait";
  skeletonClassName?: string;
  /** Responsive image srcset for different viewport sizes */
  srcSet?: string;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Whether this is an above-the-fold image that should load eagerly */
  priority?: boolean;
}

export function ImageWithSkeleton({
  src,
  webpSrc,
  className,
  aspectRatio = "video",
  skeletonClassName,
  alt = "",
  onLoad,
  onError,
  loading,
  srcSet,
  sizes,
  priority = false,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Only use WebP if explicitly provided
  const finalWebpSrc = webpSrc;
  
  // Determine loading strategy
  const loadingAttr = priority ? "eager" : (loading ?? "lazy");

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(e);
  };

  return (
    <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio])}>
      {isLoading && (
        <Skeleton 
          className={cn(
            "absolute inset-0 w-full h-full", 
            skeletonClassName
          )} 
        />
      )}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          <span>{alt || "Image unavailable"}</span>
        </div>
      ) : (
        <picture translate="no">
          {finalWebpSrc && (
            <source 
              srcSet={srcSet ? srcSet : finalWebpSrc} 
              type="image/webp"
              sizes={sizes}
            />
          )}
          <img
            {...props}
            src={src}
            alt={alt}
            loading={loadingAttr}
            translate="no"
            srcSet={!finalWebpSrc ? srcSet : undefined}
            sizes={!finalWebpSrc ? sizes : undefined}
            fetchPriority={priority ? "high" : undefined}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
          />
        </picture>
      )}
    </div>
  );
}
