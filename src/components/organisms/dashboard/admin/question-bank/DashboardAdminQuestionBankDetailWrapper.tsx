"use client";

import AlertDialogDeleteQuestion from "@/components/atoms/alert-dialog/question/AlertDialogDeleteQuestion";
import { questionColumns } from "@/components/atoms/datacolumn/DataQuestion";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteQuestion } from "@/http/questions/delete-question";
import { useGetAllQuestionBySubtest } from "@/http/questions/get-all-question-by-subtest";
import { Question } from "@/types/questions/question";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardAdminQuestionBankDetailWrapperProps {
  id: string;
}

export default function DashboardAdminQuestionBankDetailWrapper({
  id,
}: DashboardAdminQuestionBankDetailWrapperProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
  const [isSelectedDeleteQuestion, setIsSelectedDeleteQuestion] =
    useState<Question | null>(null);

  const deleteQuestionHandler = (data: Question) => {
    setIsSelectedDeleteQuestion(data);
    setIsDialogDeleteOpen(true);
  };

  const { mutate: deleteQuestion } = useDeleteQuestion({
    onError: (error) => {
      toast.error("Gagal menghapus soal!", {
        description:
          error.response?.data.message ||
          "Terjadi kesalahan saat menghapus soal.",
      });
    },
    onSuccess: () => {
      setIsSelectedDeleteQuestion(null);
      toast.success("Berhasil menghapus soal!");
      queryClient.invalidateQueries({
        queryKey: ["get-all-question-by-subtest", id],
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

  const { data, isPending } = useGetAllQuestionBySubtest({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  return (
    <section>
      <Card>
        <CardContent>
          <div className="space-y-6">
            <Input
              placeholder="Cari berdasarkan pertanyaan..."
              className="max-w-xs w-full"
            />
            <DataTable
              columns={questionColumns({
                deleteQuestionHandler,
              })}
              data={data?.data ?? []}
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {isSelectedDeleteQuestion && (
        <AlertDialogDeleteQuestion
          open={isDialogDeleteOpen}
          setOpen={setIsDialogDeleteOpen}
          confirmDelete={handleDeleteQuestion}
          isPending={isPending}
        />
      )}
    </section>
  );
}
