/**
 * Tautan langsung ke bagian target di form profil.
 *
 * Kartu target di dashboard mengarah ke sini, supaya peserta tidak perlu
 * mencari sendiri: buka Pengaturan, tekan Edit Profil, lalu menggulir melewati
 * data diri sampai ketemu kolom targetnya. Ketiga nilainya sengaja disatukan di
 * satu berkas - yang membuat tautan dan yang membacanya harus sepakat.
 */
export const BAGIAN_TARGET = "target";

/** Parameter URL yang dibaca halaman Pengaturan. */
export const PARAM_UBAH = "ubah";

/** id elemen bagian target di form, tujuan guliran. */
export const ID_BAGIAN_TARGET = "profil-target";

export const UBAH_TARGET_HREF = `/dashboard/settings?${PARAM_UBAH}=${BAGIAN_TARGET}`;
