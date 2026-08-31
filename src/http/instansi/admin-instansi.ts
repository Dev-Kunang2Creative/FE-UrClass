import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface AdminInstansi {
  id: string;
  kode: string | null;
  nama: string;
  tingkat: "pusat" | "daerah";
  is_active: boolean;
  formasi_count: number;
}

export interface AdminFormasi {
  id: string;
  instansi_id: string;
  nama: string;
  jenjang: string | null;
  is_active: boolean;
}

interface Paginated<T> {
  data: T[];
  total: number;
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

/**
 * Instansi untuk panel admin, termasuk yang nonaktif.
 *
 * Seeder CSV mengisi borongan dari rekap resmi, tapi rekap formasi tidak
 * tersedia dalam bentuk yang bisa diunduh - jadi tanpa layar admin ini formasi
 * hanya bisa masuk lewat seeder di server.
 */
export const useAdminInstansi = ({
  token,
  search,
}: {
  token: string;
  search: string;
}) =>
  useQuery({
    queryKey: ["admin-instansi", search],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<Paginated<AdminInstansi>>("/admin/instansi", {
        ...auth(token),
        params: { search: search || undefined, per_page: 50 },
      });
      return data;
    },
  });

/** Formasi satu instansi. Hanya diambil ketika barisnya dibuka. */
export const useAdminFormasi = ({
  token,
  instansiId,
}: {
  token: string;
  instansiId: string | null;
}) =>
  useQuery({
    queryKey: ["admin-formasi", instansiId],
    enabled: !!token && !!instansiId,
    queryFn: async () => {
      const { data } = await api.get<{ data: AdminFormasi[] }>(
        `/admin/instansi/${instansiId}/formasi`,
        auth(token),
      );
      return data.data;
    },
  });

export const useCreateFormasi = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: AdminFormasi },
    AxiosError<{ message?: string }>,
    { instansiId: string; nama: string; jenjang?: string }
  >({
    mutationFn: async ({ instansiId, nama, jenjang }) => {
      const { data } = await api.post(
        `/admin/instansi/${instansiId}/formasi`,
        { nama, jenjang: jenjang || null },
        auth(token),
      );
      return data;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-formasi", variables.instansiId] });
      queryClient.invalidateQueries({ queryKey: ["admin-instansi"] });
      // Picker peserta membaca endpoint yang berbeda.
      queryClient.invalidateQueries({ queryKey: ["formasi"] });
    },
  });
};

export const useDeleteFormasi = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<{ message?: string }>,
    { instansiId: string; formasiId: string }
  >({
    mutationFn: async ({ instansiId, formasiId }) => {
      const { data } = await api.delete(
        `/admin/instansi/${instansiId}/formasi/${formasiId}`,
        auth(token),
      );
      return data;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-formasi", variables.instansiId] });
      queryClient.invalidateQueries({ queryKey: ["admin-instansi"] });
      queryClient.invalidateQueries({ queryKey: ["formasi"] });
    },
  });
};
