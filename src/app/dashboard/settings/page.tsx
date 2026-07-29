import type { Metadata } from 'next';
import SettingsContent from '@/components/organisms/dashboard/SettingsContent';

export const metadata: Metadata = {
  title: 'Pengaturan Akun - UrClass',
  description: 'Pengaturan Akun dan Profil Pengguna UrClass',
};

export default function SettingsPage() {
  return (
    <div className="w-full flex-1 md:container flex flex-col gap-6 p-4 md:p-6 lg:p-8 relative mt-10 md:mt-0">
      <div className="mb-2 md:mb-6 leading-tight">
        <h1 className="text-2xl md:text-3xl font-bold text-[#013476]">
          Pengaturan Akun
        </h1>
        <p className="text-sm md:text-base text-[#9695A5] mt-1">
          Kelola informasi data diri dan akademik kamu di sini.
        </p>
      </div>
      
      <SettingsContent />
    </div>
  );
}
