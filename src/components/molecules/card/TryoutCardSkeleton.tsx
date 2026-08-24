"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors TryoutCard so the grid does not reflow when data lands. */
export default function TryoutCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]">
      <div className="hidden h-20 w-full border-b-2 border-slate-900 sm:block">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="mb-3 flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <Skeleton className="mb-3 h-5 w-4/5 rounded-md" />

        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        <div className="mb-5 space-y-2 border-t-2 border-dashed border-slate-200 pt-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>

        <Skeleton className="mt-auto h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
