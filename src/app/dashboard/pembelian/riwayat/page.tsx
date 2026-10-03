"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetHistoryPembelian } from "@/http/pembelian/get-history-pembelian";
import { useCancelOrder } from "@/http/pembelian/cancel-order";
import { getErrorMessage } from "@/utils/get-error-message";
import { formatJakartaDate } from "@/utils/date-time";
import Mascot from "@/components/atoms/mascot/Mascot";

export default function RiwayatPembelianPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const { data, isLoading } = useGetHistoryPembelian({ token });
  const transactions = data?.data || [];

  const queryClient = useQueryClient();
  const [membatalkan, setMembatalkan] = React.useState<string | null>(null);

  // Membatalkan pesanan yang belum dibayar membebaskan peserta memesan ulang
  // saat itu juga. Tanpa ini ia harus menunggu token pembayarannya kedaluwarsa
  // - 15 menit - hanya karena salah memilih metode pembayaran.
  const batal = useCancelOrder({
    onSuccess: () => {
      toast.success("Pesanan dibatalkan. Kamu bisa memesan ulang sekarang.");
      queryClient.invalidateQueries({ queryKey: ["get-history-pembelian"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Pesanan gagal dibatalkan.")),
    onSettled: () => setMembatalkan(null),
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/pembelian"
              className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Riwayat Pembelian
            </h1>
          </div>
          <p className="text-slate-600 text-sm pl-9">
            Daftar transaksi dan status pembelian paket belajarmu.
          </p>
        </div>

        <Mascot
          pose="terimakasih1"
          decorative
          sizes="100px"
          className="hidden sm:block h-16 w-auto shrink-0 md:h-20"
        />
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] p-5 sm:p-7">
        {isLoading ? (
          <div className="flex justify-center p-12 text-slate-500 font-medium animate-pulse">
            Memuat riwayat pembelian...
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-4">
            <Mascot
              pose="berfikir"
              decorative
              sizes="112px"
              className="h-28 w-auto"
            />
            <p className="font-semibold text-slate-600">
              Belum ada riwayat pembelian paket.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((trx) => (
              <div
                key={trx.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-2 border-slate-100 bg-slate-50/70 rounded-2xl hover:bg-slate-100/90 hover:border-slate-200 transition-all gap-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900 text-base sm:text-lg">
                    {trx.packageName}
                  </span>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <span>
                      {formatJakartaDate(trx.orderDate, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-mono">ID: {trx.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-black text-primary text-base sm:text-lg">
                    Rp{trx.amount.toLocaleString("id-ID")}
                  </span>

                  {trx.status === "success" && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold uppercase tracking-wider">
                      Berhasil
                    </span>
                  )}
                  {trx.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold uppercase tracking-wider">
                        Menunggu
                      </span>
                      {trx.packageId && (
                        <Link
                          href={`/dashboard/pembelian/${trx.packageId}`}
                          className="text-xs sm:text-sm font-bold text-primary-foreground bg-primary px-3.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:brightness-95 active:translate-y-0.5 transition-all"
                        >
                          Lanjut Bayar
                        </Link>
                      )}
                      <button
                        type="button"
                        disabled={membatalkan === trx.orderId}
                        onClick={() => {
                          setMembatalkan(trx.orderId);
                          batal.mutate({ orderId: trx.orderId, token });
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-600 px-3.5 py-1.5 rounded-xl border-2 border-slate-300 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
                      >
                        {membatalkan === trx.orderId ? "Membatalkan…" : "Batalkan"}
                      </button>
                    </div>
                  )}
                  {trx.status === "failed" && (
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold uppercase tracking-wider">
                      Gagal
                    </span>
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
