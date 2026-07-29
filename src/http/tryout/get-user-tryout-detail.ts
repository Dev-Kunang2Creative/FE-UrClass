import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { Tryout } from "@/types/tryout/tryout";

interface GetUserTryoutDetailResponse {
  data: Tryout;
}

export const GetUserTryoutDetailHandler = async (
  id: string,
  token: string,
): Promise<GetUserTryoutDetailResponse> => {
  const { data } = await api.get<{ data: Tryout[] }>("/tryouts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  const found = data.data.find((t) => t.id === id);
  
  if (!found) {
    throw new Error("Tryout not found");
  }

  return { data: found };
};

export const useGetUserTryoutDetail = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetUserTryoutDetailResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-user-tryout-detail", id],
    queryFn: () => GetUserTryoutDetailHandler(id, token),
    enabled: !!token && !!id,
    ...options,
  });
};
