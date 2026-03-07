import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ClubGalleryProps {
  mainImage: string;
  galleryImages?: string[];
  clubName: string;
}

export function ClubGallery({ mainImage, galleryImages = [], clubName }: ClubGalleryProps) {
  const allImages = [mainImage, ...galleryImages];
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // If only one image, show simple image without carousel
  if (allImages.length === 1) {
    return (
      <div className="w-full h-64 md:h-96">
        <ImageWithSkeleton
          src={mainImage}
          alt={`${clubName} - Cannabis social club interior`}
          aspectRatio="video"
          className="h-64 md:h-96"
          loading="eager"
        />
      </div>
    );
  }

  // Update current slide when carousel changes
  const onSelect = () => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
  };

  return (
    <div className="w-full">
      {/* Main Carousel */}
      <Carousel 
        className="w-full" 
        opts={{ loop: true }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-0" onPointerUp={onSelect}>
          {allImages.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div 
                className="cursor-pointer h-64 md:h-96"
                onClick={() => setSelectedImageIndex(index)}
              >
                <ImageWithSkeleton
                  src={image}
                  alt={`${clubName} - Photo ${index + 1}`}
                  aspectRatio="video"
                  className="h-64 md:h-96"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation arrows */}
        <CarouselPrevious className="left-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
        <CarouselNext className="right-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
      </Carousel>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((image, index) => (
          <button
            key={index}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              currentSlide === index 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
            onClick={() => {
              api?.scrollTo(index);
              setCurrentSlide(index);
            }}
            aria-label={`View photo ${index + 1}`}
          >
            <img
              src={image}
              alt=""
              width={64}
              height={64}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-border">
          {selectedImageIndex !== null && (
            <img
              src={allImages[selectedImageIndex]}
              alt={`${clubName} - Photo ${selectedImageIndex + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
