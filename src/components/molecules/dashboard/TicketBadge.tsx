"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { useTickets } from "@/hooks/useTickets";

interface TicketBadgeProps {
  /** Hide the word "Tiket" below this breakpoint. Defaults to always showing it. */
  className?: string;
}

/**
 * The ticket balance, always in reach.
 *
 * The count used to live in DashboardTopBar - which the dashboard layout does
 * not render, so it was on screen nowhere. The sidebar only linked to the
 * ledger, without a number. This pill is mounted in the mobile top bar and
 * mirrored as a badge in the sidebar so the balance is visible at both
 * breakpoints, without reviving a top bar full of controls that do nothing.
 *
 * It links to the ledger when there is a balance to explain, and to the store
 * when there is not - at zero, history is not what the reader needs.
 */
export default function TicketBadge({ className = "" }: TicketBadgeProps) {
  const { ticketCount } = useTickets();
  const empty = ticketCount <= 0;

  return (
    <Link
      href={empty ? "/dashboard/pembelian" : "/dashboard/tiket/riwayat"}
      aria-label={
        empty
          ? "Tiket habis - beli paket tiket"
          : `${ticketCount} tiket tersisa - lihat riwayat tiket`
      }
      className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-sm font-bold transition-colors ${
        empty
          ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-track-border bg-track-tint text-slate-900 hover:bg-primary/10"
      } ${className}`}
    >
      <Ticket
        className={`size-4 shrink-0 ${empty ? "text-red-600" : "text-primary"}`}
        aria-hidden
      />
      {empty ? (
        <span>Tiket habis</span>
      ) : (
        <>
          <span>{ticketCount}</span>
          <span className="font-semibold">Tiket</span>
        </>
      )}
    </Link>
  );
}
