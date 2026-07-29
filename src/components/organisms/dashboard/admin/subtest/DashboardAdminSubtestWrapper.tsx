"use client";

import AlertDialogDeleteSubtest from "@/components/atoms/alert-dialog/subtest/AlertDialogDeleteSubtest";
import { subtestColumns } from "@/components/atoms/datacolumn/DataSubtest";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteSubtest } from "@/http/subtest/delete-subtest";
import { useGetAllSubtest } from "@/http/subtest/get-all-subtest";
import { Subtest } from "@/types/subtest/subtest";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const subtestExportColumns: AdminExportColumn<Subtest>[] = [
  { header: "Nama Subtes", accessor: (row) => row.name },
  { header: "Kategori", accessor: (row) => row.category },
  { header: "Maksimal Soal", accessor: (row) => (row.max_questions === 0 ? "Tidak terbatas" : row.max_questions) },
  { header: "Jumlah Soal", accessor: (row) => row.questions_count ?? 0 },
  { header: "Tanggal Dibuat", accessor: (row) => new Date(row.created_at).toLocaleDateString("id-ID") },
];

const subtestSortOptions: AdminSortOption<Subtest>[] = [
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "oldest", label: "Terlama", compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
  { key: "az", label: "Nama A-Z", compare: (a, b) => a.name.localeCompare(b.name, "id-ID") },
  { key: "za", label: "Nama Z-A", compare: (a, b) => b.name.localeCompare(a.name, "id-ID") },
  { key: "questions", label: "Soal terbanyak", compare: (a, b) => (b.questions_count ?? 0) - (a.questions_count ?? 0) },
];

export default function DashboardAdminSubtestWrapper() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [isSelectedDeleteSubtest, setIsSelectedDeleteSubtest] =
    useState<Subtest | null>(null);
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);

  const { data, isPending } = useGetAllSubtest({
    token: session?.access_token as string,
  });
  const subtestRows = data?.data ?? [];
  const categoryOptions = Array.from(new Set(subtestRows.map((item) => item.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "id-ID"))
    .map((category) => ({ label: category, value: category }));
  const subtestFilters: AdminFilterOption<Subtest>[] = [
    {
      key: "category",
      label: "Semua Kategori",
      placeholder: "Kategori",
      options: categoryOptions,
      getValue: (row) => row.category,
    },
  ];
  const controls = useAdminTableControls({
    data: subtestRows,
    searchFields: [(row) => row.name, (row) => row.category],
    filters: subtestFilters,
    sortOptions: subtestSortOptions,
    defaultSort: "newest",
  });

  const deleteSubtestHandler = (data: Subtest) => {
    setIsSelectedDeleteSubtest(data);
    setIsDialogDeleteOpen(true);
  };

  const { mutate: deleteSubtest } = useDeleteSubtest({
    onError: (error) => {
      toast.error("Gagal menghapus subtes!", {
        description:
          error.response?.data.message ||
          "Terjadi kesalahan saat menghapus subtes.",
      });
    },
    onSuccess: () => {
      setIsSelectedDeleteSubtest(null);
      toast.success("Berhasil menghapus subtes!");
      queryClient.invalidateQueries({
        queryKey: ["get-all-subtests"],
      });
    },
  });

  const handleDeleteSubtest = () => {
    if (isSelectedDeleteSubtest) {
      deleteSubtest({
        id: isSelectedDeleteSubtest.id,
        token: session?.access_token as string,
      });
    }
  };

  return (
    <section>
      <Card>
        <CardContent>
          <div className="space-y-6">
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Cari nama atau kategori subtes..."
              filters={subtestFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={subtestSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={subtestExportColumns}
              exportTitle="laporan-subtes"
              filterSummary={`Total hasil: ${controls.rows.length}`}
            >
              <Button size={"lg"} asChild>
                <Link href="/dashboard/admin/subtest/create">
                  <Plus /> Tambah Subtes
                </Link>
              </Button>
            </AdminDataToolbar>
            <DataTable
              columns={subtestColumns({
                deleteSubtestHandler,
              })}
              data={controls.rows}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {isSelectedDeleteSubtest && (
        <AlertDialogDeleteSubtest
          open={isDialogDeleteOpen}
          setOpen={setIsDialogDeleteOpen}
          confirmDelete={handleDeleteSubtest}
        />
      )}
    </section>
  );
}
