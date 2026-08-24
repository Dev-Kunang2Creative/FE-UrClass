"use client";

import HeroBanner from "@/components/molecules/dashboard/HeroBanner";
import StatRow from "@/components/molecules/dashboard/StatRow";
import TrackStatisticsCard from "@/components/molecules/dashboard/TrackStatisticsCard";
import InfoCardCarousel from "@/components/molecules/dashboard/InfoCardCarousel";
import DialogCompleteProfile from "@/components/molecules/dialog/DialogCompleteProfile";
import TourGuideOverlay from "@/components/molecules/dialog/TourGuideOverlay";
import { useGetUserTryouts } from "@/http/tryout/get-user-tryouts";
import { useGetHistoryTryout } from "@/http/tryout/get-history-tryout";
import { useTickets } from "@/hooks/useTickets";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function DashboardContent() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  const { ticketCount } = useTickets();
  const { kategori } = useKategori();

  const { data: tryouts, isLoading: tryoutsLoading } = useGetUserTryouts({ token });
  const { data: historyData, isLoading: historyLoading } = useGetHistoryTryout({ token });

  const [profileDialogDismissed, setProfileDialogDismissed] = useState(false);
  const showProfileComplete =
    !!session?.user &&
    (!session.user.phone_number || !session.user.school_origin) &&
    !profileDialogDismissed;

  const statRow = (
    <StatRow
      kategoriLabel={KATEGORI_CONFIG[kategori].label}
      theme={KATEGORI_CONFIG[kategori].theme}
      ticketCount={ticketCount}
      tryoutCount={tryouts?.data.length}
      loading={tryoutsLoading}
    />
  );

  const evaluation = (
    <TrackStatisticsCard
      histories={historyData?.data}
      loading={historyLoading}
    />
  );

  return (
    <>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <HeroBanner userName={session?.user?.name ?? "Sobat UrClass"} />

        {/* Order follows what each candidate is actually asking.

            CPNS: "am I above the three thresholds?" - that is the entire
            question, and failing one subtest fails the whole SKD, so the
            evaluation sits directly under the hero.

            UTBK: there is no threshold to clear, only a rank to climb. The
            lever is material coverage, so discovery comes first and the score
            trend reads as progress rather than a pass/fail verdict. */}
        {kategori === "cpns" ? (
          <>
            {evaluation}
            {statRow}
            <InfoCardCarousel />
          </>
        ) : (
          <>
            <InfoCardCarousel />
            {statRow}
            {evaluation}
          </>
        )}
      </section>

      {/* Conditionally rendered popup for new users without full profiles */}
      <DialogCompleteProfile
        open={showProfileComplete}
        onOpenChange={(open) => {
          if (!open) setProfileDialogDismissed(true);
        }}
      />

      {/* Interactive Spotlight & Arrow Coachmark Tour Guide for New Users */}
      <TourGuideOverlay />
    </>
  );
}
