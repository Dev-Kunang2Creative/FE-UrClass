import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTransactionWrapper from "@/components/organisms/dashboard/admin/transactions/DashboardAdminTransactionWrapper";

export default function DashboardAdminTransactionsPage() {
  return (
    <main>
      <DashboardTitle title="Riwayat Transaksi" />
      <DashboardAdminTransactionWrapper />
    </main>
  );
}
