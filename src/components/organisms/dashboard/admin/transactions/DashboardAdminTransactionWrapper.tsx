"use client";

import { useState } from "react";
import { transactionColumns } from "@/components/atoms/datacolumn/DataTransaction";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  getControlledAdminRows,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetAllTransactionsForExportHandler, useGetAllTransaction } from "@/http/transactions/get-all-transactions";
import { Transaction } from "@/types/transactions/transaction";
import { formatPrice } from "@/utils/format-price";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];
const transactionStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  waiting_approval: "Menunggu Persetujuan",
  waiting_aproval: "Menunggu Persetujuan",
  paid: "Dibayar",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
  failed: "Gagal",
};
const transactionExportColumns: AdminExportColumn<Transaction>[] = [
  { header: "Kode Order", accessor: (row) => row.order_code },
  { header: "Pengguna", accessor: (row) => row.user?.name || "-" },
  { header: "Email", accessor: (row) => row.user?.email || "-" },
  { header: "Status", accessor: (row) => transactionStatusLabels[row.status] ?? row.status },
  { header: "Total", accessor: (row) => row.grand_total, format: (value) => formatPrice(Number(value || 0)) },
  { header: "Tanggal Order", accessor: (row) => new Date(row.created_at).toLocaleString("id-ID") },
  { header: "Tanggal Bayar", accessor: (row) => (row.paid_at ? new Date(row.paid_at).toLocaleString("id-ID") : "-") },
  { header: "Disetujui Oleh", accessor: (row) => row.approved_by?.name ?? "-" },
];
const transactionSortOptions: AdminSortOption<Transaction>[] = [
  { key: "newest", label: "Order terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "oldest", label: "Order terlama", compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
  { key: "total-high", label: "Total tertinggi", compare: (a, b) => Number(b.grand_total || 0) - Number(a.grand_total || 0) },
  { key: "total-low", label: "Total terendah", compare: (a, b) => Number(a.grand_total || 0) - Number(b.grand_total || 0) },
  { key: "user-az", label: "Pengguna A-Z", compare: (a, b) => (a.user?.name || "").localeCompare(b.user?.name || "", "id-ID") },
];

export default function DashboardAdminTransactionWrapper() {
  const { data: session, status } = useSession();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isPending } = useGetAllTransaction({
    token: session?.access_token as string,
    page,
    perPage,
    search,
    options: { enabled: status === "authenticated" },
  });
  const transactionRows = data?.data ?? [];
  const transactionFilters: AdminFilterOption<Transaction>[] = [
    {
      key: "status",
      label: "Semua Status",
      placeholder: "Status",
      options: Object.entries(transactionStatusLabels).map(([value, label]) => ({ value, label })),
      getValue: (row) => row.status,
    },
  ];
  const controls = useAdminTableControls({
    data: transactionRows,
    searchFields: [(row) => row.order_code, (row) => row.user?.name, (row) => row.user?.email],
    filters: transactionFilters,
    sortOptions: transactionSortOptions,
    defaultSort: "newest",
  });
  const getExportRows = async () => {
    const rows = await GetAllTransactionsForExportHandler(session?.access_token as string, search);

    return getControlledAdminRows({
      data: rows,
      search: controls.search,
      filterValues: controls.filterValues,
      sortKey: controls.sortKey,
      searchFields: [(row) => row.order_code, (row) => row.user?.name, (row) => row.user?.email],
      filters: transactionFilters,
      sortOptions: transactionSortOptions,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <section>
      <Card>
        <CardContent>
          <div className="space-y-6">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Input
                placeholder="Cari berdasarkan nama pengguna..."
                className="max-w-xs w-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" variant="outline">Cari</Button>
            </form>
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Filter halaman ini..."
              filters={transactionFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={transactionSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportRows={getExportRows}
              exportColumns={transactionExportColumns}
              exportTitle="laporan-transaksi"
              filterSummary={`Search server: ${search || "-"}; filter toolbar diterapkan ke semua data`}
            />

            <DataTable
              columns={transactionColumns}
              data={controls.rows}
              isLoading={isPending}
              disablePagination={true}
            />

            {/* Pagination */}
            {data && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>
                    {data.total > 0
                      ? `Menampilkan ${(page - 1) * perPage + 1}–${Math.min(page * perPage, data.total)} dari ${data.total} transaksi`
                      : "Tidak ada transaksi"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">Tampilkan</span>
                    <Select
                      value={String(perPage)}
                      onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}
                    >
                      <SelectTrigger className="h-7 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs">per halaman</span>
                  </div>
                </div>
                {data.last_page > 1 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-20 text-center">
                      {data.current_page} / {data.last_page}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.last_page, p + 1))} disabled={page === data.last_page}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
