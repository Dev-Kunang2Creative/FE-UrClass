import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTryoutLeaderboardWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardAdminTryoutLeaderboardWrapper";

interface DashboardAdminTryoutResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminTryoutResultPage({
  params,
}: DashboardAdminTryoutResultPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle title="Hasil Tryout" />
      <DashboardAdminTryoutLeaderboardWrapper tryoutId={id} />
    </main>
  );
}
