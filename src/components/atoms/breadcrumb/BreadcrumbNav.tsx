"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import TicketBadge from "@/components/molecules/dashboard/TicketBadge";

/**
 * Mobile top bar. It held nothing but the sidebar trigger, so on a phone the
 * ticket balance was not on screen anywhere - the empty right-hand side is
 * exactly where a reader looks for it.
 */
export default function BreadcrumbNav() {
  return (
    <nav className="fixed z-50 flex h-14 w-full items-center justify-between gap-3 border-b bg-white px-5 backdrop-blur-sm md:hidden md:border-0">
      <div className="flex items-center gap-x-2">
        <SidebarTrigger />
      </div>

      <TicketBadge />
    </nav>
  );
}
