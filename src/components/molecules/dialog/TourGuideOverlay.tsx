"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { X, ArrowDown, ArrowUp, ArrowRight, CheckCircle2 } from "lucide-react";

export default function TourGuideOverlay() {
  const { data: session } = useSession();
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const userId = session?.user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      targetId: "hero-track-banner",
      title: `Mode Belajar Aktif: ${config.label}`,
      description: `Halo! Saat ini kamu sedang berada di Mode Belajar ${config.label} (${config.full}). Seluruh latihan, tryout bertimer, dan analitik nilai disesuaikan untuk jalur ini.`,
      arrowPosition: "down",
    },
    {
      targetId: "topbar-user-profile",
      title: "Ganti Mode Kapan Saja di Profil",
      description: "Mau pindah jalur belajar ke CPNS atau UTBK? Kamu bisa dengan mudah merubah mode kapan saja lewat menu Profil & Pengaturan di pojok kanan atas ini.",
      arrowPosition: "up",
    },
    {
      targetId: "dashboard-stats-card",
      title: "Simulasi & Analisis Nilai",
      description: "Mulai simulasi tryoutmu, dapatkan pembahasan mendalam, dan pantau grafik capaian skor kelulusanmu di kartu evaluasi ini.",
      arrowPosition: "down",
    },
  ];

  useEffect(() => {
    if (!userId) return;
    const key = `urclass_tour_guide_seen_${userId}`;
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen, currentStep]);

  const handleFinish = () => {
    if (userId) {
      localStorage.setItem(`urclass_tour_guide_seen_${userId}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      {/* Dark semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={handleFinish}
      />

      {/* Top right close (X) button with circular badge */}
      <button
        type="button"
        onClick={handleFinish}
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white border-2 border-slate-500 transition-all hover:scale-110 shadow-2xl cursor-pointer"
        aria-label="Tutup petunjuk"
      >
        <X className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Center Instruction Card (SSO Undip Style) */}
      <div className="relative z-50 max-w-xl w-full mx-4 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top arrow if target is above */}
        {current.arrowPosition === "up" && (
          <div className="animate-bounce flex flex-col items-center mb-1">
            <svg
              className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
        )}

        {/* Text Message Block */}
        <div className="space-y-2 px-4 max-w-lg">
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow-md">
            {current.description}
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            {currentStep < steps.length - 1 ? (
              <>Klik <strong className="text-orange-400">"Lanjut"</strong> untuk melanjutkan.</>
            ) : (
              <>Klik <strong className="text-orange-400">"Mulai Belajar"</strong> untuk menutup panduan.</>
            )}
          </p>
        </div>

        {/* Action Buttons: Yellow Lanjut & Slate Ghost Sudahi Petunjuk */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {currentStep < steps.length - 1 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-8 py-2.5 rounded-full bg-[#f97316] hover:bg-[#c2410c] active:bg-[#9a3412] text-black font-extrabold text-sm shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                Lanjut
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-400 font-semibold text-sm transition-all cursor-pointer shadow-md"
              >
                Sudahi petunjuk.
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-3 rounded-full bg-[#f97316] hover:bg-[#c2410c] active:bg-[#9a3412] text-black font-black text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>Sudah Mengerti, Mulai Belajar! 🚀</span>
            </button>
          )}
        </div>

        {/* Down arrow pointing straight down to the highlighted element */}
        {current.arrowPosition === "down" && (
          <div className="animate-bounce flex flex-col items-center pt-2">
            <svg
              className="w-12 h-12 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}

      </div>
    </div>
  );
}
