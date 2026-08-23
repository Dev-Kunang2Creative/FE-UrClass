import CardAuthLogin from "@/components/molecules/card/auth/CardAuthLogin";

export default function AuthLoginWrapper() {
  return (
    <section className="min-h-screen bg-login flex items-center justify-center p-4 sm:p-6">
      <CardAuthLogin />
    </section>
  );
}
