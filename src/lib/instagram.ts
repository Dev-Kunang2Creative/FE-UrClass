/**
 * Username Instagram peserta, sejajar dengan App\Support\AkunInstagram di
 * backend. Kalau keduanya menyimpang, peserta akan lolos di layar lalu ditolak
 * 422 - atau sebaliknya.
 */

/**
 * 1-30 huruf kecil, angka, titik, atau garis bawah; tidak diawali atau
 * diakhiri titik, dan tanpa dua titik berurutan.
 */
export const INSTAGRAM_REGEX = /^(?!\.)(?!.*\.\.)[a-z0-9._]{1,30}(?<!\.)$/;

export const INSTAGRAM_PESAN =
  "Username Instagram hanya boleh berisi huruf, angka, titik, dan garis bawah (maks. 30 karakter)";

/**
 * "@Nama.User", "nama.user", dan tautan profil dari tombol bagikan
 * ("https://www.instagram.com/nama.user/?igsh=...") semuanya jadi "nama.user".
 *
 * Mengembalikan string kosong kalau tidak diisi.
 */
export function normalkanInstagram(nilai: string | null | undefined): string {
  let teks = String(nilai ?? "").trim();

  const tautan = teks.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/([^/?#\s]+)/i,
  );
  if (tautan) teks = tautan[1];

  return teks.replace(/^@+/, "").toLowerCase();
}

export function tautanInstagram(username: string): string {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}
