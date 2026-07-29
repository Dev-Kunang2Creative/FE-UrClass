"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Radio, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { getTryoutButtonState, TRYOUT_BUTTON_CLASS } from "@/utils/tryout-button-state";
import { formatJakartaDate } from "@/utils/date-time";

interface TryoutCardProps {
  id: number | string;
  title: string;
  type: "Gratis" | "Premium";
  category?: string | null;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  participantsCount?: number;
  isEnrolled?: boolean;
  hasAttempted?: boolean;
}

export default function TryoutCard({
  id,
  title,
  type,
  category,
  startDate,
  endDate,
  imageUrl,
  participantsCount = 0,
  isEnrolled = false,
  hasAttempted = false,
}: TryoutCardProps) {
  const buttonState = getTryoutButtonState({ isEnrolled, hasAttempted });
  const buttonHref = isEnrolled ? `/dashboard/try-out/${id}/start` : `/dashboard/try-out/${id}`;

  const [statusText, setStatusText] = useState("Menghitung...");
  const [statusTheme, setStatusTheme] = useState("bg-gray-400"); // for the left tag
  const [iconVariant, setIconVariant] = useState(<Radio className="w-3.5 h-3.5" />); // default icon
  const [countdownText, setCountdownText] = useState("");
  const [countdownTheme, setCountdownTheme] = useState("bg-gray-300"); // for the right tag
  const [dateRangeText, setDateRangeText] = useState("");

  const thumbnailSrc = imageUrl || "/images/background/bg_to.png";
  const isExternal = imageUrl?.startsWith("http");

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date().getTime();
      const phaseStart = new Date(startDate).getTime();
      const phaseEnd = new Date(endDate).getTime();

      const formatDate = (date: Date) => {
        return formatJakartaDate(date, { day: "2-digit", month: "long", year: "numeric" });
      };

      setDateRangeText(`${formatDate(new Date(phaseStart))} - ${formatDate(new Date(phaseEnd))}`);

      if (now >= phaseStart && now <= phaseEnd) {
        setStatusText("Berlangsung");
        setStatusTheme("bg-[#E54D4D]");
        setIconVariant(<Radio className="w-3.5 h-3.5" />);
        setCountdownTheme("bg-[#83CC75]");
        
        // Calculate countdown to end of current phase
        const distance = phaseEnd - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdownText(`${days} hr, ${hours} j ${minutes} m, ${seconds} dtk`);
        
      } else if (now < phaseStart) {
        setStatusText("Akan Datang");
        setStatusTheme("bg-[#F59E0B]"); // amber/orange
        setIconVariant(<Clock className="w-3.5 h-3.5" />);
        setCountdownTheme("bg-[#83CC75]"); // fixed to specified green

        // Calculate countdown to start of phase
        const distance = phaseStart - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdownText(`Mulai dlm ${days} hr, ${hours} j ${minutes} m, ${seconds} dtk`);
      } else {
        setStatusText("Selesai");
        setStatusTheme("bg-[#6B7280]"); // gray
        setIconVariant(<Clock className="w-3.5 h-3.5" />);
        setCountdownTheme("bg-[#9CA3AF]");
        setCountdownText("Tryout berakhir");
      }
    };

    updateStatus();
    const intervalId = setInterval(updateStatus, 1000);
    return () => clearInterval(intervalId);
  }, [startDate, endDate]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Background Image Header */}
      <div className="relative hidden sm:block w-full h-40">
        <Image
          src={thumbnailSrc}
          alt={title}
          fill
          className="object-cover"
          unoptimized={!!isExternal}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/30 backdrop-blur-sm border border-white/40 text-white text-xs px-3 py-1 rounded-full font-medium">
            {category || "-"}
          </span>
          <span className="bg-white/30 backdrop-blur-sm border border-white/40 text-white text-xs px-3 py-1 rounded-full font-medium">
            {type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="mb-3 flex gap-2 sm:hidden">
          <span className="bg-blue-50 border border-blue-100 text-[#004AAB] text-xs px-3 py-1 rounded-full font-semibold">
            {category || "-"}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${type === "Gratis" ? "bg-green-50 border border-green-100 text-green-700" : "bg-amber-50 border border-amber-100 text-amber-700"}`}>
            {type}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-[17px] mb-3 line-clamp-1">
          {title}
        </h3>

        {/* Status Badges */}
        <div className="flex items-stretch gap-2 mb-4">
          <div className={`${statusTheme} text-white flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium min-w-max`}>
            {iconVariant}
            <span>{statusText}</span>
          </div>
          <div className={`${countdownTheme} text-white flex items-center justify-center px-2 py-1.5 rounded-lg text-[11px] font-medium flex-1 text-center line-clamp-1`}>
            {countdownText || "Memuat..."}
          </div>
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Details List */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.75 h-3.75 text-gray-400" />
            <span className="text-gray-600 text-xs font-medium">
              {dateRangeText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.75 h-3.75 text-gray-400" />
            <span className="text-gray-600 text-xs font-medium">
              {participantsCount.toLocaleString("id-ID")} peserta
            </span>
          </div>
        </div>

        {/* Button */}
        <Link
          href={buttonHref}
          className={`w-full transition-colors py-2.5 rounded-lg text-sm font-semibold mt-auto flex justify-center items-center ${TRYOUT_BUTTON_CLASS[buttonState.variant]}`}
        >
          {buttonState.label}
        </Link>
      </div>
    </div>
  );
}
