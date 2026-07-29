"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Ticket } from "lucide-react";

interface KelasCardProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  ticketAmount?: number;
  enrollmentsCount?: number;
  description?: string | null;
}

export default function KelasCard({
  id,
  name,
  price,
  discountPrice,
  imageUrl,
  ticketAmount = 0,
  enrollmentsCount = 0,
  description,
}: KelasCardProps) {
  const thumbnailSrc = imageUrl || "/images/background/bg_to.png";
  const isExternal = imageUrl?.startsWith("http");
  const isFree = price === 0;
  const hasDiscount = discountPrice != null && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice! : price;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full h-40">
        <Image
          src={thumbnailSrc}
          alt={name}
          fill
          className="object-cover"
          unoptimized={!!isExternal}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`text-white text-xs px-3 py-1 rounded-full font-medium ${
              isFree
                ? "bg-green-500/80 backdrop-blur-sm"
                : "bg-[#004AAB]/80 backdrop-blur-sm"
            }`}
          >
            {isFree ? "Gratis" : "Berbayar"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-[17px] mb-2 line-clamp-1">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          {isFree ? (
            <span className="text-green-600 font-bold text-lg">Gratis</span>
          ) : (
            <>
              <span className="text-[#004AAB] font-bold text-lg">
                Rp{finalPrice.toLocaleString("id-ID")}
              </span>
              {hasDiscount && (
                <span className="text-slate-400 text-sm line-through">
                  Rp{price.toLocaleString("id-ID")}
                </span>
              )}
            </>
          )}
        </div>

        {/* Ticket bonus */}
        {ticketAmount > 0 && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-3">
            <Ticket className="w-4 h-4 shrink-0" />
            <span>
              Bonus <strong>{ticketAmount} tiket</strong> tryout
            </span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}

        <hr className="border-gray-100 mb-3" />

        {/* Participants */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500 text-xs font-medium">
            {enrollmentsCount.toLocaleString("id-ID")} peserta
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/dashboard/kelas/${id}`}
          className="w-full bg-[#004AAB] hover:bg-[#003B8A] transition-colors text-white py-2.5 rounded-lg text-sm font-semibold mt-auto flex justify-center items-center"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
