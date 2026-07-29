"use client";

import AlertDialogDeleteTryout from "@/components/atoms/alert-dialog/tryout/AlertDialogDeleteTryout";
import { tryoutColumns } from "@/components/atoms/datacolumn/DataTryout";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteTryout } from "@/http/tryout/delete-tryout";
import { useGetAllTryout } from "@/http/tryout/get-all-tryout";
import { Tryout } from "@/types/tryout/tryout";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const tryoutExportColumns: AdminExportColumn<Tryout>[] = [
  { header: "Judul", accessor: (row) => row.title },
  { header: "Kategori", accessor: (row) => row.category },
  { header: "Status", accessor: (row) => (row.is_published ? "Dipublish" : "Draft") },
  { header: "Tipe", accessor: (row) => (row.is_free ? "Gratis" : "Berbayar") },
  { header: "Peserta", accessor: (row) => row.user_accesses_count ?? 0 },
  { header: "Tanggal Dibuat", accessor: (row) => new Date(row.created_at).toLocaleDateString("id-ID") },
];

const tryoutSortOptions: AdminSortOption<Tryout>[] = [
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "oldest", label: "Terlama", compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
  { key: "az", label: "Judul A-Z", compare: (a, b) => a.title.localeCompare(b.title, "id-ID") },
  { key: "za", label: "Judul Z-A", compare: (a, b) => b.title.localeCompare(a.title, "id-ID") },
  { key: "participants", label: "Peserta terbanyak", compare: (a, b) => (b.user_accesses_count ?? 0) - (a.user_accesses_count ?? 0) },
];

export default function DashboardAdminTryoutWrapper() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [isSelectedDeleteTryout, setIsSelectedDeleteTryout] =
    useState<Tryout | null>(null);
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);

  const deleteTryoutHandler = (data: Tryout) => {
    setIsSelectedDeleteTryout(data);
    setIsDialogDeleteOpen(true);
  };

  const { data, isPending } = useGetAllTryout({
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });
  const tryoutRows = data?.data ?? [];
  const categoryOptions = Array.from(new Set(tryoutRows.map((item) => item.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "id-ID"))
    .map((category) => ({ label: category, value: category }));
  const tryoutFilters: AdminFilterOption<Tryout>[] = [
    {
      key: "status",
      label: "Semua Status",
      placeholder: "Status",
      options: [
        { label: "Dipublish", value: "published" },
        { label: "Draft", value: "draft" },
      ],
      getValue: (row) => (row.is_published ? "published" : "draft"),
    },
    {
      key: "category",
      label: "Semua Kategori",
      placeholder: "Kategori",
      options: categoryOptions,
      getValue: (row) => row.category,
    },
    {
      key: "type",
      label: "Semua Tipe",
      placeholder: "Tipe",
      options: [
        { label: "Gratis", value: "free" },
        { label: "Berbayar", value: "paid" },
      ],
      getValue: (row) => (row.is_free ? "free" : "paid"),
    },
  ];
  const controls = useAdminTableControls({
    data: tryoutRows,
    searchFields: [(row) => row.title, (row) => row.description, (row) => row.category],
    filters: tryoutFilters,
    sortOptions: tryoutSortOptions,
    defaultSort: "newest",
  });

  const { mutate: deleteTryout } = useDeleteTryout({
    onError: (error) => {
      toast.error("Gagal menghapus tryout!", {
        description:
          error.response?.data.message ||
          "Terjadi kesalahan saat menghapus tryout.",
      });
    },
    onSuccess: () => {
      setIsSelectedDeleteTryout(null);
      toast.success("Berhasil menghapus tryout!");
      queryClient.invalidateQueries({
        queryKey: ["get-all-tryouts"],
      });
    },
  });

  const handleDeleteTryout = () => {
    if (isSelectedDeleteTryout) {
      deleteTryout({
        id: isSelectedDeleteTryout.id,
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
              searchPlaceholder="Cari judul, deskripsi, kategori..."
              filters={tryoutFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={tryoutSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={tryoutExportColumns}
              exportTitle="laporan-tryout"
              filterSummary={`Total hasil: ${controls.rows.length}`}
            >
              <Button size={"lg"} asChild>
                <Link href="/dashboard/admin/try-out/create">
                  <Plus /> Tambah Tryout
                </Link>
              </Button>
            </AdminDataToolbar>
            <DataTable
              columns={tryoutColumns({
                deleteTryoutHandler,
              })}
              data={controls.rows}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {isSelectedDeleteTryout && (
        <AlertDialogDeleteTryout
          open={isDialogDeleteOpen}
          setOpen={setIsDialogDeleteOpen}
          confirmDelete={handleDeleteTryout}
        />
      )}
    </section>
  );
}
