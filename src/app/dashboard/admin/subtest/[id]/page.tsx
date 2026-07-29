import DashboardadminSubtestDetailWrapper from "@/components/organisms/dashboard/admin/subtest/DashboardAdminSubtestDetailWrapper";

interface DashboardAdminSubtestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardAdminSubtestDetailPage({
  params,
}: DashboardAdminSubtestDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardadminSubtestDetailWrapper id={id} />
    </main>
  );
}
