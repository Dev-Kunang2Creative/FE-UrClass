"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ExternalLink, Upload, X } from "lucide-react";

import { useGetUserTryoutDetail } from "@/http/tryout/get-user-tryout-detail";
import { useGetProofRequirements } from "@/http/proof-requirements/proof-requirements";
import { useEnrollTryout } from "@/http/tryout/enroll-tryout";
import { proofIconOf } from "@/lib/proof-icons";
import { getErrorMessage } from "@/utils/get-error-message";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 2;

/**
 * Pendaftaran tryout gratis: sebuah halaman, bukan modal.
 *
 * Syaratnya ditentukan admin dan jumlahnya bisa bertambah, masing-masing dengan
 * instruksi, tautan, dan pratinjau gambar yang sudah diunggah. Di dalam modal
 * seukuran `sm:max-w-md` isinya melewati tinggi layar dan terpotong tanpa bisa
 * digulir, sehingga tombol daftarnya sendiri tidak terjangkau - kegagalan yang
 * bertambah parah persis ketika admin menambah satu syarat lagi.
 *
 * Sebagai halaman, isinya mengikuti gulir halaman seperti biasa dan tombol
 * aksinya menempel di bawah layar, jadi berapa pun jumlah syaratnya tidak
 * mengubah apakah pendaftaran bisa diselesaikan.
 */
