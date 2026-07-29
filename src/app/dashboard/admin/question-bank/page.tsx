import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminQuestionBankWrapper from "@/components/organisms/dashboard/admin/question-bank/DashboardAdminQuestionBankWrapper";

export default function DashboardAdminQuestionBankPage() {
  return (
    <main>
      <DashboardTitle title="Manajemen Bank Soal" />
      <DashboardAdminQuestionBankWrapper />
    </main>
  );
}
