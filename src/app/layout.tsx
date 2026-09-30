import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import GlobalProvider from "@/components/providers/GlobalProvider";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  // UrClass hanya punya dua mode: UTBK serta SEKDIN & CPNS. Judul sebelumnya
  // menyebut SNBP dan UM PTN, dua hal yang tidak ada di aplikasi ini.
  title: "UrClass | Tryout UTBK & SEKDIN & CPNS",
  description:
    "Platform tryout untuk persiapan UTBK, sekolah kedinasan, dan CPNS dengan simulasi ujian, pembahasan, papan peringkat, dan analitik progres.",
  keywords: [
    "tryout utbk",
    "tryout cpns",
    "tryout sekolah kedinasan",
    "tryout sekdin",
    "simulasi utbk",
    "simulasi cpns",
    "latihan soal utbk",
    "latihan soal cpns",
    "bank soal utbk",
    "bank soal cpns",
    "materi utbk dan pembahasan",
    "persiapan utbk",
    "persiapan cpns",
    "UrClass",
    "platform tryout indonesia",
  ],
  authors: [{ name: "UrClass", url: "https://urclass.id" }],
  applicationName: "UrClass",
  metadataBase: new URL("https://urclass.id"),
  alternates: {
    canonical: "https://urclass.id",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "UrClass | Tryout UTBK & SEKDIN & CPNS",
    description:
      "Simulasi ujian, pembahasan langkah demi langkah, dan analitik hasil untuk target PTN, sekolah kedinasan, dan ASN.",
    url: "https://urclass.id",
    siteName: "UrClass",
    images: [
      {
        url: "/images/logo/urclass.png",
        width: 1200,
        height: 630,
        alt: "UrClass, tryout UTBK, sekolah kedinasan, dan CPNS",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UrClass | Tryout UTBK & SEKDIN & CPNS",
    description:
      "Simulasi ujian real-time, pembahasan lengkap, dan analitik akurasi di UrClass.",
    creator: "@UrClass",
    images: ["/images/logo/urclass.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // snap.js tidak lagi dimuat di sini. Lingkungannya ditentukan backend yang
  // menerbitkan tokennya dan dikirim bersama token itu, lalu dimuat saat
  // pembayaran dimulai - lihat src/lib/midtrans-snap.ts. Memuatnya di layout
  // berarti menebak lingkungan sebelum ada token yang perlu dibayar, dan
  // tebakan itulah yang menghasilkan "Transaksi tidak ditemukan".
  return (
    <html lang="id">
      <body className={`${rubik.variable} antialiased font-rubik`}>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
