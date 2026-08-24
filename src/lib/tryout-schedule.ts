import { formatJakartaDate } from "@/utils/date-time";

export type SchedulePhase = "upcoming" | "running" | "ended";

export interface Schedule {
  phase: SchedulePhase;
  /** Human sentence about the nearest boundary. */
  label: string;
  dateRange: string;
  /** Under a day left on a running tryout. */
  urgent: boolean;
}

const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

export const PHASE_PILL: Record<
  SchedulePhase,
  { text: string; className: string }
> = {
  running: { text: "Berlangsung", className: "bg-red-600 text-white" },
  upcoming: { text: "Akan Datang", className: "bg-amber-600 text-white" },
  ended: { text: "Selesai", className: "bg-slate-500 text-white" },
};

/**
 * Shown until the first tick. The phase depends on the clock, so computing it
 * during server rendering risks a hydration mismatch - and defaulting to one of
 * the real phases would flash a confident wrong status, "Akan Datang" on a
 * tryout already running, on every mount.
 */
export const PENDING_PILL = {
  text: "Memuat",
  className: "bg-slate-300 text-slate-700",
};

export function remaining(ms: number) {
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / (60 * 1000));
  if (d > 0) return `${d} hari ${h} jam`;
  if (h > 0) return `${h} jam ${m} menit`;
  return `${m} menit`;
}

function formatDate(value: number) {
  return formatJakartaDate(new Date(value), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Where a tryout sits relative to now. Shared by the list card and the detail
 * page so the two can never disagree about whether something is still open.
 */
export function describeSchedule(
  startDate: string,
  endDate: string,
  now: number,
): Schedule {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const dateRange = `${formatDate(start)} - ${formatDate(end)}`;

  if (now < start) {
    return {
      phase: "upcoming",
      label: `Mulai dalam ${remaining(start - now)}`,
      dateRange,
      urgent: false,
    };
  }

  if (now <= end) {
    const left = end - now;
    return {
      phase: "running",
      label: `Berakhir dalam ${remaining(left)}`,
      dateRange,
      urgent: left < DAY,
    };
  }

  return {
    phase: "ended",
    label: "Tryout sudah berakhir",
    dateRange,
    urgent: false,
  };
}

/** Keeps the previous object when nothing visible changed, so no re-render. */
export function sameSchedule(
  prev: Schedule | null,
  next: Schedule,
): Schedule {
  if (
    prev &&
    prev.phase === next.phase &&
    prev.label === next.label &&
    prev.dateRange === next.dateRange &&
    prev.urgent === next.urgent
  ) {
    return prev;
  }
  return next;
}
