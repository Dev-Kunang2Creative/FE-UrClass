"use client";

import Link from "next/link";
import { Ticket, ClipboardList, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatRowProps {
  kategoriLabel: string;
  theme: { statIcon: string; statCard: string };
  ticketCount: number;
  tryoutCount?: number;
  loading?: boolean;
}

export default function StatRow({
  kategoriLabel,
  theme,
  ticketCount,
  tryoutCount,
  loading,
}: StatRowProps) {
  return (
    <section
      aria-label={`Ringkasan Akun dan Tryout ${kategoriLabel}`}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {/* Card 1: Saldo Tiket Pengguna */}
      <Link
        href="/dashboard/pembelian"
        className={cn(
          "group rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_#0f172a] hover:shadow-[7px_7px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between",
          theme.statCard,
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200">
                <Ticket className={cn("size-5", theme.statIcon)} aria-hidden />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  Saldo Tiket Saya
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Kuota untuk mengerjakan tryout
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Beli Tiket <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="pt-2">
            {loading ? (
              <Skeleton className="h-10 w-20 rounded-xl" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-black tabular-nums text-slate-900">
                  {ticketCount}
                </p>
                <span className="text-xs font-bold text-slate-500">Tiket Aktif</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Card 2: Tryout Tersedia di Jalur Tersebut */}
      <Link
        href="/dashboard/try-out"
        className={cn(
          "group rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_#0f172a] hover:shadow-[7px_7px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between",
          theme.statCard,
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200">
                <ClipboardList className={cn("size-5", theme.statIcon)} aria-hidden />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  Tryout Siap Dikerjakan
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Katalog simulasi aktif ({kategoriLabel})
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Buka Katalog <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="pt-2">
            {loading || tryoutCount === undefined ? (
              <Skeleton className="h-10 w-20 rounded-xl" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-black tabular-nums text-slate-900">
                  {tryoutCount}
                </p>
                <span className="text-xs font-bold text-slate-500">Paket Simulasi Tersedia</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}
