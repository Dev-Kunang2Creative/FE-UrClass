"use client";

import HeroBanner from "@/components/molecules/dashboard/HeroBanner";
import StatRow from "@/components/molecules/dashboard/StatRow";
import InfoCardCarousel from "@/components/molecules/dashboard/InfoCardCarousel";
import DialogCompleteProfile from "@/components/molecules/dialog/DialogCompleteProfile";
import { useGetUserTryouts } from "@/http/tryout/get-user-tryouts";
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
        <InfoCardCarousel />
      </section>

      {/* Conditionally rendered popup for new users without full profiles */}
      <DialogCompleteProfile
        open={showProfileComplete}
        onOpenChange={(open) => {
          if (!open) setProfileDialogDismissed(true);
        }}
      />
    </>
  );
}
