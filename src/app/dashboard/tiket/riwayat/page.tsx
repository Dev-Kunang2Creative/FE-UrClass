"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Ticket,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetTicketLogs } from "@/http/tiket/get-ticket-logs";
import type { TicketLog } from "@/http/tiket/get-ticket-logs";
import { formatJakartaDateTime } from "@/utils/date-time";
import SmartPagination from "@/components/molecules/pagination/SmartPagination";
import Mascot from "@/components/atoms/mascot/Mascot";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const realBalance = session?.user?.ticket_balance ?? 0;

  const { data, isLoading } = useGetTicketLogs({ token });
  const logs = useMemo(() => data?.data || [], [data?.data]);

  const filtered = useMemo(() => {
    return logs
      .filter((log: TicketLog) => {
        const matchesSearch =
          log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          SOURCE_LABELS[log.source]?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
          typeFilter === "Semua" ||
          (typeFilter === "Masuk" && log.type === "credit") ||
          (typeFilter === "Keluar" && log.type === "debit");
        return matchesSearch && matchesType;
      })
      // Newest first, always. A ledger is read from the most recent entry
      // down, and the control offering the other direction was the only thing
      // on the page that needed explaining.
      .sort(
        (a: TicketLog, b: TicketLog) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [logs, searchQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const resetPage = () => setCurrentPage(1);

  const totalMasuk = logs
    .filter((l: TicketLog) => l.type === "credit")
    .reduce((a: number, l: TicketLog) => a + l.amount, 0);

  const totalKeluar = logs
    .filter((l: TicketLog) => l.type === "debit")
    .reduce((a: number, l: TicketLog) => a + l.amount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Riwayat Tiket
            </h1>
          </div>
          <p className="text-slate-600 text-sm pl-9">
            Pantau mutasi saldo, pemakaian, dan perolehan tiket belajarmu.
          </p>
        </div>

        <Mascot
          pose="laptop"
          decorative
          sizes="100px"
          className="hidden sm:block h-16 w-auto shrink-0 md:h-20"
        />
      </div>

      {/* Summary Cards */}
      {!isLoading && logs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a] hover:shadow-[7px_7px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900 bg-emerald-100 text-emerald-700 shadow-[2px_2px_0px_0px_#0f172a]">
              <ArrowDownCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Masuk
              </p>
              <p className="text-2xl font-black text-emerald-600">
                +{totalMasuk}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a] hover:shadow-[7px_7px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900 bg-rose-100 text-rose-700 shadow-[2px_2px_0px_0px_#0f172a]">
              <ArrowUpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Digunakan
              </p>
              <p className="text-2xl font-black text-rose-600">
                -{totalKeluar}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a] hover:shadow-[7px_7px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900 bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#0f172a]">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Saldo Tiket
              </p>
              <p className="text-2xl font-black text-primary">
                {realBalance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari riwayat tiket..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 focus:ring-0 transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setTypeFilter(filter);
                resetPage();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:translate-y-0.5 ${
                typeFilter === filter
                  ? "border-2 border-slate-900 bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#0f172a]"
                  : "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List Container */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] p-5 sm:p-7">
        {isLoading ? (
          <div className="flex justify-center p-12 text-slate-500 font-medium animate-pulse">
            Memuat riwayat tiket...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-4">
            <Mascot
              pose="berfikir"
              decorative
              sizes="112px"
              className="h-28 w-auto"
            />
            <p className="font-semibold text-slate-600">
              Belum ada riwayat tiket.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-4">
            <Mascot
              pose="berfikir"
              decorative
              sizes="112px"
              className="h-28 w-auto"
            />
            <p className="font-semibold text-slate-600">
              Tidak ada riwayat yang cocok.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginated.map((log: TicketLog) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 sm:p-4 border-2 border-slate-100 bg-slate-50/70 rounded-2xl hover:bg-slate-100/90 hover:border-slate-200 transition-all gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      log.type === "credit"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                        : "bg-rose-100 text-rose-700 border-rose-300"
                    }`}
                  >
                    {log.type === "credit" ? (
                      <ArrowDownCircle className="w-5 h-5" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                      {log.description}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      <span className="font-bold text-slate-700">
                        {SOURCE_LABELS[log.source] ?? log.source}
                      </span>{" "}
                      · {formatJakartaDateTime(log.created_at)}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 font-black text-sm sm:text-base px-3 py-1 rounded-xl border ${
                    log.type === "credit"
                      ? "text-emerald-700 bg-emerald-100/80 border-emerald-300"
                      : "text-rose-700 bg-rose-100/80 border-rose-300"
                  }`}
                >
                  {log.type === "credit" ? "+" : "-"}
                  {log.amount} Tiket
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center font-medium">
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
          onPerPageChange={(v) => {
            setItemsPerPage(v);
            resetPage();
          }}
        />
      )}
    </div>
  );
}
