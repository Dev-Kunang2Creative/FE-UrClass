import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminCreateSubtestWrapper from "@/components/organisms/dashboard/admin/subtest/DashboardAdminCreateSubtestWrapper";

export default function DashboardAdminCreateSubtestPage() {
  return (
    <main>
      <DashboardTitle
        title="Tambah Subtes"
        showBackButton
        backFallbackHref="/dashboard/admin/subtest"
      />
      <DashboardAdminCreateSubtestWrapper />
    </main>
  );
}
