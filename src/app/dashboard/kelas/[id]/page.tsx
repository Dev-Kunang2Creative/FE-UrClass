"use client";

import React, { use, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Clock, AlertCircle, Ticket } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetDetailKelas } from "@/http/kelas/get-detail-kelas";
import { useCreateKelasOrder } from "@/http/kelas/create-kelas-order";
import { useCancelKelasOrder } from "@/http/kelas/cancel-kelas-order";
import { useVerifyKelasPayment } from "@/http/kelas/verify-kelas-payment";
import { getErrorMessage } from "@/utils/get-error-message";
import { notifyTicketBalanceUpdated } from "@/hooks/useTickets";

type PaymentState = "idle" | "loading" | "success" | "pending" | "error";

interface DetailKelasPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailKelasPage({ params }: DetailKelasPageProps) {
  const { id: kelasId } = use(params);
  const { data: session, update } = useSession();
  const token = session?.access_token || "";
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetDetailKelas({ id: kelasId, token });
  const kelas = data?.data;

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const currentOrderId = useRef<string | null>(null);
  const paymentCompleted = useRef(false);

  const { mutate: cancelKelasOrder } = useCancelKelasOrder();
  const { mutate: verifyKelasPayment } = useVerifyKelasPayment();

  const createKelasOrderMutation = useCreateKelasOrder({
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
              verifyKelasPayment(
                { orderId: currentOrderId.current, token },
                {
                  onSuccess: (res) => {
                    queryClient.invalidateQueries({ queryKey: ["get-my-kelas"] });
                    if (res.status === "paid") {
                      if (res.ticket_balance !== undefined) {
                        notifyTicketBalanceUpdated({
                          ticketBalance: res.ticket_balance,
                          suppressModal: true,
                        });
                      }
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
            queryClient.invalidateQueries({ queryKey: ["get-my-kelas"] });
            // Safety net untuk QRIS: verifyPayment agar tiket masuk
            // meski webhook terlambat atau gagal dikirim Midtrans
            if (currentOrderId.current) {
              verifyKelasPayment(
                { orderId: currentOrderId.current, token },
                {
                  onSuccess: (res) => {
                    if (res.status === "paid") {
                      setPaymentState("success");
                      queryClient.invalidateQueries({ queryKey: ["get-my-kelas"] });
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

            if (!paymentCompleted.current && currentOrderId.current) {
              cancelKelasOrder({ orderId: currentOrderId.current, token });
            }
            setPaymentState("idle");
            toast.info("Pembayaran dibatalkan.");
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

  const handleDaftar = () => {
    if (!token) {
      toast.error("Sesi tidak ditemukan, silakan login ulang.");
      return;
    }
    setPaymentState("loading");
    createKelasOrderMutation.mutate({ kelas_id: kelasId });
  };

  if (isLoading || !kelas) {
    return (
      <div className="p-10 text-center text-slate-500">
        Memuat detail kelas...
      </div>
    );
  }

  const hasDiscount =
    kelas.discount_price != null && kelas.discount_price < kelas.price;
  const finalPrice = hasDiscount ? kelas.discount_price! : kelas.price;
  const discountAmount = hasDiscount ? kelas.price - kelas.discount_price! : 0;
  const discountPercent =
    hasDiscount && kelas.price > 0
      ? Math.round(((kelas.price - kelas.discount_price!) / kelas.price) * 100)
      : 0;

  // --- State: Success ---
  if (paymentState === "success") {
    return (
      <div className="w-full max-w-md mx-auto mt-20 flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="font-bold text-2xl text-gray-900">
          Pendaftaran Berhasil!
        </h2>
        <p className="text-gray-500 text-sm">
          Selamat! Kamu sudah terdaftar di kelas{" "}
          <strong>{kelas.name}</strong>. Akses kelas dan semua benefitnya sekarang!
        </p>
        <div className="flex gap-3 w-full">
          <Link
            href="/dashboard/kelas/saya"
            className="flex-1 py-3 border border-[#004AAB] text-[#004AAB] font-semibold rounded-lg hover:bg-[#EBF4FF] transition-colors text-center"
          >
            Kelas Saya
          </Link>
          <Link
            href="/dashboard/try-out"
            className="flex-1 py-3 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold rounded-lg transition-colors text-center"
          >
            Lihat Tryout
          </Link>
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
        <h2 className="font-bold text-2xl text-gray-900">
          Menunggu Pembayaran
        </h2>
        <p className="text-gray-500 text-sm">
          Pembayaranmu sedang diproses. Pendaftaran kelas akan aktif otomatis
          setelah pembayaran dikonfirmasi.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            disabled={isCheckingStatus}
            onClick={() => {
              if (!currentOrderId.current) return;
              setIsCheckingStatus(true);
              verifyKelasPayment(
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
                      queryClient.invalidateQueries({ queryKey: ["get-my-kelas"] });
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
          <Link
            href="/dashboard/kelas/saya"
            className="w-full py-3 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold rounded-lg transition-colors text-center block"
          >
            Lihat Kelas Saya
          </Link>
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
          href="/dashboard/kelas"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Detail Kelas
        </h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl w-full p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
        {/* Kelas Title */}
        <div className="w-full bg-[#EBF4FF] text-[#004AAB] font-bold text-xl text-center py-4 rounded-xl">
          {kelas.name}
        </div>

        {/* Price & Details */}
        <div className="flex flex-col gap-5 border border-slate-200 rounded-xl p-6">
          {/* Price Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-baseline gap-3">
              {kelas.price === 0 ? (
                <span className="font-bold text-2xl text-green-600">Gratis</span>
              ) : (
                <>
                  <span className="font-bold text-2xl text-[#004AAB]">
                    Rp{finalPrice.toLocaleString("id-ID")}
                  </span>
                  {hasDiscount && (
                    <span className="text-base font-medium text-slate-400 line-through">
                      Rp{kelas.price.toLocaleString("id-ID")}
                    </span>
                  )}
                </>
              )}
            </div>
            {hasDiscount && discountPercent > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                Hemat {discountPercent}%
              </span>
            )}
          </div>

          {/* Ticket bonus */}
          {kelas.ticket_amount > 0 && (
            <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
              <Ticket className="w-5 h-5 shrink-0" />
              <span>
                Bonus <strong>{kelas.ticket_amount} tiket</strong> tryout premium
              </span>
            </div>
          )}

          {/* Description */}
          {kelas.description && (
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-slate-800 text-sm">
                Deskripsi Kelas
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {kelas.description}
              </p>
            </div>
          )}

          {/* Payment Summary */}
          {kelas.price > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2 text-sm border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-1">
                Ringkasan Pembayaran
              </h4>
              <div className="flex justify-between text-slate-600">
                <span>{kelas.name}</span>
                <span>Rp{kelas.price.toLocaleString("id-ID")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Potongan Harga ({discountPercent}%)</span>
                  <span>-Rp{discountAmount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total Pembayaran</span>
                <span>Rp{finalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Daftar Button */}
        <button
          onClick={handleDaftar}
          disabled={paymentState === "loading"}
          className="w-full py-3.5 bg-[#004AAB] hover:bg-[#003B8A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-base shadow-sm"
        >
          {paymentState === "loading" ? "Memproses..." : "Daftar Sekarang"}
        </button>

        {kelas.price > 0 && (
          <p className="text-center text-xs text-slate-400">
            Pembayaran diproses secara aman melalui Midtrans. Berbagai metode
            pembayaran tersedia.
          </p>
        )}
      </div>
    </div>
  );
}
