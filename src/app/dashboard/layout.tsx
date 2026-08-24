import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarWrapper } from "@/components/organisms/sidebar/SidebarWrapper";
import BreadcrumbNav from "@/components/atoms/breadcrumb/BreadcrumbNav";
import TicketChangeModal from "@/components/molecules/dialog/TicketChangeModal";
import { isKategori } from "@/lib/kategori";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");

  // Resolved here rather than in a client hook so the themed variables are in
  // the first paint. Doing it after hydration would flash the wrong track's
  // colours on every navigation.
  const track = isKategori(session.user?.kategori) ? session.user.kategori : "utbk";

  return (
    <SidebarProvider data-track={track}>
      <SidebarWrapper session={session!} />

      <SidebarInset className="min-w-0">
        <BreadcrumbNav />
        <main className="min-w-0 px-4 md:px-6 pt-16 md:pt-6 pb-6 flex-col track-surface min-h-screen">
          {children}
        </main>
        <TicketChangeModal />
      </SidebarInset>
    </SidebarProvider>
  );
}
