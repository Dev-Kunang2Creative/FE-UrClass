import type { Kategori } from "@/lib/kategori";

/** Teks satu kartu pemilihan jalur, dikelola dari panel admin. */
export interface TrackCard {
  kategori: Kategori;
  title: string;
  badge: string;
  cta: string;
  description: string;
  features: string[];
}
