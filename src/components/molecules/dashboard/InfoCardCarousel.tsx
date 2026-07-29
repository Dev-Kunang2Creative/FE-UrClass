"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const INFO_CARDS = [
  {
    src: "/images/tryout/tryout-01.webp",
    alt: "Tryout 01",
    href: "/dashboard/try-out",
  },
  {
    src: "/images/tryout/tryout-02.webp",
    alt: "Tryout 02",
    href: "/dashboard/try-out",
  },
  {
    src: "/images/tryout/tryout-03.webp",
    alt: "Tryout 03",
    href: "/dashboard/try-out",
  },
  {
    src: "/images/ticket/starter.webp",
    alt: "Info UTBK Starter",
    href: "/dashboard/pembelian",
  },
  {
    src: "/images/ticket/ambis.webp",
    alt: "Info UTBK Ambis",
    href: "/dashboard/pembelian",
  },
  {
    src: "/images/ticket/booster.webp",
    alt: "Info UTBK Booster",
    href: "/dashboard/pembelian",
  },
  {
    src: "/images/ticket/ultimate.webp",
    alt: "Info UTBK Ultimate",
    href: "/dashboard/pembelian",
  },
];

export default function InfoCardCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setActiveIndex(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900">
        Buat amunisian yang mau kejar UTBK
      </h2>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {INFO_CARDS.map((card, index) => (
            <CarouselItem
              key={index}
              className="pl-3 basis-[75%] sm:basis-[55%] md:basis-[40%] lg:basis-[30%]"
            >
              <Link
                href={card.href}
                className="block group relative w-full h-[280px] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  width={1080}
                  height={1920}
                  quality={100}
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Animated Dot Indicators */}
      <div className="flex justify-center items-center gap-1.5">
        {Array.from({ length: snapCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "rounded-full transition-all duration-300 ease-out",
              index === activeIndex
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
