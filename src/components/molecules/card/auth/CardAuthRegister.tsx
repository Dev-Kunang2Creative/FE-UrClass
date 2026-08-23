"use client";

import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import FormAuthRegister from "../../form/auth/FormAuthRegister";
import { useGetGoogleRedirect } from "@/http/auth/login-google";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CardAuthRegister() {
  const { refetch: googleLogin, isFetching: isGoogleLoading } =
    useGetGoogleRedirect({});

  const handleGoogleLogin = async () => {
    try {
      const res = await googleLogin();

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      toast.error("Gagal mendaftar dengan Google!");
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-4">
      {/* Main Unified Auth Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)] border border-slate-100 p-7 sm:p-9 space-y-6">
        {/* Card Header with Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/images/logo/urclass.png"
              alt="UrClass Logo"
              width={240}
              height={180}
              priority
              className="h-16 w-auto object-contain mx-auto"
            />
          </Link>
          <div className="pt-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Daftar Akun
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Buat akun barumu untuk mulai simulasi tryout
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormAuthRegister />

          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              atau
            </span>
            <Separator className="flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 font-semibold text-sm text-slate-700 flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Daftar dengan Google</span>
          </button>
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            Sudah punya akun?{" "}
          </span>
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-bold underline"
          >
            Masuk sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
