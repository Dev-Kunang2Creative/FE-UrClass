"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import TurnstileWidget from "@/components/atoms/turnstile/TurnstileWidget";
import DialogTurnstileHelp from "@/components/molecules/dialog/DialogTurnstileHelp";
import { getErrorMessage } from "@/utils/get-error-message";
import {
  forgotPasswordHandler,
  resetPasswordHandler,
} from "@/http/auth/forgot-password";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordType,
  type ResetPasswordType,
} from "@/validators/auth/forgot-password-validator";

/**
 * Verifikasi dan pembuatan password baru terjadi di satu halaman, bergantian.
 *
 * Tokennya hidup di state komponen ini saja - tidak di URL, tidak di
 * localStorage. Alamat yang memuat token akan tertinggal di riwayat peramban
 * dan ikut terkirim sebagai referrer, dan karena di alur ini yang memverifikasi
 * dan yang mengganti password adalah orang yang sama di sesi yang sama, token
 * itu memang tidak perlu ke mana-mana.
 */
export default function FormForgotPassword() {
  const router = useRouter();
  const [terverifikasi, setTerverifikasi] = useState<{
    email: string;
    token: string;
  } | null>(null);

  if (terverifikasi) {
    return (
      <LangkahPasswordBaru
        email={terverifikasi.email}
        token={terverifikasi.token}
        onSelesai={() => router.push("/login")}
        onUlangi={() => setTerverifikasi(null)}
      />
    );
  }

  return <LangkahVerifikasi onLolos={setTerverifikasi} />;
}

function LangkahVerifikasi({
  onLolos,
}: {
  onLolos: (hasil: { email: string; token: string }) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isTurnstileHelpOpen, setIsTurnstileHelpOpen] = useState(false);

  const form = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "", birth_date: "", phone_number: "" },
    mode: "onChange",
  });

  const onSubmit = async (body: ForgotPasswordType) => {
    setIsLoading(true);
    try {
      const hasil = await forgotPasswordHandler({
        ...body,
        cf_turnstile_response: turnstileToken,
      });
      onLolos({ email: hasil.data.email, token: hasil.data.token });
    } catch (error: unknown) {
      toast.error("Verifikasi gagal", {
        description: getErrorMessage(
          error,
          "Data yang kamu masukkan tidak cocok. Periksa lagi, atau hubungi admin lewat WhatsApp.",
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="grid grid-cols-1 gap-3.5">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input
                {...field}
                type="email"
                autoComplete="email"
                placeholder="Email akunmu"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="birth_date"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Tanggal Lahir</FieldLabel>
              <Input {...field} type="date" max="2100-12-31" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="phone_number"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nomor HP</FieldLabel>
              <Input
                {...field}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
              />
              <FieldDescription>
                Keduanya harus sama dengan yang tersimpan di profilmu.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <TurnstileWidget
        onSuccess={(token) => setTurnstileToken(token)}
        onError={() => setTurnstileToken("")}
        onExpire={() => setTurnstileToken("")}
        onHelpRequested={() => setIsTurnstileHelpOpen(true)}
      />

      <Button type="submit" className="w-full font-bold" disabled={isLoading}>
        {isLoading ? "Memeriksa..." : "Verifikasi Data"}
      </Button>

      {/* Percobaannya dibatasi, jadi peserta perlu tahu bahwa mencoba terus
          justru mengunci akunnya sendiri - dan tahu ke mana harus pergi. */}
      <p className="text-xs text-slate-500 text-center">
        Percobaan dibatasi lima kali per jam. Profil belum lengkap atau datanya
        lupa?{" "}
        <a
          href="https://wa.me/6281398169073"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline underline-offset-2"
        >
          Hubungi admin lewat WhatsApp
        </a>
        .
      </p>

      <DialogTurnstileHelp
        open={isTurnstileHelpOpen}
        onOpenChange={setIsTurnstileHelpOpen}
      />
    </form>
  );
}

function LangkahPasswordBaru({
  email,
  token,
  onSelesai,
  onUlangi,
}: {
  email: string;
  token: string;
  onSelesai: () => void;
  onUlangi: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onChange",
  });

  const onSubmit = async (body: ResetPasswordType) => {
    setIsLoading(true);
    try {
      await resetPasswordHandler({ ...body, email, token });
      toast.success("Password berhasil diubah", {
        description: "Silakan login dengan password barumu.",
      });
      onSelesai();
    } catch (error: unknown) {
      toast.error("Gagal mengubah password", {
        description: getErrorMessage(
          error,
          "Token reset sudah kedaluwarsa. Ulangi dari langkah pertama.",
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-500">Mengatur ulang password untuk</p>
        <p className="text-sm font-semibold text-slate-900 break-all">{email}</p>
      </div>

      <FieldGroup className="grid grid-cols-1 gap-3.5">
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Password Baru</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
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
              <FieldLabel>Konfirmasi Password Baru</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi password baru"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showConfirm ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full font-bold" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        Berlaku 15 menit. Semua perangkat yang masih login akan dikeluarkan.{" "}
        <button
          type="button"
          onClick={onUlangi}
          className="font-semibold text-primary underline underline-offset-2"
        >
          Ulangi verifikasi
        </button>
      </p>
    </form>
  );
}
