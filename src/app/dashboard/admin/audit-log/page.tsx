"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  GetAuditLogsForExportHandler,
  useGetAuditLogs,
} from "@/http/audit/get-audit-logs";
import {
  exportAdminRowsToExcel,
  exportAdminRowsToPdf,
  type AdminExportColumn,
} from "@/components/molecules/datatable/AdminDataControls";
import type { AuditLogEntry } from "@/http/audit/get-audit-logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, X, Download } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import DashboardTitle from "@/components/atoms/typography/DashboardTitle";

const MODULE_COLORS: Record<string, string> = {
  Auth: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Tryout: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Subtest: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  Question: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Order: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Package: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  update: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  delete: "bg-red-500/10 text-red-600 border-red-500/20",
  login: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  logout: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  register: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  approve: "bg-green-500/10 text-green-600 border-green-500/20",
  reject: "bg-red-500/10 text-red-600 border-red-500/20",
  cancel: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  bulk_import: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const MODULES = ["Auth", "Tryout", "Subtest", "Question", "Order", "Package"];
const ACTIONS = [
  "login",
  "logout",
  "register",
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "cancel",
  "bulk_import",
];
const auditExportColumns: AdminExportColumn<AuditLogEntry>[] = [
  {
    header: "Waktu",
    accessor: (row) => new Date(row.created_at).toLocaleString("id-ID"),
  },
  { header: "Pengguna", accessor: (row) => row.user_name ?? "System" },
  { header: "Modul", accessor: (row) => row.module },
  { header: "Aksi", accessor: (row) => row.action },
  { header: "Deskripsi", accessor: (row) => row.description },
  { header: "IP Address", accessor: (row) => row.ip_address ?? "-" },
];

export default function AuditLogPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = Number(searchParams.get("page") || 1);
  const [page, setPage] = useState(urlPage);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [date, setDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Sync state when browser back/forward buttons are used
  useEffect(() => {
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [urlPage]);

  const updatePage = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data, isLoading } = useGetAuditLogs({
    token,
    page,
    search,
    module,
    action,
    date,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    updatePage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setModule("");
    setAction("");
    setDate("");
    updatePage(1);
  };

  const hasFilter = search || module || action || date;
  const exportRows = async () => {
    setIsExporting(true);
    try {
      return await GetAuditLogsForExportHandler({
        token,
        search,
        module,
        action,
        date,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="space-y-8 pb-8">
      <DashboardTitle title="Log Audit" />

      <Card className="border-0 shadow-sm ring-1 ring-border/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold tracking-tight">
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="Cari deskripsi atau pengguna..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="icon" variant="secondary">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Module */}
            <Select
              value={module || "all"}
              onValueChange={(v) => {
                setModule(v === "all" ? "" : v);
                updatePage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Modul</SelectItem>
                {MODULES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action */}
            <Select
              value={action || "all"}
              onValueChange={(v) => {
                setAction(v === "all" ? "" : v);
                updatePage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date */}
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                updatePage(1);
              }}
              className="w-40"
            />

            {hasFilter && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                title="Hapus filter"
                className="text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm ring-1 ring-border/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-wrap justify-end gap-3 border-b border-border/50 bg-muted/20 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={async () =>
                exportAdminRowsToExcel({
                  rows: await exportRows(),
                  columns: auditExportColumns,
                  title: "laporan-audit-log",
                })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Export Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={async () =>
                exportAdminRowsToPdf({
                  rows: await exportRows(),
                  columns: auditExportColumns,
                  title: "laporan-audit-log",
                  filterSummary: `Search: ${search || "-"}; Modul: ${module || "Semua"}; Aksi: ${action || "Semua"}; Tanggal: ${date || "Semua"}`,
                })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground/60 font-medium">
              Memuat log...
            </div>
          ) : !data?.data.length ? (
            <div className="p-12 text-center text-muted-foreground/60 font-medium">
              Tidak ada log ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-semibold tracking-tight w-40">
                      Waktu
                    </th>
                    <th className="px-5 py-4 font-semibold tracking-tight w-32">
                      Pengguna
                    </th>
                    <th className="px-5 py-4 font-semibold tracking-tight w-24">
                      Modul
                    </th>
                    <th className="px-5 py-4 font-semibold tracking-tight w-24">
                      Aksi
                    </th>
                    <th className="px-5 py-4 font-semibold tracking-tight">
                      Deskripsi
                    </th>
                    <th className="px-5 py-4 font-semibold tracking-tight w-28 text-right">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.data.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {format(
                          new Date(log.created_at),
                          "dd MMM yyyy HH:mm:ss",
                          { locale: idLocale },
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-foreground truncate max-w-32 block"
                          title={log.user_name ?? "-"}
                        >
                          {log.user_name ?? (
                            <span className="text-muted-foreground/60 italic font-medium">
                              System
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 border ${MODULE_COLORS[log.module] ?? "bg-slate-500/10 text-slate-600 border-slate-500/20"}`}
                          variant="outline"
                        >
                          {log.module}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 border ${ACTION_COLORS[log.action] ?? "bg-slate-500/10 text-slate-600 border-slate-500/20"}`}
                          variant="outline"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-foreground leading-relaxed">
                        {log.description}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground/70 font-mono text-right">
                        {log.ip_address ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.total > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-muted/10">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(data.current_page - 1) * data.per_page + 1} –{" "}
                {Math.min(data.current_page * data.per_page, data.total)} dari{" "}
                {data.total} data
              </p>
              {data.last_page > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => updatePage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="flex items-center px-2 text-sm text-muted-foreground">
                    Page {data.current_page} of {data.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() =>
                      updatePage(Math.min(data.last_page, page + 1))
                    }
                    disabled={page === data.last_page}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
