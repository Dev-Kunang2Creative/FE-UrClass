import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminUpdateQuestionWrapper from "@/components/organisms/dashboard/admin/subtest/questions/DashboardAdminUpdateQuestionWrapper";

interface DashboardAdminEditQuestionSubtestPageProps {
  params: Promise<{ id: string; questionId: string }>;
}

export default async function DashboardAdminEditQuestionSubtestPage({
  params,
}: DashboardAdminEditQuestionSubtestPageProps) {
  const { id, questionId } = await params;

  return (
    <main>
      <DashboardTitle
        title="Edit Pertanyaan"
        showBackButton
        backFallbackHref={`/dashboard/admin/subtest/${id}/question/${questionId}`}
      />
      <DashboardAdminUpdateQuestionWrapper id={id} questionId={questionId} />
    </main>
  );
}
