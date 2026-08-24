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
import { KATEGORI_CONFIG, type Kategori } from "@/lib/kategori";

export default function SettingsContent() {
  const { data: session } = useSession();
  const [isEdit, setIsEdit] = useState(false);
  const { kategori, switchKategori, isSwitching } = useKategori();

  // Handle loading state gracefully
  if (!session) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = session.user;
  
  // Extract user info, using optional chaining and defaults
  const name = user?.name || "Sobat UrClass";
  const email = user?.email || "-";
  const phone = user?.phone_number || "-";
  const school = user?.school_origin || "-";
  const gradeLevel = user?.grade_level || "-";
  
  // New fields
  const gender = user?.gender === 'L' ? 'Laki-laki' : user?.gender === 'P' ? 'Perempuan' : '-';
  const birthDate = user?.birth_date || "-";
  const province = user?.province || "-";
  const city = user?.city || "-";
  const targetUniversity1 = user?.target_university_1 || "-";
  const targetMajor1 = user?.target_major_1 || "-";
  const targetUniversity2 = user?.target_university_2 || "-";
  const targetMajor2 = user?.target_major_2 || "-";

  return (
    <div className="space-y-6">
      
      {/* Mode Belajar Switcher Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-300">
                <Compass className="w-5 h-5 text-blue-700" />
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

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-[#EFF6FF] shrink-0">
            <AvatarFallback className="bg-blue-50 text-blue-600 text-3xl">
              <User className="h-8 w-8 sm:h-10 sm:w-10" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-blue-600 truncate">{name}</h2>
            <div className="flex items-center gap-2 text-gray-500 mt-1 shrink-0">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="text-sm break-all">{email}</span>
            </div>
          </div>
        </div>
        
        {/* Edit Button toggle */}
        {!isEdit ? (
          <Button 
            variant="outline" 
            className="shrink-0 text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => setIsEdit(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            className="shrink-0 text-gray-500 hover:text-gray-700"
            onClick={() => setIsEdit(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Batalkan
          </Button>
        )}
      </div>

      {isEdit ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-blue-600 font-semibold flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Perbarui Profil
            </h3>
          </div>
          <div className="p-6">
            <FormCompleteProfile onSuccess={() => setIsEdit(false)} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Detail Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-blue-600 font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Informasi Data Diri
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="Nama Lengkap" value={name} />
              <DetailRow label="Email" value={email} />
              <DetailRow label="Nomor Handphone" value={phone} />
              <DetailRow label="Jenis Kelamin" value={gender} />
              <DetailRow label="Tanggal Lahir" value={birthDate} />
              <DetailRow label="Provinsi" value={province} />
              <DetailRow label="Kabupaten / Kota" value={city} />
            </div>
          </div>

          {/* Academic Detail Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-blue-600 font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Informasi Akademik
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="Asal Sekolah" value={school} />
              <DetailRow label="Jenjang & Kelas" value={gradeLevel} />
              <DetailRow label="Target Universitas (Pilihan 1)" value={targetUniversity1} />
              <DetailRow label="Target Jurusan (Pilihan 1)" value={targetMajor1} />
              <DetailRow label="Target Universitas (Pilihan 2)" value={targetUniversity2} />
              <DetailRow label="Target Jurusan (Pilihan 2)" value={targetMajor2} />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Internal reusable helper for the detail layout
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-50 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500 sm:w-1/3 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 mt-1 sm:mt-0 sm:w-2/3 sm:text-right break-all">
        {value}
      </span>
    </div>
  );
}
