"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import FormAuthLogin from "../../form/auth/FormAuthLogin";
import { useGetGoogleRedirect } from "@/http/auth/login-google";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CardAuthLogin() {
  const { refetch: googleLogin, isFetching: isGoogleLoading } =
    useGetGoogleRedirect({});

  const handleGoogleLogin = async () => {
    try {
      const res = await googleLogin();

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      toast.error("Login Google gagal");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-6">
      {/* Brand Logo Header */}
      <div className="flex flex-col items-center justify-center space-y-2 mb-1">
        <div className="bg-white px-8 py-4 rounded-2xl border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] inline-flex items-center justify-center">
          <Image
            src="/images/logo/urclass.png"
            alt="Logo UrClass"
            width={320}
            height={240}
            priority
            className="h-24 sm:h-28 w-auto object-contain"
          />
        </div>
      </div>

      {/* Main Neo-Brutalist Card */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#0f172a] p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke Akunmu
          </h2>
          <p className="text-sm text-slate-600">
            Akses ribuan soal tryout UTBK & CPNS terupdate.
          </p>
        </div>

        <div className="space-y-5">
          <FormAuthLogin />

          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              atau
            </span>
            <Separator className="flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl border-2 border-slate-900 bg-white font-bold text-sm text-slate-800 flex items-center justify-center gap-3 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[1px_1px_0px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
            <span>Masuk dengan Google</span>
          </button>
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            Belum punya akun?{" "}
          </span>
          <Link
            href="/register"
            className="text-sm text-blue-600 hover:text-blue-700 font-bold underline"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
