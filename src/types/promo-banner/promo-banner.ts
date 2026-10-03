/** Jalur tempat sebuah banner muncul. "semua" berarti kedua jalur. */
export type BannerKategori = "semua" | "utbk" | "cpns";

export interface PromoBanner {
  id: string;
  image: string;
  image_url: string | null;
  alt: string;
  href: string;
  kategori: BannerKategori;
  order_no: number;
  is_active: boolean;
}
