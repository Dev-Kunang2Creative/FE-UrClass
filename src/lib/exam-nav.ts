/**
 * Tampilan tombol nomor soal, dipakai bersama dua alur ujian.
 *
 * UTBK memakai ExamSidebar, CPNS memakai daftar nomornya sendiri di UjianCpns.
 * Keduanya sempat menyimpang: UTBK menandai soal terjawab dengan hijau,
 * sementara CPNS memakai varian tombol "secondary" yang abu-abunya nyaris tak
 * berbeda dari soal yang belum dijawab - sehingga di jalur itu indikatornya
 * seperti tidak ada sama sekali.
 *
 * Hijaunya sengaja harfiah, bukan mengikuti warna jalur: "sudah dijawab"
 * berarti hal yang sama di UTBK maupun CPNS, dan warna jalur sudah dipakai
 * untuk menandai soal yang sedang dibuka.
 */
export const NOMOR_SOAL_TERJAWAB = "bg-[#3B9245] text-white hover:bg-[#347c3b]";
export const NOMOR_SOAL_KOSONG = "bg-gray-100 text-gray-600 hover:bg-gray-200";
export const NOMOR_SOAL_AKTIF =
  "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2";

export function kelasNomorSoal(aktif: boolean, terjawab: boolean): string {
  if (aktif) return NOMOR_SOAL_AKTIF;
  return terjawab ? NOMOR_SOAL_TERJAWAB : NOMOR_SOAL_KOSONG;
}
