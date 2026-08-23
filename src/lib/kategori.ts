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
    label: "CPNS",
    full: "CPNS - SKD & Kedinasan",
    deskripsi: "Seleksi Calon Aparatur Sipil Negara",
    icon: Landmark,
    tagline: "Siapkan SKD terpadu: TWK, TIU, dan TKP lengkap dengan standar Passing Grade CAT resmi.",
    heading: "Persiapan intensif target lolos SKD CPNS & Kedinasan",
    maxScore: 550,
    scoreScale: "Standar SKD CAT (Maks. 550)",
    theme: {
      accent: "bg-amber-50 text-amber-800 border-amber-200",
      badge: "bg-amber-100 text-amber-900 border-amber-300",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
      cardBorder: "border-amber-200 hover:border-amber-400",
      cardBg: "bg-gradient-to-br from-amber-50/60 to-orange-50/40",
      statIcon: "text-amber-700 bg-amber-50 border-amber-200",
      statCard: "border-amber-300 hover:border-amber-500 shadow-[4px_4px_0px_0px_#b45309]",
      dot: "bg-amber-600",
      progress: "bg-amber-600",
      switcherActive: "bg-amber-600 text-white shadow-sm",
    },
    subtests: [
      { name: "Tes Wawasan Kebangsaan (TWK)", code: "TWK", passingGrade: 65, maxScore: 150, description: "Pancasila, UUD 1945, NKRI, Bela Negara, Bahasa Indo" },
      { name: "Tes Inteligensi Umum (TIU)", code: "TIU", passingGrade: 80, maxScore: 175, description: "Verbal, Numerik, Logika Berhitung & Figural" },
      { name: "Tes Karakteristik Pribadi (TKP)", code: "TKP", passingGrade: 166, maxScore: 225, description: "Integritas, Pelayanan Publik, Sosbud, Profesionalisme" },
    ],
  },
};

export const KATEGORI_LIST = ["utbk", "cpns"] as const;

export function isKategori(value: unknown): value is Kategori {
  return value === "utbk" || value === "cpns";
}
