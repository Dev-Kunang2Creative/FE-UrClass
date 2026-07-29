import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Package } from "@/types/packages/package";

interface GetAllPackageResponse {
  data: Package[];
}

export const GetAllPackageHandler = async (
  token: string,
): Promise<GetAllPackageResponse> => {
  const { data } = await api.get<GetAllPackageResponse>("/packages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useGetAllPackage = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetAllPackageResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-packages"],
    queryFn: () => GetAllPackageHandler(token),
    enabled: !!token,
    ...options,
  });
};
