"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, History, Search, KeyRound } from "lucide-react";
import Link from "next/link";
import TryoutCard from "@/components/molecules/card/TryoutCard";
import { useSession } from "next-auth/react";
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

  const [activeFilter, setActiveFilter] = useState("Semua Tryout");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("status");
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const {
    data: tryoutsData,
    isLoading: isTryoutsLoading,
    isFetching: isTryoutsFetching,
  } = useGetUserTryouts({
    token,
  });

  const tryouts = tryoutsData?.data || [];

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useGetHistoryTryout({
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

  const isPageLoading =
    sessionStatus === "loading" ||
    isTryoutsLoading ||
    isTryoutsFetching ||
    isHistoryLoading ||
    isHistoryFetching;

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
            item.category?.toUpperCase() === categoryFilter) &&
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
          return b.participantsCount - a.participantsCount;

        const statusDiff = getStatusOrder(a) - getStatusOrder(b);
        if (statusDiff !== 0) return statusDiff;
        return timeA - timeB;
      });
  }, [
    activeFilter,
    categoryFilter,
    enrolledTryoutIds,
    searchQuery,
    sortBy,
    tryouts,
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Daftar Tryout
            </h1>
          </div>
          <p className="text-gray-600 text-sm pl-9">
            Amunisian, tingkatkan skor tryoutmu dan persiapkan diri menghadapi
            ujian yang akan datang.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRedeemDialog(true)}
            className="flex items-center gap-2 bg-[#004AAB] hover:bg-[#003B8A] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors w-fit"
          >
            <KeyRound className="w-4 h-4" />
            <span>Kode Akses</span>
          </button>
          <Link
            href="/dashboard/try-out/riwayat"
            className="flex items-center gap-2 bg-[#3C8D60] hover:bg-[#327851] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors w-fit md:mt-0"
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Mau tryout seperti apa?"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAB]/20 focus:border-[#004AAB] transition-all shadow-sm"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-[#004AAB] text-white"
                  : "bg-[#EAEFF4] text-[#5A6A80] hover:bg-gray-200"
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
            <SelectTrigger className="h-10 w-full bg-white sm:w-36">
              <SelectValue placeholder="Jenis TO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Jenis</SelectItem>
              <SelectItem value="UTBK">UTBK</SelectItem>
              <SelectItem value="UM">UM</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="h-10 w-full bg-white sm:w-48">
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
                />
              ))}
            </div>

            <SmartPagination
              page={safeCurrentPage}
              totalItems={filteredData.length}
              perPage={itemsPerPage}
              perPageOptions={PER_PAGE_OPTIONS}
              itemLabel="tryout"
              onPageChange={setCurrentPage}
              onPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500">
            <p>Tidak ada tryout yang ditemukan.</p>
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
