"use client";

import Link from "next/link";
import { CalendarClock, ArrowRight } from "lucide-react";
import Mascot from "@/components/atoms/mascot/Mascot";
import { deadlineLabel } from "@/lib/dashboard-tasks";
import type { UserTryoutData } from "@/http/tryout/get-user-tryouts";

interface UpcomingTryoutsProps {
  items: { tryout: UserTryoutData; daysLeft: number | null }[];
  loading?: boolean;
}

/**
 * What to do next, soonest deadline first.
 *
 * end_date has always been in the payload and was never shown, so a tryout
 * could quietly expire while the dashboard reported nothing but a count.
 */
export default function UpcomingTryouts({ items, loading }: UpcomingTryoutsProps) {
  return (
    <section
      aria-label="Tryout yang bisa dikerjakan"
      className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]"
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-slate-900 px-5 py-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
            Siap dikerjakan
          </h2>
        </div>
        <Link
          href="/dashboard/try-out"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          Semua tryout <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
          <Mascot pose="berfikir" decorative sizes="96px" className="h-24 w-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Belum ada tryout yang siap dikerjakan
          </p>
          <p className="max-w-xs text-xs text-slate-500">
            Tryout baru akan muncul di sini begitu tersedia untuk jalurmu.
          </p>
          <Link
            href="/dashboard/pembelian"
            className="mt-1 text-xs font-bold text-primary hover:underline"
          >
            Lihat paket tiket
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map(({ tryout, daysLeft }) => {
            // Anything inside three days gets emphasis. Past deadlines are
            // filtered upstream, so this never shouts about something dead.
            const urgent = daysLeft !== null && daysLeft <= 3;

            return (
              <li key={tryout.id}>
                <Link
                  href={`/dashboard/try-out/${tryout.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-track-tint"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {tryout.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                      <span
                        className={
                          urgent
                            ? "font-bold text-red-600"
                            : "font-medium text-slate-500"
                        }
                      >
                        {deadlineLabel(daysLeft)}
                      </span>
                      {tryout.tryoutSubtests?.length ? (
                        <span className="text-slate-400">
                          · {tryout.tryoutSubtests.length} subtest
                        </span>
                      ) : null}
                      {!tryout.isEnrolled && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
                          {tryout.type}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                    {tryout.isEnrolled ? "Mulai" : "Daftar"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
