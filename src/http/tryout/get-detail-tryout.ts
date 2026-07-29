import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Tryout } from "@/types/tryout/tryout";

interface GetDetailTryoutResponse {
  data: Tryout;
}

export const GetDetailTryoutHandler = async (
  id: string,
  token: string,
): Promise<GetDetailTryoutResponse> => {
  const { data } = await api.get<GetDetailTryoutResponse>(
    `/admin/tryouts/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetDetailTryout = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailTryoutResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-tryouts", id],
    queryFn: () => GetDetailTryoutHandler(id, token),
    enabled: !!token && !!id,
    ...options,
  });
};
