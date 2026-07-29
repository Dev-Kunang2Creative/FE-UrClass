import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarWrapper } from "@/components/organisms/sidebar/SidebarWrapper";
import { BreadcrumbProvider } from "@/components/atoms/breadcrumb/BreadcrumbContext";
import BreadcrumbNav from "@/components/atoms/breadcrumb/BreadcrumbNav";
import DashboardTopBar from "@/components/molecules/dashboard/DashboardTopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");

  const isAdmin = session.user.role === "admin";

  return (
    <SidebarProvider>
      <SidebarWrapper session={session!} />

      <SidebarInset className="min-w-0">
        {isAdmin ? (
          <BreadcrumbProvider>
            <BreadcrumbNav />
            <main className="min-w-0 px-5 pt-20 pb-6 md:pt-10 flex-col bg-[#fafafa] min-h-screen">
              {children}
            </main>
          </BreadcrumbProvider>
        ) : (
          <>
            <DashboardTopBar userName={session.user.name ?? "Amunisian"} />
            <main className="min-w-0 px-4 md:px-6 py-6 flex-col bg-[#fafafa] min-h-screen">
              {children}
            </main>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
