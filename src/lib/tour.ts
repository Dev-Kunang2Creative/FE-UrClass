"use client";

/**
 * Membuka ulang panduan awal dari mana saja.
 *
 * TourGuideOverlay hanya terpasang di beranda siswa, karena elemen yang
 * disorotnya - banner mode belajar dan kartu statistik - memang hanya ada di
 * sana. Jadi permintaan dari halaman lain perlu dititipkan: sessionStorage
 * menampungnya melewati perpindahan halaman, sementara event menangani kasus
 * pengguna yang sudah berada di beranda, di mana tidak ada perpindahan apa pun
 * yang akan memasang ulang komponennya.
 */
export const TOUR_REQUEST_EVENT = "urclass:tour-restart";
export const TOUR_REQUEST_KEY = "urclass:tour-restart";

export function requestTour() {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(TOUR_REQUEST_KEY, "1");
  window.dispatchEvent(new Event(TOUR_REQUEST_EVENT));
}

/** Dipakai TourGuideOverlay saat dipasang: benar ketika ada permintaan tertunda. */
export function consumeTourRequest(): boolean {
  if (typeof window === "undefined") return false;

  const requested = window.sessionStorage.getItem(TOUR_REQUEST_KEY) === "1";
  if (requested) window.sessionStorage.removeItem(TOUR_REQUEST_KEY);

  return requested;
}
