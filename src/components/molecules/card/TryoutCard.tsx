"use client";

import Image from "next/image";
import { Radio, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import {
  getTryoutButtonState,
  TRYOUT_BUTTON_CLASS,
} from "@/utils/tryout-button-state";
import { PENDING_PILL, PHASE_PILL } from "@/lib/tryout-schedule";
import { useSchedule } from "@/hooks/useSchedule";
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
    isFree: type === "Gratis",
  });
  // Resume and start share /start on purpose: the backend reuses an unfinished
  // session rather than opening a new attempt, while /exam would default to
  // subtest 0 and pull someone back to the beginning of a tryout in progress.
  const buttonHref = isEnrolled
    ? `/dashboard/try-out/${id}/start`
    : `/dashboard/try-out/${id}`;

  const isExternal = imageUrl?.startsWith("http");
  const countdown = useSchedule(startDate, endDate);

  const pill = countdown ? PHASE_PILL[countdown.phase] : PENDING_PILL;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a]">
      {/* The banner an admin uploaded, at banner height and on every screen.
          It used to be hidden below sm, so on a phone - where most of this is
          read - the uploaded artwork never appeared at all. Both branches share
          a height so a grid mixing tryouts with and without artwork stays
          even. */}
      <div className="relative h-36 w-full shrink-0 overflow-hidden border-b-2 border-slate-900 sm:h-40">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Banner ${title}`}
            fill
            className="object-cover"
            unoptimized={!!isExternal}
          />
        ) : (
          /* No upload on this tryout. Deliberately not a stock photo: the
             fallback here used to be a study-abroad advert belonging to
             another company. A track-coloured panel says nothing untrue. */
          <div className="flex h-full w-full flex-col justify-center gap-1 bg-primary px-5">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.13]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 12px)",
              }}
            />
            <TrackIcon
              className="pointer-events-none absolute -bottom-8 -right-6 size-36 text-white/10"
              aria-hidden
            />
            <TrackIcon
              className="relative size-7 text-primary-foreground"
              aria-hidden
            />
            <span className="relative truncate text-xs font-black uppercase tracking-[0.18em] text-primary-foreground">
              {config.full}
            </span>
          </div>
        )}
      </div>

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
            {countdown?.label ?? "Menghitung waktu..."}
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
