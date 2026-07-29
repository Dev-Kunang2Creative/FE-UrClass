import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Kelas } from "@/types/kelas/kelas";

interface GetDetailKelasResponse {
  data: Kelas;
}

export const GetDetailKelasHandler = async (
  id: string,
  token: string
): Promise<GetDetailKelasResponse> => {
  const { data } = await api.get<GetDetailKelasResponse>(`/kelas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useGetDetailKelas = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailKelasResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-kelas", id],
    queryFn: () => GetDetailKelasHandler(id, token),
    enabled: !!token && !!id,
    ...options,
  });
};
