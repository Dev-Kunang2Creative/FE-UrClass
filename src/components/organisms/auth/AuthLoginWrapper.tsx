import CardAuthLogin from "@/components/molecules/card/auth/CardAuthLogin";

export default function AuthLoginWrapper() {
  return (
    <section className="min-h-screen bg-login bg-cover bg-bottom bg-no-repeat flex items-center justify-center p-4">
      <CardAuthLogin />
    </section>
  );
}
