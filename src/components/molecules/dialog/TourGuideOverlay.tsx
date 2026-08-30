"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { X, CheckCircle2 } from "lucide-react";
import { TOUR_REQUEST_EVENT, consumeTourRequest } from "@/lib/tour";

/** Jarak kartu ke elemen yang disorot, dan ke tepi layar. */
const GAP = 14;
const EDGE = 16;
const CARD_WIDTH = 420;

interface Step {
  targetId: string;
  title: string;
  description: string;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const sameBox = (a: Box | null, b: Box) =>
  !!a &&
  Math.round(a.top) === Math.round(b.top) &&
  Math.round(a.left) === Math.round(b.left) &&
  Math.round(a.width) === Math.round(b.width) &&
  Math.round(a.height) === Math.round(b.height);

export default function TourGuideOverlay() {
  const { data: session } = useSession();
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const userId = session?.user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  /**
   * Posisi elemen yang sedang dijelaskan, dalam koordinat viewport.
   *
   * Sebelumnya kartu petunjuk selalu dipaku di tengah layar dan targetnya hanya
   * dipakai untuk scrollIntoView, jadi panah "ke bawah" menunjuk apa pun yang
   * kebetulan ada di bawahnya dan elemen yang dibicarakan ikut tergelapkan
   * seperti sisa halaman. Sekarang kartunya menempel ke elemennya.
   */
  const [box, setBox] = useState<Box | null>(null);
  const boxRef = useRef<Box | null>(null);

  /** Langkah yang elemennya benar-benar ada dan terlihat saat tur dibuka. */
  const [steps, setSteps] = useState<Step[]>([]);

  /**
   * Urutannya mengikuti jalan yang ditempuh pengguna baru: tahu sedang di jalur
   * apa, tahu menu apa saja yang ada di kiri, tahu tiket itu untuk apa, lalu
   * tahu di mana melihat hasilnya.
   *
   * Langkah yang elemennya tidak terlihat akan dilewati sendiri - sidebar
   * tersembunyi di layar kecil, dan tombol profil di top bar hanya muncul di
   * sana - jadi tidak ada langkah yang menyorot ruang kosong.
   */
  const allSteps = [
    {
      targetId: "hero-track-banner",
      title: `Mode Belajar Aktif: ${config.label}`,
      description: `Halo! Kamu sedang berada di Mode Belajar ${config.label} (${config.full}). Seluruh latihan, tryout bertimer, dan analitik nilai menyesuaikan jalur ini.`,
    },
    {
      targetId: "sidebar-nav",
      title: "Menu Utama Ada di Sini",
      description:
        "Semua halaman dijangkau lewat menu kiri ini: Beranda, Try Out, Pembelian Paket, Riwayat Tiket, dan Bantuan. Kita lihat satu per satu sebentar.",
    },
    {
      targetId: "sidebar-menu-tryout",
      title: "Try Out",
      description:
        "Daftar semua tryout yang bisa kamu ikuti. Di sini kamu mendaftar, mengerjakan, lalu melihat hasil dan pembahasannya.",
    },
    {
      targetId: "sidebar-menu-paket",
      title: "Pembelian Paket",
      description:
        "Tempat membeli paket tiket. Tiket inilah yang dipakai untuk mendaftar tryout premium.",
    },
    {
      targetId: "sidebar-menu-tiket",
      title: "Riwayat & Saldo Tiket",
      description:
        "Angka di sebelah kanan menu ini adalah sisa tiketmu. Satu tiket berlaku untuk satu kali pengerjaan tryout, jadi mengulang tryout yang sama memakai tiket lagi.",
    },
    {
      targetId: "sidebar-menu-bantuan",
      title: "Bantuan & CS",
      description:
        "Bingung atau ada kendala? Menu ini menghubungkanmu langsung ke tim kami lewat WhatsApp.",
    },
    {
      targetId: "dashboard-stats-card",
      title: "Statistik & Analisis Nilai",
      description:
        "Setelah mengerjakan tryout, capaian nilai dan grafik perkembanganmu muncul di kartu ini.",
    },
    {
      targetId: "sidebar-user-profile",
      title: "Profil & Ganti Mode Belajar",
      description:
        "Mau pindah jalur ke CPNS atau UTBK, atau melengkapi data diri? Semuanya lewat menu profil ini.",
    },
    {
      targetId: "topbar-user-profile",
      title: "Profil & Ganti Mode Belajar",
      description:
        "Mau pindah jalur ke CPNS atau UTBK, atau melengkapi data diri? Semuanya lewat menu profil di pojok kanan atas ini.",
    },
  ];

  const openTour = useCallback(() => {
    // Elemen yang tersembunyi tetap ada di DOM tapi berukuran nol - sidebar di
    // layar kecil, misalnya. Menyorotnya akan menghasilkan kotak sorot 0x0 di
    // pojok kiri atas, jadi langkahnya dibuang sekalian.
    const visible = allSteps.filter((step) => {
      const el = document.getElementById(step.targetId);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    if (visible.length === 0) return;

    setSteps(visible);
    setCurrentStep(0);
    setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.label, config.full]);

  // Otomatis, sekali saja, untuk pengguna yang belum pernah melihatnya.
  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(`urclass_tour_guide_seen_${userId}`)) return;

    const timer = setTimeout(openTour, 700);
    return () => clearTimeout(timer);
  }, [userId, openTour]);

