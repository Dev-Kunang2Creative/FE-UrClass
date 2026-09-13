"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleHelp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  shouldMarkTurnstileStalled,
  shouldShowTurnstileGuidance,
  TURNSTILE_WATCHDOG_TIMEOUT_MS,
} from "./turnstile-watchdog";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onHelpRequested?: () => void;
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: string;
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  onHelpRequested,
  siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
    "1x00000000000000000000AA", // Cloudflare Turnstile standard test sitekey (always passes)
  theme = "light",
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  const watchdogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasTokenRef = useRef(false);
  const hasErrorRef = useRef(false);
  const [isStalled, setIsStalled] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  const clearWatchdog = useCallback(() => {
    if (watchdogTimeoutRef.current !== null) {
      clearTimeout(watchdogTimeoutRef.current);
      watchdogTimeoutRef.current = null;
    }
  }, []);

  const startWatchdog = useCallback(() => {
    clearWatchdog();
    hasTokenRef.current = false;
    hasErrorRef.current = false;
    watchdogTimeoutRef.current = setTimeout(() => {
      if (shouldMarkTurnstileStalled(hasTokenRef.current, hasErrorRef.current)) {
        setIsStalled(true);
      }
    }, TURNSTILE_WATCHDOG_TIMEOUT_MS);
  }, [clearWatchdog]);

  const resetWidget = useCallback(() => {
    setIsStalled(false);
    setHasError(false);
    onExpireRef.current?.();
    startWatchdog();

    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        setHasError(true);
      }
    }
  }, [startWatchdog]);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    startWatchdog();

    const renderWidget = () => {
      if (
        !containerRef.current ||
        !window.turnstile ||
        widgetIdRef.current !== null ||
        !isMounted
      ) {
        return;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (isMounted) {
              hasTokenRef.current = true;
              clearWatchdog();
              setIsStalled(false);
              setHasError(false);
              onSuccessRef.current(token);
            }
          },
          "error-callback": () => {
            if (isMounted) {
              hasErrorRef.current = true;
              clearWatchdog();
              setIsStalled(false);
              setHasError(true);
              onErrorRef.current?.();
            }
          },
          "expired-callback": () => {
            if (isMounted) {
              setHasError(false);
              startWatchdog();
              onExpireRef.current?.();
            }
          },
          theme,
          size: "normal",
        });
        widgetIdRef.current = id;
      } catch (err) {
        hasErrorRef.current = true;
        clearWatchdog();
        setIsStalled(false);
        setHasError(true);
        console.error("Turnstile render error:", err);
        onErrorRef.current?.();
      }
    };

    // Check if turnstile script is already present
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    );

    if (window.turnstile) {
      renderWidget();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          renderWidget();
        }
      };
      document.head.appendChild(script);
    } else {
      // Script is loading, poll briefly
      interval = setInterval(() => {
        if (window.turnstile) {
          if (interval !== null) {
            clearInterval(interval);
            interval = null;
          }
          renderWidget();
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      clearWatchdog();
      if (interval !== null) {
        clearInterval(interval);
      }
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [clearWatchdog, siteKey, startWatchdog, theme]);

  const showGuidance = shouldShowTurnstileGuidance(isStalled, hasError);
  const guidanceMessage = hasError
    ? "Verifikasi gagal. Coba muat ulang verifikasi."
    : "Verifikasi belum selesai. Coba muat ulang widgetnya.";

  return (
    <div className={`my-3 flex flex-col items-center gap-3 ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
      {showGuidance && (
        <div
          className="w-full max-w-sm rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-slate-800">
            {guidanceMessage}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <Button type="button" size="sm" variant="outline" onClick={resetWidget}>
              <RefreshCw className="size-3.5" />
              Muat Ulang Verifikasi
            </Button>
            <button
              type="button"
              onClick={onHelpRequested}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CircleHelp className="size-4" />
              Butuh bantuan verifikasi?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
