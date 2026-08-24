"use client";

import Link from "next/link";
import { Ticket, TrendingUp, Trophy, ArrowUpRight } from "lucide-react";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import type { ScoreSummary } from "@/lib/dashboard-tasks";

interface ProgressAsideProps {
  summary: ScoreSummary;
  ticketCount: number;
  loading?: boolean;
}

/**
 * Context beside the actions: how it is going, and what is left to spend.
 *
 * Scores come from the shared scoreSummary helper, the same one
 * TrackStatisticsCard uses, so the number here can never disagree with the
 * detailed card further down the page.
 *
 * Only figures that actually exist are shown. There is no per-subtest weakness
 * here because history does not carry per-subtest scores - inventing a
 * "weakest subtest" from an overall average would be a guess presented as
 * insight.
 */
export default function ProgressAside({
  summary,
  ticketCount,
  loading,
}: ProgressAsideProps) {
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];

  return (
    <aside aria-label="Ringkasan progres" className="flex flex-col gap-4">
      <div className="rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a]">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-900">
            Progresmu
          </h2>
        </div>

        {loading ? (
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-slate-100" />
        ) : summary.attempts === 0 ? (
          <p className="mt-3 text-xs leading-snug text-slate-500">
            Belum ada tryout yang selesai. Skor rata-rata muncul di sini setelah
            kamu menyelesaikan satu.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-500">
                Rata-rata skor
              </p>
              <p className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">
                  {summary.average}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / {config.maxScore}
                </span>
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <div>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Trophy className="size-3" /> Tertinggi
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {summary.highest}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">
                  Tryout selesai
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {summary.attempts}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Answers "what can I do with these" first, and only then offers to sell
          more - the old card led with Beli Tiket regardless of balance. */}
      <div className="rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ticket className="size-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-900">
              Tiket
            </h2>
          </div>
          <Link
            href="/dashboard/tiket/riwayat"
            className="text-[11px] font-bold text-slate-400 hover:text-primary"
          >
            Riwayat
          </Link>
        </div>

        {loading ? (
          <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">
                {ticketCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                tersisa
              </span>
            </p>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              {ticketCount > 0
                ? "Satu tiket dipakai untuk satu kali mengerjakan tryout."
                : "Tiket habis. Beli paket untuk mulai mengerjakan tryout."}
            </p>
          </>
        )}

        <Link
          href="/dashboard/pembelian"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          {ticketCount > 0 ? "Tambah tiket" : "Beli tiket"}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
