"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, LogOut, Settings, Home, User, Ticket, PlusCircle, MinusCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  SUPPRESS_NEXT_TICKET_MODAL_KEY,
  TICKET_BALANCE_UPDATED_EVENT,
  TicketBalanceUpdatedDetail,
  useTickets,
} from "@/hooks/useTickets";

interface DashboardTopBarProps {
  userName?: string;
}

export default function DashboardTopBar({ userName }: DashboardTopBarProps) {
  const { data: session } = useSession();
  const user = session?.user as { fullname?: string; name?: string } | undefined;
  const userNameFromSession = user?.fullname || user?.name;
  const name = userName || userNameFromSession || "Amunisian";
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

  const isPositiveChange = (ticketChange?.amount ?? 0) > 0;
  const changeAmount = Math.abs(ticketChange?.amount ?? 0);

  return (
    <>
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-white border-b border-gray-100 px-4 md:px-6 py-3">
      {/* Left: Mobile Sidebar Trigger */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
      </div>

      {/* Right side wrapper covering Search + Notification + Profile */}
      <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
        
        {/* Search Bar */}
        <div className="w-full max-w-md hidden sm:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Mau belajar apa hari ini?"
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#EDF5FF] border-none rounded-full text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            readOnly
          />
        </div>

        {/* Ticket Badge */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF5FF] hover:bg-blue-100 transition-colors shrink-0 cursor-pointer">
          <Ticket className="h-5 w-5 text-gray-700" />
          <span className="font-bold text-gray-800 text-sm">{ticketCount}</span>
        </button>

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="focus:outline-none">
            <button className="relative p-2 rounded-full bg-[#EDF5FF] hover:bg-blue-100 transition-colors shrink-0 text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-75 p-2" sideOffset={8}>
            <DropdownMenuLabel className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2">
              Notifikasi
            </DropdownMenuLabel>
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Belum ada notifikasi</p>
              <p className="text-xs text-gray-400 mt-1">
                Notifikasi terbaru akan muncul di sini.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="hidden md:block w-px h-8 bg-gray-200" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors cursor-pointer border border-transparent hover:border-gray-100">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start pr-1">
                <span className="text-[11px] text-[#013476] font-medium leading-tight">
                  Halo!
                </span>
                <span className="text-sm font-bold text-[#013476] leading-tight">
                  {name}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-56"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Pengguna Amunisi
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan Akun</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>

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
          <div className={`${isPositiveChange ? "bg-green-50 border-green-100 text-green-700" : "bg-amber-50 border-amber-100 text-amber-700"} mx-auto w-fit rounded-full border px-5 py-2 text-2xl font-black`}>
            {isPositiveChange ? "+" : "-"}{changeAmount} tiket
          </div>
          <p className="text-sm text-gray-600">
            Sekarang kamu punya <strong>{ticketChange?.current ?? ticketCount} tiket</strong>.
            {isPositiveChange ? " Bisa langsung dipakai untuk daftar tryout premium." : " Gunakan sisa tiketmu dengan bijak untuk tryout berikutnya."}
          </p>
          <button
            type="button"
            onClick={() => setTicketChange(null)}
            className="w-full rounded-xl bg-[#004AAB] py-3 text-sm font-bold text-white transition-colors hover:bg-[#003B8A]"
          >
            Mengerti
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
