/**
 * Memuat snap.js dari lingkungan yang menerbitkan tokennya.
 *
 * Token Snap hanya berlaku di lingkungan yang menerbitkannya. Sebelumnya
 * halaman memuat snap.js berdasarkan NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION miliknya
 * sendiri, sementara backend menerbitkan token berdasarkan MIDTRANS_IS_PRODUCTION
 * miliknya - dua saklar terpisah yang harus kebetulan sama. Begitu berbeda,
 * Snap menjawab "Transaksi tidak ditemukan" atas token yang sebenarnya sah,
 * dan pesan itu tidak menyebut sedikit pun bahwa sebabnya salah lingkungan.
 *
 * Sekarang keputusannya datang bersama tokennya, jadi keduanya tidak mungkin
 * berbeda. Nilai NEXT_PUBLIC_* dipakai hanya sebagai cadangan untuk backend
 * lama yang belum mengirimkan blok `snap`.
 */

const SNAP_URL = {
  production: "https://app.midtrans.com/snap/snap.js",
  sandbox: "https://app.sandbox.midtrans.com/snap/snap.js",
} as const;

export interface SnapEnvironment {
  is_production: boolean;
  client_key: string;
}

const ATTR = "data-urclass-snap";

function envCadangan(): SnapEnvironment {
  return {
    is_production: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
    client_key: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
  };
}

/**
 * Menjamin snap.js yang benar sudah termuat, lalu mengembalikan window.snap.
 *
 * Menolak (bukan diam-diam memakai yang lama) kalau skripnya gagal dimuat,
 * supaya pemanggilnya bisa mengatakan apa yang salah alih-alih membiarkan
 * peserta menatap tombol bayar yang tidak melakukan apa-apa.
 */
type SnapInstance = Window["snap"];

export function loadSnap(env?: SnapEnvironment | null): Promise<SnapInstance> {
  const { is_production, client_key } = env ?? envCadangan();
  const src = is_production ? SNAP_URL.production : SNAP_URL.sandbox;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Snap hanya bisa dimuat di browser."));
      return;
    }

    const terpasang = document.querySelector<HTMLScriptElement>(`script[${ATTR}]`);

    // Sudah ada dan lingkungannya sama - tidak perlu memuat ulang.
    if (terpasang && terpasang.src === src && window.snap) {
      resolve(window.snap);
      return;
    }

    // Ada, tapi dari lingkungan lain. Snap menempel ke window.snap, jadi yang
    // lama harus dilepas dulu supaya tidak ada dua versi yang berebut.
    if (terpasang && terpasang.src !== src) {
      terpasang.remove();
      delete (window as Partial<Window>).snap;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute(ATTR, "");
    script.setAttribute("data-client-key", client_key);
    script.onload = () => {
      if (window.snap) resolve(window.snap);
      else reject(new Error("snap.js termuat tetapi window.snap tidak tersedia."));
    };
    script.onerror = () =>
      reject(new Error("Gagal memuat snap.js dari server pembayaran."));

    document.body.appendChild(script);
  });
}
