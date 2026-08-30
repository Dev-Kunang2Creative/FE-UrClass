import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTryoutProofWrapper from "@/components/organisms/dashboard/admin/tryout/DashboardAdminTryoutProofWrapper";
import InstagramAccountManager from "@/components/organisms/dashboard/admin/tryout/InstagramAccountManager";

export default function DashboardAdminBuktiFollowPage() {
  return (
    <main>
      <DashboardTitle title="Bukti Follow Instagram" />
      {/* Yang diatur dan yang diperiksa berada di satu halaman: daftar akun
          menentukan syaratnya, tabel di bawahnya menampilkan bukti yang masuk. */}
      <InstagramAccountManager />
      <DashboardAdminTryoutProofWrapper />
    </main>
  );
}
