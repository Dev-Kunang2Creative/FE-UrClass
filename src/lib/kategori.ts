import { BookOpenCheck, Landmark, type LucideIcon } from "lucide-react";

export type Kategori = "utbk" | "cpns";

export const KATEGORI_CONFIG: Record<
  Kategori,
  {
    label: string;
    full: string;
    deskripsi: string;
    icon: LucideIcon;
    tagline: string;
    heading: string;
    maxScore: number;
    scoreScale: string;
    theme: {
      accent: string;
      badge: string;
      btn: string;
      cardBorder: string;
      cardBg: string;
      statIcon: string;
      statCard: string;
      dot: string;
      progress: string;
      switcherActive: string;
    };
    subtests: {
      name: string;
      code: string;
      passingGrade?: number;
      maxScore: number;
      description: string;
    }[];
  }
> = {
  utbk: {
    label: "UTBK",
    full: "UTBK - SNBT",
    deskripsi: "Seleksi Masuk Perguruan Tinggi Negeri",
    icon: BookOpenCheck,
    tagline: "Kejar kampus impianmu lewat latihan TPS, Literasi, dan Penalaran Matematika.",
    heading: "Persiapan intensif target lolos UTBK - SNBT",
    maxScore: 1000,
    scoreScale: "Skala IRT (0 - 1000)",
    theme: {
      accent: "bg-blue-50 text-blue-700 border-blue-200",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
      cardBorder: "border-blue-200 hover:border-blue-400",
      cardBg: "bg-gradient-to-br from-blue-50/60 to-indigo-50/40",
      statIcon: "text-blue-600 bg-blue-50 border-blue-200",
      statCard: "border-blue-200 hover:border-blue-400 shadow-[4px_4px_0px_0px_#1d4ed8]",
      dot: "bg-blue-600",
      progress: "bg-blue-600",
      switcherActive: "bg-blue-600 text-white shadow-sm",
    },
    subtests: [
      { name: "Penalaran Umum (PU)", code: "PU", maxScore: 1000, description: "Logika analitis, induktif & deduktif" },
      { name: "Pengetahuan Kuantitatif (PK)", code: "PK", maxScore: 1000, description: "Kecakapan matematika dasar & logika angka" },
      { name: "Pemahaman Bacaan & Menulis (PBM)", code: "PBM", maxScore: 1000, description: "Ejaan baku, kalimat efektif, struktur wacana" },
      { name: "Pengetahuan & Pemahaman Umum (PPU)", code: "PPU", maxScore: 1000, description: "Kosakata, konteks bahasa, makna tersirat" },
      { name: "Literasi Bahasa Indonesia", code: "LBI", maxScore: 1000, description: "Analisis teks saintifik, sosial & naratif" },
      { name: "Literasi Bahasa Inggris", code: "LBE", maxScore: 1000, description: "Comprehension, inference & argument analysis" },
      { name: "Penalaran Matematika", code: "PM", maxScore: 1000, description: "Pemecahan masalah matematis kontekstual" },
    ],
  },
  cpns: {
    // Pil di sidebar ikut menyebut kedinasan atas permintaan pengguna: peserta
    // sekolah kedinasan perlu melihat jalurnya sendiri di sana, bukan cuma
    // "CPNS". Akronim SEKDIN menjaga labelnya tetap ringkas di ruang sempit.
    label: "SEKDIN & CPNS",
    full: "SEKDIN & CPNS - SKD",
    deskripsi: "Seleksi Sekolah Kedinasan & Calon Aparatur Sipil Negara",
    icon: Landmark,
    tagline: "Siapkan SKD terpadu untuk sekolah kedinasan maupun CPNS: TWK, TIU, dan TKP lengkap dengan standar Passing Grade CAT resmi.",
    heading: "Persiapan intensif target lolos SKD sekolah kedinasan & CPNS",
    maxScore: 550,
    scoreScale: "Standar SKD CAT (Maks. 550)",
    // Indigo - biru tua keunguan - bukan oranye seperti sebelumnya. Diminta
    // pengguna supaya kedua jalur sama-sama biru: UTBK biru terang, CPNS biru
    // gelap.
    //
    // Karena hue tidak lagi memisahkan kedua jalur, yang membedakannya tinggal
    // jarak terang-gelapnya. Jadi nada padat di sini sengaja diambil dari
    // langkah yang jauh lebih gelap daripada blue-600/700 milik UTBK, dan
    // jangan dinaikkan terangnya tanpa menggelapkan UTBK lebih dulu - kalau
    // keduanya bertemu di tengah, peserta tidak lagi bisa menebak sedang di
    // jalur mana hanya dari warnanya.
    //
    // Yang membawa teks putih memakai indigo-800 (#3730a3, 9.93:1) dan
    // indigo-900 (#312e81), dua-duanya jauh melewati WCAG AA.
    theme: {
      accent: "bg-indigo-50 text-indigo-900 border-indigo-200",
      badge: "bg-indigo-100 text-indigo-950 border-indigo-300",
      btn: "bg-indigo-800 hover:bg-indigo-900 text-white",
      cardBorder: "border-indigo-200 hover:border-indigo-400",
      cardBg: "bg-gradient-to-br from-indigo-50/70 to-slate-100/50",
      statIcon: "text-indigo-800 bg-indigo-50 border-indigo-200",
      statCard: "border-indigo-300 hover:border-indigo-500 shadow-[4px_4px_0px_0px_#312e81]",
      dot: "bg-indigo-700",
      progress: "bg-indigo-700",
      switcherActive: "bg-indigo-800 text-white shadow-sm",
    },
    subtests: [
      { name: "Tes Wawasan Kebangsaan (TWK)", code: "TWK", maxScore: 150, description: "Pancasila, UUD 1945, NKRI, Bela Negara, Bahasa Indo" },
      { name: "Tes Inteligensi Umum (TIU)", code: "TIU", maxScore: 175, description: "Verbal, Numerik, Logika Berhitung & Figural" },
      { name: "Tes Karakteristik Pribadi (TKP)", code: "TKP", maxScore: 225, description: "Integritas, Pelayanan Publik, Sosbud, Profesionalisme" },
    ],
  },
};

export const KATEGORI_LIST = ["utbk", "cpns"] as const;

export function isKategori(value: unknown): value is Kategori {
  return value === "utbk" || value === "cpns";
}

/**
 * The reader current track: the session value when it is loaded, otherwise the
 * one the server already resolved. Shared so the CSS variables on data-track
 * and the hooks that read the config can never disagree about which track is
 * being shown.
 */
export function resolveKategori(raw: unknown, fallback: Kategori | null): Kategori {
  if (isKategori(raw)) return raw;
  return fallback ?? "utbk";
}

/**
 * Match a subtest name coming from the API to its config entry, so the exam
 * screen can show the metric that track actually cares about: a passing grade
 * for CPNS, the IRT scale for UTBK.
 *
 * Matches on the code in parentheses first ("Tes Wawasan Kebangsaan (TWK)"),
 * since names get edited in the admin panel far more often than codes do.
 */
export function findSubtestMeta(kategori: Kategori, subtestName: string) {
  const list = KATEGORI_CONFIG[kategori].subtests;
  const haystack = subtestName.toUpperCase();

  return (
    list.find((s) => haystack.includes(`(${s.code})`)) ??
    list.find((s) => haystack.includes(s.code)) ??
    list.find((s) => s.name.toUpperCase() === haystack)
  );
}
