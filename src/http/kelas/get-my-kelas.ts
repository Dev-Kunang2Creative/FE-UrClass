import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Kelas } from "@/types/kelas/kelas";

interface GetMyKelasResponse {
  data: Kelas[];
}

export const GetMyKelasHandler = async (
  token: string
): Promise<GetMyKelasResponse> => {
  const { data } = await api.get<GetMyKelasResponse>("/kelas/saya", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useGetMyKelas = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetMyKelasResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-my-kelas"],
    queryFn: () => GetMyKelasHandler(token),
    enabled: !!token,
    ...options,
  });
};
