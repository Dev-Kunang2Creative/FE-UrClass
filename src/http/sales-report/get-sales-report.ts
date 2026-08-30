import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface SalesReportRow {
  type: "tryout";
  product_name: string;
  year: number;
  month: number;
  period_start: string;
  total_item_sold: number;
  order_count: number;
  average_price: number;
  total_sales: number;
}

/**
 * Tidak ada lagi pecahan per jenis produk: fitur kelas sudah dihapus, sehingga
 * paket tiket tryout adalah satu-satunya yang dijual dan angka totalnya sudah
 * merupakan angka tryout.
 */
export interface SalesReportSummary {
  total_sales: number;
  total_item_sold: number;
  order_count: number;
  average_order_value: number;
}

export interface SalesReportResponse {
  data: SalesReportRow[];
  summary: SalesReportSummary;
}

export interface FeeTryoutReportRow {
  tryout_id: string;
  tryout_name: string;
  year: number;
  month: number;
  period_start: string;
  participant_count: number;
  access_count: number;
  total_fee: number;
}

export interface FeeTryoutReportSummary {
  fee_per_participant: number;
  total_fee: number;
  total_participants: number;
  tryout_count: number;
  average_fee_per_tryout: number;
}

export interface FeeTryoutReportResponse {
  data: FeeTryoutReportRow[];
  summary: FeeTryoutReportSummary;
}

interface GetSalesReportParams {
  token: string;
  year?: number;
  month?: number;
}

export const GetSalesReportHandler = async ({
  token,
  year,
  month,
}: GetSalesReportParams): Promise<SalesReportResponse> => {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;

  const { data } = await api.get<SalesReportResponse>("/admin/sales-report", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const useGetSalesReport = ({
  token,
  year,
  month,
  options,
}: GetSalesReportParams & {
  options?: Partial<UseQueryOptions<SalesReportResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-sales-report", year, month],
    queryFn: () => GetSalesReportHandler({ token, year, month }),
    enabled: !!token,
    ...options,
  });
};

export const GetFeeTryoutReportHandler = async ({
  token,
  year,
  month,
}: GetSalesReportParams): Promise<FeeTryoutReportResponse> => {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;

  const { data } = await api.get<FeeTryoutReportResponse>(
    "/admin/fee-to-report",
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    },
  );
  return data;
};

export const useGetFeeTryoutReport = ({
  token,
  year,
  month,
  options,
}: GetSalesReportParams & {
  options?: Partial<UseQueryOptions<FeeTryoutReportResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-fee-tryout-report", year, month],
    queryFn: () => GetFeeTryoutReportHandler({ token, year, month }),
    enabled: !!token,
    ...options,
  });
};
