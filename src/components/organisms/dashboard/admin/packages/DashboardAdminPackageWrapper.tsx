"use client";

import AlertDialogDeletePackage from "@/components/atoms/alert-dialog/package/AlertDialogDeletePackage";
import { packageColumns } from "@/components/atoms/datacolumn/DataPackage";
import DialogPackageDetail from "@/components/atoms/dialog/package/DialogPackageDetail";
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
import { useDeletePackage } from "@/http/packages/delete-package";
import { useGetAllPackage } from "@/http/packages/get-all-package";
import { Package } from "@/types/packages/package";
import { formatPrice } from "@/utils/format-price";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const packageExportColumns: AdminExportColumn<Package>[] = [
  { header: "Nama Paket", accessor: (row) => row.name },
  { header: "Slug", accessor: (row) => row.slug },
  { header: "Harga", accessor: (row) => row.price, format: (value) => formatPrice(Number(value || 0)) },
  { header: "Harga Diskon", accessor: (row) => row.discount_price, format: (value) => (value == null ? "-" : formatPrice(Number(value))) },
  { header: "Tiket", accessor: (row) => row.ticket_amount },
  { header: "Status", accessor: (row) => (row.is_active ? "Aktif" : "Tidak Aktif") },
  { header: "Tanggal Dibuat", accessor: (row) => new Date(row.created_at).toLocaleDateString("id-ID") },
];

const packageSortOptions: AdminSortOption<Package>[] = [
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "oldest", label: "Terlama", compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
  { key: "az", label: "Nama A-Z", compare: (a, b) => a.name.localeCompare(b.name, "id-ID") },
  { key: "za", label: "Nama Z-A", compare: (a, b) => b.name.localeCompare(a.name, "id-ID") },
  { key: "price-high", label: "Harga tertinggi", compare: (a, b) => Number(b.discount_price ?? b.price) - Number(a.discount_price ?? a.price) },
  { key: "price-low", label: "Harga terendah", compare: (a, b) => Number(a.discount_price ?? a.price) - Number(b.discount_price ?? b.price) },
];

export default function DashboardAdminPackageWrapper() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSelectedDeletePackage, setIsSelectedDeletePackage] =
    useState<Package | null>(null);

  const deletePackageHandler = (data: Package) => {
    setIsSelectedDeletePackage(data);
    setIsDeleteDialogOpen(true);
  };

  const { mutate: deletePackage } = useDeletePackage({
    onError: (error) => {
      toast.error("Gagal menghapus paket!", {
        description:
          error.response?.data.message ||
          "Terjadi kesalahan saat menghapus paket.",
      });
    },
    onSuccess: () => {
      setIsSelectedDeletePackage(null);
      toast.success("Berhasil menghapus paket!");
      queryClient.invalidateQueries({
        queryKey: ["get-all-packages"],
      });
    },
  });

  const handleDeletePackage = () => {
    if (isSelectedDeletePackage) {
      deletePackage({
        id: isSelectedDeletePackage.id,
        token: session?.access_token as string,
      });
    }
  };

  const handleDetailPackage = (data: Package) => {
    setSelectedPackage(data);
    setIsDialogOpen(true);
  };

  const { data, isPending } = useGetAllPackage({
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });
  const packageRows = data?.data ?? [];
  const packageFilters: AdminFilterOption<Package>[] = [
    {
      key: "status",
      label: "Semua Status",
      placeholder: "Status",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Tidak Aktif", value: "inactive" },
      ],
      getValue: (row) => (row.is_active ? "active" : "inactive"),
    },
  ];
  const controls = useAdminTableControls({
    data: packageRows,
    searchFields: [(row) => row.name, (row) => row.description, (row) => row.slug],
    filters: packageFilters,
    sortOptions: packageSortOptions,
    defaultSort: "newest",
  });

  return (
    <section>
      <Card>
        <CardContent>
          <div className="space-y-6">
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Cari nama, slug, deskripsi..."
              filters={packageFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={packageSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={packageExportColumns}
              exportTitle="laporan-paket"
              filterSummary={`Total hasil: ${controls.rows.length}`}
            >
              <Button size={"lg"} asChild>
                <Link href="/dashboard/admin/packages/create">
                  <Plus /> Tambah Paket
                </Link>
              </Button>
            </AdminDataToolbar>
            <DataTable
              columns={packageColumns({
                detailPackageHandler: handleDetailPackage,
                deletePackageHandler: deletePackageHandler,
              })}
              data={controls.rows}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {selectedPackage && (
        <DialogPackageDetail
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          packageId={selectedPackage.id}
        />
      )}

      {isSelectedDeletePackage && (
        <AlertDialogDeletePackage
          open={isDeleteDialogOpen}
          setOpen={setIsDeleteDialogOpen}
          confirmDelete={handleDeletePackage}
        />
      )}
    </section>
  );
}
