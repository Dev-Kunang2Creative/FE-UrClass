import type { UserTryoutData } from "@/http/tryout/get-user-tryouts";
import type { TryoutHistoryData } from "@/http/tryout/get-history-tryout";

/**
 * Turns the tryout list into the two questions a dashboard has to answer:
 * "what did I leave unfinished" and "what runs out soonest".
 *
 * Kept out of the components so the rules are in one place and testable. The
 * API already sends everything needed here; the old dashboard fetched it and
 * used only the array length.
 */

/** Whole days from now until `iso`. Negative once it has passed. */
export function daysUntil(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;

  // Compared at day granularity so a deadline later today reads as 0 days
  // rather than rounding up to 1 and looking like there is still time.
  const a = Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate());
  const b = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((a - b) / 86_400_000);
}

export function deadlineLabel(days: number | null): string {
  if (days === null) return "Tanpa batas waktu";
  if (days < 0) return "Sudah berakhir";
  if (days === 0) return "Berakhir hari ini";
  if (days === 1) return "Berakhir besok";
  return `${days} hari lagi`;
}

/**
 * Tryouts the user started and never finished.
 *
 * "expired" is excluded on purpose: the session is gone, so offering Lanjutkan
 * would lead to a dead end.
 */
export function resumableTryouts(tryouts: UserTryoutData[] = []): UserTryoutData[] {
  return tryouts
    .filter((t) => t.sessionStatus === "in_progress")
    .sort((a, b) => {
      // Oldest first: the one abandoned longest ago is the most likely to be
      // forgotten, and on a timed tryout also the most urgent.
      const at = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const bt = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return at - bt;
    });
}

/**
 * Worth starting, soonest deadline first. Excludes what is already finished,
 * expired, in progress, or past its end date.
 */
export function upcomingTryouts(
  tryouts: UserTryoutData[] = [],
  limit = 4,
  now = new Date(),
): { tryout: UserTryoutData; daysLeft: number | null }[] {
  return tryouts
    .filter((t) => t.sessionStatus === "not_started")
    .map((t) => ({ tryout: t, daysLeft: daysUntil(t.endDate, now) }))
    .filter(({ daysLeft }) => daysLeft === null || daysLeft >= 0)
    .sort((x, y) => {
      // Dated ones first; undated have no urgency to rank on.
      if (x.daysLeft === null && y.daysLeft === null) return 0;
      if (x.daysLeft === null) return 1;
      if (y.daysLeft === null) return -1;
      return x.daysLeft - y.daysLeft;
    })
    .slice(0, limit);
}

export interface ScoreSummary {
  attempts: number;
  average: number;
  highest: number;
}

/**
 * Shared with TrackStatisticsCard so the aside and the detail card cannot show
 * different averages for the same data.
 */
export function scoreSummary(histories: TryoutHistoryData[] = []): ScoreSummary {
  const finished = histories.filter(
    (h) => h.status === "selesai" && Number(h.score) > 0,
  );

  if (finished.length === 0) {
    return { attempts: 0, average: 0, highest: 0 };
  }

  const scores = finished.map((h) => Number(h.score));

  return {
    attempts: finished.length,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highest: Math.max(...scores),
  };
}
