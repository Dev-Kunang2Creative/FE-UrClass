"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Settings,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpenCheck,
  Landmark,
} from "lucide-react";
import Image from "next/image";

interface DialogOnboardingTourProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DialogOnboardingTour({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: DialogOnboardingTourProps) {
  const { data: session } = useSession();
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const userId = session?.user?.id || "guest";

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
      return;
    }

    if (session?.user?.id) {
      const storageKey = `urclass_tour_seen_${session.user.id}`;
      const seen = localStorage.getItem(storageKey);
      if (!seen) {
        setIsOpen(true);
      }
    }
  }, [session?.user?.id, externalOpen]);

  const handleClose = () => {
    if (session?.user?.id) {
      const storageKey = `urclass_tour_seen_${session.user.id}`;
      localStorage.setItem(storageKey, "true");
    }
    setIsOpen(false);
    externalOnOpenChange?.(false);
  };

  const steps = [
    {
      title: `Selamat Datang di UrClass! 🎉`,
      badge: `Jalur Aktif: ${config.full}`,
      badgeClass: config.theme.badge,
      description: `Akunmu saat ini berada dalam Mode ${config.label}. Seluruh bank soal, simulasi tryout, paket pembelian, dan analitik performa diatur khusus untuk jalur persiapan ini.`,
      icon: kategori === "cpns" ? Landmark : BookOpenCheck,
      iconBg: kategori === "cpns" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800",
      highlight: "Kamu siap memulai persiapan intensif meraih target impianmu!",
    },
    {
      title: "Bebas Ganti Mode Kapan Saja 🔄",
      badge: "Menu Profil & Pengaturan",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
      description:
        "Mau belajar jalur lain seperti CPNS atau UTBK? Kamu bisa dengan mudah berpindah mode kapan saja melalui menu Profil & Pengaturan di sidebar.",
      icon: Settings,
      iconBg: "bg-purple-100 text-purple-700",
      highlight:
        "Semua riwayat nilai, pembelian tiket, dan progres tryoutmu tetap aman tersimpan di masing-masing jalur.",
    },
    {
      title: "Simulasi Tryout & Analitik Akurat 📊",
      badge: "Sistem CAT & IRT Resmi",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      description:
        "Beli paket tiket tryout, kerjakan simulasi dengan timer perpindahan subtes realistis, dan pantau grafik evaluasi serta ambang batas kelulusan di Beranda.",
      icon: Award,
      iconBg: "bg-emerald-100 text-emerald-700",
      highlight:
        "Kunci pembahasan mendalam dan analisis butir soal tersedia lengkap setelah kamu menyelesaikan tryout.",
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-2 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_#0f172a] bg-white">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3">
            <StepIcon className="w-8 h-8 text-orange-300" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {current.title}
          </DialogTitle>
          <div className="mt-2 flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${current.badgeClass}`}>
              {current.badge}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 space-y-5">
          <DialogDescription className="text-sm sm:text-base text-slate-700 leading-relaxed text-center">
            {current.description}
          </DialogDescription>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-slate-800">
              {current.highlight}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-8 bg-slate-900"
                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Pindah ke langkah ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="rounded-xl border-2 border-slate-900 font-bold text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Kembali
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Lewati Panduan
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-[2px_2px_0px_0px_#0f172a]"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-[2px_2px_0px_0px_#0f172a]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Mulai Belajar! 🚀</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
