import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { ErrorResponse } from "@/types/metadata/metadata";
import type {
  DummyParticipantMutationResponse,
  DummyParticipantSummary,
  DummyParticipantTryoutPayload,
  InjectDummyExcelPayload,
  InjectDummyRandomPayload,
} from "@/types/tryout/dummy-participant";

export const dummyParticipantKeys = {
  summary: (id: string) => ["tryout-dummy-summary", id] as const,
};

export const useInjectDummyRandom = () =>
  useMutation<
    DummyParticipantMutationResponse,
    AxiosError<ErrorResponse>,
    InjectDummyRandomPayload
  >({
    mutationFn: async ({ id, token, count, scorePreset }) => {
      const { data } = await api.post(
        `/admin/tryouts/${id}/inject-dummy-random`,
        { count, score_preset: scorePreset },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return data;
    },
  });

export const useInjectDummyExcel = () =>
  useMutation<
    DummyParticipantMutationResponse,
    AxiosError<ErrorResponse>,
    InjectDummyExcelPayload
  >({
    mutationFn: async ({ id, token, file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post(
        `/admin/tryouts/${id}/inject-dummy-excel`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return data;
    },
  });

export const useClearDummyParticipants = () =>
  useMutation<
    DummyParticipantMutationResponse,
    AxiosError<ErrorResponse>,
    DummyParticipantTryoutPayload
  >({
    mutationFn: async ({ id, token }) => {
      const { data } = await api.delete(`/admin/tryouts/${id}/clear-dummy`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data;
    },
  });

export const useGetDummySummary = (
  id: string,
  token: string,
  options?: Pick<
    UseQueryOptions<DummyParticipantSummary, AxiosError<ErrorResponse>>,
    "enabled"
  >,
) =>
  useQuery({
    queryKey: dummyParticipantKeys.summary(id),
    queryFn: async () => {
      const { data } = await api.get<DummyParticipantSummary>(
        `/admin/tryouts/${id}/dummy-summary`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return data;
    },
    ...options,
  });

export const downloadDummyExcelTemplate = async (token: string) => {
  const response = await api.get("/admin/tryouts/dummy-excel-template", {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "template-peserta-dummy.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
