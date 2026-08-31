"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Session } from "next-auth";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Book,
  BookCopy,
  BookKey,
  BookOpen,
  FileClock,
  Gift,
  GraduationCap,
  Home,
  Images,
  Landmark,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Shield,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { SidebarUser } from "./SidebarUser";
import { DASHBOARD_MENU } from "@/constants/dashboard-menu";

import { useKategori } from "@/hooks/useKategori";
import { useTickets } from "@/hooks/useTickets";
import { KATEGORI_CONFIG } from "@/lib/kategori";

interface SidebarWrapperProps {
  session: Session;
}

export function SidebarWrapper({ session }: SidebarWrapperProps) {
  const pathname = usePathname();
  const [waModalOpen, setWaModalOpen] = useState(false);
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const { ticketCount } = useTickets();

  const role = session?.user.role as keyof typeof DASHBOARD_MENU;

  const menu = role ? DASHBOARD_MENU[role] : null;

  if (!menu) return null;

  const activeMenuClass =
    kategori === "cpns"
      ? "bg-orange-50 text-orange-900 font-bold border border-orange-300 shadow-sm"
      : "bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm";

  const buttonClass = (href: string) =>
    `hover:bg-primary/10 hover:text-primary dark:hover:bg-slate-900 ${
      pathname.startsWith(href)
        ? "bg-primary/10 text-primary dark:bg-slate-800"
        : ""
    }`;

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="h-16 p-0 cursor-default bg-white border-b border-slate-100 dark:bg-slate-950">
        <div className="flex items-center justify-between px-4 h-full w-full">
          <Link
            href={session?.user.role === "admin" ? "/dashboard/admin" : "/dashboard"}
            className="inline-flex items-center group transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/images/logo/urclass.png"
              alt="UrClass Logo"
              width={2135}
              height={1635}
              priority
              className="h-8.5 w-auto object-contain"
            />
          </Link>
          {session?.user.role === "user" && (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-xs leading-none inline-flex items-center ${config.theme.badge}`}
            >
              {config.label}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white dark:bg-slate-950">
        {session?.user.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={`hover:bg-primary/10 hover:text-primary dark:hover:bg-slate-900 ${
                      pathname === menu.href
                        ? "bg-primary/10 text-primary dark:bg-slate-800"
                        : ""
                    }`}
                  >
                    <Link href={menu.href}>
                      <LayoutDashboard />
                      <span>{menu.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {session?.user.role === "admin" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Manajemen Tryout</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/subtest")}
                    >
                      <Link href="/dashboard/admin/subtest">
                        <Book />
                        <span>Subtes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/subtest-category")}
                    >
                      <Link href="/dashboard/admin/subtest-category">
                        <Layers />
                        <span>Kategori Subtes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/try-out")}
                    >
                      <Link href="/dashboard/admin/try-out">
                        <BookOpen />
                        <span>Try Out</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/bukti-follow")}
                    >
                      <Link href="/dashboard/admin/bukti-follow">
                        <Images />
                        <span>Syarat & Bukti</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/question-bank")}
                    >
                      <Link href="/dashboard/admin/question-bank">
                        <BookKey />
                        <span>Bank Soal</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Manajemen Data</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/users")}
                    >
                      <Link href="/dashboard/admin/users">
                        <Users />
                        <span>Pengguna</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/packages")}
                    >
                      <Link href="/dashboard/admin/packages">
                        <BookCopy />
                        <span>Paket</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/redeem-code")}
                    >
                      <Link href="/dashboard/admin/redeem-code">
                        <Gift />
                        <span>Kode Redeem</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/instansi")}
                    >
                      <Link href="/dashboard/admin/instansi">
                        <Landmark />
                        <span>Instansi & Formasi</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/transactions")}
                    >
                      <Link href="/dashboard/admin/transactions">
                        <FileClock />
                        <span>Riwayat Transaksi</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/sales-report")}
                    >
                      <Link href="/dashboard/admin/sales-report">
                        <TrendingUp />
                        <span>Laporan Penjualan</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={buttonClass("/dashboard/admin/audit-log")}
                    >
                      <Link href="/dashboard/admin/audit-log">
                        <Shield />
                        <span>Log Audit</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* user roles groups */}
        {session?.user.role === "user" && (
          <>
            <SidebarGroup className="p-0 py-3">
              <SidebarGroupContent>
                {/* id dipakai panduan awal (TourGuideOverlay) untuk menyorot
                    menu ini satu per satu. */}
                <SidebarMenu id="sidebar-nav" className="gap-1.5 px-3">
                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-10.5 justify-start px-3.5 rounded-xl transition-all w-full flex items-center ${
                        pathname === "/dashboard"
                          ? activeMenuClass
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Link href="/dashboard" className="flex items-center w-full gap-3 font-medium text-sm">
                        <Home className="w-4.5 h-4.5 shrink-0" />
                        <span>Beranda</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-10.5 justify-start px-3.5 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/try-out")
                          ? activeMenuClass
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Link id="sidebar-menu-tryout" href="/dashboard/try-out" className="flex items-center w-full gap-3 font-medium text-sm">
                        <BookOpen className="w-4.5 h-4.5 shrink-0" />
                        <span>Try Out</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-10.5 justify-start px-3.5 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/pembelian")
                          ? activeMenuClass
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Link id="sidebar-menu-paket" href="/dashboard/pembelian" className="flex items-center w-full gap-3 font-medium text-sm">
                        <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
                        <span>Pembelian Paket</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-10.5 justify-start px-3.5 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/tiket")
                          ? activeMenuClass
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Link id="sidebar-menu-tiket" href="/dashboard/tiket/riwayat" className="flex items-center w-full gap-3 font-medium text-sm">
                        <Ticket className="w-4.5 h-4.5 shrink-0" />
                        <span>Riwayat Tiket</span>
                        {/* The balance itself, not just a way to the ledger.
                            On desktop there is no top bar, so without this the
                            count appeared only on the dashboard home. */}
                        <span
                          className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${
                            ticketCount > 0
                              ? "bg-track-tint text-primary"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ticketCount}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      id="sidebar-menu-bantuan"
                      className="h-10.5 justify-start px-3.5 rounded-xl transition-all w-full flex items-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer font-medium text-sm"
                      onClick={() => setWaModalOpen(true)}
                    >
                      <div className="flex items-center w-full gap-3">
                        <LifeBuoy className="w-4.5 h-4.5 shrink-0" />
                        <span>Bantuan &amp; CS</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}


      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-slate-100 p-2">
        <SidebarUser session={session} />
      </SidebarFooter>

      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-primary" />
              Pusat Bantuan
            </DialogTitle>
            <DialogDescription>
              Kamu akan diarahkan ke WhatsApp untuk menghubungi tim kami. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setWaModalOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-[#25D366] hover:bg-[#1ebe5d] text-white"
              onClick={() => {
                window.open("https://wa.me/6281398169073", "_blank", "noopener,noreferrer");
                setWaModalOpen(false);
              }}
            >
              Ya, Buka WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
