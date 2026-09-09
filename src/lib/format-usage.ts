/**
 * Pemformat angka untuk pemantauan pemakaian AI.
 *
 * Angka besar dipadatkan (4.509.641.951 -> 4,51 M) karena nilai penuh di kartu
 * statistik tidak bisa dibaca sekilas - dan sekilas itulah gunanya kartu
 * statistik. Nilai penuhnya tetap tersedia lewat atribut title.
 */

/** 1.284 -> "1.284" · 12.900 -> "12,9 rb" · 4.509.641.951 -> "4,51 M" */
export function compactNumber(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} M`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} jt`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(1)} rb`;

  return value.toLocaleString("id-ID");
}

export function fullNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

/**
 * Biaya dalam Rupiah, dengan presisi yang menyesuaikan besarnya.
 *
 * Satu permintaan bisa berbiaya Rp 4,55 sementara total sebulan bisa jutaan.
 * Memakai satu format untuk keduanya berarti salah satunya jadi tidak terbaca:
 * dua desimal pada angka juta hanya ramai, dan nol desimal pada biaya satu
 * permintaan membuatnya tampil "Rp 5" - kehilangan justru bagian yang dipakai
 * untuk membandingkan antar permintaan.
 *
 * Angka besar dipadatkan karena kartu statistik dibaca sekilas; nilai penuhnya
 * tetap tersedia lewat atribut title.
 */
export function formatRupiah(value: number, opsi?: { compact?: boolean }): string {
  const abs = Math.abs(value);

  if (abs === 0) return "Rp 0";

  // Di bawah seratus rupiah, desimalnya yang membedakan satu permintaan dari
  // yang lain.
  if (abs < 100) {
    return `Rp ${value.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (opsi?.compact) {
    if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
    if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(2)} jt`;
    if (abs >= 100_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  }

  return `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

/** Nilai penuh tanpa pemadatan, untuk atribut title. */
export function fullRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Label sumbu x: jam saja untuk ember per jam, tanggal untuk ember harian. */
export function bucketLabel(bucket: string, granularity: "hour" | "day"): string {
  const date = new Date(bucket.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return bucket;

  return granularity === "hour"
    ? date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function bucketTitle(bucket: string, granularity: "hour" | "day"): string {
  const date = new Date(bucket.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return bucket;

  return granularity === "hour"
    ? date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    : date.toLocaleDateString("id-ID", { dateStyle: "full" });
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1000) return `${ms} ms`;

  return `${(ms / 1000).toFixed(1)} s`;
}
