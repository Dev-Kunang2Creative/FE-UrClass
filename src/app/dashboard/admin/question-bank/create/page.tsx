import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminCreateQuestionBankWrapper from "@/components/organisms/dashboard/admin/question-bank/DashboardAdminCreateQuestionBankWrapper";

export default function DashboardAdminQuestionBankCreatePage() {
  return (
    <main>
      <DashboardTitle
        title="Tambah Bank Soal"
        showBackButton
        backFallbackHref="/dashboard/admin/question-bank"
      />
      <DashboardAdminCreateQuestionBankWrapper />
    </main>
  );
}
