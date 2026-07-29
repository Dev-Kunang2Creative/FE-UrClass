import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Question } from "@/types/questions/question";

interface DeleteQuestionPayload {
  id: string;
  subtestId: string;
  token: string;
}

interface DeleteQuestionResponse {
  data: Question;
}

export const DeleteQuestionHandler = async ({
  id,
  subtestId,
  token,
}: DeleteQuestionPayload): Promise<DeleteQuestionResponse> => {
  const { data } = await api.delete(
    `/admin/subtests/${subtestId}/questions/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useDeleteQuestion = (
  options?: UseMutationOptions<
    DeleteQuestionResponse,
    AxiosError<ErrorResponse>,
    DeleteQuestionPayload
  >,
) => {
  return useMutation({
    mutationFn: DeleteQuestionHandler,
    ...options,
  });
};
