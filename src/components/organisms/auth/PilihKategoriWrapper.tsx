"use client";

import { updateKategoriApiHandler } from "@/http/profile/update-kategori";
import { type Kategori } from "@/lib/kategori";
import { BookOpenCheck, Landmark, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

type KategoriId = Kategori;

const CATEGORY_ITEMS: Array<{
  id: KategoriId;
  title: string;
  badge: string;
  badgeClass: string;
  description: string;
  features: string[];
  icon: typeof BookOpenCheck;
  iconBg: string;
  iconColor: string;
  btnClass: string;
  hoverBorder: string;
}> = [
  {
    id: "utbk",
    title: "Tryout UTBK - SNBT",
    badge: "JALUR PTN & GAP YEAR",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Fokus latihan TPS, Literasi Bahasa Indonesia, Bahasa Inggris, dan Penalaran Matematika.",
    features: [
      "Simulasi timer standar SNBT resmi",
      "Analitik akurasi per subtest",
      "Pembahasan tuntas & kunci jawaban",
    ],
    icon: BookOpenCheck,
    iconBg: "bg-blue-50 border-2 border-blue-200",
    iconColor: "text-blue-600",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-[2px_2px_0px_0px_#1e293b]",
    hoverBorder: "hover:border-blue-600",
  },
  {
    id: "cpns",
    title: "Tryout CPNS - SKD",
    badge: "JALUR ASN & KEDINASAN",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    description: "Fokus latihan CAT SKD meliputi TWK, TIU, dan TKP dengan sistem bobot nilai akurat.",
    features: [
      "Simulasi CAT BKN realistis",
      "Sistem penilaian bobot TKP 1-5",
      "Ranking 3 level (Nasional/Daerah/Instansi)",
    ],
    icon: Landmark,
    iconBg: "bg-amber-50 border-2 border-amber-200",
    iconColor: "text-amber-700",
    btnClass: "bg-amber-700 hover:bg-amber-800 text-white shadow-[2px_2px_0px_0px_#1e293b]",
    hoverBorder: "hover:border-amber-700",
  },
];

export default function PilihKategoriWrapper() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loadingCategory, setLoadingCategory] = useState<KategoriId | null>(null);

  const handlePilih = async (id: KategoriId) => {
    if (!session?.access_token) return;
    setLoadingCategory(id);

    try {
      await updateKategoriApiHandler(session.access_token, id);
      await update();
      router.push("/dashboard");
    } catch {
      toast.error("Gagal menyimpan kategori, silakan coba lagi.");
      setLoadingCategory(null);
    }
  };

  if (status === "loading") {
    return (
      <section className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </section>
    );
  }

  const userName = session?.user?.name || "Sobat UrClass";

  return (
    <section className="min-h-screen bg-onboarding flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="space-y-8 w-full max-w-4xl mx-auto py-8">
        {/* Header with UrClass Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-white px-8 py-4 rounded-2xl border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] inline-flex items-center justify-center">
            <Image
              src="/images/logo/urclass.png"
              alt="Logo UrClass"
              width={320}
              height={240}
              priority
              className="h-24 sm:h-28 w-auto object-contain"
            />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, {userName}!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
              Pilih jalur belajar yang ingin kamu fokuskan untuk menampilkan materi dan tryout yang sesuai.
            </p>
          </div>
        </div>

        {/* 2 Category Selection Cards (Soft Neo-Brutalist 2-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isLoading = loadingCategory === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePilih(item.id)}
                disabled={loadingCategory !== null}
                className={`text-left w-full h-full p-6 sm:p-7 rounded-2xl border-2 border-slate-900 bg-white transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-[6px_6px_0px_0px_#0f172a] hover:shadow-[8px_8px_0px_0px_#0f172a] hover:-translate-y-1 disabled:opacity-60 disabled:pointer-events-none ${item.hoverBorder}`}
              >
                <div className="space-y-5">
                  {/* Top Row: Icon + Track Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className={`p-3.5 rounded-xl ${item.iconBg}`}>
                      <Icon className={`w-8 h-8 ${item.iconColor}`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-6 mt-4">
                  <div className={`w-full py-3 px-4 rounded-xl border-2 border-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-transform group-hover:scale-[1.02] ${item.btnClass}`}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyiapkan Ruang Belajar...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke {item.title}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
