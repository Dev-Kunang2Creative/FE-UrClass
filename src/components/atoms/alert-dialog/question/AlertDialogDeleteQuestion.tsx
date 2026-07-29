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
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types/questions/question";
import { stripHtmlToPreviewText } from "@/utils/rich-text";

interface AlertDialogDeleteQuestionProps {
  confirmDelete: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isPending?: boolean;
  question?: Question | null;
  subtestName?: string;
}

const AlertDialogDeleteQuestion = ({
  open,
  setOpen,
  confirmDelete,
  isPending,
  question,
  subtestName,
}: AlertDialogDeleteQuestionProps) => {
  const usageCount = question?.user_answers_count ?? 0;
  const preview = question ? stripHtmlToPreviewText(question.question_text) : "-";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Soal?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <span className="block">
              Periksa detail soal sebelum menghapus. Soal yang sudah digunakan
              pada riwayat pengerjaan tidak akan dihapus agar data nilai dan
              review peserta tetap aman.
            </span>
            <span className="block rounded-lg border bg-gray-50 p-3 text-gray-700">
              <span className="block text-xs text-gray-500">Pertanyaan</span>
              <span className="mt-1 block font-medium text-gray-900">
                {preview || "-"}
              </span>
              <span className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <span>Subtes: {subtestName || question?.subtest?.name || "-"}</span>
                <span>Kategori: {question?.subtest?.category || "-"}</span>
                <span>Urutan: {question?.order_no ?? "-"}</span>
                <span>Jawaban: {question?.correct_answer || "-"}</span>
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <Badge variant={usageCount > 0 ? "destructive" : "outline"}>
                {usageCount > 0
                  ? `${usageCount} riwayat jawaban terkait`
                  : "Belum ada riwayat jawaban"}
              </Badge>
              <span>
                {usageCount > 0
                  ? "Penghapusan akan ditolak oleh sistem."
                  : "Soal akan di-soft delete dan hilang dari daftar aktif."}
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || usageCount > 0}
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogDeleteQuestion;
