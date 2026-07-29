"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else if (session.user.role === "admin") {
      router.push("/dashboard/admin");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role === "admin") {
    return null;
  }

  return (
    <>
      <DashboardContent />
    </>
  );
}
