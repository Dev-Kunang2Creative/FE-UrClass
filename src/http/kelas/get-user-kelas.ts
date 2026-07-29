import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Kelas } from "@/types/kelas/kelas";

interface GetUserKelasResponse {
  data: Kelas[];
}

export const GetUserKelasHandler = async (
  token: string
): Promise<GetUserKelasResponse> => {
  const { data } = await api.get<GetUserKelasResponse>("/kelas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useGetUserKelas = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetUserKelasResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-user-kelas"],
    queryFn: () => GetUserKelasHandler(token),
    enabled: !!token,
    ...options,
  });
};
