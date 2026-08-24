"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, History, Search, KeyRound } from "lucide-react";
import Link from "next/link";
import TryoutCard from "@/components/molecules/card/TryoutCard";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { useGetUserTryouts } from "@/http/tryout/get-user-tryouts";
import { useGetHistoryTryout } from "@/http/tryout/get-history-tryout";
import DialogRedeemCode from "@/components/molecules/dialog/DialogRedeemCode";
import SmartPagination from "@/components/molecules/pagination/SmartPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TryoutCardSkeleton from "@/components/molecules/card/TryoutCardSkeleton";
import Mascot from "@/components/atoms/mascot/Mascot";

const FILTER_OPTIONS = [
  "Semua Tryout",
  "Tryout Premium",
  "Tryout Gratis",
  "Terdaftar",
];

const INITIAL_TIME = Date.now();
const PER_PAGE_OPTIONS = [3, 6, 9];

export default function TryoutPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.access_token || "";
  const { kategori } = useKategori();
  const isCpns = kategori === "cpns";

  const [activeFilter, setActiveFilter] = useState("Semua Tryout");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("status");
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const { data: tryoutsData, isLoading: isTryoutsLoading } = useGetUserTryouts({
    token,
  });

  const tryouts = useMemo(() => tryoutsData?.data || [], [tryoutsData]);

  const { data: historyData, isLoading: isHistoryLoading } =
    useGetHistoryTryout({
      token,
    });

  const enrolledTryoutIds = useMemo(
    () => new Set(historyData?.data?.map((t) => t.id) || []),
    [historyData],
  );
  const historyMap = useMemo(
    () => new Map(historyData?.data?.map((t) => [t.id, t]) || []),
    [historyData],
  );

  // isFetching used to be in here, which meant every background refetch - and
  // React Query refetches on window focus by default - replaced the whole grid
  // with skeletons and then put it back. Coming back to the tab made the page
  // visibly flash. isLoading is only true when there is no data to show yet,
  // which is the only time a skeleton is the honest thing to render.
  const isPageLoading =
    sessionStatus === "loading" || isTryoutsLoading || isHistoryLoading;

  const getStatusOrder = (item: { startDate: string; endDate: string }) => {
    const start = item.startDate ? new Date(item.startDate).getTime() : 0;
    const end = item.endDate ? new Date(item.endDate).getTime() : 0;
    if (start && end && INITIAL_TIME >= start && INITIAL_TIME <= end) return 0;
    if (start && INITIAL_TIME < start) return 1;
    return 2;
  };

  const filteredData = useMemo(() => {
    return tryouts
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (categoryFilter === "Semua" ||
            item.category?.toUpperCase() === categoryFilter.toUpperCase()) &&
          (activeFilter === "Semua Tryout" ||
            (activeFilter === "Tryout Premium" && item.type === "Premium") ||
            (activeFilter === "Tryout Gratis" && item.type === "Gratis") ||
            (activeFilter === "Terdaftar" && enrolledTryoutIds.has(item.id))),
      )
      .sort((a, b) => {
        const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;

        if (sortBy === "newest") return timeB - timeA;
        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "participants")
          return (b.participantsCount || 0) - (a.participantsCount || 0);

        return getStatusOrder(a) - getStatusOrder(b);
      });
  }, [
    tryouts,
    searchQuery,
    categoryFilter,
    activeFilter,
    enrolledTryoutIds,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (filter: string) => {
    setCategoryFilter(filter);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
              Daftar Tryout {isCpns ? "CPNS & Kedinasan" : "UTBK - SNBT"}
            </h1>
          </div>
          <p className="pl-9 text-sm text-slate-600">
            {isCpns
              ? "Sobat UrClass, latih kemampuan CAT SKD (TWK, TIU, TKP) dengan standar penilaian resmi."
              : "Sobat UrClass, tingkatkan skor tryoutmu dan persiapkan diri menghadapi seleksi masuk PTN."}
          </p>
        </div>

        {/* Buttons. Both were off-palette: the access-code button branched on
            isCpns to pick between hardcoded orange and blue, and Riwayat TO
            was a green that belongs to neither track. Primary action takes
            the track colour, the secondary one is outlined. */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRedeemDialog(true)}
            className="flex w-fit items-center gap-2 rounded-xl border-2 border-slate-900 bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:brightness-95 active:translate-y-0.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Kode Akses</span>
          </button>
          <Link
            href="/dashboard/try-out/riwayat"
            className="flex w-fit items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-track-tint active:translate-y-0.5"
          >
            <History className="w-4 h-4" />
            <span>Riwayat TO</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 pt-2">
        {/* Search Bar */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              isCpns
                ? "Cari tryout CPNS, SKD, Kedinasan..."
                : "Mau tryout seperti apa?"
            }
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-900 bg-white py-3 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`rounded-full border-2 border-slate-900 px-4 py-1.5 text-sm font-bold transition-colors ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-slate-700 hover:bg-track-tint"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger className="h-10 w-full rounded-xl border-2 border-slate-900 bg-white font-semibold sm:w-36">
              <SelectValue placeholder="Jenis TO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Jenis</SelectItem>
              {isCpns ? (
                <>
                  <SelectItem value="SKD">SKD</SelectItem>
                  <SelectItem value="SKB">SKB</SelectItem>
                  <SelectItem value="Kedinasan">Kedinasan</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="UTBK">UTBK</SelectItem>
                  <SelectItem value="SNBP">SNBP</SelectItem>
                  <SelectItem value="UM">UM</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="h-10 w-full rounded-xl border-2 border-slate-900 bg-white font-semibold sm:w-48">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status terdekat</SelectItem>
              <SelectItem value="newest">Tanggal terbaru</SelectItem>
              <SelectItem value="oldest">Tanggal terlama</SelectItem>
              <SelectItem value="title">Judul A-Z</SelectItem>
              <SelectItem value="participants">Peserta terbanyak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4">
        {isPageLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <TryoutCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {paginatedData.map((item) => (
                <TryoutCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  category={item.category}
                  startDate={item.startDate}
                  endDate={item.endDate}
                  imageUrl={item.image_url}
                  participantsCount={item.participantsCount}
                  isEnrolled={item.isEnrolled || enrolledTryoutIds.has(item.id)}
                  hasAttempted={
                    item.hasAttempted ||
                    historyMap.get(item.id)?.hasAttempted ||
                    false
                  }
                  // Without this the card cannot tell an unfinished session
                  // from a finished one, so someone mid-exam was offered
                  // "Kerjakan Ulang" - a restart - instead of "Lanjutkan".
                  sessionStatus={item.sessionStatus}
                />
              ))}
            </div>

            <SmartPagination
              page={safeCurrentPage}
              totalItems={filteredData.length}
              perPage={itemsPerPage}
              perPageOptions={PER_PAGE_OPTIONS}
              itemLabel="tryout"
              layout="stacked"
              onPageChange={setCurrentPage}
              onPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 py-12 text-center">
            <Mascot pose="berfikir" decorative sizes="112px" className="h-28 w-auto" />
            <p className="text-sm font-bold text-slate-700">
              Tidak ada tryout yang cocok
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              Coba hapus kata pencarian atau ganti filternya.
            </p>
          </div>
        )}
      </div>

      {/* Redeem Code Dialog */}
      <DialogRedeemCode
        open={showRedeemDialog}
        onOpenChange={setShowRedeemDialog}
      />
    </div>
  );
}
