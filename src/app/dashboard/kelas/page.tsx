"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetUserKelas } from "@/http/kelas/get-user-kelas";
import KelasCard from "@/components/molecules/card/KelasCard";

export default function KelasPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const { data, isLoading } = useGetUserKelas({ token });
  const kelasList = data?.data ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Program Kelas
        </h1>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && kelasList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Belum ada kelas tersedia
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Kelas akan segera hadir. Pantau terus update terbaru dari UrClass!
          </p>
        </div>
      )}

      {/* Grid of cards */}
      {!isLoading && kelasList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kelasList.map((kelas) => (
            <KelasCard
              key={kelas.id}
              id={kelas.id}
              name={kelas.name}
              price={kelas.price}
              discountPrice={kelas.discount_price}
              imageUrl={kelas.image_url}
              ticketAmount={kelas.ticket_amount}
              enrollmentsCount={kelas.enrollments_count}
              description={kelas.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}
