"use client";

import AlertDialogDeleteQuestion from "@/components/atoms/alert-dialog/question/AlertDialogDeleteQuestion";
import { questionColumns } from "@/components/atoms/datacolumn/DataQuestion";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteQuestion } from "@/http/questions/delete-question";
import { useGetAllQuestionBySubtest } from "@/http/questions/get-all-question-by-subtest";
import { Question } from "@/types/questions/question";
import { stripHtmlToPreviewText } from "@/utils/rich-text";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

const questionExportColumns: AdminExportColumn<Question>[] = [
  { header: "Urutan", accessor: (row) => row.order_no },
  { header: "Pertanyaan", accessor: (row) => stripHtmlToPreviewText(row.question_text) },
  { header: "Jawaban Benar", accessor: (row) => row.correct_answer },
  { header: "Tingkat", accessor: (row) => row.difficulty || "-" },
  { header: "Status", accessor: (row) => (row.is_active ? "Aktif" : "Tidak Aktif") },
  { header: "Riwayat Jawaban", accessor: (row) => row.user_answers_count ?? 0 },
];

const questionSortOptions: AdminSortOption<Question>[] = [
  { key: "order-asc", label: "Urutan terkecil", compare: (a, b) => Number(a.order_no || 0) - Number(b.order_no || 0) },
  { key: "order-desc", label: "Urutan terbesar", compare: (a, b) => Number(b.order_no || 0) - Number(a.order_no || 0) },
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "oldest", label: "Terlama", compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
];

interface DashboardAdminQuestionSubtestTryoutProps {
  tryoutId: string;
  subtestId: string;
}

export default function DashboardAdminQuestionSubtestTryoutWrapper({
  subtestId,
}: DashboardAdminQuestionSubtestTryoutProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
  const [isSelectedDeleteQuestion, setIsSelectedDeleteQuestion] =
    useState<Question | null>(null);

  const deleteQuestionHandler = (data: Question) => {
    setIsSelectedDeleteQuestion(data);
    setIsDialogDeleteOpen(true);
  };

  const { data: question, isPending: isPendingQuestion } =
    useGetAllQuestionBySubtest({
      id: subtestId,
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
    searchFields: [(row) => stripHtmlToPreviewText(row.question_text), (row) => row.correct_answer, (row) => row.difficulty],
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
      setIsDialogDeleteOpen(false);
      toast.success("Berhasil menghapus soal!");
      queryClient.invalidateQueries({
        queryKey: ["get-all-question-by-subtest", subtestId],
      });
    },
  });

  const handleDeleteQuestion = () => {
    if (isSelectedDeleteQuestion) {
      deleteQuestion({
        id: isSelectedDeleteQuestion.id,
        subtestId: subtestId,
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
              exportTitle={`laporan-soal-subtes-${subtestId}`}
              filterSummary={`Subtes ID: ${subtestId}; hasil: ${controls.rows.length}`}
            />
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
          open={isDialogDeleteOpen}
          setOpen={setIsDialogDeleteOpen}
          confirmDelete={handleDeleteQuestion}
          isPending={isDeletingQuestion}
          question={isSelectedDeleteQuestion}
        />
      )}
    </section>
  );
}
