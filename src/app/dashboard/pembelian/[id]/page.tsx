"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Clock, AlertCircle, Ticket } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetDetailPackage } from "@/http/pembelian/get-detail-package";
import { useCreateOrder } from "@/http/pembelian/create-order";
import { useVerifyPayment } from "@/http/pembelian/verify-payment";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { notifyTicketBalanceUpdated } from "@/hooks/useTickets";

type PaymentState = "idle" | "loading" | "success" | "pending" | "error";

export default function DetailPaketPage() {
  const { data: session, update } = useSession();
  const token = session?.access_token || "";
  const router = useRouter();
  const queryClient = useQueryClient();

  const params = useParams();
  const pkgId = params?.id as string;

  const { data, isLoading } = useGetDetailPackage({ id: pkgId, token });
  const pkg = data?.data;

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const currentOrderId = useRef<string | null>(null);
  const paymentCompleted = useRef(false);

  const { mutate: verifyPayment } = useVerifyPayment();

  const createOrderMutation = useCreateOrder({
    token,
    options: {
      onSuccess: (res) => {
        const snapToken = res.snap_token;

        if (!snapToken) {
          toast.error("Tidak ada snap token dari server.");
          setPaymentState("error");
          return;
        }

        if (typeof window === "undefined" || !window.snap) {
          toast.error("Midtrans Snap belum siap, coba refresh halaman.");
          setPaymentState("idle");
          return;
        }

        currentOrderId.current = res.data.id;
        paymentCompleted.current = false;

        window.snap.pay(snapToken, {
          onSuccess: () => {
            paymentCompleted.current = true;
            if (currentOrderId.current) {
              verifyPayment(
                { orderId: currentOrderId.current, token },
                {
                  onSuccess: (res) => {
                    queryClient.invalidateQueries({ queryKey: ["get-history-pembelian"] });
                    if (res.status === "paid") {
                      // Gunakan nilai asli dari DB, bukan optimistic guess
                      if (res.ticket_balance !== undefined) {
                        notifyTicketBalanceUpdated({
                          ticketBalance: res.ticket_balance,
                          suppressModal: true,
                        });
                      }
                      // Refresh session agar ticket_balance di JWT sync dengan DB
                      update();
                    }
                  },
                }
              );
            }
            setPaymentState("success");
          },
          onPending: () => {
            paymentCompleted.current = true;
            setPaymentState("pending");
            queryClient.invalidateQueries({ queryKey: ["get-history-pembelian"] });
            // Safety net untuk QRIS: verifyPayment agar tiket masuk
            // meski webhook terlambat atau gagal dikirim Midtrans
            if (currentOrderId.current) {
              verifyPayment(
                { orderId: currentOrderId.current, token },
                {
                  onSuccess: (res) => {
                    if (res.status === "paid") {
                      setPaymentState("success");
                      queryClient.invalidateQueries({ queryKey: ["get-history-pembelian"] });
                    }
                  },
                }
              );
            }
          },
          onError: () => {
            paymentCompleted.current = true;
            setPaymentState("error");
            toast.error("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            if (paymentCompleted.current) return;

            setPaymentState("idle");
            toast.info("Pembayaran ditutup. Kamu bisa lanjut bayar dari paket ini atau riwayat pembelian.");
          },
        });
      },
      onError: (error: unknown) => {
        const msg = getErrorMessage(error, "Gagal membuat pesanan.");
        toast.error(msg);
        setPaymentState("idle");
      },
    },
  });

  const handleBayar = () => {
    if (!token) {
      toast.error("Sesi tidak ditemukan, silakan login ulang.");
      return;
    }
    setPaymentState("loading");
    createOrderMutation.mutate({ package_id: pkgId });
  };

  if (isLoading || !pkg) {
    return (
      <div className="p-10 text-center text-slate-500">Memuat detail paket...</div>
    );
  }

  const discountAmount = pkg.originalPrice != null ? pkg.originalPrice - pkg.price : 0;

  // --- State: Success ---
  if (paymentState === "success") {
    return (
      <div className="w-full max-w-md mx-auto mt-20 flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900">Pembayaran Berhasil!</h2>
        <p className="text-gray-500 text-sm">
          Terima kasih! Paket <strong>{pkg.title}</strong> sudah aktif di akunmu. Selamat belajar, Amunisian!
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => router.push("/dashboard/pembelian/riwayat")}
            className="flex-1 py-3 border border-[#004AAB] text-[#004AAB] font-semibold rounded-lg hover:bg-[#EBF4FF] transition-colors"
          >
            Riwayat Pembelian
          </button>
          <button
            onClick={() => router.push("/dashboard/try-out")}
            className="flex-1 py-3 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold rounded-lg transition-colors"
          >
            Mulai Try Out
          </button>
        </div>
      </div>
    );
  }

  // --- State: Pending ---
  if (paymentState === "pending") {
    return (
      <div className="w-full max-w-md mx-auto mt-20 flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
          <Clock className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900">Menunggu Pembayaran</h2>
        <p className="text-gray-500 text-sm">
          Pembayaranmu sedang diproses. Paket akan aktif otomatis setelah pembayaran dikonfirmasi.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            disabled={isCheckingStatus}
            onClick={() => {
              if (!currentOrderId.current) return;
              setIsCheckingStatus(true);
              verifyPayment(
                { orderId: currentOrderId.current, token },
                {
                  onSuccess: (res) => {
                    if (res.status === "paid") {
                      if (res.ticket_balance !== undefined) {
                        notifyTicketBalanceUpdated({
                          ticketBalance: res.ticket_balance,
                          suppressModal: true,
                        });
                      }
                      update();
                      setPaymentState("success");
                      queryClient.invalidateQueries({ queryKey: ["get-history-pembelian"] });
                    } else {
                      toast.info("Pembayaran belum terkonfirmasi. Coba beberapa saat lagi.");
                    }
                  },
                  onError: () => toast.error("Gagal mengecek status. Coba lagi."),
                  onSettled: () => setIsCheckingStatus(false),
                }
              );
            }}
            className="w-full py-3 border border-[#004AAB] text-[#004AAB] font-semibold rounded-lg hover:bg-[#EBF4FF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCheckingStatus ? "Mengecek..." : "Cek Status Pembayaran"}
          </button>
          <button
            onClick={() => router.push("/dashboard/pembelian/riwayat")}
            className="w-full py-3 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold rounded-lg transition-colors"
          >
            Lihat Riwayat Pembelian
          </button>
        </div>
      </div>
    );
  }

  // --- State: Error ---
  if (paymentState === "error") {
    return (
      <div className="w-full max-w-md mx-auto mt-20 flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900">Pembayaran Gagal</h2>
        <p className="text-gray-500 text-sm">
          Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.
        </p>
        <button
          onClick={() => setPaymentState("idle")}
          className="w-full py-3 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold rounded-lg transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // --- Default: Idle / Loading ---
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/pembelian"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Detail Paket</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl w-full p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
        {/* Package Title */}
        <div className="w-full bg-[#EBF4FF] text-[#004AAB] font-bold text-xl text-center py-4 rounded-xl">
          {pkg.title}
        </div>

        {/* Price & Details */}
        <div className="flex flex-col gap-5 border border-slate-200 rounded-xl p-6">
          {/* Price Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-2xl text-[#004AAB]">
                Rp{pkg.price.toLocaleString("id-ID")}
              </span>
              {pkg.originalPrice != null && (
                <span className="text-base font-medium text-slate-400 line-through">
                  Rp{pkg.originalPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
            {pkg.discountPercent != null && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                Hemat {pkg.discountPercent}%
              </span>
            )}
          </div>

          {/* Ticket */}
          {pkg.ticketAmount && (
            <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
              <Ticket className="w-5 h-5 shrink-0" />
              <span>
                Berisi <strong>{pkg.ticketAmount} tiket</strong> tryout premium
              </span>
            </div>
          )}

          {/* Description */}
          {pkg.description && (
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-slate-800 text-sm">Deskripsi Paket</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{pkg.description}</p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2 text-sm border border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-1">Ringkasan Pembayaran</h4>
            <div className="flex justify-between text-slate-600">
              <span>{pkg.title}</span>
              <span>Rp{(pkg.originalPrice ?? pkg.price).toLocaleString("id-ID")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Potongan Harga ({pkg.discountPercent}%)</span>
                <span>-Rp{discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-1" />
            <div className="flex justify-between font-bold text-slate-900">
              <span>Total Pembayaran</span>
              <span>Rp{pkg.price.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleBayar}
          disabled={paymentState === "loading"}
          className="w-full py-3.5 bg-[#004AAB] hover:bg-[#003B8A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-base shadow-sm"
        >
          {paymentState === "loading" ? "Memproses..." : "Bayar Sekarang"}
        </button>

        <p className="text-center text-xs text-slate-400">
          Pembayaran diproses secara aman melalui Midtrans. Berbagai metode pembayaran tersedia.
        </p>
      </div>
    </div>
  );
}
