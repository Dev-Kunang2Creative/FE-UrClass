import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTryoutDetailWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardAdminTryoutDetailWrapper";

interface DashboardAdminTryoutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminTryoutDetailPage({
  params,
}: DashboardAdminTryoutDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Detail Tryout"
        showBackButton
        backFallbackHref="/dashboard/admin/try-out"
      />
      <DashboardAdminTryoutDetailWrapper id={id} />
    </main>
  );
}