  // Atas permintaan, lewat menu profil. Titipan sessionStorage menangani
  // permintaan dari halaman lain yang baru saja berpindah ke sini; event
  // menangani pengguna yang memang sudah berada di beranda.
  useEffect(() => {
    if (consumeTourRequest()) {
      const timer = setTimeout(openTour, 250);
      return () => clearTimeout(timer);
    }
  }, [openTour]);

  useEffect(() => {
    const onRequest = () => {
      if (consumeTourRequest()) openTour();
    };

    window.addEventListener(TOUR_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(TOUR_REQUEST_EVENT, onRequest);
  }, [openTour]);

  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    const el = step ? document.getElementById(step.targetId) : null;

    if (!el) {
      boxRef.current = null;
      setBox(null);
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const measure = () => {
      const r = el.getBoundingClientRect();
      const next = { top: r.top, left: r.left, width: r.width, height: r.height };
      if (sameBox(boxRef.current, next)) return;
      boxRef.current = next;
      setBox(next);
    };

    // scrollIntoView yang halus tidak punya event selesai, jadi elemennya
    // diikuti sebentar sampai berhenti bergerak.
    let frame = requestAnimationFrame(function follow() {
      measure();
      frame = requestAnimationFrame(follow);
    });
    const stop = setTimeout(() => cancelAnimationFrame(frame), 900);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stop);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentStep]);

  const handleFinish = useCallback(() => {
    if (userId) {
      localStorage.setItem(`urclass_tour_guide_seen_${userId}`, "true");
    }
    setIsOpen(false);
  }, [userId]);

  const current = steps[currentStep];

  if (!isOpen || !current) return null;

  const isLast = currentStep === steps.length - 1;

  // Ditaruh di sisi yang ruangnya lebih lega, supaya kartunya tidak pernah
  // terpotong tepi layar pada elemen yang dekat atas atau bawah.
  const viewportH = typeof window === "undefined" ? 0 : window.innerHeight;
  const viewportW = typeof window === "undefined" ? 0 : window.innerWidth;
  const placeBelow = box ? viewportH - (box.top + box.height) >= box.top : true;

  const half = Math.min(CARD_WIDTH, viewportW - EDGE * 2) / 2;
  const centerX = box ? box.left + box.width / 2 : viewportW / 2;
  const clampedX = Math.min(Math.max(centerX, half + EDGE), viewportW - half - EDGE);

  // Ekor kartu diletakkan tepat di bawah/atas titik tengah elemen, bukan di
  // tengah kartu: begitu kartu digeser agar tidak keluar layar, ekor yang
  // dipaku di tengah akan menunjuk ke sebelah elemennya, bukan ke elemennya.
  const tailLeft = Math.min(
    Math.max(centerX - (clampedX - half), 16),
    half * 2 - 16,
  );

  const cardStyle: React.CSSProperties = box
    ? {
        left: clampedX,
        transform: "translateX(-50%)",
        ...(placeBelow
          ? { top: box.top + box.height + GAP }
          : { bottom: viewportH - box.top + GAP }),
        maxWidth: `min(${CARD_WIDTH}px, calc(100vw - ${EDGE * 2}px))`,
      }
    : {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: `min(${CARD_WIDTH}px, calc(100vw - ${EDGE * 2}px))`,
      };

  return (
    <div className="fixed inset-0 z-50">
      {/* Penangkap klik untuk menutup, di bawah sorotan supaya sorotannya
          sendiri tidak ikut menangkap klik. */}
      <div className="fixed inset-0" onClick={handleFinish} />

      {box ? (
        /* Satu kotak dengan bayangan raksasa: bagian dalamnya bening, sisa
           layar tergelapkan. Elemen yang dijelaskan jadi satu-satunya yang
           terang, bukan ikut redup bersama seluruh halaman. */
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-2xl ring-4 ring-white/70 transition-all duration-300"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
            boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.82)",
          }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-slate-950/82" />
      )}

      <button
        type="button"
        onClick={handleFinish}
        className="fixed top-6 right-6 z-[60] cursor-pointer rounded-full border-2 border-slate-500 bg-slate-800/90 p-2 text-white shadow-2xl transition-all hover:scale-110 hover:bg-slate-700"
        aria-label="Tutup petunjuk"
      >
        <X className="h-6 w-6 stroke-[2.5]" />
      </button>

      <div
        role="dialog"
        aria-label={current.title}
        className="fixed z-[60] w-full animate-in fade-in zoom-in-95 duration-200"
        style={cardStyle}
      >
        {/* Ekor kartu, menunjuk ke elemen yang disorot. Arahnya mengikuti
            penempatan kartu, bukan nilai yang ditulis tangan per langkah -
            dulu keduanya bisa tidak sinkron dan panahnya menunjuk ke ruang
            kosong. */}
        {box && placeBelow && (
          <div
            className="h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-slate-900"
            style={{ marginLeft: tailLeft - 8 }}
          />
        )}

        <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a]">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Langkah {currentStep + 1} dari {steps.length}
          </p>
          <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
            {current.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {current.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isLast ? (
              <button
                type="button"
                onClick={handleFinish}
                className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-slate-900 bg-[#f97316] px-6 py-2.5 text-sm font-black text-black shadow-[3px_3px_0px_0px_#0f172a] transition-all active:translate-y-0.5 active:shadow-none"
              >
                <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                <span>Sudah Mengerti, Mulai Belajar! 🚀</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="cursor-pointer rounded-full border-2 border-slate-900 bg-[#f97316] px-7 py-2.5 text-sm font-extrabold text-black shadow-[3px_3px_0px_0px_#0f172a] transition-all active:translate-y-0.5 active:shadow-none"
              >
                Lanjut
              </button>
            )}

            {/* Panduan delapan langkah tanpa jalan mundur memaksa orang
                mengulang dari awal hanya karena satu langkah terlewat dibaca. */}
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="cursor-pointer rounded-full border-2 border-slate-900 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
              >
                Kembali
              </button>
            )}

            <button
              type="button"
              onClick={handleFinish}
              className="ml-auto cursor-pointer text-sm font-semibold text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-800"
            >
              Lewati
            </button>
          </div>
        </div>

        {box && !placeBelow && (
          <div
            className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-slate-900"
            style={{ marginLeft: tailLeft - 8 }}
          />
        )}
      </div>
    </div>
  );
}
