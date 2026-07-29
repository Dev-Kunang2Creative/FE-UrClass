"use client";

import Image from "next/image";

interface HeroBannerProps {
  userName?: string;
}

export default function HeroBanner({ userName }: HeroBannerProps) {
  const displayName = userName || "Amunisian";

  return (
    <section className="relative w-full rounded-2xl overflow-hidden min-h-[180px] md:min-h-[200px]">
      {/* Background Image */}
      <Image
        src="/images/background/bg_dashboard.png"
        alt="Dashboard Background"
        fill
        quality={100}
        unoptimized
        className="object-cover"
        priority
      />

      {/* Gradient Overlay using requested colors over the image */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#378DFF]/90 to-[#8FB5E7]/80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#378DFF]/60 to-[#8FB5E7]/40" />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full min-h-[180px] md:min-h-[200px] px-6 md:px-10">
        <div className="relative z-20 flex flex-col gap-2 w-full md:max-w-[50%] lg:max-w-[60%] xl:max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-white bg-white/20 backdrop-blur-sm shadow-sm border border-white/20 inline-block px-3 py-1 rounded-lg w-fit">
            Welcome {displayName}!
          </h1>
          <p className="text-white/90 text-sm md:text-base leading-relaxed drop-shadow-sm font-medium">
            Lanjutkan perjalanan belajarmu hari ini dan tingkatkan peluang lolos
            PTN impianmu.
          </p>
        </div>

        {/* Right Icon/Illustration */}
        <div className="hidden md:block absolute right-0 lg:right-10 xl:right-20 top-1/2 -translate-y-1/2 w-[240px] lg:w-[280px] h-[200px] pointer-events-none">
          <Image
            src="/images/background/icon_dashboard.png"
            alt="Students Illustration"
            fill
            quality={100}
            unoptimized
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>
    </section>
  );
}
