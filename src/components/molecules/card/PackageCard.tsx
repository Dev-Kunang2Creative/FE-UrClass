"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, Tag, Ticket } from "lucide-react";

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ??
  "https://dev-api.amunisiptn.com/storage";

interface PackageCardProps {
  id: string;
  title: string;
  thumbnail: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  description?: string;
  ticketAmount?: number;
}

export default function PackageCard({
  id,
  title,
  thumbnail,
  price,
  originalPrice,
  discountPercent,
  description,
  ticketAmount,
}: PackageCardProps) {
  const thumbnailSrc = thumbnail ? `${STORAGE_BASE_URL}/${thumbnail}` : null;

  const isExternal = thumbnailSrc?.startsWith("http");

  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      {/* Thumbnail / Header */}
      <div className="relative w-full h-40 bg-[#004AAB]">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            unoptimized={!!isExternal}
          />
        ) : (
          /* Fallback: decorative gradient with icon */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#004AAB] to-[#0065F0] gap-2">
            <Package className="w-10 h-10 text-white/40" />
          </div>
        )}

        {/* Discount badge overlay */}
        {discountPercent != null && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            -{discountPercent}%
          </div>
        )}

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pt-6 pb-3">
          <h3 className="text-white font-bold text-[15px] leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col p-4 gap-3 flex-1">
        {/* Description */}
        {description && (
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Ticket amount */}
        {ticketAmount != null && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Ticket className="w-3.5 h-3.5 text-[#004AAB]" />
            <span>{ticketAmount} tiket tryout</span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <span className="font-bold text-xl text-[#004AAB]">
              Rp{price.toLocaleString("id-ID")}
            </span>
            {originalPrice != null && (
              <span className="text-xs font-medium text-slate-400 line-through">
                Rp{originalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
          {discountPercent != null && (
            <div className="flex items-center gap-1 bg-blue-50 text-[#004AAB] px-2 py-1 rounded-md text-xs font-bold">
              <Tag className="w-3 h-3" />
              Hemat {discountPercent}%
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={`/dashboard/pembelian/${id}`}
          className="w-full flex justify-center items-center py-2.5 bg-[#004AAB] hover:bg-[#003B8A] active:bg-[#002F75] text-white font-semibold rounded-lg transition-colors text-sm shadow-sm mt-1"
        >
          Beli Paket
        </Link>
      </div>
    </div>
  );
}
