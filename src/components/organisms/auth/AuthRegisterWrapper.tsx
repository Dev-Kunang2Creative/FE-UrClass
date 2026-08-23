import CardAuthRegister from "@/components/molecules/card/auth/CardAuthRegister";

export default function AuthRegisterWrapper() {
  return (
    <section className="min-h-screen bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-4 sm:p-6">
      <CardAuthRegister />
    </section>
  );
}
