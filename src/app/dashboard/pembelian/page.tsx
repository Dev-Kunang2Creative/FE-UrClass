"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, History, Search, Ticket } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetAllPackages } from "@/http/pembelian/get-all-packages";
import PackageCard from "@/components/molecules/card/PackageCard";
import InfoCardCarousel from "@/components/molecules/dashboard/InfoCardCarousel";
import Mascot from "@/components/atoms/mascot/Mascot";

/**
 * One catalogue for both jalur.
 *
 * The list used to be filtered by the reader's kategori while the ticket it
 * sold was a single balance usable on either track, so half the store was
 * hidden for no reason the buyer could act on. The backend now returns every
 * active package (PackageCatalogController) and the note below says plainly
 * what a ticket is worth.
 *
 * The category chips are gone with it. They matched on title substrings -
 * "try out", and a bare "to" that would also hit words like "total" - which
 * only ever worked against the old per-track names. Three packages and a
 * search box need no taxonomy.
 */
export default function PembelianPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useGetAllPackages({ token });
  const packages = data?.data || [];

  const query = searchQuery.trim().toLowerCase();
  const filteredPackages = query
    ? packages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(query) ||
          pkg.description.toLowerCase().includes(query),
      )
    : packages;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Pembelian Paket
            </h1>
          </div>
          <p className="text-gray-600 text-sm pl-9">
            Pilih paket yang paling cocok untuk persiapan belajarmu!
          </p>
        </div>

        <Link
          href="/dashboard/pembelian/riwayat"
          className="flex items-center gap-2 bg-[#3C8D60] hover:bg-[#327851] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors w-fit md:mt-0 shadow-sm"
        >
          <History className="w-4 h-4" />
          <span>Riwayat Pembelian</span>
        </Link>
      </div>

      {/* Says what the buyer is actually getting. Without it, a CPNS reader
          seeing packages next to a UTBK-themed dashboard has no way to know the
          ticket is not track-locked. */}
      <div className="flex items-start gap-3 rounded-2xl border-2 border-slate-900 bg-track-tint px-4 py-3 shadow-[4px_4px_0px_0px_#0f172a]">
        <Ticket className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-sm leading-snug text-slate-700">
          <span className="font-bold text-slate-900">
            Satu tiket, dua jalur.
          </span>{" "}
          Tiket dari paket mana pun bisa kamu pakai untuk tryout UTBK maupun
          CPNS - tidak perlu beli dua kali.
        </p>
      </div>

      {/* Moved here from the dashboard. The promo slides all pointed at this
          page or the tryout list, so on the dashboard they were motion without
          information; here the reader is already deciding whether to buy. */}
      <InfoCardCarousel />

      <div className="flex flex-col gap-4 mt-2">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary text-sm shadow-sm transition-all"
            placeholder="Cari paket sesuai kebutuhanmu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-pulse"
            >
              <div className="w-full h-40 bg-slate-200" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded mt-2" />
              </div>
            </div>
          ))
        ) : filteredPackages.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center text-slate-500">
            <Mascot pose="berfikir" decorative sizes="112px" className="h-28 w-auto" />
            {query
              ? `Tidak ada paket yang cocok dengan "${searchQuery.trim()}".`
              : "Belum ada paket yang tersedia saat ini."}
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              id={pkg.id}
              title={pkg.title}
              thumbnail={pkg.thumbnail}
              price={pkg.price}
              originalPrice={pkg.originalPrice}
              discountPercent={pkg.discountPercent}
              description={pkg.description}
              ticketAmount={pkg.ticketAmount}
            />
          ))
        )}
      </div>
    </div>
  );
}
