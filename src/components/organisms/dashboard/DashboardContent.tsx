"use client";

import HeroBanner from "@/components/molecules/dashboard/HeroBanner";
import InfoCardCarousel from "@/components/molecules/dashboard/InfoCardCarousel";
import LiveClassSection from "@/components/molecules/dashboard/LiveClassSection";
import DialogCompleteProfile from "@/components/molecules/dialog/DialogCompleteProfile";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function DashboardContent() {
  const { data: session } = useSession();
  const [profileDialogDismissed, setProfileDialogDismissed] = useState(false);
  const showProfileComplete =
    !!session?.user &&
    (!session.user.phone_number || !session.user.school_origin) &&
    !profileDialogDismissed;

  return (
    <>
      <section className="flex flex-col gap-6">
        <HeroBanner userName={session?.user?.name ?? "Amunisian"} />
        <InfoCardCarousel />
        <LiveClassSection />
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
