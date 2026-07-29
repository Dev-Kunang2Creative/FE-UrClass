"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Ticket, ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetTicketLogs } from "@/http/tiket/get-ticket-logs";
import type { TicketLog } from "@/http/tiket/get-ticket-logs";
import { formatJakartaDateTime } from "@/utils/date-time";
import SmartPagination from "@/components/molecules/pagination/SmartPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_FILTERS = ["Semua", "Masuk", "Keluar"];
const SOURCE_LABELS: Record<string, string> = {
  paket: "Pembelian Paket",
  kelas: "Pembelian Kelas",
  redeem: "Redeem Kode",
  tryout: "Digunakan Try Out",
};
const PER_PAGE_OPTIONS = [5, 9, 15];

export default function RiwayatTiketPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const realBalance = session?.user?.ticket_balance ?? 0;

  const { data, isLoading } = useGetTicketLogs({ token });
  const logs = useMemo(() => data?.data || [], [data?.data]);

  const filtered = useMemo(() => {
    return logs
      .filter((log: TicketLog) => {
        const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          SOURCE_LABELS[log.source]?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
          typeFilter === "Semua" ||
          (typeFilter === "Masuk" && log.type === "credit") ||
          (typeFilter === "Keluar" && log.type === "debit");
        return matchesSearch && matchesType;
      })
      .sort((a: TicketLog, b: TicketLog) => {
        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [logs, searchQuery, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/dashboard"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Riwayat Tiket</h1>
      </div>

      {/* Summary card */}
      {!isLoading && logs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Masuk</p>
            <p className="text-2xl font-bold text-green-600">
              +{logs.filter((l: TicketLog) => l.type === "credit").reduce((a: number, l: TicketLog) => a + l.amount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Digunakan</p>
            <p className="text-2xl font-bold text-red-500">
              -{logs.filter((l: TicketLog) => l.type === "debit").reduce((a: number, l: TicketLog) => a + l.amount, 0)}
            </p>
          </div>
          <div className="bg-[#EBF4FF] rounded-2xl border border-[#004AAB]/20 p-5 text-center shadow-sm">
            <p className="text-sm text-[#004AAB] mb-1">Saldo Tiket</p>
            <p className="text-2xl font-bold text-[#004AAB]">{realBalance}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari riwayat tiket..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAB]/20 focus:border-[#004AAB] transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => { setTypeFilter(filter); resetPage(); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === filter
                  ? "bg-[#004AAB] text-white"
                  : "bg-[#EAEFF4] text-[#5A6A80] hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); resetPage(); }}>
          <SelectTrigger className="h-10 w-full bg-white sm:w-52">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
        {isLoading ? (
          <div className="flex justify-center p-10 text-slate-500">Memuat riwayat tiket...</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-4">
            <Ticket className="w-12 h-12 text-slate-300" />
            <p>Belum ada riwayat tiket.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-4">
            <Ticket className="w-12 h-12 text-slate-300" />
            <p>Tidak ada riwayat yang cocok.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginated.map((log: TicketLog) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${log.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                    {log.type === "credit"
                      ? <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      : <ArrowUpCircle className="w-5 h-5 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{log.description}</p>
                    <p className="text-sm text-slate-400">{SOURCE_LABELS[log.source] ?? log.source} · {formatJakartaDateTime(log.created_at)}</p>
                  </div>
                </div>
                <span className={`font-bold text-lg ${log.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                  {log.type === "credit" ? "+" : "-"}{log.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Riwayat hanya mencakup transaksi setelah sistem log diaktifkan.
      </p>

      {filtered.length > 0 && (
        <SmartPagination
          page={safeCurrentPage}
          totalItems={filtered.length}
          perPage={itemsPerPage}
          perPageOptions={PER_PAGE_OPTIONS}
          itemLabel="riwayat"
          onPageChange={setCurrentPage}
          onPerPageChange={(v) => { setItemsPerPage(v); resetPage(); }}
        />
      )}
    </div>
  );
}
