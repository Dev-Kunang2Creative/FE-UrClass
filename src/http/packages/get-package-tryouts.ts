import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { Tryout } from "@/types/tryout/tryout";

interface GetPackageTryoutsResponse {
  data: Tryout[];
}

export const GetPackageTryoutsHandler = async (
  token: string,
  packageId: string
): Promise<GetPackageTryoutsResponse> => {
  const { data } = await api.get<GetPackageTryoutsResponse>(
    `/admin/packages/${packageId}/tryouts`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useGetPackageTryouts = ({
  token,
  packageId,
  options,
}: {
  token: string;
  packageId: string;
  options?: Partial<UseQueryOptions<GetPackageTryoutsResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-package-tryouts", packageId],
    queryFn: () => GetPackageTryoutsHandler(token, packageId),
    enabled: !!token && !!packageId,
    ...options,
  });
};
