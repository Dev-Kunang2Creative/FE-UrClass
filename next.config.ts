import type { NextConfig } from "next";

/**
 * Origin backend menurut env, mis. "https://dev-api.urclass.id".
 *
 * Diturunkan, tidak ditulis tangan. Setiap host backend baru harus terdaftar di
 * **tiga** tempat di berkas ini - remotePatterns, img-src, dan connect-src - dan
 * itu sudah gagal sekali: `dev-api.urclass.id` naik tanpa masuk satu pun dari
 * ketiganya, sehingga next/image menolak setiap gambar soal dengan 400 `"url"
 * parameter is not allowed`. Gejalanya di layar cuma gambar yang tidak muncul,
 * tanpa petunjuk apa pun bahwa sebabnya ada di konfigurasi ini - dan dugaan
 * pertama siapa pun adalah `php artisan storage:link` yang belum dijalankan.
 *
 * next.config dievaluasi saat build, dan NEXT_PUBLIC_* memang sudah tersedia di
 * saat itu - itulah cara Next menanamkannya ke bundel. Kalau env-nya tidak ada
 * atau tidak bisa diurai, nilainya null dan daftar eksplisit di bawah yang
 * berlaku.
 */
const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL;

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
})();

/** Entri remotePatterns untuk origin backend, kalau ada. */
const apiImagePattern = (() => {
  if (!apiOrigin) {
    return [];
  }

  const url = new URL(apiOrigin);

  return [
    {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/storage/**",
    },
  ];
})();

/** Ditambahkan ke direktif CSP, dengan spasi di depan supaya aman digabung. */
const apiCsp = apiOrigin ? ` ${apiOrigin}` : "";
 
// api-sekolah-indonesia.vercel.app ada di connect-src karena pencarian asal
// sekolah memanggilnya langsung dari browser. Tanpa entri itu permintaannya
// diblokir CSP tanpa pesan apa pun di UI - kolomnya sekadar tidak pernah
// menemukan sekolah mana pun, persis seperti kalau datanya memang kosong.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://app.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: http://127.0.0.1:8000 http://localhost:8000 https://*.amunisiptn.com https://prod-api.urclass.id https://dev-api.urclass.id https://api.urclass.id https://*.googleusercontent.com${apiCsp};
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https://challenges.cloudflare.com https://*.amunisiptn.com https://prod-api.urclass.id https://dev-api.urclass.id https://api.urclass.id https://app.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com https://api-sekolah-indonesia.vercel.app${apiCsp};
  frame-src 'self' https://challenges.cloudflare.com https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com;
  frame-ancestors 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  ${process.env.NODE_ENV === "production" ? "upgrade-insecure-requests;" : ""}
`.replace(/\s{2,}/g, " ").trim();

// app-dev.urclass.id is publicly reachable, so it must not end up in search
// results. Keyed on an env var rather than the hostname because next.config is
// evaluated at build time, when the request host is not knowable.
const isDevDeployment = process.env.NEXT_PUBLIC_DEPLOY_ENV === "development";

const noIndexHeaders = isDevDeployment
  ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
  : [];

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        // Production backend. Without this entry next/image refuses every
        // uploaded image (package thumbnails, question images, payment proofs).
        protocol: "https",
        hostname: "prod-api.urclass.id",
        pathname: "/storage/**",
      },
      {
        // Backend dev UrClass. Tanpa entri ini next/image menolak setiap gambar
        // soal dengan 400, dan yang terlihat di layar hanya gambar yang tidak
        // muncul - tanpa satu pun pesan yang menyebut konfigurasi ini.
        protocol: "https",
        hostname: "dev-api.urclass.id",
        pathname: "/storage/**",
      },
      {
        // Proyek pendahulu (Amunisi). Dibiarkan supaya data lama yang masih
        // menunjuk ke host ini tetap tampil.
        protocol: "https",
        hostname: "dev-api.amunisiptn.com",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "staging-api.amunisiptn.com",
        pathname: "/storage/**",
      },
      // Host backend menurut env. Membuat lingkungan baru bekerja tanpa menyunting
      // berkas ini - lihat catatan di apiOrigin.
      ...apiImagePattern,
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          ...noIndexHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
