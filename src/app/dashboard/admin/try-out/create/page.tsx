import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminCreateTryoutWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardCreateTryoutWrapper";

export default function DashboardAdminCreateTryoutPage() {
  return (
    <main>
      <DashboardTitle
        title="Tambah Try Out"
        showBackButton
        backFallbackHref="/dashboard/admin/try-out"
      />
      <DashboardAdminCreateTryoutWrapper />
    </main>
  );
}
