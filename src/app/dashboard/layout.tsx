import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarWrapper } from "@/components/organisms/sidebar/SidebarWrapper";
import BreadcrumbNav from "@/components/atoms/breadcrumb/BreadcrumbNav";
import TicketChangeModal from "@/components/molecules/dialog/TicketChangeModal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");

  return (
    <SidebarProvider>
      <SidebarWrapper session={session!} />

      <SidebarInset className="min-w-0">
        <BreadcrumbNav />
        <main className="min-w-0 px-4 md:px-6 pt-16 md:pt-6 pb-6 flex-col bg-[#fafafa] min-h-screen">
          {children}
        </main>
        <TicketChangeModal />
      </SidebarInset>
    </SidebarProvider>
  );
}
