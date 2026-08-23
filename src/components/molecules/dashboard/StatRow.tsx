"use client";

import Link from "next/link";
import { Ticket, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatRowProps {
  kategoriLabel: string;
  theme: { statIcon: string; statCard: string };
  ticketCount: number;
  tryoutCount?: number;
  loading?: boolean;
}

const ITEMS = [
  { key: "ticket", label: "Tiket Tryout", icon: Ticket, href: "/dashboard/pembelian" },
  { key: "tryout", label: "Tryout Tersedia", icon: ClipboardList, href: "/dashboard/try-out" },
] as const;

export default function StatRow({
  kategoriLabel,
  theme,
  ticketCount,
  tryoutCount,
  loading,
}: StatRowProps) {
  const values: Record<string, number | undefined> = {
    ticket: ticketCount,
    tryout: tryoutCount,
  };

  return (
    <section
      aria-label={`Ringkasan ${kategoriLabel}`}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {ITEMS.map(({ key, label, icon: Icon, href }) => {
        const value = values[key];

        return (
          <Link
            key={key}
            href={href}
            className={cn(
              "group rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all duration-200",
              theme.statCard,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-slate-600">
                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                  <Icon className={cn("size-5", theme.statIcon)} aria-hidden />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {key === "ticket" ? label : `${label} (${kategoriLabel})`}
                </span>
              </div>
            </div>
            {loading || value === undefined ? (
              <Skeleton className="mt-3 h-9 w-14 rounded-lg" />
            ) : (
              <p className="mt-3 text-3xl font-extrabold tabular-nums text-slate-900">
                {value}
              </p>
            )}
          </Link>
        );
      })}
    </section>
  );
}
