"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const TICKET_BALANCE_UPDATED_EVENT = "amunisi:ticket-balance-updated";
export const SUPPRESS_NEXT_TICKET_MODAL_KEY = "amunisi:suppress-next-ticket-modal";

export type TicketBalanceUpdatedDetail = {
  ticketBalance?: number;
  delta?: number;
  suppressModal?: boolean;
};

export function notifyTicketBalanceUpdated(detail: TicketBalanceUpdatedDetail) {
  if (typeof window === "undefined") return;

  if (detail.suppressModal) {
    window.sessionStorage.setItem(SUPPRESS_NEXT_TICKET_MODAL_KEY, "1");
  }

  window.dispatchEvent(
    new CustomEvent<TicketBalanceUpdatedDetail>(TICKET_BALANCE_UPDATED_EVENT, {
      detail,
    }),
  );
}

export function useTickets() {
  const { data: session } = useSession();
  const sessionTicketCount = session?.user?.ticket_balance ?? 0;
  const [localTicketCount, setLocalTicketCount] = useState<number | null>(null);
  const ticketCount = localTicketCount ?? sessionTicketCount;

  useEffect(() => {
    setLocalTicketCount(sessionTicketCount);
  }, [sessionTicketCount]);

  useEffect(() => {
    const handleTicketBalanceUpdated = (event: Event) => {
      const detail = (event as CustomEvent<TicketBalanceUpdatedDetail>).detail;

      setLocalTicketCount((current) => {
        const base = current ?? sessionTicketCount;

        if (typeof detail?.ticketBalance === "number") {
          return detail.ticketBalance;
        }

        if (typeof detail?.delta === "number") {
          return Math.max(0, base + detail.delta);
        }

        return base;
      });
    };

    window.addEventListener(TICKET_BALANCE_UPDATED_EVENT, handleTicketBalanceUpdated);

    return () => {
      window.removeEventListener(TICKET_BALANCE_UPDATED_EVENT, handleTicketBalanceUpdated);
    };
  }, [sessionTicketCount]);

  const addTicket = () => {
    // In backend mode, tickets are managed server-side
    // This is a no-op; refresh session instead
    return;
  };

  const deductTicket = (): boolean => {
    // In backend mode, ticket deduction happens via POST /enroll
    return true; // Optimistic - actual deduction is server-side
  };

  return { ticketCount, addTicket, deductTicket };
}
