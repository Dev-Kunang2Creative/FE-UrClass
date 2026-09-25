/**
 * Pola masukan, sejajar dengan App\Support\AturanMasukan di backend.
 *
 * Kalau keduanya menyimpang, peserta akan lolos di layar lalu ditolak 422 -
 * atau sebaliknya ditolak di layar untuk sesuatu yang sebenarnya diterima
 * server. Setiap perubahan di sini harus diikuti di sana, dan sebaliknya.
 */

/**
 * Nama orang: huruf apa pun (termasuk beraksen), spasi, titik, tanda hubung.
 *
 * Wajib diawali huruf, jadi "@^^^^" dan "123" tertolak sejak karakter pertama.
 * Tanda petik sengaja tidak diizinkan; kalau suatu saat ada nama yang
 * memerlukannya, tambahkan "'" di kurung siku kedua di sini dan di backend.
 */
export const NAMA_REGEX = /^\p{L}[\p{L} .-]*$/u;
export const NAMA_MAKS = 100;
export const NAMA_PESAN =
  "Nama hanya boleh berisi huruf, spasi, titik, dan tanda hubung";

/** Teks bebas pendek: asal sekolah, kelas. Lebih longgar karena memuat angka. */
export const TEKS_PENDEK_REGEX = /^[\p{L}\d][\p{L}\d\s.,'\-/()]*$/u;

/** Nomor ponsel Indonesia dalam bentuk baku: +62, lalu 8, lalu 8-12 angka. */
export const TELEPON_REGEX = /^\+628\d{8,12}$/;
export const TELEPON_PESAN = "Nomor HP harus diawali +62 dan terdiri dari 11-15 angka";

/**
 * Mengubah nomor apa pun bentuknya jadi bentuk baku "+62...".
 *
 * Menerima "0812...", "62812...", "+62 812-3456-7890", dan "812...". Memaksa
 * peserta mengetik persis "+62" berarti menyalahkan mereka atas format padahal
 * nomornya sudah benar - jadi yang dinormalkan masukannya, bukan penggunanya.
 *
 * Mengembalikan string kosong kalau tidak ada angka sama sekali, supaya
 * pemanggilnya bisa membedakan "belum diisi" dari "diisi".
 */
export function keBentukInternasional(nilai: string | null | undefined): string {
  let angka = String(nilai ?? "").replace(/\D+/g, "");

  if (angka === "") return "";
  if (angka.startsWith("00")) angka = angka.slice(2);
  if (angka.startsWith("62")) angka = angka.slice(2);

  angka = angka.replace(/^0+/, "");

  return angka === "" ? "" : `+62${angka}`;
}

/** Bagian setelah "+62", untuk ditampilkan di kolom yang prefiksnya terpisah. */
export function bagianSetelahKodeNegara(nilai: string | null | undefined): string {
  const baku = keBentukInternasional(nilai);
  return baku === "" ? "" : baku.slice(3);
}
