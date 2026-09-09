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
              Pembelian Paket
            </h1>
          </div>
          <p className="text-slate-600 text-sm pl-9">
            Pilih paket yang paling cocok untuk persiapan belajarmu!
          </p>
        </div>

        <Link
          href="/dashboard/pembelian/riwayat"
          className="flex w-fit items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0f172a] transition-all hover:bg-track-tint active:translate-y-0.5"
        >
          <History className="w-4 h-4" />
          <span>Riwayat Pembelian</span>
        </Link>
      </div>

      {/* Says what the buyer is actually getting. Without it, a CPNS reader
          seeing packages next to a UTBK-themed dashboard has no way to know the
          ticket is not track-locked. */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-gradient-to-r from-track-tint via-white to-track-tint/50 p-4 sm:px-5 sm:py-3.5 shadow-[4px_4px_0px_0px_#0f172a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#0f172a]">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-900 text-sm sm:text-base">
                  Satu Tiket, Dua Jalur
                </p>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  Bebas Pilih
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                Tiket dari paket mana pun bisa kamu pakai untuk tryout{" "}
                <strong className="text-slate-800">UTBK</strong> maupun{" "}
                <strong className="text-slate-800">CPNS</strong> — tidak perlu beli dua kali.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 shadow-sm">
                🎯 UTBK
              </span>
              <span className="text-slate-400 font-bold">⇄</span>
              <span className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 shadow-sm">
                🏛️ CPNS
              </span>
            </div>
            <Mascot
              pose="sip2"
              decorative
              sizes="80px"
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>

      {/* Moved here from the dashboard. The promo slides all pointed at this
          page or the tryout list, so on the dashboard they were motion without
          information; here the reader is already deciding whether to buy. */}
      <InfoCardCarousel />

      <div className="flex flex-col gap-4 mt-2">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-0 text-sm shadow-sm transition-all placeholder:text-slate-400"
            placeholder="Cari paket sesuai kebutuhanmu..."
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
