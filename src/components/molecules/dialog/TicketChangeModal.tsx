"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, MinusCircle } from "lucide-react";
import {
  SUPPRESS_NEXT_TICKET_MODAL_KEY,
  TICKET_BALANCE_UPDATED_EVENT,
  TicketBalanceUpdatedDetail,
  useTickets,
} from "@/hooks/useTickets";

export default function TicketChangeModal() {
  const { ticketCount } = useTickets();
  const ticketCountRef = useRef(ticketCount);
  const [ticketChange, setTicketChange] = useState<{ amount: number; current: number } | null>(null);

  useEffect(() => {
    ticketCountRef.current = ticketCount;
  }, [ticketCount]);

  useEffect(() => {
    const handleTicketBalanceUpdated = (event: Event) => {
      const detail = (event as CustomEvent<TicketBalanceUpdatedDetail>).detail;

      if (detail?.suppressModal) {
        window.sessionStorage.removeItem(SUPPRESS_NEXT_TICKET_MODAL_KEY);
        return;
      }

      if (window.sessionStorage.getItem(SUPPRESS_NEXT_TICKET_MODAL_KEY) === "1") {
        window.sessionStorage.removeItem(SUPPRESS_NEXT_TICKET_MODAL_KEY);
        return;
      }

      const nextTicketCount =
        typeof detail?.ticketBalance === "number"
          ? detail.ticketBalance
          : ticketCountRef.current + (detail?.delta ?? 0);
      const diff =
        typeof detail?.delta === "number"
          ? detail.delta
          : nextTicketCount - ticketCountRef.current;

      if (diff === 0) return;

      setTicketChange({ amount: diff, current: nextTicketCount });
    };

    window.addEventListener(TICKET_BALANCE_UPDATED_EVENT, handleTicketBalanceUpdated);

    return () => {
      window.removeEventListener(TICKET_BALANCE_UPDATED_EVENT, handleTicketBalanceUpdated);
    };
  }, []);

  if (!ticketChange) return null;

  const isPositiveChange = (ticketChange.amount ?? 0) > 0;
  const changeAmount = Math.abs(ticketChange.amount ?? 0);

  return (
    <Dialog open={!!ticketChange} onOpenChange={(open) => !open && setTicketChange(null)}>
      <DialogContent showCloseButton={false} className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        <div className={`${isPositiveChange ? "bg-[#3B9245]" : "bg-amber-500"} p-6 text-center text-white`}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            {isPositiveChange ? <PlusCircle className="h-9 w-9" /> : <MinusCircle className="h-9 w-9" />}
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {isPositiveChange ? "Tiket Bertambah" : "Tiket Digunakan"}
          </DialogTitle>
          <DialogDescription className="text-white/85 text-sm mt-1">
            {isPositiveChange
              ? "Saldo tiket kamu berhasil diperbarui."
              : "Saldo tiket kamu berkurang karena transaksi atau akses premium."}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4 text-center">
          <div
            className={`${
              isPositiveChange
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-amber-50 border-amber-100 text-amber-700"
            } mx-auto w-fit rounded-full border px-5 py-2 text-2xl font-black`}
          >
            {isPositiveChange ? "+" : "-"}
            {changeAmount} tiket
          </div>
          <p className="text-sm text-gray-600">
            Sekarang kamu punya <strong>{ticketChange.current ?? ticketCount} tiket</strong>.
            {isPositiveChange
              ? " Bisa langsung dipakai untuk daftar tryout premium."
              : " Gunakan sisa tiketmu dengan bijak untuk tryout berikutnya."}
          </p>
          <button
            type="button"
            onClick={() => setTicketChange(null)}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
