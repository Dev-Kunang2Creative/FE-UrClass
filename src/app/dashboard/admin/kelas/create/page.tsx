import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import FormCreateKelas from "@/components/molecules/form/kelas/FormCreateKelas";

export default function AdminCreateKelasPage() {
  return (
    <main>
      <DashboardTitle
        title="Tambah Kelas"
        showBackButton
        backFallbackHref="/dashboard/admin/kelas"
      />
      <FormCreateKelas />
    </main>
  );
}
