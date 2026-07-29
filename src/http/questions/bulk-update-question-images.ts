import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface BulkUpdateImagesPayload {
  subtestId: string;
  file: File;
  token: string;
}

export interface BulkUpdateImagesResponse {
  message: string;
  updated: number;
  skipped: number;
  errors: string[];
}

export const BulkUpdateQuestionImagesHandler = async ({
  subtestId,
  file,
  token,
}: BulkUpdateImagesPayload): Promise<BulkUpdateImagesResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<BulkUpdateImagesResponse>(
    `/admin/subtests/${subtestId}/questions/bulk-update-images`,
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

export const useBulkUpdateQuestionImages = (
  options?: UseMutationOptions<
    BulkUpdateImagesResponse,
    AxiosError<{ message: string }>,
    BulkUpdateImagesPayload
  >
) => {
  return useMutation({
    mutationFn: BulkUpdateQuestionImagesHandler,
    ...options,
  });
};
