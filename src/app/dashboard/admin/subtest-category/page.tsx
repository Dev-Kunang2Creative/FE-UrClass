import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminSubtestCategoryWrapper from "@/components/organisms/dashboard/admin/subtest/DashboardAdminSubtestCategoryWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategori Subtes - Admin UrClass",
  description: "Kelola master data kategori subtes untuk tryout UTBK dan CPNS.",
};

export default function SubtestCategoryPage() {
  return (
    <main>
      <DashboardTitle title="Kategori Subtes" />
      <DashboardAdminSubtestCategoryWrapper />
    </main>
  );
}
