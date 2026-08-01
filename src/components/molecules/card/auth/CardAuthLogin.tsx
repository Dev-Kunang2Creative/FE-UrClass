"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import FormAuthLogin from "../../form/auth/FormAuthLogin";
import { useGetGoogleRedirect } from "@/http/auth/login-google";
import { toast } from "sonner";

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
    <div className="space-y-6 w-full max-w-md h-full mx-auto">
      <div className="flex items-center justify-center">
        <Image
          src={"/images/logo/urclass.png"}
          alt="Logo UrClass"
          width={200}
          height={200}
          priority
          className="h-36 w-auto"
        />
      </div>
      <Card className="p-4 border-0 shadow-none" size="sm">
        <CardContent className="space-y-6 p-4 border-0 shadow-none">
          <div>
            <h3 className="text-2xl font-bold">Masuk</h3>
          </div>
          <div className="space-y-6">
            <FormAuthLogin />

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ATAU</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full gap-2.5 cursor-pointer"
              size={"lg"}
            >
              <svg
                width="15"
                height="15"
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
              Masuk dengan Google
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
            </span>
            <Link
              href="/register"
              className="text-sm text-primary font-medium underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
