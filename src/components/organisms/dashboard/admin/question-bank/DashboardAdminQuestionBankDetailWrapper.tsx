"use client";

import AlertDialogDeleteQuestion from "@/components/atoms/alert-dialog/question/AlertDialogDeleteQuestion";
import { questionColumns } from "@/components/atoms/datacolumn/DataQuestion";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteQuestion } from "@/http/questions/delete-question";
import { useGetAllQuestionBySubtest } from "@/http/questions/get-all-question-by-subtest";
import { useGetDetailSubtest } from "@/http/subtest/get-detail-subtest";
import {
  exportSubtestPdfHandler,
  useExportSubtestExcel,
  streamPdfInTab,
  triggerBlobDownload,
} from "@/http/question-bank/export-subtest";
import { Question } from "@/types/questions/question";
import { stripHtmlToPreviewText } from "@/utils/rich-text";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  FileText,
  Search,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface DashboardAdminQuestionBankDetailWrapperProps {
  id: string;
}

export default function DashboardAdminQuestionBankDetailWrapper({
  id,
}: DashboardAdminQuestionBankDetailWrapperProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
  const [isSelectedDeleteQuestion, setIsSelectedDeleteQuestion] =
    useState<Question | null>(null);

  // Ambil detail subtes
  const { data: subtestData, isPending: isPendingSubtest } = useGetDetailSubtest({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  // Ambil daftar butir soal
  const { data: questionData, isPending: isPendingQuestion } = useGetAllQuestionBySubtest({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  const subtest = subtestData?.data;
  const questions = useMemo(
    () => questionData?.data ?? [],
    [questionData?.data],
  );

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Export Excel Hook
  const { mutate: exportExcel, isPending: isExportingExcel } = useExportSubtestExcel({
    onSuccess: (blob) => {
      const slug = (subtest?.name || "bank-soal")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const date = new Date().toISOString().split("T")[0];
      triggerBlobDownload(
        blob,
        `soal-${slug}-${date}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      toast.success("Lembar soal Excel berhasil diunduh!");
    },
    onError: (error) => {
      toast.error("Gagal mengunduh Excel!", {
        description: error.response?.data?.message || "Terjadi kesalahan saat mengekspor Excel.",
      });
    },
  });

  const handleExportPdf = () => {
    if (!session?.access_token) return;
    toast.info(`Membuka stream naskah soal PDF ${subtest?.name ?? ""}...`);
    setIsExportingPdf(true);
    streamPdfInTab(
      () => exportSubtestPdfHandler(id, session.access_token),
      subtest?.name,
    )
      .then(() => {
        toast.success("Naskah soal PDF berhasil dimuat di tab baru!");
      })
      .catch((error) => {
        toast.error("Gagal memuat PDF!", {
          description: error?.response?.data?.message || "Terjadi kesalahan saat memuat dokumen PDF.",
        });
      })
      .finally(() => {
        setIsExportingPdf(false);
      });
  };

  const handleExportExcel = () => {
    if (!session?.access_token) return;
    toast.info(`Menyiapkan lembar soal Excel ${subtest?.name ?? ""}...`);
    exportExcel({
      subtestId: id,
      token: session.access_token,
      subtestName: subtest?.name,
    });
  };

  const deleteQuestionHandler = (data: Question) => {
    setIsSelectedDeleteQuestion(data);
    setIsDialogDeleteOpen(true);
  };

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

  // Filter soal berdasarkan pencarian
  const filteredQuestions = useMemo(() => {
    if (!searchKeyword.trim()) return questions;
    const term = searchKeyword.toLowerCase();
    return questions.filter((q) => {
      const text = stripHtmlToPreviewText(q.question_text || "").toLowerCase();
      const answer = (q.correct_answer || "").toLowerCase();
      const difficulty = (q.difficulty || "").toLowerCase();
      return text.includes(term) || answer.includes(term) || difficulty.includes(term);
    });
  }, [questions, searchKeyword]);

  return (
    <section className="space-y-6">
      {/* Kartu Ringkasan Bank Soal & Aksi Ekspor */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-medium">Nama Bank Soal</span>
                <h3 className="font-bold text-slate-900 line-clamp-1">
                  {subtest?.name || (isPendingSubtest ? "Memuat..." : "-")}
                </h3>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-medium">Kategori</span>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {subtest?.category || "-"} ({subtest?.exam_type?.toUpperCase() || "-"})
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-medium">Total Soal Aktif</span>
                <h3 className="font-bold text-blue-600">
                  {questions.length} <span className="text-xs text-slate-400 font-normal">butir</span>
                </h3>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-medium">Maksimal Soal</span>
                <h3 className="font-semibold text-slate-700">
                  {subtest?.max_questions === 0 ? "Tidak terbatas" : `${subtest?.max_questions ?? "-"} butir`}
                </h3>
              </div>
            </div>

            {/* Tombol Aksi Ekspor & Kelola */}
            <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={isExportingExcel || questions.length === 0}
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
              >
                {isExportingExcel ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                )}
                Export Excel (Lembar Soal)
              </Button>

              <Button
                onClick={handleExportPdf}
                disabled={isExportingPdf || questions.length === 0}
                className="bg-[#004AAB] hover:bg-[#003882] text-white"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                ) : (
                  <FileText className="w-4 h-4 mr-2 text-white" />
                )}
                Export PDF (Lembar Soal)
              </Button>

              <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900">
                <Link href={`/dashboard/admin/subtest/${id}`} title="Buka di Manajemen Subtes">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Kelola / Tambah Soal
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Butir Soal & Pencarian */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari pertanyaan, kunci, atau tingkat..."
                  className="pl-9 w-full"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="text-xs text-slate-500">
                Menampilkan <span className="font-semibold text-slate-700">{filteredQuestions.length}</span> dari{" "}
                <span className="font-semibold text-slate-700">{questions.length}</span> soal
              </div>
            </div>

            <DataTable
              columns={questionColumns({
                deleteQuestionHandler,
              })}
              data={filteredQuestions}
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
        />
      )}
    </section>
  );
}
