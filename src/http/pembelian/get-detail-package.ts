import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { PackageData } from "./get-all-packages";
import type { PackageBE } from "@/types/package/package";

export interface GetDetailPackageResponse {
  data: PackageData;
}

function mapBEtoFE(pkg: PackageBE): PackageData {
  const discountPercent =
    pkg.discount_price != null && pkg.discount_price < pkg.price
      ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100)
      : null;

  return {
    id: pkg.id,
    title: pkg.name,
    price: pkg.discount_price ?? pkg.price,
    originalPrice: pkg.discount_price != null ? pkg.price : null,
    discountPercent,
    description: pkg.description || "",
    ticketAmount: pkg.ticket_amount,
    thumbnail: pkg.thumbnail,
  };
}

export const GetDetailPackageHandler = async (
  id: string,
  token: string,
): Promise<GetDetailPackageResponse> => {
  const { data } = await api.get<{ data: PackageBE }>(`/packages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data: mapBEtoFE(data.data) };
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
    enabled: !!id,
    ...options,
  });
};
