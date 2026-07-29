"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import AdminBackButton from "@/components/atoms/navigation/AdminBackButton";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardTitleProps {
  title?: string;
  isPending?: boolean;
  showBackButton?: boolean;
  backFallbackHref?: string;
  backLabel?: string;
  onBeforeBack?: () => boolean | Promise<boolean>;
}

export default function DashboardTitle({
  title,
  isPending = false,
  showBackButton = false,
  backFallbackHref,
  backLabel,
  onBeforeBack,
}: DashboardTitleProps) {
  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    if (isPending) return;

    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isPending]);

  return (
    <div className="space-y-1 mb-8">
      {isPending ? (
        <>
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {showBackButton && (
              <AdminBackButton
                label={backLabel}
                fallbackHref={backFallbackHref}
                onBeforeBack={onBeforeBack}
              />
            )}
            <h1 className="text-4xl font-extrabold">{title}</h1>
          </div>

          <p className="text-muted-foreground ml-1" suppressHydrationWarning>
            {format(time, "EEEE, d MMMM yyyy, HH:mm:ss", { locale: id })}
          </p>
        </>
      )}
    </div>
  );
}
