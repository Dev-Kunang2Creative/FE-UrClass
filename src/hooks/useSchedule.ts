"use client";

import { useEffect, useMemo, useState } from "react";
import { describeSchedule, type Schedule } from "@/lib/tryout-schedule";

/**
 * A live view of where a tryout sits relative to now. The clock advances once
 * a second while both schedule boundaries are available.
 */
export function useSchedule(
  startDate?: string | null,
  endDate?: string | null,
): Schedule | null {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!startDate || !endDate) return;

    const id = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startDate, endDate]);

  return useMemo(
    () =>
      startDate && endDate
        ? describeSchedule(startDate, endDate, currentTime)
        : null,
    [currentTime, endDate, startDate],
  );
}
