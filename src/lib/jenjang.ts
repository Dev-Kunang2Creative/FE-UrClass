import type { Kategori } from "@/lib/kategori";

/**
 * Jenjang pendidikan peserta, sejajar dengan App\Support\Jenjang di backend.
 *
 * Daftarnya berbeda menurut jalur, dan itu disengaja:
 *
 * - **UTBK** hanya melayani siswa SMA dan lulusannya yang mengulang seleksi.
 *   "Gap Year" adalah istilah yang tepat dan paling dikenali di sana.
 * - **CPNS** melayani dua audiens sekaligus: siswa SMA yang membidik sekolah
 *   kedinasan, dan wisudawan yang melamar CPNS umum. Menyebut wisudawan "gap
 *   year" jelas keliru - orang yang sudah lulus kuliah bukan sedang menunda
 *   kuliah - jadi di jalur ini istilahnya "Lulusan SMA/SMK", dan tersedia pula
 *   jenjang pendidikan tinggi beserta jurusannya.
 */
export const JENJANG_SMA = "SMA/SMK";
export const JENJANG_GAP_YEAR = "Gap Year";
export const JENJANG_LULUSAN_SMA = "Lulusan SMA/SMK";
export const JENJANG_PENDIDIKAN_TINGGI = ["D3", "D4", "S1", "S2"] as const;

export const KELAS_SMA = ["Kelas 10", "Kelas 11", "Kelas 12"] as const;

export function jenjangOptions(kategori: Kategori): string[] {
  return kategori === "cpns"
    ? [JENJANG_SMA, JENJANG_LULUSAN_SMA, ...JENJANG_PENDIDIKAN_TINGGI]
    : [JENJANG_SMA, JENJANG_GAP_YEAR];
}

/** Jenjang pendidikan tinggi menyertakan jurusan; SMA tidak. */
export function butuhJurusan(jenjang: string | null | undefined): boolean {
  return (JENJANG_PENDIDIKAN_TINGGI as readonly string[]).includes(
    String(jenjang ?? "").trim(),
  );
}

/**
 * Asal pendidikan seorang peserta jatuh ke salah satu dari dua kelompok:
 * sekolah (SMA/SMK, lulusannya, gap year) atau kampus (D3 ke atas).
 *
 * Kolom "asal sekolah" berganti arti saat peserta pindah kelompok - nama SMA
 * tidak lagi menjawab pertanyaan "asal kampus". Di dalam satu kelompok artinya
 * tetap: siswa kelas 12 yang lulus masih berasal dari sekolah yang sama, dan
 * lulusan S1 yang lanjut S2 bisa saja di kampus yang sama.
 */
export type KelompokJenjang = "sekolah" | "kampus";

export function kelompokJenjang(jenjang: string | null | undefined): KelompokJenjang {
  return butuhJurusan(jenjang) ? "kampus" : "sekolah";
}

/** Hanya siswa SMA aktif yang memilih kelas. */
export function butuhKelas(jenjang: string | null | undefined): boolean {
  return String(jenjang ?? "").trim() === JENJANG_SMA;
}

/**
 * Jenjang yang tersimpan diubah kembali jadi pilihan di form.
 *
 * Kolomnya menampung "SMA/SMK Kelas 12" sebagai satu string, jadi bagian
 * kelasnya dipisahkan lagi saat dimuat. Nilai lama "Gap Year" pada akun CPNS
 * dipetakan ke "Lulusan SMA/SMK", yang artinya sama di jalur itu - kalau tidak,
 * pilihannya tidak akan cocok dengan opsi mana pun dan tampil kosong.
 */
export function bacaJenjangTersimpan(
  tersimpan: string | null | undefined,
  kategori: Kategori,
): { jenjang: string; kelas: string } {
  const nilai = String(tersimpan ?? "").trim();

  if (nilai.startsWith(JENJANG_SMA)) {
    const kelas = nilai.slice(JENJANG_SMA.length).trim();
    return {
      jenjang: JENJANG_SMA,
      kelas: (KELAS_SMA as readonly string[]).includes(kelas) ? kelas : "Kelas 12",
    };
  }

  if (butuhJurusan(nilai)) {
    return { jenjang: nilai, kelas: "" };
  }

  if (nilai === JENJANG_GAP_YEAR || nilai === JENJANG_LULUSAN_SMA) {
    return {
      jenjang: kategori === "cpns" ? JENJANG_LULUSAN_SMA : JENJANG_GAP_YEAR,
      kelas: "",
    };
  }

  return { jenjang: JENJANG_SMA, kelas: "Kelas 12" };
}

/** Bentuk yang disimpan: kelas ikut hanya untuk siswa SMA aktif. */
export function susunJenjangTersimpan(jenjang: string, kelas: string | null | undefined): string {
  return butuhKelas(jenjang) ? `${jenjang} ${kelas ?? ""}`.trim() : jenjang;
}
