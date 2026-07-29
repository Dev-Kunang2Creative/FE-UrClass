"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Receipt } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetHistoryPembelian } from "@/http/pembelian/get-history-pembelian";
import { formatJakartaDate } from "@/utils/date-time";

export default function RiwayatPembelianPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const { data, isLoading } = useGetHistoryPembelian({ token });
  const transactions = data?.data || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/dashboard/pembelian"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Riwayat Pembelian</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
        {isLoading ? (
          <div className="flex justify-center p-10 text-slate-500">Memuat riwayat...</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-4">
            <Receipt className="w-12 h-12 text-slate-300" />
            <p>Belum ada riwayat pembelian paket.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {transactions.map((trx) => (
              <div key={trx.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-slate-100 bg-slate-50 rounded-xl gap-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-800 text-lg">{trx.packageName}</span>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{formatJakartaDate(trx.orderDate, { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span>•</span>
                    <span className="font-medium">ID: {trx.id}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-[#004AAB] text-lg">Rp{trx.amount.toLocaleString("id-ID")}</span>
                  {trx.status === "success" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Berhasil</span>
                  )}
                  {trx.status === "pending" && (
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">Menunggu</span>
                      {trx.packageId && (
                        <Link
                          href={`/dashboard/pembelian/${trx.packageId}`}
                          className="text-sm font-semibold text-white bg-[#004AAB] px-4 py-1.5 rounded-lg hover:bg-[#003B8A] transition-colors"
                        >
                          Lanjut Bayar
                        </Link>
                      )}
                    </div>
                  )}
                  {trx.status === "failed" && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">Gagal</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
