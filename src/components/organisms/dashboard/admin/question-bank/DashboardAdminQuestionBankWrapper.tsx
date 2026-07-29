"use client";

import { questionBankColumns } from "@/components/atoms/datacolumn/DataQuestionBank";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAllSubtest } from "@/http/subtest/get-all-subtest";
import { Subtest } from "@/types/subtest/subtest";
import { useSession } from "next-auth/react";

const questionBankExportColumns: AdminExportColumn<Subtest>[] = [
  { header: "Nama Bank Soal", accessor: (row) => row.name },
  { header: "Kategori", accessor: (row) => row.category },
  { header: "Jumlah Soal", accessor: (row) => row.questions_count ?? 0 },
  { header: "Maksimal Soal", accessor: (row) => (row.max_questions === 0 ? "Tidak terbatas" : row.max_questions) },
];

const questionBankSortOptions: AdminSortOption<Subtest>[] = [
  { key: "az", label: "Nama A-Z", compare: (a, b) => a.name.localeCompare(b.name, "id-ID") },
  { key: "za", label: "Nama Z-A", compare: (a, b) => b.name.localeCompare(a.name, "id-ID") },
  { key: "questions", label: "Soal terbanyak", compare: (a, b) => (b.questions_count ?? 0) - (a.questions_count ?? 0) },
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
];

export default function DashboardAdminQuestionBankWrapper() {
  const { data: session } = useSession();

  const { data, isPending } = useGetAllSubtest({
    token: session?.access_token as string,
  });
  const bankRows = data?.data ?? [];
  const categoryOptions = Array.from(new Set(bankRows.map((item) => item.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "id-ID"))
    .map((category) => ({ label: category, value: category }));
  const bankFilters: AdminFilterOption<Subtest>[] = [
    {
      key: "category",
      label: "Semua Kategori",
      placeholder: "Kategori",
      options: categoryOptions,
      getValue: (row) => row.category,
    },
  ];
  const controls = useAdminTableControls({
    data: bankRows,
    searchFields: [(row) => row.name, (row) => row.category],
    filters: bankFilters,
    sortOptions: questionBankSortOptions,
    defaultSort: "az",
  });

  return (
    <section>
      <Card>
        <CardContent>
          <div className="space-y-6">
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Cari nama bank soal atau kategori..."
              filters={bankFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={questionBankSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={questionBankExportColumns}
              exportTitle="laporan-bank-soal"
              filterSummary={`Total hasil: ${controls.rows.length}`}
            />
            <DataTable
              columns={questionBankColumns}
              data={controls.rows}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
