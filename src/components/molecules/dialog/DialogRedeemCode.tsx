"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle, KeyRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRedeemAccessCode } from "@/http/access-code/redeem-access-code";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";

interface DialogRedeemCodeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogRedeemCode({ open, onOpenChange }: DialogRedeemCodeProps) {
  const { data: session, update: updateSession } = useSession();
  const token = session?.access_token || "";
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);

  const redeemMutation = useRedeemAccessCode({
    token,
    options: {
      onSuccess: (data) => {
        toast.success(data.message || "Kode akses berhasil digunakan!");
        if (data.data?.type === "ticket" || data.data?.ticket_balance !== undefined) {
          updateSession();
        }
        setCode("");
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { error_code?: string; message?: string } } };
        if (axiosError.response?.data?.error_code === "quota_exhausted") {
          setQuotaModalOpen(true);
          return;
        }

        const message = getErrorMessage(error, "Gagal menggunakan kode akses");
        toast.error(message);
      },
    },
  });

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error("Masukkan kode akses");
      return;
    }

    setIsProcessing(true);
    try {
      await redeemMutation.mutateAsync({ code: code.trim() });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
          <div className="bg-[#004AAB] p-6 text-white text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
              <KeyRound className="w-7 h-7" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Redeem Kode Akses</DialogTitle>
            <DialogDescription className="text-white/80 text-sm mt-1">
              Masukkan kode akses untuk membuka tryout atau mendapatkan tiket
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="font-semibold text-gray-800 text-sm mb-2 block">Kode Akses</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: ABCDEF1234"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#004AAB]/30 focus:border-[#004AAB] uppercase"
                maxLength={40}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleRedeem}
                disabled={isProcessing || !code.trim()}
                className="flex-1 bg-[#004AAB] hover:bg-[#003B8A] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Memproses..." : "Gunakan Kode"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={quotaModalOpen} onOpenChange={setQuotaModalOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm rounded-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">Kuota Sudah Habis</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Kuota voucher ini sudah tercapai dan tidak bisa digunakan lagi.
          </DialogDescription>
          <button
            onClick={() => setQuotaModalOpen(false)}
            className="w-full rounded-xl bg-[#004AAB] py-3 font-bold text-white hover:bg-[#003B8A]"
          >
            Mengerti
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
