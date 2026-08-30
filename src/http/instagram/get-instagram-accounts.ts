import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface InstagramAccount {
  id: string;
  username: string;
  label: string | null;
  order_no: number;
  is_active: boolean;
  profile_url: string;
}

interface ListResponse {
  data: InstagramAccount[];
}

export interface InstagramAccountPayload {
  username: string;
  label?: string | null;
  order_no?: number;
  is_active?: boolean;
}

/**
 * Akun yang wajib di-follow, dibaca peserta saat mendaftar tryout gratis.
 *
 * Jumlah akun di sini juga menentukan berapa bukti yang diminta server, jadi
 * halaman pendaftaran tidak boleh menyebut angka lain selain panjang daftar ini.
 */
export const useGetInstagramAccounts = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<ListResponse, AxiosError>>;
}) =>
  useQuery({
    queryKey: ["instagram-accounts"],
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get<ListResponse>("/instagram-accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    ...options,
  });

/** Daftar lengkap termasuk yang nonaktif, untuk panel admin. */
export const useGetAdminInstagramAccounts = ({ token }: { token: string }) =>
  useQuery({
    queryKey: ["admin-instagram-accounts"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<ListResponse>("/admin/instagram-accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

export const useSaveInstagramAccount = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    { data: InstagramAccount },
    AxiosError<{ message?: string }>,
    { id?: string; body: InstagramAccountPayload }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = id
        ? await api.put(`/admin/instagram-accounts/${id}`, body, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await api.post("/admin/instagram-accounts", body, {
            headers: { Authorization: `Bearer ${token}` },
          });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instagram-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-accounts"] });
    },
  });
};

export const useDeleteInstagramAccount = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/admin/instagram-accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instagram-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-accounts"] });
    },
  });
};
