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
import { KATEGORI_CONFIG } from "@/lib/kategori";

/**
 * Enam banner promosi, tampil berurutan sesuai nomor asetnya.
 *
 * Sebelumnya daftarnya dipisah per jalur dan sisi CPNS hanya memakai ulang
 * gambar UTBK karena belum ada karyanya. Aset sekarang sudah mencakup keduanya
 * - biru untuk UTBK, oranye untuk CPNS dan promo - jadi keduanya memakai satu
 * urutan yang sama.
 */
const INFO_CARDS: { src: string; alt: string; href: string }[] = [
  {
    src: "/images/carousel/slide-1.webp",
    alt: "Tryout UTBK - saatnya buktikan persiapanmu",
    href: "/dashboard/try-out",
  },
  {
    src: "/images/carousel/slide-2.webp",
    alt: "Buruan, promonya terbatas",
    href: "/dashboard/pembelian",
  },
  {
    src: "/images/carousel/slide-3.webp",
    alt: "Ingat tryout, ingat UrClass - daftar sekarang",
    href: "/dashboard/try-out",
  },
  {
    src: "/images/carousel/slide-4.webp",
    alt: "Tryout CPNS - siap sekarang, lolos sekarang",
    href: "/dashboard/try-out",
  },
  {
    src: "/images/carousel/slide-5.webp",
    alt: "Tryout hemat dan murah, hanya di urclass.id",
    href: "/dashboard/pembelian",
  },
  {
    src: "/images/carousel/slide-6.webp",
    alt: "Soal dan pembahasan lengkap",
    href: "/dashboard/try-out",
  },
];
export default function InfoCardCarousel() {
  const { kategori } = useKategori();
  const cards = INFO_CARDS;
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
            delay: 2800,
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
                {/* Tanpa unoptimized, Next memotong ukurannya sesuai sizes dan
                    menyajikan format modern - kartu selebar 24vw tidak lagi
                    mengunduh gambar 1400px utuh. Yang pertama diberi priority
                    karena berada di paruh atas beranda. */}
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 38vw, 24vw"
                  priority={index === 0}
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
