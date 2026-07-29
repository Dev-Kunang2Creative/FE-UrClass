import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminDetailQuestionBySubtestWrapper from "@/components/organisms/dashboard/admin/subtest/questions/DashboardAdminDetailQuestionBySubtest";

interface DashboardAdminQuestionSubtestPageProps {
  params: Promise<{ id: string; questionId: string }>;
}

export default async function DashboardAdminQuestionSubtestPage({
  params,
}: DashboardAdminQuestionSubtestPageProps) {
  const { id, questionId } = await params;
  return (
    <main>
      <DashboardTitle
        title="Detail Pertanyaan"
        showBackButton
        backFallbackHref={`/dashboard/admin/subtest/${id}`}
      />
      <DashboardAdminDetailQuestionBySubtestWrapper
        subtestId={id}
        questionId={questionId}
      />
    </main>
  );
}
