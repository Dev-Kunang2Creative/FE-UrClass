import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Package } from "@/types/packages/package";

interface GetDetailPackageResponse {
  data: Package;
}

export const GetDetailPackageHandler = async (
  id: string,
  token: string,
): Promise<GetDetailPackageResponse> => {
  const { data } = await api.get<GetDetailPackageResponse>(`/packages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useGetDetailPackage = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailPackageResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-package", id],
    queryFn: () => GetDetailPackageHandler(id, token),
    enabled: !!token && !!id,
    ...options,
  });
};
