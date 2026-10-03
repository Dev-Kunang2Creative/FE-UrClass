"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserDetail } from "@/http/users/user-detail";
import { KATEGORI_CONFIG, isKategori } from "@/lib/kategori";
import { tautanInstagram } from "@/lib/instagram";
import { buatTautanWhatsApp } from "@/lib/whatsapp";
import { formatJakartaDate } from "@/utils/date-time";
import type { User } from "@/types/user/user";

/**
 * Profil lengkap satu peserta, untuk menjawab "ini sebenarnya siapa?".
 *
 * Tabel pengguna hanya memuat beberapa kolom, dan leaderboard hanya nama. Dari
 * keduanya admin tidak bisa mengenali, apalagi menghubungi, peserta yang
 * sedang dilihatnya - misalnya peringkat satu sebuah tryout.
 *
 * Hanya data yang diisi peserta sendiri. Tiket dan pemakaian AI sudah punya
 * panelnya sendiri, untuk pertanyaan yang berbeda.
 */
export default function DialogDetailPeserta({
  userId,
  nama,
  token,
  open,
  onOpenChange,
}: {
  userId: string | null;
  /** Ditampilkan selama datanya dimuat, supaya kepala dialog tidak kosong. */
  nama?: string;
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg!">
        <DialogHeader className="shrink-0 border-b px-5 py-3.5 text-left">
          <DialogTitle className="text-base">Detail peserta</DialogTitle>
          <DialogDescription className="text-xs">{nama || "-"}</DialogDescription>
        </DialogHeader>

        {open && userId && <Isi key={userId} userId={userId} token={token} />}
      </DialogContent>
    </Dialog>
  );
}

function Isi({ userId, token }: { userId: string; token: string }) {
  const { data, isPending, isError } = useUserDetail({ token, userId });

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat data peserta...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        Data peserta gagal dimuat. Tutup dialog ini lalu coba lagi.
      </p>
    );
  }

  const user = data.data;

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
      <Kelompok judul="Kontak">
        <Baris label="Nama" nilai={user.name} />
        <Baris label="Email" nilai={user.email} />
        <Baris
          label="Instagram"
          nilai={user.instagram ? `@${user.instagram}` : ""}
          tautan={user.instagram ? tautanInstagram(user.instagram) : undefined}
        />
        <Baris
          label="No. HP"
          nilai={user.phone_number ?? ""}
          tautan={user.phone_number ? buatTautanWhatsApp(user.phone_number) : undefined}
        />
      </Kelompok>

      <Kelompok judul="Data diri">
        <Baris
          label="Jenis kelamin"
          nilai={user.gender === "L" ? "Laki-laki" : user.gender === "P" ? "Perempuan" : ""}
        />
        <Baris
          label="Tanggal lahir"
          nilai={
            user.birth_date
              ? formatJakartaDate(user.birth_date, { day: "numeric", month: "long", year: "numeric" })
              : ""
          }
        />
        <Baris
          label="Domisili"
          nilai={[user.city, user.province].filter(Boolean).join(", ")}
        />
      </Kelompok>

      <Kelompok judul="Pendidikan & target">
        <Baris
          label="Jalur"
          nilai={isKategori(user.kategori) ? KATEGORI_CONFIG[user.kategori].full : ""}
        />
        <Baris label="Jenjang" nilai={user.grade_level ?? ""} />
        {user.education_major && <Baris label="Jurusan" nilai={user.education_major} />}
        <Baris label="Asal sekolah" nilai={user.school_origin ?? ""} />
        {barisTarget(user).map(([label, nilai]) => (
          <Baris key={label} label={label} nilai={nilai} />
        ))}
      </Kelompok>

      <Kelompok judul="Akun">
        <Baris
          label="Terdaftar"
          nilai={formatJakartaDate(String(user.created_at), {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        <Baris label="Masuk dengan" nilai={user.google_id ? "Google" : "Email & kata sandi"} />
        <Baris label="Sisa tiket" nilai={String(data.meta.tickets.balance)} />
      </Kelompok>
    </div>
  );
}

/**
 * Target yang berlaku bagi jalur peserta saja. Menampilkan semua pasangan
 * berarti separuhnya selalu kosong tanpa pernah perlu diisi.
 */
function barisTarget(user: User): [string, string][] {
  const gabung = (kampus?: string, jurusan?: string) =>
    [kampus, jurusan].filter(Boolean).join(" — ");

  if (user.kategori === "cpns") {
    if (user.cpns_target_type === "umum") {
      return [
        ["Instansi tujuan", user.target_instansi_1 ?? ""],
        ["Formasi tujuan", user.target_formasi_1 ?? ""],
      ];
    }

    return [
      ["Sekolah kedinasan 1", user.target_university_1 ?? ""],
      ["Sekolah kedinasan 2", user.target_university_2 ?? ""],
    ];
  }

  return [
    ["Target pilihan 1", gabung(user.target_university_1, user.target_major_1)],
    ["Target pilihan 2", gabung(user.target_university_2, user.target_major_2)],
  ];
}

function Kelompok({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {judul}
      </h4>
      <dl className="divide-y divide-dashed">{children}</dl>
    </section>
  );
}

function Baris({ label, nilai, tautan }: { label: string; nilai: string; tautan?: string }) {
  return (
    <div className="flex gap-3 py-2 text-sm">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 break-words">
        {!nilai ? (
          <span className="italic text-muted-foreground/70">Belum diisi</span>
        ) : tautan ? (
          <a
            href={tautan}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline"
          >
            {nilai}
            <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : (
          <span className="font-medium">{nilai}</span>
        )}
      </dd>
    </div>
  );
}
