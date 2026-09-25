import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import KritikSaranPeserta from "@/components/organisms/dashboard/admin/KritikSaranPeserta";

export default function KritikSaranPage() {
  return (
    <main>
      <DashboardTitle title="Kritik & Saran Peserta" />
      <KritikSaranPeserta />
    </main>
  );
}
