"use client";

import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginType, loginSchema } from "@/validators/auth/login-validator";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function FormAuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (body: LoginType) => {
    setIsLoading(true);
    const res = await signIn("credentials", { ...body, redirect: false });
    setIsLoading(false);

    if (!res || res.error) {
      toast.error("Login Gagal", {
        description:
          res?.error === "CredentialsSignin"
            ? "Email atau password salah."
            : "An error occurred, please try again.",
      });
      return;
    }

    toast.success("Login Berhasil!", {
      description: "Selamat datang, anda akan diarahkan ke dashboard.",
    });

    router.push("/dashboard");
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input
                {...field}
                type="email"
                id="email"
                placeholder="Masukkan email"
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Masuk"}{" "}
        </Button>
      </div>
    </form>
  );
}
