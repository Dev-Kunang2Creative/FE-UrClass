import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  module: string;
  action: string;
  description: string;
  subject_type: string | null;
  subject_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogPaginated {
  data: AuditLogEntry[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface GetAuditLogsParams {
  token: string;
  page?: number;
  module?: string;
  action?: string;
  search?: string;
  date?: string;
}

export const GetAuditLogsHandler = async ({
  token,
  page = 1,
  module,
  action,
  search,
  date,
}: GetAuditLogsParams): Promise<AuditLogPaginated> => {
  const params: Record<string, string | number> = { page };
  if (module) params.module = module;
  if (action) params.action = action;
  if (search) params.search = search;
  if (date) params.date = date;

  const { data } = await api.get<AuditLogPaginated>("/admin/audit-logs", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const GetAuditLogsForExportHandler = async ({
  token,
  module,
  action,
  search,
  date,
}: Omit<GetAuditLogsParams, "page">): Promise<AuditLogEntry[]> => {
  const firstPage = await GetAuditLogsHandler({
    token,
    page: 1,
    module,
    action,
    search,
    date,
  });
  const rows = [...firstPage.data];

  for (let page = 2; page <= firstPage.last_page; page += 1) {
    const nextPage = await GetAuditLogsHandler({
      token,
      page,
      module,
      action,
      search,
      date,
    });
    rows.push(...nextPage.data);
  }

  return rows;
};

export const useGetAuditLogs = ({
  token,
  page,
  module,
  action,
  search,
  date,
  options,
}: GetAuditLogsParams & {
  options?: Partial<UseQueryOptions<AuditLogPaginated, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-audit-logs", page, module, action, search, date],
    queryFn: () => GetAuditLogsHandler({ token, page, module, action, search, date }),
    enabled: !!token,
    ...options,
  });
};
