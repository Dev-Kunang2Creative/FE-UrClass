import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Tryout } from "@/types/tryout/tryout";

interface GetAllTryoutResponse {
  data: Tryout[];
}

export const GetAllTryoutHandler = async (
  token: string,
): Promise<GetAllTryoutResponse> => {
  const { data } = await api.get<GetAllTryoutResponse>("/admin/tryouts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useGetAllTryout = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetAllTryoutResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-tryouts"],
    queryFn: () => GetAllTryoutHandler(token),
    enabled: !!token,
    ...options,
  });
};
