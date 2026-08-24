"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Radio, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import {
  getTryoutButtonState,
  TRYOUT_BUTTON_CLASS,
} from "@/utils/tryout-button-state";
import { formatJakartaDate } from "@/utils/date-time";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";

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
  sessionStatus?: "not_started" | "in_progress" | "finished" | "expired";
}

type Phase = "upcoming" | "running" | "ended";

interface Countdown {
  phase: Phase;
  label: string;
  dateRange: string;
  /** Under a day left on a running tryout. */
  urgent: boolean;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const PHASE_PILL: Record<Phase, { text: string; className: string }> = {
  running: { text: "Berlangsung", className: "bg-red-600 text-white" },
  upcoming: { text: "Akan Datang", className: "bg-amber-600 text-white" },
  ended: { text: "Selesai", className: "bg-slate-500 text-white" },
};

function remaining(ms: number) {
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / (60 * 1000));
  if (d > 0) return `${d} hari ${h} jam`;
  if (h > 0) return `${h} jam ${m} menit`;
  return `${m} menit`;
}

/**
 * Restyled to the dashboard language: hard border, offset shadow, track
 * colour. It used to be a soft-shadowed white card belonging to a different
 * design system than the page it sat on.
 *
 * The header image mattered most. With no thumbnail on a tryout - which is
 * every seeded one - it fell back to /images/background/bg_to.png: a stock
 * study-abroad advert carrying another company phone number and address,
 * rendered full width on every card and bright blue on a CPNS page. The
 * fallback is now a track-coloured masthead; a real uploaded thumbnail is
 * still shown as-is.
 *
 * The countdown lost its green pill. White on #83CC75 is roughly 2:1, and
 * green belongs to neither track - it reads as text now, red only when a
 * running tryout has under a day left, the same urgency rule the dashboard
 * uses for deadlines.
 */
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
  sessionStatus,
}: TryoutCardProps) {
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const TrackIcon = config.icon;

  const buttonState = getTryoutButtonState({
    isEnrolled,
    hasAttempted,
    sessionStatus,
  });
  // Resume and start share /start on purpose: the backend reuses an unfinished
  // session rather than opening a new attempt, while /exam would default to
  // subtest 0 and pull someone back to the beginning of a tryout in progress.
  const buttonHref = isEnrolled
    ? `/dashboard/try-out/${id}/start`
    : `/dashboard/try-out/${id}`;

  const isExternal = imageUrl?.startsWith("http");
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    const formatDate = (date: Date) =>
      formatJakartaDate(date, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    // One state object, so a tick is one render rather than six.
    const tick = () => {
      const now = Date.now();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const dateRange = `${formatDate(new Date(start))} - ${formatDate(new Date(end))}`;

      if (now < start) {
        setCountdown({
          phase: "upcoming",
          label: `Mulai dalam ${remaining(start - now)}`,
          dateRange,
          urgent: false,
        });
        return;
      }
      if (now <= end) {
        const left = end - now;
        setCountdown({
          phase: "running",
          label: `Berakhir dalam ${remaining(left)}`,
          dateRange,
          urgent: left < DAY,
        });
        return;
      }
      setCountdown({
        phase: "ended",
        label: "Tryout sudah berakhir",
        dateRange,
        urgent: false,
      });
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [startDate, endDate]);

  const pill = PHASE_PILL[countdown?.phase ?? "upcoming"];

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a]">
      {imageUrl ? (
        <div className="relative hidden h-32 w-full border-b-2 border-slate-900 sm:block">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized={!!isExternal}
          />
        </div>
      ) : (
        <div className="relative hidden h-20 items-center gap-3 overflow-hidden border-b-2 border-slate-900 bg-primary px-5 sm:flex">
          <TrackIcon
            className="size-6 shrink-0 text-primary-foreground"
            aria-hidden
          />
          <span className="truncate text-xs font-black uppercase tracking-[0.18em] text-primary-foreground">
            {config.full}
          </span>
          <TrackIcon
            className="pointer-events-none absolute -bottom-7 -right-5 size-28 text-white/10"
            aria-hidden
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border-2 border-slate-900 bg-track-tint px-2.5 py-0.5 text-[11px] font-bold text-slate-900">
            {category || "-"}
          </span>
          <span
            className={`rounded-full border-2 border-slate-900 px-2.5 py-0.5 text-[11px] font-bold ${
              type === "Gratis"
                ? "bg-white text-slate-900"
                : "bg-slate-900 text-white"
            }`}
          >
            {type}
          </span>
        </div>

        <h3 className="mb-3 line-clamp-2 text-[17px] font-black leading-snug tracking-tight text-slate-900">
          {title}
        </h3>

        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-900 px-2.5 py-1 text-[11px] font-bold ${pill.className}`}
          >
            {countdown?.phase === "running" ? (
              <Radio className="size-3.5" aria-hidden />
            ) : (
              <Clock className="size-3.5" aria-hidden />
            )}
            {pill.text}
          </span>
          <span
            className={`text-[11px] font-semibold ${
              countdown?.urgent ? "text-red-600" : "text-slate-500"
            }`}
          >
            {countdown?.label ?? "Menghitung..."}
          </span>
        </div>

        <div className="mb-5 space-y-2 border-t-2 border-dashed border-slate-200 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="text-xs font-medium text-slate-600">
              {countdown?.dateRange ?? "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="text-xs font-medium text-slate-600">
              {participantsCount.toLocaleString("id-ID")} peserta
            </span>
          </div>
        </div>

        <Link
          href={buttonHref}
          className={`mt-auto flex w-full items-center justify-center rounded-xl border-2 border-slate-900 py-2.5 text-sm font-bold transition-all active:translate-y-0.5 ${TRYOUT_BUTTON_CLASS[buttonState.variant]}`}
        >
          {buttonState.label}
        </Link>
      </div>
    </article>
  );
}
