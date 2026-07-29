import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
        protocol: "https",
        hostname: "staging-api.amunisiptn.com",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
