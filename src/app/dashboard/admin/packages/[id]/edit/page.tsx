import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminUpdatePackageWrapper from "@/components/organisms/dashboard/admin/packages/DashboardAdminUpdatePackageWrapper";

interface DashboardAdminPackageEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminPackageEditPage({
  params,
}: DashboardAdminPackageEditPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Ubah Paket"
        showBackButton
        backFallbackHref="/dashboard/admin/packages"
      />
      <DashboardAdminUpdatePackageWrapper packageId={id} />
    </main>
  );
}
