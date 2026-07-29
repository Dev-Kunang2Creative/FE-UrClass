import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export const ExportTryoutPdfHandler = async (
  tryoutId: string,
  token: string,
): Promise<Blob> => {
  const { data } = await api.get<Blob>(
    `/admin/tryouts/${tryoutId}/export-pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
      timeout: 60000, // 60 seconds (PDF generation can be slow)
    },
  );
  return data;
};

export const useExportTryoutPdf = (
  options?: UseMutationOptions<
    Blob,
    AxiosError,
    { tryoutId: string; token: string }
  >,
) => {
  return useMutation({
    mutationFn: ({ tryoutId, token }) =>
      ExportTryoutPdfHandler(tryoutId, token),
    ...options,
  });
};
