import DashboardAdminCreateQuestionWrapper from "@/components/organisms/dashboard/admin/questions/DashboardAdminCreateQuestionWrapper";

interface DashboardAdminCreateQuestionSubtestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardAdminCreateQuestionSubtestPage({
  params,
}: DashboardAdminCreateQuestionSubtestPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardAdminCreateQuestionWrapper id={id} />
    </main>
  );
}
