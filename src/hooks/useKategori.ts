"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { updateKategoriApiHandler } from "@/http/profile/update-kategori";
import { isKategori, type Kategori } from "@/lib/kategori";

/**
 * Current exam track plus a switcher. Content (tryout/paket/kelas) is filtered
 * server-side by users.kategori, so switching must refetch those queries.
 */
export function useKategori() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  const raw = session?.user?.kategori;
  const kategori: Kategori = isKategori(raw) ? raw : "utbk";

  const switchKategori = async (next: Kategori) => {
    if (next === kategori || !session?.access_token) return;

    setIsSwitching(true);
    try {
      await updateKategoriApiHandler(session.access_token, next);
      await update();
      // Server filters by kategori, so cached lists are now for the wrong track.
      await queryClient.invalidateQueries();
    } catch {
      toast.error("Gagal mengganti kategori, coba lagi.");
    } finally {
      setIsSwitching(false);
    }
  };

  return { kategori, switchKategori, isSwitching };
}
