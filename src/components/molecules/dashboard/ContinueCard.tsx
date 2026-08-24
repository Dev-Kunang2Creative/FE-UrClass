"use client";

import Link from "next/link";
import { PlayCircle, Clock, AlertTriangle } from "lucide-react";
import { formatJakartaDateTime } from "@/utils/date-time";
import type { UserTryoutData } from "@/http/tryout/get-user-tryouts";

interface ContinueCardProps {
  tryouts: UserTryoutData[];
  loading?: boolean;
}

/**
 * The way back into an unfinished exam.
 *
 * This is the whole reason the dashboard was rebuilt: the API has always sent
 * user_session_status, but the frontend mapper collapsed it into a boolean, so
 * someone who closed the tab mid-exam had no route back from here - and the
 * tryout list offered them "Kerjakan Ulang", which reads as start over.
 *
 * Goes to /start, not straight to /exam. /exam reads its subtest from a query
 * param and defaults to 0, so a bare link would drop someone who was on
 * subtest three back onto the first one. /start is safe to re-enter: the
 * backend reuses any unfinished session instead of opening a new attempt
 * (UserTryoutController::start), and startSubtest is a firstOrCreate, so no
 * timer or answer is reset by passing through it.
 */
export default function ContinueCard({ tryouts, loading }: ContinueCardProps) {
  if (loading) {
    return (
      <div className="h-36 animate-pulse rounded-3xl border-2 border-slate-900 bg-white" />
    );
  }

  if (tryouts.length === 0) return null;

  const [first, ...rest] = tryouts;

  return (
    <section
      aria-label="Ujian yang belum selesai"
      className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]"
    >
      <div className="flex items-center gap-2 border-b-2 border-slate-900 bg-amber-100 px-5 py-2.5">
        <AlertTriangle className="size-4 shrink-0 text-amber-800" />
        <p className="text-xs font-black uppercase tracking-wide text-amber-900">
          Belum selesai
        </p>
      </div>

      <div className="p-5">
        <h2 className="text-lg font-black leading-tight text-slate-900">
          {first.title}
        </h2>

        {first.startedAt && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="size-3.5" />
            Dimulai {formatJakartaDateTime(first.startedAt)}
          </p>
        )}

        <Link
          href={`/dashboard/try-out/${first.id}/start`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <PlayCircle className="size-4" />
          Lanjutkan Ujian
        </Link>

        {rest.length > 0 && (
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {rest.length} lainnya juga belum selesai
            </p>
            <ul className="flex flex-col gap-1.5">
              {rest.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/try-out/${t.id}/start`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-track-tint"
                  >
                    <span className="min-w-0 truncate font-medium">{t.title}</span>
                    <span className="shrink-0 text-xs font-bold text-primary">
                      Lanjutkan
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
