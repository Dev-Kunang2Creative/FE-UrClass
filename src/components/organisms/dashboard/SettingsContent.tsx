"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  GraduationCap,
  Edit2,
  X,
  Compass,
  CheckCircle2,
  BookOpenCheck,
  Landmark,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FormCompleteProfile from "@/components/molecules/form/profile/FormCompleteProfile";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { formatJakartaDate } from "@/utils/date-time";
import { useFormasiStatus } from "@/http/reference/get-instansi";

export default function SettingsContent() {
  const { data: session } = useSession();
  const [isEdit, setIsEdit] = useState(false);
  const { kategori, switchKategori, isSwitching } = useKategori();

  /**
   * Formasi baru terbit per periode seleksi, jadi ada masa di mana peserta
   * memang belum bisa mengisinya. Tanpa pengecekan ini, kartu "N data belum
   * diisi" menagih peserta atas kolom yang tidak mungkin ia lengkapi - dan
   * tagihan yang tidak bisa dipenuhi hanya membuat kartu itu diabaikan
   * seluruhnya, termasuk untuk kolom yang benar-benar kurang.
   *
   * Dipanggil di sini, di atas early return di bawah, karena hook tidak boleh
   * dilewati pada sebagian render. Penyaringan ke pelamar CPNS umum dilakukan
   * lewat `enabled`, bukan dengan tidak memanggilnya.
   */
  const formasiStatus = useFormasiStatus({
    token: session?.access_token ?? "",
    enabled: session?.user?.cpns_target_type === "umum",
  });
  const formasiOpen = formasiStatus.data?.is_open ?? false;

  // Handle loading state gracefully
  if (!session) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = session.user;

  // An admin has no exam track: the switcher below drives a student's beranda,
  // tryout simulation and paket list, none of which the admin console reads.
  const isAdmin = user?.role === "admin";

  // Extract user info, using optional chaining and defaults
  const name = user?.name || "Sobat UrClass";
  const email = user?.email || "";
  const phone = user?.phone_number || "";
  const school = user?.school_origin || "";
  const gradeLevel = user?.grade_level || "";
  
  const gender =
    user?.gender === "L" ? "Laki-laki" : user?.gender === "P" ? "Perempuan" : "";
  // Was printed raw, so a stored 2005-03-14T00:00:00.000000Z was shown as-is.
  const birthDate = user?.birth_date
    ? formatJakartaDate(user.birth_date, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const province = user?.province || "";
  const city = user?.city || "";
  const targetUniversity1 = user?.target_university_1 || "";
  const targetMajor1 = user?.target_major_1 || "";
  const targetUniversity2 = user?.target_university_2 || "";
  const targetMajor2 = user?.target_major_2 || "";

  // Peserta CPNS punya dua bentuk target. Sekolah kedinasan memakai kolom
  // universitas/jurusan di atas karena bentuknya sama dengan target PTN;
  // pelamar CPNS umum memakai instansi dan formasi.
  const cpnsTargetType = user?.cpns_target_type ?? null;
  const isKedinasan = cpnsTargetType === "kedinasan";
  const isUmum = cpnsTargetType === "umum";

  const targetInstansi1 = user?.target_instansi_1 || "";
  const targetFormasi1 = user?.target_formasi_1 || "";
  const targetInstansi2 = user?.target_instansi_2 || "";
  const targetFormasi2 = user?.target_formasi_2 || "";

  // What the server actually requires. Named so the reader is told which
  // fields are missing instead of hunting for dashes down two cards.
  //
  // Kosong untuk admin: mereka tidak pernah mengikuti tryout, jadi tidak ada
  // sertifikat maupun laporan nilai yang perlu memakai data ini, dan mendesak
  // mereka melengkapinya berarti meminta pekerjaan yang tidak dipakai apa pun.
  const missing = isAdmin
    ? []
    : [
        !phone && "nomor HP",
        !gender && "jenis kelamin",
        !birthDate && "tanggal lahir",
        !school && "asal sekolah",
        kategori === "utbk" && !targetUniversity1 && "target universitas",
        kategori === "utbk" && !targetMajor1 && "target jurusan",
        kategori === "cpns" && !cpnsTargetType && "tujuan (kedinasan atau CPNS umum)",
        isKedinasan && !targetUniversity1 && "target sekolah kedinasan",
        isKedinasan && !targetMajor1 && "target program studi",
        isUmum && !targetInstansi1 && "target instansi",
        isUmum && formasiOpen && !targetFormasi1 && "target formasi",
      ].filter((item): item is string => typeof item === "string");

  return (
    <div className="space-y-6">
      
      {/* Mode Belajar Switcher Card - students only */}
      {!isAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-track-border">
                  <Compass className="w-5 h-5 text-primary" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Mode Belajar Utama (Jalur Target)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Ganti mode di sini untuk mengubah tampilan beranda, simulasi tryout, paket pembelian, dan analitik penilaian.
              </p>
            </div>
            <div className="shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${KATEGORI_CONFIG[kategori].theme.badge}`}>
                Mode Aktif: {KATEGORI_CONFIG[kategori].label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* UTBK Card */}
            <button
              type="button"
              onClick={() => switchKategori("utbk")}
              disabled={isSwitching}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                kategori === "utbk"
                  ? "border-blue-600 bg-blue-50/70 shadow-[4px_4px_0px_0px_#2563eb] ring-2 ring-blue-500/20"
                  : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/20 shadow-[2px_2px_0px_0px_#0f172a]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                    <BookOpenCheck className="w-6 h-6" />
                  </div>
                  {kategori === "utbk" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Pilih Mode</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Jalur UTBK - SNBT</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Fokus TPS, Literasi Bahasa, Penalaran Matematika, dan prediksi kelulusan kampus impian berskala IRT.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-blue-200/60 flex items-center justify-between text-xs font-semibold text-blue-800">
                <span>7 Subtes SNBT</span>
                <span>Skala IRT (0-1000)</span>
              </div>
            </button>

            {/* CPNS Card */}
            <button
              type="button"
              onClick={() => switchKategori("cpns")}
              disabled={isSwitching}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                kategori === "cpns"
                  ? "border-orange-600 bg-orange-50/70 shadow-[4px_4px_0px_0px_#c2410c] ring-2 ring-orange-500/20"
                  : "border-slate-300 bg-white hover:border-orange-400 hover:bg-orange-50/20 shadow-[2px_2px_0px_0px_#0f172a]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-orange-700 text-white shadow-sm">
                    <Landmark className="w-6 h-6" />
                  </div>
                  {kategori === "cpns" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Pilih Mode</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Jalur CPNS & Kedinasan</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Simulasi SKD CAT terpadu: TWK, TIU, dan TKP dengan indikator batas Passing Grade resmi KepmenPAN-RB.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-orange-200/60 flex items-center justify-between text-xs font-semibold text-orange-900">
                <span>TWK, TIU & TKP</span>
                <span>Passing Grade CAT</span>
              </div>
            </button>
          </div>

          {isSwitching && (
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memperbarui ruang belajar dan memuat data jalur baru...</span>
            </div>
          )}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_#0f172a] md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Avatar className="size-16 shrink-0 border-2 border-slate-900 sm:size-20">
            {/* Was a blue ring and a blue glyph, which followed a CPNS reader
                onto their own settings page. */}
            <AvatarFallback className="bg-track-tint text-primary">
              <User className="size-8 sm:size-10" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              {name}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-slate-500">
              <Mail className="size-4 shrink-0" />
              <span className="break-all text-sm">{email || "-"}</span>
            </div>
          </div>
        </div>

        {!isEdit ? (
          <Button
            className="shrink-0 border-2 border-slate-900 bg-primary font-bold text-primary-foreground hover:brightness-95"
            onClick={() => setIsEdit(true)}
          >
            <Edit2 className="mr-2 size-4" />
            Edit Profil
          </Button>
        ) : (
          <Button
            variant="outline"
            className="shrink-0 border-2 border-slate-900 font-bold"
            onClick={() => setIsEdit(false)}
          >
            <X className="mr-2 size-4" />
            Batalkan
          </Button>
        )}
      </div>

      {/* Nudge, not a scolding. The read view used to print "-" for anything
          missing, which says nothing about why it matters. */}
      {!isEdit && missing.length > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-amber-500 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                {missing.length} data belum diisi
              </p>
              <p className="text-xs leading-snug text-amber-800">
                {missing.join(", ")}. Lengkapi supaya sertifikat dan laporan
                nilaimu memakai data yang benar.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsEdit(true)}
            className="shrink-0 border-2 border-slate-900 bg-amber-600 font-bold text-white hover:bg-amber-700"
          >
            Lengkapi sekarang
          </Button>
        </div>
      )}

      {isEdit ? (
        // Full width, so switching into edit does not shrink the page from a
        // two-column read view into a narrow single column.
        <div className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 bg-track-tint px-6 py-4">
            <Edit2 className="size-4 text-primary" />
            <h3 className="text-sm font-black tracking-tight text-slate-900">
              Perbarui Profil
            </h3>
          </div>
          <div className="p-6">
            <FormCompleteProfile mode="edit" onSuccess={() => setIsEdit(false)} />
          </div>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-6 ${isAdmin ? "" : "lg:grid-cols-2"}`}
        >
          <div className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 px-6 py-4">
              <User className="size-4 text-primary" />
              <h3 className="text-sm font-black tracking-tight text-slate-900">
                Informasi Data Diri
              </h3>
            </div>
            <div className="p-6">
              <DetailRow label="Nama Lengkap" value={name} />
              <DetailRow label="Email" value={email} />
              {/* Sisanya hanya berarti bagi peserta tryout. */}
              {!isAdmin && (
                <>
                  <DetailRow label="Nomor Handphone" value={phone} />
                  <DetailRow label="Jenis Kelamin" value={gender} />
                  <DetailRow label="Tanggal Lahir" value={birthDate} />
                  <DetailRow label="Provinsi" value={province} />
                  <DetailRow label="Kabupaten / Kota" value={city} />
                </>
              )}
            </div>
          </div>

          {/* Data akademik hanya milik peserta tryout. Admin tidak punya asal
              sekolah maupun target kampus, jadi kartunya tidak ada - bukan
              kartu berisi tujuh baris "Belum diisi". */}
          {!isAdmin && (
            <div className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]">
              <div className="flex items-center gap-2 border-b-2 border-slate-900 px-6 py-4">
                <GraduationCap className="size-4 text-primary" />
                <h3 className="text-sm font-black tracking-tight text-slate-900">
                  Informasi Akademik
                </h3>
              </div>
              <div className="p-6">
                <DetailRow label="Asal Sekolah" value={school} />
                <DetailRow label="Jenjang & Kelas" value={gradeLevel} />
                {/* A CPNS candidate is not asked for a target campus, so it is
                    not reported back at them either. */}
                {kategori === "utbk" && (
                  <>
                    <DetailRow label="Target Universitas 1" value={targetUniversity1} />
                    <DetailRow label="Target Jurusan 1" value={targetMajor1} />
                    <DetailRow label="Target Universitas 2" value={targetUniversity2} />
                    <DetailRow label="Target Jurusan 2" value={targetMajor2} />
                  </>
                )}

                {/* Yang ditampilkan hanya pasangan yang berlaku bagi peserta
                    itu - menampilkan keduanya berarti setengahnya selalu
                    "Belum diisi" tanpa pernah perlu diisi. */}
                {kategori === "cpns" && (
                  <>
                    <DetailRow
                      label="Tujuan"
                      value={
                        isKedinasan
                          ? "Sekolah Kedinasan"
                          : isUmum
                            ? "CPNS Umum"
                            : ""
                      }
                    />
                    {isKedinasan && (
                      <>
                        <DetailRow label="Sekolah Kedinasan 1" value={targetUniversity1} />
                        <DetailRow label="Program Studi 1" value={targetMajor1} />
                        <DetailRow label="Sekolah Kedinasan 2" value={targetUniversity2} />
                        <DetailRow label="Program Studi 2" value={targetMajor2} />
                      </>
                    )}
                    {isUmum && (
                      <>
                        <DetailRow label="Instansi 1" value={targetInstansi1} />
                        <DetailRow label="Formasi 1" value={targetFormasi1} />
                        <DetailRow label="Instansi 2" value={targetInstansi2} />
                        <DetailRow label="Formasi 2" value={targetFormasi2} />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// Internal reusable helper for the detail layout
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col border-b border-dashed border-slate-200 py-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="shrink-0 text-sm text-slate-500 sm:w-1/3">{label}</span>
      <span
        className={`mt-1 break-all text-sm sm:mt-0 sm:w-2/3 sm:text-right ${
          value ? "font-semibold text-slate-900" : "italic text-slate-400"
        }`}
      >
        {value || "Belum diisi"}
      </span>
    </div>
  );
}
