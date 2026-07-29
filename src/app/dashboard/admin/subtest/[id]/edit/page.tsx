import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminUpdateSubtestWrapper from "@/components/organisms/dashboard/admin/subtest/DashboardAdminUpdateSubtestWrapper";

interface DashboardAdminSubtestEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminSubtestEditPage({
  params,
}: DashboardAdminSubtestEditPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Ubah Subtes"
        showBackButton
        backFallbackHref="/dashboard/admin/subtest"
      />
      <DashboardAdminUpdateSubtestWrapper subtestId={id} />
    </main>
  );
}
