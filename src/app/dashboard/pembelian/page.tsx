"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, History, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetAllPackages } from "@/http/pembelian/get-all-packages";
import PackageCard from "@/components/molecules/card/PackageCard";

const categories = [
  "Semua Paket",
  "Paket Try Out",
  "Paket Live Class",
  "Paket Konsultasi",
  "Mega Paket",
];

export default function PembelianPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const [activeCategory, setActiveCategory] = useState("Semua Paket");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useGetAllPackages({ token });
  const packages = data?.data || [];

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (activeCategory === "Paket Try Out")
      matchesCategory = pkg.title.toLowerCase().includes("try out");
    if (activeCategory === "Paket Live Class")
      matchesCategory = pkg.title.toLowerCase().includes("live class");
    if (activeCategory === "Paket Konsultasi")
      matchesCategory = pkg.title.toLowerCase().includes("konsultasi");
    if (activeCategory === "Mega Paket")
      matchesCategory = pkg.title.toLowerCase().includes("mega");

    return matchesSearch && matchesCategory;
  });

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
              Pembelian
            </h1>
          </div>
          <p className="text-gray-600 text-sm pl-9">
            Amunisian, pilih paket yang paling cocok untuk persiapanmu!
          </p>
        </div>

        <Link
          href="/dashboard/pembelian/riwayat"
          className="flex items-center gap-2 bg-[#3C8D60] hover:bg-[#327851] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors w-fit md:mt-0"
        >
          <History className="w-4 h-4" />
          <span>Riwayat Pembelian</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all"
            placeholder="Cari paket sesuai kebutuhanmu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-[#004AAB] text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
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
          <div className="col-span-full py-12 text-center text-slate-500">
            Tidak ada paket yang cocok dengan pencarian atau kategori Anda.
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
