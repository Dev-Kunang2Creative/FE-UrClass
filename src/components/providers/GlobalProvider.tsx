"use client";

import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { DataModeProvider } from "./DataModeProvider";
import AuthSessionGuard from "./AuthSessionGuard";

const queryClient = new QueryClient();

export default function GlobalProvider({ children }: PropsWithChildren) {
  return (
    <>
      <SessionProvider refetchInterval={30} refetchWhenOffline={false}>
        <AuthSessionGuard />
        <QueryClientProvider client={queryClient}>
          <DataModeProvider>{children}</DataModeProvider>
        </QueryClientProvider>
        <Toaster position="top-right" />
      </SessionProvider>
    </>
  );
}
