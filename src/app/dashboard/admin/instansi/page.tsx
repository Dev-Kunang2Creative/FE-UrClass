import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminInstansiWrapper from "@/components/organisms/dashboard/admin/instansi/DashboardAdminInstansiWrapper";

export default function DashboardAdminInstansiPage() {
  return (
    <main>
      <DashboardTitle title="Instansi & Formasi CPNS" />
      <DashboardAdminInstansiWrapper />
    </main>
  );
}
