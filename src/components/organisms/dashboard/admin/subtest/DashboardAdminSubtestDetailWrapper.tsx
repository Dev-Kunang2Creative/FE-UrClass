"use client";

import AlertDialogDeleteQuestion from "@/components/atoms/alert-dialog/question/AlertDialogDeleteQuestion";
import { questionColumns } from "@/components/atoms/datacolumn/DataQuestion";
import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
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
import { useDeleteQuestion } from "@/http/questions/delete-question";
import { useGetAllQuestionBySubtest } from "@/http/questions/get-all-question-by-subtest";
import { useGetDetailSubtest } from "@/http/subtest/get-detail-subtest";
import { Question } from "@/types/questions/question";
import { useQueryClient } from "@tanstack/react-query";
import DialogBulkImportQuestion from "@/components/molecules/dialog/DialogBulkImportQuestion";
import { Plus, TriangleAlert, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { stripHtmlToPreviewText } from "@/utils/rich-text";

const questionExportColumns: AdminExportColumn<Question>[] = [
  { header: "Urutan", accessor: (row) => row.order_no },
  { header: "Pertanyaan", accessor: (row) => stripHtmlToPreviewText(row.question_text) },
  { header: "Jawaban Benar", accessor: (row) => row.correct_answer },
  { header: "Tingkat", accessor: (row) => row.difficulty || "-" },
  { header: "Status", accessor: (row) => (row.is_active ? "Aktif" : "Tidak Aktif") },
  { header: "Riwayat Jawaban", accessor: (row) => row.user_answers_count ?? 0 },
  { header: "Tanggal Dibuat", accessor: (row) => new Date(row.created_at).toLocaleDateString("id-ID") },
];

const questionSortOptions: AdminSortOption<Question>[] = [
  { key: "order-asc", label: "Urutan terkecil", compare: (a, b) => Number(a.order_no || 0) - Number(b.order_no || 0) },
  { key: "order-desc", label: "Urutan terbesar", compare: (a, b) => Number(b.order_no || 0) - Number(a.order_no || 0) },
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "oldest", label: "Terlama", compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
  { key: "answered", label: "Riwayat terbanyak", compare: (a, b) => (b.user_answers_count ?? 0) - (a.user_answers_count ?? 0) },
];

interface DashboardadminSubtestDetailWrapperProps {
  id: string;
}

export default function DashboardadminSubtestDetailWrapper({
  id,
}: DashboardadminSubtestDetailWrapperProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [isOpenDialogDelete, setIsOpenDialogDelete] = useState(false);
  const [isSelectedDeleteQuestion, setIsSelectedDeleteQuestion] =
    useState<Question | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const deleteQuestionHandler = (data: Question) => {
    setIsSelectedDeleteQuestion(data);
    setIsOpenDialogDelete(true);
  };

  const { data } = useGetDetailSubtest({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  const { data: question, isPending: isPendingQuestion } =
    useGetAllQuestionBySubtest({
      id,
      token: session?.access_token as string,
      options: {
        enabled: status === "authenticated",
      },
    });
  const questionRows = question?.data ?? [];
  const questionFilters: AdminFilterOption<Question>[] = [
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
    {
      key: "usage",
      label: "Semua Pemakaian",
      placeholder: "Pemakaian",
      options: [
        { label: "Belum dipakai", value: "unused" },
        { label: "Sudah ada riwayat", value: "used" },
      ],
      getValue: (row) => ((row.user_answers_count ?? 0) > 0 ? "used" : "unused"),
    },
  ];
  const controls = useAdminTableControls({
    data: questionRows,
    searchFields: [
      (row) => stripHtmlToPreviewText(row.question_text),
      (row) => row.correct_answer,
      (row) => row.difficulty,
    ],
    filters: questionFilters,
    sortOptions: questionSortOptions,
    defaultSort: "order-asc",
  });

  const { mutate: deleteQuestion, isPending: isDeletingQuestion } = useDeleteQuestion({
    onError: (error) => {
      toast.error("Gagal menghapus soal!", {
        description:
          error.response?.data.message ||
          "Terjadi kesalahan saat menghapus soal.",
      });
    },
    onSuccess: () => {
      setIsSelectedDeleteQuestion(null);
      setIsOpenDialogDelete(false);
      toast.success("Berhasil menghapus soal!");
      queryClient.invalidateQueries({
        queryKey: ["get-all-question-by-subtest", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-detail-subtest", id],
      });
    },
  });

  const handleDeleteQuestion = () => {
    if (isSelectedDeleteQuestion) {
      deleteQuestion({
        id: isSelectedDeleteQuestion.id,
        subtestId: id,
        token: session?.access_token as string,
      });
    }
  };

  return (
    <section className="space-y-6">
      <DashboardTitle
        title={data?.data.name}
        showBackButton
        backFallbackHref="/dashboard/admin/subtest"
      />
      <Card>
        <CardContent>
          <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Judul Subtes</span>
              <h3 className="font-semibold">{data?.data.name}</h3>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Kategori</span>
              <h3 className="font-semibold">{data?.data.category}</h3>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Maks. Soal</span>
              <h3 className="font-semibold">
                {data?.data.max_questions === 0 ? "Tidak terbatas" : data?.data.max_questions}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Jumlah Soal</span>
              <h3 className="font-semibold">
                <span className="text-blue-600">{data?.data.questions_count ?? 0}</span>
                {data?.data.max_questions && data.data.max_questions > 0 && (
                  <span className="text-gray-400 font-normal"> / {data.data.max_questions}</span>
                )}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Bobot yang belum diisi tidak membuat apa pun gagal - hanya membuat
          skor TKP peserta jauh lebih rendah dari seharusnya - jadi satu-satunya
          tempat kondisi ini bisa terlihat adalah di sini. */}
      {(question?.meta?.needs_option_weight_count ?? 0) > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              {question?.meta?.needs_option_weight_count} soal belum punya bobot
              opsi yang sah.
            </p>
            <p className="text-amber-800">
              Subtes ini dinilai per bobot opsi, jadi setiap opsi harus bernilai
              1-5 tanpa angka kembar. Soal yang belum diisi ditandai
              &quot;Bobot belum diisi&quot; di daftar dan nilainya tidak akan
              terhitung sebagaimana mestinya.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent>
          <div className="space-y-6">
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Cari pertanyaan, jawaban, tingkat..."
              filters={questionFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={questionSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={questionExportColumns}
              exportTitle={`laporan-soal-${data?.data.name ?? id}`}
              filterSummary={`Subtes: ${data?.data.name ?? "-"}; hasil: ${controls.rows.length}`}
            >
                {/* Tinggi dan warnanya sengaja tidak menyamai tombol export di
                    sebelahnya: ini mengunggah, bukan mengunduh, dan ikon panah
                    ke atas yang membedakannya sekilas. */}
                <Button
                  variant="outline"
                  onClick={() => setIsBulkImportOpen(true)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Soal
                </Button>
                <Button asChild>
                  <Link href={`/dashboard/admin/subtest/${id}/create`}>
                    <Plus /> Tambah Pertanyaan
                  </Link>
                </Button>
            </AdminDataToolbar>
            <DataTable
              columns={questionColumns({
                deleteQuestionHandler,
              })}
              data={controls.rows}
              isLoading={isPendingQuestion}
            />
          </div>
        </CardContent>
      </Card>

      {isSelectedDeleteQuestion && (
        <AlertDialogDeleteQuestion
          open={isOpenDialogDelete}
          setOpen={setIsOpenDialogDelete}
          confirmDelete={handleDeleteQuestion}
          isPending={isDeletingQuestion}
          question={isSelectedDeleteQuestion}
          subtestName={data?.data.name}
        />
      )}

      <DialogBulkImportQuestion
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        subtestId={id}
      />
    </section>
  );
}
