"use client";

import DashboardHeader from "@/components/molecules/dashboard/DashboardHeader";
import ContinueCard from "@/components/molecules/dashboard/ContinueCard";
import UpcomingTryouts from "@/components/molecules/dashboard/UpcomingTryouts";
import ProgressAside from "@/components/molecules/dashboard/ProgressAside";
import TrackStatisticsCard from "@/components/molecules/dashboard/TrackStatisticsCard";
import DialogCompleteProfile from "@/components/molecules/dialog/DialogCompleteProfile";
import TourGuideOverlay from "@/components/molecules/dialog/TourGuideOverlay";
import { useGetUserTryouts } from "@/http/tryout/get-user-tryouts";
import { useGetHistoryTryout } from "@/http/tryout/get-history-tryout";
import { useTickets } from "@/hooks/useTickets";
import {
  resumableTryouts,
  upcomingTryouts,
  scoreSummary,
} from "@/lib/dashboard-tasks";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

/**
 * Actions first, context beside them.
 *
 * The previous layout opened with a greeting, then seven autoplaying promo
 * slides that all led to one of two pages, and only then any data - none of it
 * actionable. It fetched the tryout list and used `.length`, discarding
 * user_session_status and end_date, so an unfinished exam and an expiring
 * deadline were both invisible from here.
 *
 * Two columns on desktop: what to do on the left, how it is going on the right.
 * One column on mobile, actions first. The promo carousel moved to the purchase
 * page, where someone is actually deciding whether to buy.
 */
export default function DashboardContent() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  const { ticketCount } = useTickets();

  const { data: tryouts, isLoading: tryoutsLoading } = useGetUserTryouts({ token });
  const { data: historyData, isLoading: historyLoading } = useGetHistoryTryout({ token });

  const [profileDialogDismissed, setProfileDialogDismissed] = useState(false);
  const showProfileComplete =
    !!session?.user &&
    (!session.user.phone_number || !session.user.school_origin) &&
    !profileDialogDismissed;

  const list = tryouts?.data;
  const resumable = useMemo(() => resumableTryouts(list), [list]);
  const upcoming = useMemo(() => upcomingTryouts(list), [list]);
  const summary = useMemo(() => scoreSummary(historyData?.data), [historyData]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DashboardHeader userName={session?.user?.name} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Actions. Ordered by urgency: an abandoned exam outranks a deadline,
              because the attempt is already spent. */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <ContinueCard tryouts={resumable} loading={tryoutsLoading} />
            <UpcomingTryouts items={upcoming} loading={tryoutsLoading} />
          </div>

          <ProgressAside
            summary={summary}
            ticketCount={ticketCount}
            loading={historyLoading}
          />
        </div>

        {/* The detailed, track-specific breakdown stays, moved below the fold.
            It is reference rather than a next step. */}
        <TrackStatisticsCard
          histories={historyData?.data}
          loading={historyLoading}
        />
      </div>

      <DialogCompleteProfile
        open={showProfileComplete}
        onOpenChange={(open) => {
          if (!open) setProfileDialogDismissed(true);
        }}
      />

      <TourGuideOverlay />
    </>
  );
}
