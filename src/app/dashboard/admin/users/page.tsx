import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminUserWrapper from "@/components/organisms/dashboard/admin/users/DashboardAdminUserWrapper";

export default function DashboardAdminUsersPage() {
  return (
    <main>
      <DashboardTitle title="Pengguna" />
      <DashboardAdminUserWrapper />
    </main>
  );
}
