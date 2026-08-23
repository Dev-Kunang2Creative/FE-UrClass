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

  return (
    <>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <HeroBanner userName={session?.user?.name ?? "Sobat UrClass"} />
        
        <StatRow
          kategoriLabel={KATEGORI_CONFIG[kategori].label}
          theme={KATEGORI_CONFIG[kategori].theme}
          ticketCount={ticketCount}
          tryoutCount={tryouts?.data.length}
          loading={tryoutsLoading}
        />

        {/* Dynamic Track-Specific Evaluation & Statistics */}
        <TrackStatisticsCard
          histories={historyData?.data}
          loading={historyLoading}
        />

        <InfoCardCarousel />
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
