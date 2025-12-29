"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "./carousel-base";

interface BlogCarouselProps {
  children: React.ReactNode;
  className?: string;
}

function CarouselNavigation() {
  const { canScrollPrev, canScrollNext } = useCarousel();

  return (
    <>
      {canScrollPrev && (
        <CarouselPrevious className="-left-16 top-1/2 -translate-y-1/2" variant="ghost">
          <span className="sr-only"></span>
        </CarouselPrevious>
      )}
      {canScrollNext && (
        <CarouselNext className="-right-16 top-1/2 -translate-y-1/2" variant="ghost">
          <span className="sr-only"></span>
        </CarouselNext>
      )}
    </>
  );
}

export function BlogCarousel({ children, className }: BlogCarouselProps) {
  return (
    <div className={`relative ${className || ""}`}>
      <Carousel
        opts={{
          align: "start",
          containScroll: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {React.Children.map(children, (child, index) => (
            <CarouselItem key={index} className="pl-0 basis-full">
              <div className="w-full">
                {child}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNavigation />
      </Carousel>
    </div>
  );
}
