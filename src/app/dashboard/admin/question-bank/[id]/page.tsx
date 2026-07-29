import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminQuestionBankDetailWrapper from "@/components/organisms/dashboard/admin/question-bank/DashboardAdminQuestionBankDetailWrapper";

interface DashboardAdminQuestionBankDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminQuestionBankDetailPage({
  params,
}: DashboardAdminQuestionBankDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Detail Bank Soal"
        showBackButton
        backFallbackHref="/dashboard/admin/question-bank"
      />
      <DashboardAdminQuestionBankDetailWrapper id={id} />
    </main>
  );
}
