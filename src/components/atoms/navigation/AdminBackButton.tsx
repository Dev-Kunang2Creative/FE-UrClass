"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminBackButtonProps {
  label?: string;
  fallbackHref?: string;
  className?: string;
  onBeforeBack?: () => boolean | Promise<boolean>;
  iconOnly?: boolean;
}

export default function AdminBackButton({
  label = "Kembali",
  fallbackHref = "/dashboard/admin",
  className,
  onBeforeBack,
  iconOnly = true,
}: AdminBackButtonProps) {
  const router = useRouter();

  const handleBack = async () => {
    if (onBeforeBack) {
      const canGoBack = await onBeforeBack();
      if (!canGoBack) return;
    }

    const historyIndex = window.history.state?.idx;
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const isExternalReferrer = referrer ? referrer.origin !== window.location.origin : false;
    const hasInternalHistory =
      typeof historyIndex === "number"
        ? historyIndex > 0
        : window.history.length > 1 && !isExternalReferrer;

    if (hasInternalHistory && !isExternalReferrer) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className={cn(
        "h-10 w-10 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-[#004AAB] rounded-full",
        className,
      )}
      aria-label="Kembali ke halaman sebelumnya"
    >
      <ArrowLeft className="h-6 w-6" />
      {!iconOnly && label}
    </Button>
  );
}
