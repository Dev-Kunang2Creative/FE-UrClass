import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminQuestionSubtestTryoutWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardAdminQuestionSubtestTryout";

interface DashboardAdminTryOutSubtestDetailPageProps {
  params: Promise<{
    id: string;
    subtestId: string;
  }>;
}

export default async function DashboardAdminTryOutSubtestDetailPage({
  params,
}: DashboardAdminTryOutSubtestDetailPageProps) {
  const { id, subtestId } = await params;
  return (
    <main>
      <DashboardTitle
        title="Detail Subtes Tryout"
        showBackButton
        backFallbackHref={`/dashboard/admin/try-out/${id}`}
      />
      <DashboardAdminQuestionSubtestTryoutWrapper
        tryoutId={id}
        subtestId={subtestId}
      />
    </main>
  );
}
