import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTransactionDetailWrapper from "@/components/organisms/dashboard/admin/transactions/DashboardAdminTransactionDetailWrapper";

interface DashboardAdminTransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAdminTransactionDetailPage({
  params,
}: DashboardAdminTransactionDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <DashboardTitle
        title="Detail Transaksi"
        showBackButton
        backFallbackHref="/dashboard/admin/transactions"
      />
      <DashboardAdminTransactionDetailWrapper id={id} />
    </main>
  );
}
