import type { Metadata } from "next";
import AuthForgotPasswordWrapper from "@/components/organisms/auth/AuthForgotPasswordWrapper";

export const metadata: Metadata = {
  title: "Lupa Password | UrClass",
};

export default function ForgotPasswordPage() {
  return (
    <main>
      <AuthForgotPasswordWrapper />
    </main>
  );
}
