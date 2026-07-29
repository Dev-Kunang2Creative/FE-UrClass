import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { OrderBE } from "@/types/package/package";

export interface TransactionData {
  id: string;
  orderId: string;
  packageId: string | null;
  orderDate: string;
  packageName: string;
  amount: number;
  status: "success" | "pending" | "failed";
}

function mapBEStatusToFE(status: string): "success" | "pending" | "failed" {
  if (status === "paid") return "success";
  if (status === "pending" || status === "waiting_approval") return "pending";
  return "failed"; // cancelled, rejected
}

function mapOrderBEtoFE(order: OrderBE): TransactionData {
  return {
    id: order.order_code,
    orderId: order.id,
    packageId: order.items?.[0]?.package_id ?? null,
    orderDate: order.created_at,
    packageName: order.items?.[0]?.package_name_snapshot || "Paket",
    amount: order.grand_total,
    status: mapBEStatusToFE(order.status),
  };
}

export interface GetHistoryPembelianResponse {
  data: TransactionData[];
}

export const GetHistoryPembelianHandler = async (token: string): Promise<GetHistoryPembelianResponse> => {
  const { data } = await api.get<{ data: OrderBE[] }>("/my-orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data: data.data.map(mapOrderBEtoFE) };
};

export const useGetHistoryPembelian = ({ token, options }: { token: string; options?: Partial<UseQueryOptions<GetHistoryPembelianResponse, AxiosError>> }) => {
  return useQuery({
    queryKey: ["get-history-pembelian"],
    queryFn: () => GetHistoryPembelianHandler(token),
    enabled: !!token,
    ...options,
  });
};
