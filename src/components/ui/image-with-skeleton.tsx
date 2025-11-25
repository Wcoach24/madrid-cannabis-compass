import { useState, ImgHTMLAttributes } from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: "video" | "square" | "portrait";
  skeletonClassName?: string;
}

export function ImageWithSkeleton({
  className,
  aspectRatio = "video",
  skeletonClassName,
  alt = "",
  onLoad,
  onError,
  loading = "lazy",
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
        <img
          {...props}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
        />
      )}
    </div>
  );
}
