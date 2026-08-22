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
    /** Heading above the promo carousel. */
    heading: string;
    /**
     * Per-track theme. Written as complete class strings, never assembled from
     * fragments, so Tailwind's scanner can see them.
     */
    theme: {
      /** Badge/chip next to the user's name. */
      accent: string;
      /** Active pill in the kategori switcher. */
      switcherActive: string;
      /** Icon tint on the stat cards. */
      statIcon: string;
      /** Stat card border, at rest and on hover. */
      statCard: string;
      /** Active carousel dot. */
      dot: string;
    };
  }
> = {
  utbk: {
    label: "UTBK",
    full: "UTBK - SNBT",
    deskripsi: "Seleksi Masuk Perguruan Tinggi",
    icon: BookOpenCheck,
    tagline: "Kejar kampus impianmu lewat latihan TPS dan Literasi.",
    heading: "Buat amunisian yang mau kejar UTBK",
    theme: {
      accent: "bg-blue-50 text-blue-700 border-blue-200",
      switcherActive: "bg-blue-600 text-white",
      statIcon: "text-blue-600",
      statCard: "border-blue-100 hover:border-blue-300",
      dot: "bg-blue-600",
    },
  },
  cpns: {
    label: "CPNS",
    full: "CPNS - SKD",
    deskripsi: "Seleksi Calon Aparatur Sipil Negara",
    icon: Landmark,
    tagline: "Siapkan SKD-mu: TWK, TIU, dan TKP dalam satu tempat.",
    heading: "Buat amunisian yang mau lolos CPNS",
    theme: {
      accent: "bg-amber-50 text-amber-800 border-amber-200",
      switcherActive: "bg-amber-700 text-white",
      statIcon: "text-amber-700",
      statCard: "border-amber-100 hover:border-amber-300",
      dot: "bg-amber-700",
    },
  },
};

export const KATEGORI_LIST = ["utbk", "cpns"] as const;

export function isKategori(value: unknown): value is Kategori {
  return value === "utbk" || value === "cpns";
}
