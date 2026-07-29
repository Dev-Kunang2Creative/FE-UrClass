"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function BreadcrumbNav() {
  return (
    <nav className="fixed z-50 flex h-14 w-full items-center border-b bg-white px-5 backdrop-blur-sm md:hidden md:border-0">
      <div className="flex items-center gap-x-2">
        <SidebarTrigger />
      </div>
    </nav>
  );
}
