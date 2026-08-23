import type { NextConfig } from "next";
 
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://app.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: http://127.0.0.1:8000 http://localhost:8000 https://*.amunisiptn.com https://prod-api.urclass.id https://api.urclass.id https://*.googleusercontent.com;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https://challenges.cloudflare.com https://*.amunisiptn.com https://prod-api.urclass.id https://api.urclass.id https://app.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com;
  frame-src 'self' https://challenges.cloudflare.com https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com;
  frame-ancestors 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Production backend. Without this entry next/image refuses every
        // uploaded image (package thumbnails, question images, payment proofs).
        protocol: "https",
        hostname: "prod-api.urclass.id",
        pathname: "/storage/**",
      },
      {
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
        ],
      },
    ];
  },
};

export default nextConfig;
