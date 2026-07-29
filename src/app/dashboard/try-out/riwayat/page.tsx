"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, BookOpen, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetHistoryTryout } from "@/http/tryout/get-history-tryout";
import { formatJakartaDateTime } from "@/utils/date-time";
import SmartPagination from "@/components/molecules/pagination/SmartPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_FILTERS = ["Semua", "Selesai", "Mengerjakan"];
const PER_PAGE_OPTIONS = [5, 9, 15];
const ALL_TRYOUTS_FILTER = "all";

export default function RiwayatTryoutPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [tryoutNameFilter, setTryoutNameFilter] = useState(ALL_TRYOUTS_FILTER);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const { data, isLoading } = useGetHistoryTryout({ token });
  const histories = useMemo(() => data?.data || [], [data?.data]);
  const tryoutNameOptions = useMemo(
    () => Array.from(new Set(histories.map((hist) => hist.tryoutName))).sort((a, b) => a.localeCompare(b, "id-ID")),
    [histories],
  );

  const filteredHistories = useMemo(() => {
    return histories
      .filter((hist) => {
        const matchesSearch = hist.tryoutName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTryoutName =
          tryoutNameFilter === ALL_TRYOUTS_FILTER || hist.tryoutName === tryoutNameFilter;
        const matchesStatus =
          statusFilter === "Semua" ||
          (statusFilter === "Selesai" && hist.status === "selesai") ||
          (statusFilter === "Mengerjakan" && hist.status === "sedang dikerjakan");

        return matchesSearch && matchesTryoutName && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = a.dateTaken ? new Date(a.dateTaken).getTime() : 0;
        const timeB = b.dateTaken ? new Date(b.dateTaken).getTime() : 0;

        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "score_high") return b.score - a.score;
        if (sortBy === "score_low") return a.score - b.score;
        if (sortBy === "attempt") return b.attemptNumber - a.attemptNumber;
        return timeB - timeA;
      });
  }, [histories, searchQuery, sortBy, statusFilter, tryoutNameFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistories.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedHistories = filteredHistories.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/dashboard/try-out"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Riwayat Try Out</h1>
      </div>

      <div className="space-y-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari riwayat tryout..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              resetPage();
            }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAB]/20 focus:border-[#004AAB] transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                resetPage();
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-[#004AAB] text-white"
                  : "bg-[#EAEFF4] text-[#5A6A80] hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={tryoutNameFilter}
            onValueChange={(value) => {
              setTryoutNameFilter(value);
              resetPage();
            }}
          >
            <SelectTrigger className="h-10 w-full bg-white sm:w-72">
              <SelectValue placeholder="Pilih nama Try Out" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TRYOUTS_FILTER}>Semua Try Out</SelectItem>
              {tryoutNameOptions.map((tryoutName) => (
                <SelectItem key={tryoutName} value={tryoutName}>
                  {tryoutName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              resetPage();
            }}
          >
            <SelectTrigger className="h-10 w-full bg-white sm:w-52">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru dikerjakan</SelectItem>
              <SelectItem value="oldest">Terlama dikerjakan</SelectItem>
              <SelectItem value="score_high">Skor tertinggi</SelectItem>
              <SelectItem value="score_low">Skor terendah</SelectItem>
              <SelectItem value="attempt">Attempt terbesar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
        {isLoading ? (
          <div className="flex justify-center p-10 text-slate-500">Memuat riwayat...</div>
        ) : histories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-4">
            <BookOpen className="w-12 h-12 text-slate-300" />
            <p>Belum ada riwayat Try Out yang pernah dikerjakan.</p>
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-4">
            <BookOpen className="w-12 h-12 text-slate-300" />
            <p>Tidak ada riwayat yang cocok.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paginatedHistories.map((hist) => (
              <div key={hist.historyId} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-slate-100 bg-slate-50 rounded-xl gap-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-800 text-lg">{hist.tryoutName}</span>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>Attempt {hist.attemptNumber}</span>
                    <span>Dikerjakan: {formatJakartaDateTime(hist.dateTaken)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-slate-500">Skor:</span>
                    <span className="font-bold text-[#004AAB] text-xl">{hist.score}</span>
                  </div>
                  {hist.status === "selesai" ? (
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Selesai</span>
                      <Link 
                        href={`/dashboard/try-out/${hist.id}/result?attempt=${hist.attemptNumber}`}
                        className="mt-1 text-sm font-semibold text-white bg-[#004AAB] px-4 py-1.5 rounded-lg hover:bg-[#003B8A] transition-colors"
                      >
                        Lihat Hasil
                      </Link>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">Mengerjakan</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredHistories.length > 0 && (
        <SmartPagination
          page={safeCurrentPage}
          totalItems={filteredHistories.length}
          perPage={itemsPerPage}
          perPageOptions={PER_PAGE_OPTIONS}
          itemLabel="riwayat"
          onPageChange={setCurrentPage}
          onPerPageChange={(value) => {
            setItemsPerPage(value);
            resetPage();
          }}
        />
      )}
    </div>
  );
}
