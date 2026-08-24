"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { updateKategoriApiHandler } from "@/http/profile/update-kategori";
import { resolveKategori, type Kategori } from "@/lib/kategori";
import { useInitialTrack } from "@/components/providers/TrackProvider";

/**
 * Current exam track plus a switcher. Content (tryout/paket/kelas) is filtered
 * server-side by users.kategori, so switching must refetch those queries.
 *
 * The fallback is the track the dashboard layout resolved on the server, not a
 * blanket "utbk". SessionProvider is mounted without an initial session, so
 * useSession() is empty on the first render - falling back to utbk made every
 * CPNS page render its UTBK labels for a moment before swapping.
 */
export function useKategori() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);
  const serverTrack = useInitialTrack();

  // Same rule as the data-track attribute in TrackShell, so the palette and
  // the labels are always describing the same track.
  const kategori: Kategori = resolveKategori(session?.user?.kategori, serverTrack);

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
