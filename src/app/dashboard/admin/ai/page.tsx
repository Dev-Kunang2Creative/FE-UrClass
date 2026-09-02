import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminAiSettingsWrapper from "@/components/organisms/dashboard/admin/ai/DashboardAdminAiSettingsWrapper";

export default function DashboardAdminAiPage() {
  return (
    <main>
      <DashboardTitle title="Asisten AI" />
      <DashboardAdminAiSettingsWrapper />
    </main>
  );
}
