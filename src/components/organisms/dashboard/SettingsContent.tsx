"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, GraduationCap, Edit2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FormCompleteProfile from "@/components/molecules/form/profile/FormCompleteProfile";

export default function SettingsContent() {
  const { data: session } = useSession();
  const [isEdit, setIsEdit] = useState(false);

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
  const name = user?.name || "Amunisian";
  const email = user?.email || "-";
  const phone = user?.phone_number || "-";
  const school = user?.school_origin || "-";
  const gradeLevel = user?.grade_level || "-";
  
  // New fields
  const gender = user?.gender === 'L' ? 'Laki-laki' : user?.gender === 'P' ? 'Perempuan' : '-';
  const birthDate = user?.birth_date || "-";
  const province = user?.province || "-";
  const city = user?.city || "-";
  const targetUniversity = user?.target_university_1 || "-";
  const targetMajor = user?.target_major_1 || "-";

  return (
    <div className="space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-[#EBF4FF] shrink-0">
            <AvatarFallback className="bg-[#EBF4FF] text-[#004AAB] text-3xl">
              <User className="h-8 w-8 sm:h-10 sm:w-10" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#004AAB] truncate">{name}</h2>
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
            className="shrink-0 text-[#004AAB] border-[#004AAB] hover:bg-[#EBF4FF]"
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
            <h3 className="text-[#004AAB] font-semibold flex items-center gap-2">
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
              <h3 className="text-[#004AAB] font-semibold flex items-center gap-2">
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
              <h3 className="text-[#004AAB] font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Informasi Akademik
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="Asal Sekolah" value={school} />
              <DetailRow label="Jenjang & Kelas" value={gradeLevel} />
              <DetailRow label="Target Universitas" value={targetUniversity} />
              <DetailRow label="Target Jurusan" value={targetMajor} />
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
