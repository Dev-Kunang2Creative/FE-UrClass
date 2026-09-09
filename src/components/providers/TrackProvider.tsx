"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { useSession } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { resolveKategori, type Kategori } from "@/lib/kategori";

const TrackContext = createContext<Kategori | null>(null);

/**
 * Owns the track for the whole dashboard: the CSS variables and the hooks.
 *
 * Two problems met here.
 *
 * data-track used to be written by the server layout, so switching track
 * updated every label but left the colours alone - --primary, --track-tint and
 * the .track-surface background all stayed on the old palette until a reload.
 * Reading the session here makes the attribute follow the switch immediately.
 *
 * In the other direction, GlobalProvider mounts SessionProvider without a
 * `session` prop, so useSession() is empty on the first render, during SSR
 * too. Falling back to "utbk" made every CPNS page render UTBK labels for a
 * beat. The server already resolved the track from getServerSession, so it is
 * passed in as the fallback and handed down for useKategori to use as well.
 *
 * Both sides now apply the same rule, resolveKategori, which is why the
 * attribute and the hooks cannot disagree.
 */
export function TrackShell({
  initial,
  children,
}: PropsWithChildren<{ initial: Kategori }>) {
  return (
    <TrackContext.Provider value={initial}>
      <TrackedSidebar initial={initial}>{children}</TrackedSidebar>
    </TrackContext.Provider>
  );
}

function TrackedSidebar({
  initial,
  children,
}: PropsWithChildren<{ initial: Kategori }>) {
  const { data: session } = useSession();
  const track = resolveKategori(session?.user?.kategori, initial);

  return <SidebarProvider data-track={track}>{children}</SidebarProvider>;
}

/** The track resolved for this render, or null outside a TrackShell. */
export function useInitialTrack() {
  return useContext(TrackContext);
}
