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
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG, type Kategori } from "@/lib/kategori";

const INFO_CARDS: Record<Kategori, { src: string; alt: string; href: string }[]> = {
  utbk: [
    { src: "/images/tryout/tryout-01.webp", alt: "Tryout 01", href: "/dashboard/try-out" },
    { src: "/images/tryout/tryout-02.webp", alt: "Tryout 02", href: "/dashboard/try-out" },
    { src: "/images/tryout/tryout-03.webp", alt: "Tryout 03", href: "/dashboard/try-out" },
    { src: "/images/ticket/starter.webp", alt: "Info UTBK Starter", href: "/dashboard/pembelian" },
    { src: "/images/ticket/ambis.webp", alt: "Info UTBK Ambis", href: "/dashboard/pembelian" },
    { src: "/images/ticket/booster.webp", alt: "Info UTBK Booster", href: "/dashboard/pembelian" },
    { src: "/images/ticket/ultimate.webp", alt: "Info UTBK Ultimate", href: "/dashboard/pembelian" },
  ],
  // No CPNS-specific artwork exists yet, so reuse the neutral tryout/ticket art.
  cpns: [
    { src: "/images/tryout/tryout-01.webp", alt: "Tryout SKD", href: "/dashboard/try-out" },
    { src: "/images/tryout/tryout-02.webp", alt: "Simulasi CAT BKN", href: "/dashboard/try-out" },
    { src: "/images/ticket/starter.webp", alt: "Paket SKD Starter", href: "/dashboard/pembelian" },
    { src: "/images/ticket/booster.webp", alt: "Paket SKD Intensif", href: "/dashboard/pembelian" },
  ],
};

export default function InfoCardCarousel() {
  const { kategori } = useKategori();
  const cards = INFO_CARDS[kategori];
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
    <section className="flex flex-col gap-3">
      <h2 className="text-sm sm:text-base font-bold text-slate-900">
        {KATEGORI_CONFIG[kategori].heading}
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
          {cards.map((card, index) => (
            <CarouselItem
              key={index}
              className="pl-3 basis-[82%] sm:basis-[52%] md:basis-[38%] lg:basis-[30%] xl:basis-[24%]"
            >
              <Link
                href={card.href}
                className="block group relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all duration-300 bg-slate-100"
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 38vw, 24vw"
                  quality={100}
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Animated Dot Indicators */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {Array.from({ length: snapCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "rounded-full transition-all duration-300 ease-out",
              index === activeIndex
                ? cn("w-6 h-2", KATEGORI_CONFIG[kategori].theme.dot)
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
