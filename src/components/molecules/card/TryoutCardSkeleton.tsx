"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function TryoutCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
      {/* Background Image Header */}
      <div className="relative hidden sm:block w-full h-40">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Mobile badges */}
        <div className="mb-3 flex gap-2 sm:hidden">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-4/5 mb-3 rounded-md" />

        {/* Status badges */}
        <div className="flex items-stretch gap-2 mb-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>

        {/* Button */}
        <Skeleton className="h-11 w-full rounded-lg mt-auto" />
      </div>
    </div>
  );
}
