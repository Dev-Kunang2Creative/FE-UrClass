import CardAuthRegister from "@/components/molecules/card/auth/CardAuthRegister";

export default function AuthRegisterWrapper() {
  return (
    <section className="min-h-screen bg-login flex items-center justify-center p-4 sm:p-6">
      <CardAuthRegister />
    </section>
  );
}
