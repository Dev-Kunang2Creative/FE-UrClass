import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { PackageBE } from "@/types/package/package";

export interface PackageData {
  id: string;
  title: string;
  thumbnail: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  description: string;
  ticketAmount?: number;
}

function mapBEtoFE(pkg: PackageBE): PackageData {
  const discountPercent =
    pkg.discount_price != null && pkg.discount_price < pkg.price
      ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100)
      : null;

  return {
    id: pkg.id,
    title: pkg.name,
    thumbnail: pkg.thumbnail ?? null,
    price: pkg.discount_price ?? pkg.price,
    originalPrice: pkg.discount_price != null ? pkg.price : null,
    discountPercent,
    description: pkg.description || "",
    ticketAmount: pkg.ticket_amount,
  };
}

export interface GetAllPackagesResponse {
  data: PackageData[];
}

export const GetAllPackagesHandler = async (
  token: string,
): Promise<GetAllPackagesResponse> => {
  const { data } = await api.get<{ data: PackageBE[] }>("/packages", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data: data.data.map(mapBEtoFE) };
};

export const useGetAllPackages = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetAllPackagesResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-packages"],
    queryFn: () => GetAllPackagesHandler(token),
    ...options,
  });
};
