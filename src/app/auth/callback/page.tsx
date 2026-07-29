"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function OAuthCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      router.push("/login");
      return;
    }

    signIn("credentials", {
      token,
      redirect: false,
    }).then((res) => {
      if (!res || res.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-primary/20 blur-xl" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Sedang memproses login...
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