export default function DaftarTryoutGratisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const token = session?.access_token || "";

  const [proofFiles, setProofFiles] = useState<Record<string, File>>({});
  const [proofPreviews, setProofPreviews] = useState<Record<string, string>>({});

  const { data: detail, isPending: memuatTryout } = useGetUserTryoutDetail({
    id: tryoutId,
    token,
  });
  const { data: proofData, isPending: memuatSyarat } = useGetProofRequirements({
    token,
  });

  const tryout = detail?.data;
  const proofRequirements = proofData?.data ?? [];

  const enrollMutation = useEnrollTryout({
    token,
    options: {
      onSuccess: () => {
        toast.success("Berhasil mendaftar tryout!");
        updateSession();
        queryClient.invalidateQueries({ queryKey: ["get-user-tryouts"] });
        queryClient.invalidateQueries({ queryKey: ["get-user-tryout-detail", tryoutId] });
        queryClient.invalidateQueries({ queryKey: ["get-history-tryout"] });
        router.push(`/dashboard/try-out/${tryoutId}/start`);
      },
      onError: (error: unknown) =>
        toast.error(getErrorMessage(error, "Gagal mendaftar tryout")),
    },
  });

  // Semua syarat aktif harus terisi. Aturannya sama di server, jadi tombol
  // daftar dikunci sampai terpenuhi daripada membiarkan peserta mengirim lalu
  // menerima 422.
  const missingProofs = proofRequirements.filter((item) => !proofFiles[item.id]);
  const proofsComplete =
    proofRequirements.length > 0 && missingProofs.length === 0;

  const handleProofChange = (
    requirementId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran gambar melebihi batas ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Satu slot menampung satu gambar: memilih ulang menggantikan yang lama,
    // bukan menumpuk. Itu yang diharapkan dari slot berlabel.
    setProofFiles((current) => ({ ...current, [requirementId]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreviews((current) => ({
        ...current,
        [requirementId]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeProof = (requirementId: string) => {
    setProofFiles((current) => {
      const next = { ...current };
      delete next[requirementId];
      return next;
    });
    setProofPreviews((current) => {
      const next = { ...current };
      delete next[requirementId];
      return next;
    });
  };

  const memuat = sessionStatus === "loading" || memuatTryout;

  // Halaman ini khusus tryout gratis. Tryout berbayar tidak punya syarat untuk
  // diunggah - alamatnya diketik langsung pun, yang benar adalah dialog tiket
  // di halaman detailnya.
  const bukanGratis = !memuat && tryout && tryout.is_free === false;

  if (bukanGratis) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 py-10">
        <p className="text-sm text-slate-600">
          Tryout ini berbayar, jadi pendaftarannya memakai tiket - tidak ada
          syarat yang perlu diunggah.
        </p>
        <Link
          href={`/dashboard/try-out/${tryoutId}`}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          Kembali ke tryout
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-5 pb-32">
      <Link
        href={`/dashboard/try-out/${tryoutId}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
      >
        <ChevronLeft className="size-4" />
        Kembali ke tryout
      </Link>

      <div className="min-w-0 rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]">
        <div className="border-b-2 border-slate-900 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Pendaftaran tryout gratis
          </p>
          <h1 className="mt-1 break-words text-lg font-black tracking-tight text-slate-900">
            {memuat ? "Memuat tryout…" : (tryout?.title ?? "Tryout")}
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            {proofRequirements.length > 0
              ? `Penuhi ${proofRequirements.length} syarat berikut, lalu unggah tangkapan layarnya di masing-masing slot.`
              : memuatSyarat
                ? "Memuat syarat pendaftaran…"
                : "Belum ada syarat pendaftaran untuk tryout ini."}
          </p>
        </div>

        <div className="space-y-3 p-5">
          {/* Slot, judul, dan instruksinya seluruhnya dari server - tidak ada
              yang ditulis di sini. Server memvalidasi dengan daftar yang sama,
              jadi teks yang ditulis tangan pasti akan menyimpang begitu
              syaratnya diubah admin. */}
          {memuatSyarat && proofRequirements.length === 0
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border-2 border-gray-200 bg-gray-50"
                />
              ))
            : proofRequirements.map((requirement, index) => {
                const { Icon, className } = proofIconOf(requirement.icon);
                const preview = proofPreviews[requirement.id];

                return (
                  <div
                    key={requirement.id}
                    className={`rounded-xl border-2 p-4 transition-colors ${
                      preview
                        ? "border-green-400 bg-green-50/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                          <Icon className={`size-4 shrink-0 ${className}`} />
                          <span className="min-w-0">{requirement.title}</span>
                        </p>

                        {requirement.instruction && (
                          <p className="text-xs leading-relaxed text-gray-500">
                            {requirement.instruction}
                          </p>
                        )}

                        {requirement.link_url && (
                          <a
                            href={requirement.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700 transition-colors hover:bg-pink-100"
                          >
                            {requirement.link_label || "Buka tautan"}
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {preview ? (
                        <div className="relative overflow-hidden rounded-lg border border-green-300">
                          {/* object-contain, bukan object-cover: tangkapan
                              layar ponsel jauh lebih tinggi daripada lebar,
                              dan dipotong di tengah membuat peserta tidak bisa
                              memastikan yang terunggah memang gambar yang
                              benar. */}
                          <img
                            src={preview}
                            alt={`Bukti untuk ${requirement.title}`}
                            className="max-h-64 w-full bg-slate-50 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => removeProof(requirement.id)}
                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                            aria-label={`Hapus bukti untuk ${requirement.title}`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-primary hover:bg-gray-50">
                          <Upload className="mb-1 size-5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">
                            Unggah tangkapan layar
                          </span>
                          <span className="mt-0.5 text-[11px] text-gray-400">
                            JPG, PNG, WebP — maks 2MB
                          </span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) =>
                              handleProofChange(requirement.id, event)
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Menempel di bawah layar supaya tombolnya terjangkau berapa pun panjang
          daftar syaratnya - itu persis yang gagal saat ini berbentuk modal. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-900 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-3">
          {/* Menyebut syarat mana yang belum, bukan hanya "belum lengkap":
              dengan beberapa slot, peserta perlu tahu yang mana. */}
          {proofRequirements.length > 0 && missingProofs.length > 0 && (
            <p className="text-xs text-amber-700">
              Belum diunggah:{" "}
              {missingProofs.map((item) => item.title).join(", ")}.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/try-out/${tryoutId}`)}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => enrollMutation.mutate({ tryoutId, proofs: proofFiles })}
              disabled={enrollMutation.isPending || !proofsComplete}
              className="flex-[2] rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {enrollMutation.isPending ? "Memproses…" : "Daftar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
