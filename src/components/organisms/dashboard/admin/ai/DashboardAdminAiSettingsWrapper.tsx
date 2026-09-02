"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle2, KeyRound, Loader2, Plug, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/utils/get-error-message";
import {
  useAiSettings,
  useSaveAiSettings,
  useTestAiConnection,
  type AiProvider,
  type AiSettingsPayload,
} from "@/http/ai/admin-ai-settings";

/**
 * Pengaturan asisten AI.
 *
 * Kunci API tidak pernah dikirim balik oleh server - yang datang hanya bentuk
 * tersamar. Karena itu kolom kuncinya selalu mulai kosong, dan mengosongkannya
 * berarti "pertahankan yang sudah ada", bukan "hapus". Tanpa aturan itu, admin
 * yang menyimpan perubahan model akan ikut menghapus kuncinya tanpa sadar.
 */

const LABEL_PROVIDER: Record<AiProvider, string> = {
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic (Claude)",
};

const CONTOH: Record<AiProvider, { endpoint: string; model: string; catatan: string }> = {
  openai_compatible: {
    endpoint: "https://openrouter.ai/api/v1",
    model: "openai/gpt-oss-120b",
    catatan:
      "Jalan di OpenRouter, Groq, Together, DeepSeek, Fireworks, Azure OpenAI, dan OpenAI. Server memanggil {endpoint}/chat/completions.",
  },
  anthropic: {
    endpoint: "https://api.anthropic.com",
    model: "claude-opus-5",
    catatan:
      "Server memanggil {endpoint}/v1/messages dengan header x-api-key. Isi endpoint dengan alamat dasarnya saja, tanpa /v1.",
  },
};

type Draft = Omit<AiSettingsPayload, "api_key"> & { api_key: string };

export default function DashboardAdminAiSettingsWrapper() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const { data: setting, isPending } = useAiSettings({ token });

  if (isPending || !setting) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">Memuat pengaturan...</p>
    );
  }

  /**
   * Form dipisah dan di-remount lewat key, bukan disemai dari effect.
   *
   * State form diturunkan dari data yang diambil, dan menyemainya di dalam
   * useEffect berarti render pertama memakai state kosong lalu menimpanya -
   * pola yang eslint tolak (react-hooks/set-state-in-effect) dan yang juga
   * menyebabkan suntingan admin tertimpa setiap kali query menyegarkan diri.
   * Dengan key, komponennya lahir sudah membawa nilai yang benar.
   */
  return <FormPengaturan key={setting.updated_at ?? "baru"} setting={setting} token={token} />;
}

