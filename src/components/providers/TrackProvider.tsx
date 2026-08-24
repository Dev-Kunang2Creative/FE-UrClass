"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import type { Kategori } from "@/lib/kategori";

const TrackContext = createContext<Kategori | null>(null);

/**
 * Carries the server-resolved track down to the client hooks.
 *
 * GlobalProvider mounts SessionProvider without a `session` prop, so on the
 * client useSession() starts at status "loading" with no data - during SSR too.
 * Every consumer of useKategori therefore rendered the UTBK config first and
 * swapped to CPNS once /api/auth/session came back: the page title, the search
 * placeholder, the filter options, the card mastheads and the sidebar all
 * flipped a beat after paint, while the colours were already orange because
 * data-track is server-rendered. That mismatch is the flicker.
 *
 * The dashboard layout already knows the track from getServerSession, so
 * handing it down gives useKategori a correct value on the very first render.
 * The session still wins once it loads, which is what makes switching tracks
 * take effect without a reload.
 */
export function TrackProvider({
  initial,
  children,
}: PropsWithChildren<{ initial: Kategori }>) {
  return (
    <TrackContext.Provider value={initial}>{children}</TrackContext.Provider>
  );
}

/** The server-resolved track, or null outside a TrackProvider. */
export function useInitialTrack() {
  return useContext(TrackContext);
}
