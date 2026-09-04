import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import GlobalProvider from "@/components/providers/GlobalProvider";
import Script from "next/script";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  // UrClass hanya punya dua jalur: UTBK dan CPNS. Judul sebelumnya menyebut SNBP
  // dan UM PTN - dua hal yang tidak ada di aplikasi ini - jadi orang yang datang
  // dari pencarian itu tidak menemukan apa yang dijanjikan judulnya.
  title: "UrClass - UTBK dan CPNS Tryout",
  description:
    "UrClass adalah platform tryout untuk persiapan UTBK dan CPNS. Simulasi ujian real-time, pembahasan lengkap langkah demi langkah, papan peringkat, dan analitik progress untuk target PTN dan ASN impianmu.",
  keywords: [
    "tryout utbk",
    "tryout cpns",
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
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "UrClass - UTBK dan CPNS Tryout",
    description:
      "Simulasi ujian real-time, pembahasan detail langkah demi langkah, dan analitik performa untuk target lolos PTN & ASN impianmu.",
    url: "https://urclass.id",
    siteName: "UrClass",
    images: [
      {
        url: "/images/logo/urclass.png",
        width: 1200,
        height: 630,
        alt: "UrClass - UTBK dan CPNS Tryout",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UrClass - UTBK dan CPNS Tryout",
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
  const midtransUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang="id">
      <body className={`${rubik.variable} antialiased font-rubik`}>
        <Script
          src={midtransUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
