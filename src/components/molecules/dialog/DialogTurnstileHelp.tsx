"use client";

import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogTurnstileHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const helpSteps = [
  {
    title: "Muat ulang halaman",
    description:
      "Ini biasanya memulai ulang verifikasi dengan koneksi yang lebih stabil.",
  },
  {
    title: "Nonaktifkan pemblokir iklan",
    description:
      "AdBlock, uBlock Origin, dan Brave Shields dapat memblokir komunikasi verifikasi Cloudflare.",
  },
  {
    title: "Buka di browser utama",
    description:
      "Jika halaman dibuka dari WhatsApp, Telegram, atau Instagram, salin tautannya ke Google Chrome atau Safari.",
  },
  {
    title: "Gunakan opsi alternatif",
    description:
      "Pilih tombol Daftar dengan Google di bawah form ini untuk melanjutkan tanpa captcha.",
  },
];

export default function DialogTurnstileHelp({
  open,
  onOpenChange,
}: DialogTurnstileHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-2 border-slate-900 p-0 shadow-[6px_6px_0_#0f172a] sm:max-w-lg">
        <DialogHeader className="border-b-2 border-slate-900 bg-slate-50 px-5 py-4 pr-12 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-slate-900">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-slate-950">
                Bantuan verifikasi keamanan
              </DialogTitle>
              <DialogDescription className="leading-relaxed text-slate-600">
                Coba muat ulang verifikasi terlebih dahulu agar data form tetap terisi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ol className="space-y-4 px-5 pb-5">
          {helpSteps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-900 bg-white text-xs font-bold text-slate-900">
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
                {index === 0 && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="size-3.5" />
                    Refresh Halaman
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
