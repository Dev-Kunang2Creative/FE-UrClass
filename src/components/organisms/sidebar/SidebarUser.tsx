"use client";

import { Compass, EllipsisVertical, Home, LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Session } from "next-auth";
import { generateFallbackFromName } from "@/utils/generate-name";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { requestTour } from "@/lib/tour";

interface SidebarUserProps {
  session: Session;
}

export function SidebarUser({ session }: SidebarUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Panduan hanya ada untuk siswa: elemen yang disorotnya adalah beranda
  // siswa, dan admin tidak punya halaman itu.
  const isStudent = session?.user?.role === "user";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              id="sidebar-user-profile"
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full border border-slate-200 shrink-0">
                <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {generateFallbackFromName(session?.user.name || "U")}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold text-slate-800">
                  {session?.user.name || "Sobat UrClass"}
                </span>
                <span className="truncate text-xs text-slate-500">{session?.user.email}</span>
              </div>

              <EllipsisVertical className="ml-auto size-4 text-slate-400 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full border">
                  <AvatarFallback className="rounded-lg">
                    {generateFallbackFromName(session?.user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session?.user.name}
                  </span>
                  <span className="truncate text-xs">
                    {session?.user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href="/dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <Home className="w-4 h-4 mr-2" />
                  Beranda
                </DropdownMenuItem>
              </Link>

              <Link href="/dashboard/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Pengaturan &amp; Mode Belajar</span>
                </DropdownMenuItem>
              </Link>

              {isStudent && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    requestTour();
                    // Panduannya hanya terpasang di beranda. Kalau sudah di
                    // sana, push ini tidak melakukan apa-apa dan event dari
                    // requestTour yang membukanya.
                    router.push("/dashboard");
                  }}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  <span>Lihat Panduan Lagi</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:bg-destructive/20 focus:text-destructive cursor-pointer"
            >
              <LogOut className="text-destructive" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
