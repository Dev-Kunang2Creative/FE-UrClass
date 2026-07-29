"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterType,
  registerSchema,
} from "@/validators/auth/register-validator";
import { registerApiHandler } from "@/http/auth/register";

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
import { getErrorMessage } from "@/utils/get-error-message";

export default function FormAuthRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onChange",
  });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (body: RegisterType) => {
    setIsLoading(true);

    try {
      await registerApiHandler(body);

      setIsLoading(false);

      toast.success("Registrasi Berhasil!", {
        description: "Silakan login dengan akun yang baru dibuat.",
      });

      router.push("/login");
    } catch (error: unknown) {
      setIsLoading(false);

      const message = getErrorMessage(
        error,
        "Terjadi kesalahan, silakan coba lagi.",
      );

      toast.error("Registrasi Gagal", {
        description: message,
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nama Lengkap</FieldLabel>
              <Input
                {...field}
                type="text"
                id="name"
                placeholder="Masukkan Nama Lengkap"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
                placeholder="Masukkan Email"
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
              <FieldLabel>Kata Sandi</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan Kata Sandi"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password_confirmation"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Konfirmasi Kata Sandi</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  id="password_confirmation"
                  placeholder="Masukkan Kata Sandi"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Daftar"}
        </Button>
      </div>
    </form>
  );
}