function FormPengaturan({
  setting,
  token,
}: {
  setting: NonNullable<ReturnType<typeof useAiSettings>["data"]>;
  token: string;
}) {
  const save = useSaveAiSettings({ token });
  const test = useTestAiConnection({ token });

  const [draft, setDraft] = useState<Draft>({
    provider: setting.provider,
    endpoint: setting.endpoint ?? "",
    // Selalu kosong: kunci aslinya tidak pernah sampai ke sini, dan kosong
    // berarti "jangan ubah".
    api_key: "",
    model: setting.model ?? "",
    system_prompt: setting.system_prompt ?? "",
    max_tokens: setting.max_tokens,
    temperature_x100: setting.temperature_x100,
    daily_message_limit: setting.daily_message_limit,
    history_limit: setting.history_limit,
    is_active: setting.is_active,
  });

  const handleSave = () => {
    save.mutate(draft, {
      onSuccess: (result) => {
        toast.success(result.message);
        // Kolom kunci dikosongkan lagi setelah berhasil, supaya kunci yang baru
        // diisi tidak tertinggal di DOM lebih lama dari perlunya.
        setDraft((prev) => ({ ...prev, api_key: "" }));
      },
      onError: (error) => {
        const errors = error.response?.data?.errors;
        toast.error("Gagal menyimpan", {
          description: errors
            ? Object.values(errors).flat().join(" ")
            : getErrorMessage(error, "Terjadi kesalahan."),
        });
      },
    });
  };

  const handleTest = () => {
    test.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(result.message, {
          description: `Model ${result.data.model} menjawab: "${result.data.reply}"`,
        });
      },
      onError: (error) =>
        toast.error("Uji koneksi gagal", {
          description: getErrorMessage(error, "Terjadi kesalahan."),
        }),
    });
  };

  const contoh = CONTOH[draft.provider];

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Koneksi Provider</CardTitle>
          <p className="text-sm text-muted-foreground">
            Peserta tidak pernah memanggil provider secara langsung. Semua
            permintaan lewat server ini, jadi endpoint dan API key tidak pernah
            sampai ke browser siapa pun.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div className="space-y-1 text-xs leading-relaxed text-emerald-900">
              <p className="font-bold">API key tidak bisa dibaca lagi setelah disimpan</p>
              <p>
                Kuncinya disimpan terenkripsi dan tidak pernah dikirim balik ke
                halaman ini — bahkan untukmu. Yang tampil hanya bentuk
                tersamarnya. Simpan salinanmu sendiri di tempat yang aman.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Provider" hint="Menentukan bentuk request yang dikirim server.">
              <select
                value={draft.provider}
                onChange={(event) => {
                  const provider = event.target.value as AiProvider;
                  setDraft({ ...draft, provider });
                }}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {setting.providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {LABEL_PROVIDER[provider]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Model" hint={`Contoh: ${contoh.model}`}>
              <Input
                value={draft.model}
                onChange={(event) => setDraft({ ...draft, model: event.target.value })}
                placeholder={contoh.model}
              />
            </Field>
          </div>

          <Field label="Endpoint" hint={contoh.catatan}>
            <Input
              value={draft.endpoint}
              onChange={(event) => setDraft({ ...draft, endpoint: event.target.value })}
              placeholder={contoh.endpoint}
            />
            <p className="mt-1 text-xs text-slate-500">
              Wajib https, dan tidak boleh menunjuk alamat internal — server yang
              memanggilnya, jadi endpoint ke jaringan dalam akan ditolak.
            </p>
          </Field>

          <Field
            label="API Key"
            hint={
              setting.has_api_key
                ? `Terpasang: ${setting.api_key_masked}. Biarkan kosong kalau tidak ingin menggantinya.`
                : "Belum ada key terpasang."
            }
          >
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                autoComplete="new-password"
                value={draft.api_key}
                onChange={(event) => setDraft({ ...draft, api_key: event.target.value })}
                placeholder={setting.has_api_key ? "••••••••  (tidak diubah)" : "sk-..."}
                className="pl-9"
              />
            </div>
          </Field>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(next) => setDraft({ ...draft, is_active: next })}
              />
              <span className="text-sm">
                <span className="font-semibold text-slate-800">
                  {draft.is_active ? "Aktif untuk peserta" : "Nonaktif"}
                </span>
                <span className="block text-xs text-slate-500">
                  {draft.is_active
                    ? "Tombol asisten muncul di dashboard peserta."
                    : "Tombol asisten tidak dirender sama sekali."}
                </span>
              </span>
            </label>

            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={test.isPending || !setting.has_api_key}
              className="border-2 font-bold"
            >
              {test.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plug className="mr-2 size-4" />
              )}
              Uji Koneksi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Persona & Batas Pemakaian</CardTitle>
          <p className="text-sm text-muted-foreground">
            Persona disimpan di server, jadi peserta tidak bisa membacanya maupun
            menyuruh asisten mengabaikannya.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <Field
            label="Persona (system prompt)"
            hint={`${draft.system_prompt.length.toLocaleString("id-ID")} / 20.000 karakter`}
          >
            <textarea
              value={draft.system_prompt}
              onChange={(event) => setDraft({ ...draft, system_prompt: event.target.value })}
              rows={16}
              maxLength={20000}
              className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Kuota per peserta / hari" hint="Setiap pesan berbiaya.">
              <Input
                type="number"
                min={1}
                max={1000}
                value={draft.daily_message_limit}
                onChange={(event) =>
                  setDraft({ ...draft, daily_message_limit: Number(event.target.value) })
                }
              />
            </Field>

            <Field label="Riwayat dikirim" hint="0 = tiap pesan berdiri sendiri.">
              <Input
                type="number"
                min={0}
                max={40}
                value={draft.history_limit}
                onChange={(event) =>
                  setDraft({ ...draft, history_limit: Number(event.target.value) })
                }
              />
            </Field>

            <Field label="Max tokens" hint="Panjang maksimum satu jawaban.">
              <Input
                type="number"
                min={256}
                max={32000}
                step={256}
                value={draft.max_tokens}
                onChange={(event) => setDraft({ ...draft, max_tokens: Number(event.target.value) })}
              />
            </Field>

            <Field
              label="Temperature"
              hint={`${(draft.temperature_x100 / 100).toFixed(2)} — makin tinggi makin bervariasi.`}
            >
              <Input
                type="number"
                min={0}
                max={200}
                step={5}
                value={draft.temperature_x100}
                onChange={(event) =>
                  setDraft({ ...draft, temperature_x100: Number(event.target.value) })
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t-2 border-dashed border-slate-200 bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {setting.updated_at
            ? `Terakhir diubah ${new Date(setting.updated_at).toLocaleString("id-ID")}`
            : "Belum pernah disimpan"}
        </p>
        <Button
          type="button"
          onClick={handleSave}
          disabled={save.isPending}
          className="border-2 border-slate-900 font-bold"
        >
          {save.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 size-4" />
          )}
          Simpan Pengaturan
        </Button>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}
