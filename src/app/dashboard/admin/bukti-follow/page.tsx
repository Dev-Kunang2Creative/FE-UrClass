import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTryoutProofWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardAdminTryoutProofWrapper";
import ProofRequirementManager from "@/components/organisms/dashboard/admin/tryout/ProofRequirementManager";

export default function DashboardAdminBuktiPendaftaranPage() {
  return (
    <main>
      <DashboardTitle title="Syarat & Bukti Pendaftaran" />
      {/* Yang diatur dan yang diperiksa berada di satu halaman: daftar syarat di
          atas menentukan slot unggahan peserta, tabel di bawahnya menampilkan
          bukti yang masuk beserta syarat mana yang dijawabnya. */}
      <ProofRequirementManager />
      <DashboardAdminTryoutProofWrapper />
    </main>
  );
}
