import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface BulkImportPayload {
  subtestId: string;
  file: File;
  token: string;
}

export interface BulkImportResponse {
  message: string;
  imported: number;
  skipped: number;
  errors: string[];
}

export const BulkImportQuestionsHandler = async ({
  subtestId,
  file,
  token,
}: BulkImportPayload): Promise<BulkImportResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<BulkImportResponse>(
    `/admin/subtests/${subtestId}/questions/bulk-import`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

export const useBulkImportQuestions = (
  options?: UseMutationOptions<
    BulkImportResponse,
    AxiosError<{ message: string }>,
    BulkImportPayload
  >
) => {
  return useMutation({
    mutationFn: BulkImportQuestionsHandler,
    ...options,
  });
};
