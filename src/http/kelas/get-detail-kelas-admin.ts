import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Kelas } from "@/types/kelas/kelas";

interface GetDetailKelasAdminResponse {
  data: Kelas;
}

export const GetDetailKelasAdminHandler = async (
  id: string,
  token: string
): Promise<GetDetailKelasAdminResponse> => {
  const { data } = await api.get<GetDetailKelasAdminResponse>(`/admin/kelas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useGetDetailKelasAdmin = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailKelasAdminResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-kelas-admin", id],
    queryFn: () => GetDetailKelasAdminHandler(id, token),
    enabled: !!token && !!id,
    retry: 1,
    ...options,
  });
};
