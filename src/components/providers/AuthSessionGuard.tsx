"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { AUTH_TOKEN_INVALID_EVENT } from "@/lib/axios";

const SESSION_REPLACED_NOTICE_KEY = "amunisi:session-replaced-notice";

export default function AuthSessionGuard() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isHandlingInvalidSession = useRef(false);

  const handleInvalidSession = useCallback(async () => {
    if (isHandlingInvalidSession.current) return;

    isHandlingInvalidSession.current = true;
    window.localStorage.setItem(SESSION_REPLACED_NOTICE_KEY, "1");
    await signOut({ redirect: false });
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (session?.authError === "TOKEN_INVALID") {
      handleInvalidSession();
    }
  }, [handleInvalidSession, session?.authError]);

  useEffect(() => {
    window.addEventListener(AUTH_TOKEN_INVALID_EVENT, handleInvalidSession);

    return () => {
      window.removeEventListener(AUTH_TOKEN_INVALID_EVENT, handleInvalidSession);
    };
  }, [handleInvalidSession]);

  useEffect(() => {
    if (pathname !== "/login") return;
    if (window.localStorage.getItem(SESSION_REPLACED_NOTICE_KEY) !== "1") return;

    window.localStorage.removeItem(SESSION_REPLACED_NOTICE_KEY);
    isHandlingInvalidSession.current = false;
    toast.warning("Sesi kamu berakhir", {
      description: "Akun ini baru saja login di device lain. Silakan login kembali jika ingin memakai device ini.",
    });
  }, [pathname]);

  return null;
}
