"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { testimonialColumns } from "@/components/atoms/datacolumn/DataTestimonial";
import AlertDialogDeleteTestimonial from "@/components/atoms/alert-dialog/testimonial/AlertDialogDeleteTestimonial";
import DialogTestimonialForm from "@/components/molecules/dialog/DialogTestimonialForm";
import { useGetAllTestimonials } from "@/http/testimonials/get-all-testimonials";
import { useDeleteTestimonial } from "@/http/testimonials/delete-testimonial";
import { Testimonial } from "@/types/testimonials/testimonial";

const testimonialExportColumns: AdminExportColumn<Testimonial>[] = [
  { header: "Nama Siswa", accessor: (row) => row.name },
  { header: "Status / Role", accessor: (row) => row.role },
  { header: "Program", accessor: (row) => row.program },
  { header: "Ulasan", accessor: (row) => row.quote },
  { header: "Rating", accessor: (row) => row.rating },
  { header: "Urutan", accessor: (row) => row.order_no },
  { header: "Status", accessor: (row) => (row.is_active ? "Aktif" : "Nonaktif") },
  {
    header: "Tanggal Dibuat",
    accessor: (row) => new Date(row.created_at).toLocaleDateString("id-ID"),
  },
];

const testimonialSortOptions: AdminSortOption<Testimonial>[] = [
  {
    key: "order-asc",
    label: "Urutan terkecil",
    compare: (a, b) => Number(a.order_no || 0) - Number(b.order_no || 0),
  },
  {
    key: "newest",
    label: "Terbaru",
    compare: (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  },
  {
    key: "oldest",
    label: "Terlama",
    compare: (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  },
  {
    key: "az",
    label: "Nama A-Z",
    compare: (a, b) => a.name.localeCompare(b.name, "id-ID"),
  },
];

const testimonialFilters: AdminFilterOption<Testimonial>[] = [
  {
    key: "program",
    label: "Semua Program",
    placeholder: "Program",
    options: [
      { label: "UTBK-SNBT", value: "UTBK-SNBT" },
      { label: "CPNS", value: "CPNS" },
    ],
    getValue: (row) => row.program,
  },
  {
    key: "is_active",
    label: "Semua Status",
    placeholder: "Status",
    options: [
      { label: "Aktif", value: "true" },
      { label: "Nonaktif", value: "false" },
    ],
    getValue: (row) => String(row.is_active),
  },
];

export default function DashboardAdminTestimonialWrapper() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeleteTestimonial, setSelectedDeleteTestimonial] =
    useState<Testimonial | null>(null);

  const { data, isPending } = useGetAllTestimonials({
    token: session?.access_token as string,
  });

  const testimonialRows = data?.data ?? [];

  const controls = useAdminTableControls({
    data: testimonialRows,
    searchFields: [
      (row) => row.name,
      (row) => row.role,
      (row) => row.quote,
      (row) => row.program,
    ],
    filters: testimonialFilters,
    sortOptions: testimonialSortOptions,
    defaultSort: "order-asc",
  });

  const { mutate: deleteTestimonial, isPending: isDeleting } =
    useDeleteTestimonial({
      onSuccess: () => {
        toast.success("Testimoni berhasil dihapus!");
        setIsDeleteDialogOpen(false);
        setSelectedDeleteTestimonial(null);
        queryClient.invalidateQueries({
          queryKey: ["get-all-testimonials"],
        });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Gagal menghapus testimoni.");
      },
    });

  const handleOpenCreate = () => {
    setSelectedTestimonial(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setSelectedTestimonial(item);
    setIsFormDialogOpen(true);
  };

  const handleOpenDelete = (item: Testimonial) => {
    setSelectedDeleteTestimonial(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDeleteTestimonial) {
      deleteTestimonial(selectedDeleteTestimonial.id);
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
              searchPlaceholder="Cari nama siswa, status, atau ulasan..."
              filters={testimonialFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={testimonialSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={testimonialExportColumns}
              exportTitle="laporan-testimoni"
              filterSummary={`Total hasil: ${controls.rows.length}`}
            >
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Testimoni
              </Button>
            </AdminDataToolbar>

            <DataTable
              columns={testimonialColumns({
                editTestimonialHandler: handleOpenEdit,
                deleteTestimonialHandler: handleOpenDelete,
              })}
              data={controls.rows}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog Form Tambah / Edit */}
      <DialogTestimonialForm
        open={isFormDialogOpen}
        setOpen={setIsFormDialogOpen}
        selectedTestimonial={selectedTestimonial}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["get-all-testimonials"],
          });
        }}
      />

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialogDeleteTestimonial
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        confirmDelete={handleConfirmDelete}
        isPending={isDeleting}
      />
    </section>
  );
}
