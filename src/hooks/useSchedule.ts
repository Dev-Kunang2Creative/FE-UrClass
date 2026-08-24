"use client";

import { useEffect, useState } from "react";
import {
  describeSchedule,
  sameSchedule,
  type Schedule,
} from "@/lib/tryout-schedule";

/**
 * A live view of where a tryout sits relative to now, or null until the first
 * tick after mount.
 *
 * A second keeps a phase change prompt; sameSchedule bails out when nothing
 * rendered would differ, so a grid of cards is not re-rendered once a second
 * for a label that only changes by the minute.
 */
export function useSchedule(
  startDate?: string | null,
  endDate?: string | null,
): Schedule | null {
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      setSchedule(null);
      return;
    }

    const tick = () =>
      setSchedule((prev) =>
        sameSchedule(prev, describeSchedule(startDate, endDate, Date.now())),
      );

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate, endDate]);

  return schedule;
}
