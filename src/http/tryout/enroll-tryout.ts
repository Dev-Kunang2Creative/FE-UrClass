import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface EnrollResponse {
  message: string;
  ticket_balance_remaining?: number;
  participants_count?: number;
}

/**
 * Bukti dikirim per syarat, dikunci pada id syaratnya.
 *
 * Bentuk sebelumnya mengirim proof_images[] - tumpukan gambar tanpa keterangan -
 * sehingga saat ditinjau tidak ada cara tahu tangkapan layar mana yang menjawab
 * syarat mana. Begitu syaratnya lebih dari satu macam (follow, tag, bagikan),
 * itu justru pertanyaan pertama admin.
 */
export type ProofFiles = Record<string, File>;

export const EnrollTryoutHandler = async (
  tryoutId: string,
  token: string,
  proofs?: ProofFiles,
): Promise<EnrollResponse> => {
  const entries = Object.entries(proofs ?? {});

  if (entries.length > 0) {
    const formData = new FormData();
    entries.forEach(([requirementId, file]) => {
      formData.append(`proofs[${requirementId}]`, file);
    });

    const { data } = await api.post<EnrollResponse>(
      `/tryouts/${tryoutId}/enroll`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  }

  const { data } = await api.post<EnrollResponse>(
    `/tryouts/${tryoutId}/enroll`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data;
};

export const useEnrollTryout = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<
    UseMutationOptions<
      EnrollResponse,
      AxiosError,
      { tryoutId: string; proofs?: ProofFiles }
    >
  >;
}) => {
  return useMutation({
    mutationFn: ({ tryoutId, proofs }: { tryoutId: string; proofs?: ProofFiles }) =>
      EnrollTryoutHandler(tryoutId, token, proofs),
    ...options,
  });
};
