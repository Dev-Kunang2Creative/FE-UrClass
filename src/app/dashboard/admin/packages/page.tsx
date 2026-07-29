import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminPackageWrapper from "@/components/organisms/dashboard/admin/packages/DashboardAdminPackageWrapper";

export default function DashboardAdminPackagesPage() {
  return (
    <main>
      <DashboardTitle title="Paket" />
      <DashboardAdminPackageWrapper />
    </main>
  );
}
