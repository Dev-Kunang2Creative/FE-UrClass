import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import FormUpdateKelas from "@/components/molecules/form/kelas/FormUpdateKelas";

interface AdminEditKelasPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditKelasPage({
  params,
}: AdminEditKelasPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Edit Kelas"
        showBackButton
        backFallbackHref="/dashboard/admin/kelas"
      />
      <FormUpdateKelas kelasId={id} />
    </main>
  );
}
