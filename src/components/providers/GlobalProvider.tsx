"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { DataModeProvider } from "./DataModeProvider";
import AuthSessionGuard from "./AuthSessionGuard";

/**
 * Bawaan React Query terlalu agresif untuk aplikasi ini.
 *
 * Tanpa staleTime, setiap query dianggap basi begitu selesai: pindah halaman
 * lalu kembali akan menembak ulang permintaan yang datanya sudah ada di cache,
 * dan refetchOnWindowFocus bawaannya menembak ulang seluruh query yang sedang
 * terpasang setiap kali tab diaktifkan kembali. Satu menit cukup untuk membuat
 * navigasi bolak-balik terasa instan, sementara mutasi tetap memanggil
 * invalidateQueries yang memaksa ambil ulang tanpa peduli staleTime.
 */
const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        // Tiga kali percobaan bawaan berarti kegagalan baru terlihat setelah
        // beberapa detik menunggu; sekali ulang sudah menutup gangguan sesaat.
        retry: 1,
      },
    },
  });

export default function GlobalProvider({ children }: PropsWithChildren) {
  // Dibuat per pemasangan, bukan di lingkup modul: satu instance modul di server
  // akan dipakai bersama lintas permintaan dan lintas pengguna.
  const [queryClient] = useState(makeQueryClient);

  return (
    <>
      {/*
        Callback session memanggil /auth/me di backend setiap kali session
        dibaca, jadi setiap refetch di sini adalah satu permintaan ke Laravel
        untuk tiap tab yang terbuka - plus render ulang di ~70 berkas yang
        memakai useSession(). Interval 30 detik menjadikannya 120 permintaan per
        jam per tab hanya untuk data yang nyaris tidak pernah berubah sendiri.

        Saldo tiket, jalur, dan profil sudah dimuat ulang lewat update() tepat
        setelah aksi yang mengubahnya, dan sesi yang dicabut dari perangkat lain
        tetap tertangkap interceptor 401 di lib/axios pada panggilan API
        berikutnya. Jadi jajak pendapat ini hanya jaring pengaman, bukan sumber
        kebenaran, dan boleh jarang.
      */}
      <SessionProvider
        refetchInterval={15 * 60}
        refetchOnWindowFocus={false}
        refetchWhenOffline={false}
      >
        <AuthSessionGuard />
        <QueryClientProvider client={queryClient}>
          <DataModeProvider>{children}</DataModeProvider>
        </QueryClientProvider>
        <Toaster position="top-right" />
      </SessionProvider>
    </>
  );
}
