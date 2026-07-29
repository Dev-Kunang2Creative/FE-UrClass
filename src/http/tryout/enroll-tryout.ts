import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface EnrollResponse {
  message: string;
  ticket_balance_remaining?: number;
  participants_count?: number;
}

export const EnrollTryoutHandler = async (
  tryoutId: string,
  token: string,
  proofImages?: File[]
): Promise<EnrollResponse> => {
  if (proofImages?.length) {
    const formData = new FormData();
    proofImages.forEach((proofImage) => {
      formData.append("proof_images[]", proofImage);
    });

    const { data } = await api.post<EnrollResponse>(
      `/tryouts/${tryoutId}/enroll`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  }

  const { data } = await api.post<EnrollResponse>(
    `/tryouts/${tryoutId}/enroll`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useEnrollTryout = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<EnrollResponse, AxiosError, { tryoutId: string; proofImages?: File[] }>>;
}) => {
  return useMutation({
    mutationFn: ({ tryoutId, proofImages }: { tryoutId: string; proofImages?: File[] }) =>
      EnrollTryoutHandler(tryoutId, token, proofImages),
    ...options,
  });
};
