import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminParticipantsWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardAdminParticipantsWrapper";

interface DashboardAdminParticipantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminParticipantsPage({
  params,
}: DashboardAdminParticipantsPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Daftar Peserta Tryout"
        showBackButton
        backFallbackHref={`/dashboard/admin/try-out/${id}`}
      />
      <DashboardAdminParticipantsWrapper id={id} />
    </main>
  );
}
