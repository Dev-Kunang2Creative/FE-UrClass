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
  title: "UrClass - Tryout & Bimbel SNBP, UTBK (SNBT) & UM PTN",
  description:
    "UrClass adalah platform tryout dan bimbingan intensif untuk persiapan SNBP, UTBK (SNBT), dan UM PTN. Dapatkan simulasi ujian real-time, pembahasan lengkap, kelas intensif, dan analitik progress untuk strategi masuk PTN terbaikmu.",
  keywords: [
    "tryout utbk",
    "bimbel snbp",
    "bimbel utbk online",
    "latihan soal utbk",
    "simulasi utbk snbt",
    "prediksi passing grade",
    "tips lolos snbp",
    "persiapan um ptn",
    "materi utbk dan pembahasan",
    "bank soal utbk",
    "UrClass",
    "platform tryout indonesia",
    "persiapan utbk",
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
    title: "UrClass - Platform Simulasi Tryout UTBK (SNBT) & CPNS (SKD)",
    description:
      "Simulasi ujian real-time, pembahasan detail langkah demi langkah, dan analitik performa untuk target lolos PTN & ASN impianmu.",
    url: "https://urclass.id",
    siteName: "UrClass",
    images: [
      {
        url: "/images/logo/urclass.png",
        width: 1200,
        height: 630,
        alt: "UrClass - Platform Tryout UTBK & CPNS",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UrClass - Platform Simulasi Tryout UTBK & CPNS",
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
    <html lang="en">
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
