"use client";

import Link from "next/link";
import { Ticket, ClipboardList, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatRowProps {
  kategoriLabel: string;
  theme: { statIcon: string; statCard: string };
  ticketCount: number;
  tryoutCount?: number;
  kelasCount?: number;
  loading?: boolean;
}

const ITEMS = [
  { key: "ticket", label: "Tiket tryout", icon: Ticket, href: "/dashboard/pembelian" },
  { key: "tryout", label: "Tryout tersedia", icon: ClipboardList, href: "/dashboard/try-out" },
  { key: "kelas", label: "Kelas saya", icon: GraduationCap, href: "/dashboard/kelas/saya" },
] as const;

// Counts come from kategori-filtered endpoints, so the label should say which track.

export default function StatRow({
  kategoriLabel,
  theme,
  ticketCount,
  tryoutCount,
  kelasCount,
  loading,
}: StatRowProps) {
  const values: Record<string, number | undefined> = {
    ticket: ticketCount,
    tryout: tryoutCount,
    kelas: kelasCount,
  };

  return (
    <section
      aria-label={`Ringkasan ${kategoriLabel}`}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {ITEMS.map(({ key, label, icon: Icon, href }) => {
        const value = values[key];

        return (
          <Link
            key={key}
            href={href}
            className={cn(
              "group rounded-xl border bg-white p-4 transition-colors",
              theme.statCard,
            )}
          >
            <div className="flex items-center gap-2 text-gray-500">
              <Icon className={cn("size-4", theme.statIcon)} aria-hidden />
              <span className="text-xs font-medium">
                {key === "ticket" ? label : `${label} ${kategoriLabel}`}
              </span>
            </div>
            {loading || value === undefined ? (
              <Skeleton className="mt-2 h-8 w-10" />
            ) : (
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {value}
              </p>
            )}
          </Link>
        );
      })}
    </section>
  );
}
