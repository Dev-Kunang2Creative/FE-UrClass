import Image from "next/image";
import Link from "next/link";
import FormForgotPassword from "@/components/molecules/form/auth/FormForgotPassword";

export default function AuthForgotPasswordWrapper() {
  return (
    <section className="min-h-screen bg-login flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] mx-auto py-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)] border border-slate-100 p-7 sm:p-9 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2 pb-1">
            <Link
              href="/"
              className="inline-flex items-center justify-center transition-transform hover:scale-105"
            >
              <Image
                src="/images/logo/urclass.png"
                alt="UrClass Logo"
                width={2135}
                height={1635}
                priority
                className="h-20 sm:h-24 w-auto object-contain"
              />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Lupa Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cocokkan data profilmu untuk membuat password baru
              </p>
            </div>
          </div>

          <FormForgotPassword />

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-600">Sudah ingat? </span>
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80 font-bold underline"
            >
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
