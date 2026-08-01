"use client";

import { Card, CardContent } from "@/components/ui/card";
import { updateKategoriApiHandler } from "@/http/profile/update-kategori";
import { BookOpenCheck, Landmark, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const KATEGORI = [
  {
    id: "utbk",
    label: "UTBK",
    deskripsi: "Seleksi Masuk Perguruan Tinggi",
    icon: BookOpenCheck,
  },
  {
    id: "cpns",
    label: "CPNS",
    deskripsi: "Seleksi Calon Aparatur Sipil Negara",
    icon: Landmark,
  },
] as const;

type KategoriId = (typeof KATEGORI)[number]["id"];

export default function PilihKategoriWrapper() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState<KategoriId | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.kategori) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const handlePilih = async (id: KategoriId) => {
    if (!session?.access_token) return;
    setIsLoading(id);

    try {
      await updateKategoriApiHandler(session.access_token, id);
      await update();
      router.push("/dashboard");
    } catch {
      toast.error("Gagal menyimpan kategori, coba lagi.");
      setIsLoading(null);
    }
  };

  if (status === "loading" || session?.user?.kategori) {
    return (
      <section className="min-h-screen bg-main bg-cover bg-bottom bg-no-repeat flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-main bg-cover bg-bottom bg-no-repeat flex items-center justify-center p-4">
      <div className="space-y-6 w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center">
          <Image
            src={"/images/logo/urclass.png"}
            alt="Logo UrClass"
            width={200}
            height={200}
            priority
            className="h-24 w-auto"
          />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold">
            Halo, {session?.user?.name ?? "Amunisian"}!
          </h3>
          <p className="text-sm text-muted-foreground">
            Pilih kategori belajar yang ingin kamu fokuskan
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KATEGORI.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => handlePilih(k.id)}
              disabled={isLoading !== null}
              className="text-left cursor-pointer transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl disabled:opacity-60 disabled:pointer-events-none"
            >
              <Card className="h-full hover:ring-primary">
                <CardContent className="flex flex-col items-center text-center gap-3 p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {isLoading === k.id ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <k.icon className="h-8 w-8" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold">{k.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {k.deskripsi}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
