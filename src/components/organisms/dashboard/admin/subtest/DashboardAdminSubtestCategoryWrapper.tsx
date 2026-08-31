"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { getErrorMessage } from "@/utils/get-error-message";
import type { SubtestCategory } from "@/types/subtest-category/subtest-category";
import {
  useCreateSubtestCategory,
  useDeleteSubtestCategory,
  useGetAdminSubtestCategories,
  useToggleActiveSubtestCategory,
  useUpdateSubtestCategory,
} from "@/http/subtest-category/admin-subtest-categories";

const categoryExportColumns: AdminExportColumn<SubtestCategory>[] = [
  { header: "Kode", accessor: (row) => row.code },
  { header: "Nama Kategori", accessor: (row) => row.name },
  { header: "Jalur Ujian", accessor: (row) => (row.exam_type === "cpns" ? "CPNS" : "UTBK") },
  { header: "Status", accessor: (row) => (row.is_active ? "Aktif" : "Nonaktif") },
];

const categorySortOptions: AdminSortOption<SubtestCategory>[] = [
  { key: "name_az", label: "Nama A-Z", compare: (a, b) => a.name.localeCompare(b.name, "id-ID") },
  { key: "name_za", label: "Nama Z-A", compare: (a, b) => b.name.localeCompare(a.name, "id-ID") },
  { key: "code_az", label: "Kode A-Z", compare: (a, b) => a.code.localeCompare(b.code, "id-ID") },
  { key: "exam_type", label: "Jalur Ujian", compare: (a, b) => a.exam_type.localeCompare(b.exam_type) },
];

const categoryFilters: AdminFilterOption<SubtestCategory>[] = [
  {
    key: "exam_type",
    label: "Semua Jalur",
    placeholder: "Jalur",
    options: [
      { label: "UTBK", value: "utbk" },
      { label: "CPNS", value: "cpns" },
    ],
    getValue: (row) => row.exam_type,
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

export default function DashboardAdminSubtestCategoryWrapper() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const { data, isPending } = useGetAdminSubtestCategories({ token });
  const categories = data?.data ?? [];

  // State for Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SubtestCategory | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    exam_type: "utbk" | "cpns";
    is_active: boolean;
  }>({
    code: "",
    name: "",
    exam_type: "utbk",
    is_active: true,
  });

  // State for Delete Alert Dialog
  const [deletingCategory, setDeletingCategory] = useState<SubtestCategory | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const createMutation = useCreateSubtestCategory({
    token,
    onSuccess: () => {
      setIsModalOpen(false);
      toast.success("Kategori subtes berhasil ditambahkan.");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan kategori", {
        description: getErrorMessage(error, "Terjadi kesalahan."),
      });
    },
  });

  const updateMutation = useUpdateSubtestCategory({
    token,
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingCategory(null);
      toast.success("Kategori subtes berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui kategori", {
        description: getErrorMessage(error, "Terjadi kesalahan."),
      });
    },
  });

  const toggleMutation = useToggleActiveSubtestCategory({
    token,
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error("Gagal mengubah status kategori", {
        description: getErrorMessage(error, "Terjadi kesalahan."),
      });
    },
  });

  const deleteMutation = useDeleteSubtestCategory({
    token,
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      toast.success("Kategori subtes berhasil dihapus.");
    },
    onError: (error) => {
      toast.error("Gagal menghapus kategori", {
        description: getErrorMessage(error, "Terjadi kesalahan."),
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      code: "",
      name: "",
      exam_type: "utbk",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: SubtestCategory) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      exam_type: category.exam_type,
      is_active: category.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Kode dan Nama kategori wajib diisi.");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        body: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  const controls = useAdminTableControls({
    data: categories,
    searchFields: [(row) => row.name, (row) => row.code, (row) => row.exam_type],
    filters: categoryFilters,
    sortOptions: categorySortOptions,
    defaultSort: "name_az",
  });

  const columns: ColumnDef<SubtestCategory>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nama Kategori",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 text-sm">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "exam_type",
      header: "Jalur Ujian",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            row.original.exam_type === "cpns"
              ? "bg-orange-50 text-orange-800 border-orange-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          {row.original.exam_type.toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.is_active}
            onCheckedChange={() => toggleMutation.mutate(row.original.id)}
            disabled={toggleMutation.isPending}
          />
          <span
            className={`text-xs font-semibold ${
              row.original.is_active ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            {row.original.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEdit(row.original)}
            className="h-8 px-2.5 text-xs font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setDeletingCategory(row.original);
              setIsDeleteOpen(true);
            }}
            className="h-8 px-2.5 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href="/dashboard/admin/subtest">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Daftar Subtes
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Master Kategori Subtes
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Kelola kategori subtes untuk jalur UTBK dan CPNS secara dinamis.
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="h-9 font-bold">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Cari nama atau kode kategori..."
              filters={categoryFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={categorySortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={categoryExportColumns}
              exportTitle="master-kategori-subtes"
              filterSummary={`Total kategori: ${controls.rows.length}`}
            />

            <DataTable
              columns={columns}
              data={controls.rows}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori Subtes" : "Tambah Kategori Subtes"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Jalur Ujian <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.exam_type}
                onValueChange={(val: "utbk" | "cpns") =>
                  setFormData((prev) => ({ ...prev, exam_type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jalur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utbk">UTBK</SelectItem>
                  <SelectItem value="cpns">CPNS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Kode Kategori <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: TWK, TIU, TKP, TPS, Literasi"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <p className="text-[11px] text-slate-500">
                Kode unik yang akan tersimpan pada relasi subtes.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Tes Wawasan Kebangsaan (TWK)"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Status Aktif
                </span>
                <p className="text-[11px] text-slate-500">
                  Hanya kategori aktif yang muncul pada pilihan dropdown subtes.
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(val) =>
                  setFormData((prev) => ({ ...prev, is_active: val }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Menyimpan..."
                : editingCategory
                  ? "Simpan Perubahan"
                  : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori Subtes?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah kamu yakin ingin menghapus kategori{" "}
              <strong>{deletingCategory?.name} ({deletingCategory?.code})</strong>?
              Pastikan tidak ada subtes yang sedang menggunakan kategori ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus Kategori"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
