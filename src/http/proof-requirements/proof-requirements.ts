import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

/** Ikon yang dikenali; sejajar dengan ProofRequirement::ICONS di backend. */
export const PROOF_ICONS = [
  "instagram",
  "whatsapp",
  "tiktok",
  "youtube",
  "share",
  "users",
  "camera",
  "link",
] as const;

export type ProofIcon = (typeof PROOF_ICONS)[number];

export interface ProofRequirement {
  id: string;
  title: string;
  instruction: string | null;
  link_url: string | null;
  link_label: string | null;
  icon: ProofIcon | null;
  order_no: number;
  is_active: boolean;
}

interface ListResponse {
  data: ProofRequirement[];
}

export interface ProofRequirementPayload {
  title: string;
  instruction?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  icon?: ProofIcon | null;
  order_no?: number | null;
  is_active?: boolean;
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

/**
 * Syarat bukti yang dibaca peserta saat mendaftar tryout gratis.
 *
 * Daftar ini juga menentukan berapa bukti yang diminta server dan apa judul tiap
 * slotnya, jadi halaman pendaftaran tidak boleh menyebut jumlah atau instruksi
 * lain selain yang ada di sini.
 */
export const useGetProofRequirements = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<ListResponse, AxiosError>>;
}) =>
  useQuery({
    queryKey: ["proof-requirements"],
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get<ListResponse>("/proof-requirements", auth(token));
      return data;
    },
    ...options,
  });

/** Daftar lengkap termasuk yang nonaktif, untuk panel admin. */
export const useGetAdminProofRequirements = ({ token }: { token: string }) =>
  useQuery({
    queryKey: ["admin-proof-requirements"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<ListResponse>(
        "/admin/proof-requirements",
        auth(token),
      );
      return data;
    },
  });

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["admin-proof-requirements"] });
  // Peserta membaca endpoint yang berbeda.
  queryClient.invalidateQueries({ queryKey: ["proof-requirements"] });
};

export const useSaveProofRequirement = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: ProofRequirement },
    AxiosError<{ message?: string }>,
    { id?: string; body: ProofRequirementPayload }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = id
        ? await api.put(`/admin/proof-requirements/${id}`, body, auth(token))
        : await api.post("/admin/proof-requirements", body, auth(token));
      return data;
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useDeleteProofRequirement = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/admin/proof-requirements/${id}`, auth(token));
      return data;
    },
    onSuccess: () => invalidate(queryClient),
  });
};

/**
 * Urutan dikirim sekaligus sebagai daftar id.
 *
 * Menggeser satu syarat selalu mengubah posisi yang lain, jadi mengirimnya
 * satu-satu melewati keadaan di mana dua baris punya urutan sama - dan peserta
 * yang memuat halaman tepat saat itu melihat urutan yang salah.
 */
export const useReorderProofRequirements = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: ProofRequirement[] },
    AxiosError<{ message?: string }>,
    string[]
  >({
    mutationFn: async (ids) => {
      const { data } = await api.put(
        "/admin/proof-requirements/reorder",
        { ids },
        auth(token),
      );
      return data;
    },
    onSuccess: () => invalidate(queryClient),
  });
};
