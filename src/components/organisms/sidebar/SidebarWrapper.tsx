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
  LayoutDashboard,
  Users,
  Book,
  ShoppingCart,
  BookCopy,
  BookOpen,
  BookKey,
  FileClock,
  Home,
  Shield,
  GraduationCap,
  TrendingUp,
  Gift,
  LifeBuoy,
  Ticket,
  Images,
} from "lucide-react";
import { SidebarUser } from "./SidebarUser";
import { DASHBOARD_MENU } from "@/constants/dashboard-menu";

interface SidebarWrapperProps {
  session: Session;
}

export function SidebarWrapper({ session }: SidebarWrapperProps) {
  const pathname = usePathname();
  const [waModalOpen, setWaModalOpen] = useState(false);

  const role = session?.user.role as keyof typeof DASHBOARD_MENU;

  const menu = role ? DASHBOARD_MENU[role] : null;

  if (!menu) return null;

  const buttonClass = (href: string) =>
    `hover:bg-primary/10 hover:text-primary dark:hover:bg-slate-900 ${
      pathname.startsWith(href)
        ? "bg-primary/10 text-primary dark:bg-slate-800"
        : ""
    }`;

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="h-18 cursor-default justify-center bg-white dark:bg-slate-950">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-start px-6 pt-2 w-full">
            <div className="flex items-center gap-x-3 w-full">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  src={"/images/logo/urclass.png"}
                  alt="UrClass"
                  width={150}
                  height={32}
                  className="object-contain"
                />
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
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
                        <span>Bukti Follow</span>
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
                      className={buttonClass("/dashboard/admin/kelas")}
                    >
                      <Link href="/dashboard/admin/kelas">
                        <GraduationCap />
                        <span>Kelas</span>
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
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2 mt-4 px-4">
                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-11 justify-start px-4 rounded-xl transition-all w-full flex items-center ${
                        pathname === "/dashboard"
                          ? "bg-[#EBF4FF] text-[#004AAB] font-semibold"
                          : "text-[#9695A5] hover:bg-[#EBF4FF] hover:text-[#004AAB]"
                      }`}
                    >
                      <Link href="/dashboard" className="flex items-center w-full gap-3">
                        <Home className="w-5 h-5 shrink-0" />
                        <span>Beranda</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-11 justify-start px-4 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/try-out")
                          ? "bg-[#EBF4FF] text-[#004AAB] font-semibold"
                          : "text-[#9695A5] hover:bg-[#EBF4FF] hover:text-[#004AAB]"
                      }`}
                    >
                      <Link href="/dashboard/try-out" className="flex items-center w-full gap-3">
                        <BookOpen className="w-5 h-5 shrink-0" />
                        <span>Try Out</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-11 justify-start px-4 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/kelas")
                          ? "bg-[#EBF4FF] text-[#004AAB] font-semibold"
                          : "text-[#9695A5] hover:bg-[#EBF4FF] hover:text-[#004AAB]"
                      }`}
                    >
                      <Link href="/dashboard/kelas" className="flex items-center w-full gap-3">
                        <GraduationCap className="w-5 h-5 shrink-0" />
                        <span>Kelas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-11 justify-start px-4 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/pembelian")
                          ? "bg-[#EBF4FF] text-[#004AAB] font-semibold"
                          : "text-[#9695A5] hover:bg-[#EBF4FF] hover:text-[#004AAB]"
                      }`}
                    >
                      <Link href="/dashboard/pembelian" className="flex items-center w-full gap-3">
                        <ShoppingCart className="w-5 h-5 shrink-0" />
                        <span>Pembelian</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      asChild
                      className={`h-11 justify-start px-4 rounded-xl transition-all w-full flex items-center ${
                        pathname.startsWith("/dashboard/tiket")
                          ? "bg-[#EBF4FF] text-[#004AAB] font-semibold"
                          : "text-[#9695A5] hover:bg-[#EBF4FF] hover:text-[#004AAB]"
                      }`}
                    >
                      <Link href="/dashboard/tiket/riwayat" className="flex items-center w-full gap-3">
                        <Ticket className="w-5 h-5 shrink-0" />
                        <span>Riwayat Tiket</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="w-full relative">
                    <SidebarMenuButton
                      className="h-11 justify-start px-4 rounded-xl transition-all w-full flex items-center text-[#9695A5] hover:bg-[#EBF4FF] hover:text-[#004AAB] cursor-pointer"
                      onClick={() => setWaModalOpen(true)}
                    >
                      <LifeBuoy className="w-5 h-5 shrink-0" />
                      <span>Pusat Bantuan</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}


      </SidebarContent>

      {session?.user.role === "admin" && (
        <SidebarFooter className="bg-white">
          <SidebarUser session={session} />
        </SidebarFooter>
      )}

      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-[#004AAB]" />
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
