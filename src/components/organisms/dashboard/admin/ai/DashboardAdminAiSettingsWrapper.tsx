"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  KeyRound,
  Loader2,
  Pencil,
  Plug,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/utils/get-error-message";
import AiUsageMonitor from "@/components/organisms/dashboard/admin/ai/AiUsageMonitor";
import {
  useAiSettings,
  useLoadAiModels,
  useSaveAiSettings,
  useTestAiConnection,
  type AiModel,
  type AiProvider,
  type AiSettings,
  type AiSettingsPayload,
} from "@/http/ai/admin-ai-settings";

/**
 * Pengaturan dan pemantauan asisten AI.
 *
 * Kunci API tidak pernah dikirim balik oleh server - yang datang hanya bentuk
 * tersamar. Karena itu kolom kuncinya selalu mulai kosong, dan mengosongkannya
 * berarti "pertahankan yang sudah ada", bukan "hapus". Tanpa aturan itu, admin
 * yang menyimpan perubahan model akan ikut menghapus kuncinya tanpa sadar.
 *
 * Persona ada di modal: isinya ribuan karakter, dan sebagai kotak teks sebaris
 * ia mendorong seluruh kolom lain ke bawah lipatan - sehingga hal yang paling
 * sering diubah (kunci, model, kuota) justru paling jauh dijangkau.
 */

const LABEL_PROVIDER: Record<AiProvider, string> = {
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic (Claude)",
};

const CONTOH: Record<
  AiProvider,
  { endpoint: string; model: string; catatan: string; harga: [number, number, number] }
> = {
  openai_compatible: {
    endpoint: "https://openrouter.ai/api/v1",
    model: "openai/gpt-oss-120b",
    catatan:
      "Server memanggil {endpoint}/chat/completions. Jalan di OpenRouter, Groq, Together, DeepSeek, Azure OpenAI, dan OpenAI.",
    harga: [0.15, 0.6, 0.0375],
  },
  anthropic: {
    endpoint: "https://api.anthropic.com",
    model: "claude-opus-5",
    catatan:
      "Server memanggil {endpoint}/v1/messages dengan header x-api-key. Isi alamat dasarnya saja, tanpa /v1.",
    harga: [5, 25, 0.5],
  },
};

type Draft = Omit<AiSettingsPayload, "api_key"> & { api_key: string };

export default function DashboardAdminAiSettingsWrapper() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const { data: setting, isPending } = useAiSettings({ token });

  if (isPending || !setting) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <Tabs defaultValue="pengaturan" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pengaturan">Pengaturan</TabsTrigger>
        <TabsTrigger value="pemantauan">Pemantauan</TabsTrigger>
      </TabsList>

      <TabsContent value="pengaturan">
        {/*
         * Form dipisah dan di-remount lewat key, bukan disemai dari effect.
         * State form diturunkan dari data yang diambil, dan menyemainya di
         * useEffect berarti render pertama memakai state kosong lalu
         * menimpanya - pola yang eslint tolak, dan yang juga menyebabkan
         * suntingan admin tertimpa setiap kali query menyegarkan diri.
         */}
        <FormPengaturan key={setting.updated_at ?? "baru"} setting={setting} token={token} />
      </TabsContent>

      <TabsContent value="pemantauan">
        <AiUsageMonitor />
      </TabsContent>
    </Tabs>
  );
}

function FormPengaturan({ setting, token }: { setting: AiSettings; token: string }) {
  const save = useSaveAiSettings({ token });
  const test = useTestAiConnection({ token });
  const loadModels = useLoadAiModels({ token });

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
    price_input_per_mtok: setting.price_input_per_mtok,
    price_output_per_mtok: setting.price_output_per_mtok,
    price_cached_per_mtok: setting.price_cached_per_mtok,
    daily_message_limit: setting.daily_message_limit,
    history_limit: setting.history_limit,
    is_active: setting.is_active,
  });

  const [personaOpen, setPersonaOpen] = useState(false);
  const [models, setModels] = useState<AiModel[] | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /** Kredensial yang sedang di layar, untuk uji koneksi dan daftar model. */
  const probe = () => ({
    provider: draft.provider,
    endpoint: draft.endpoint,
    api_key: draft.api_key,
    model: draft.model,
  });

  /**
   * Galat provider punya rincian, dan rinciannya ditampilkan - halaman ini
   * hanya dilihat admin, dan justru rincian itu yang dicari orang yang sedang
   * mendiagnosis. Kuncinya sudah disensor server.
   */
  const tampilkanGalat = (judul: string, error: unknown) => {
    const data = (
      error as {
        response?: {
          data?: { message?: string; detail?: string | null; errors?: Record<string, string[]> };
        };
      }
    ).response?.data;

    toast.error(judul, {
      description:
        data?.detail ||
        (data?.errors ? Object.values(data.errors).flat().join(" ") : undefined) ||
        getErrorMessage(error, "Terjadi kesalahan."),
      duration: 10_000,
    });
  };

  const simpan = (override?: Partial<Draft>, pesanSukses?: string) => {
    save.mutate(
      { ...draft, ...override },
      {
        onSuccess: (result) => {
          toast.success(pesanSukses ?? result.message);
          setDraft((prev) => ({ ...prev, ...override, api_key: "" }));
          setPersonaOpen(false);
        },
        onError: (error) => tampilkanGalat("Gagal menyimpan", error),
      },
    );
  };

  const contoh = CONTOH[draft.provider];
  const adaKunci = setting.has_api_key || draft.api_key.trim().length > 0;
  const siap = Boolean(draft.endpoint && draft.model && adaKunci);

  return (
    <div className="space-y-4">
      {/* Keadaan yang sedang berlaku, di paling atas: itu pertanyaan pertama
          siapa pun yang membuka halaman ini. */}
      <div
        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${
          setting.is_active
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        {setting.is_active ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        ) : (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold ${
              setting.is_active ? "text-emerald-900" : "text-amber-900"
            }`}
          >
            {setting.is_active
              ? "Asisten aktif — tombolnya muncul di dashboard peserta"
              : "Asisten nonaktif — tombolnya tidak dirender sama sekali"}
          </p>
          <p
            className={`text-xs leading-relaxed ${
              setting.is_active ? "text-emerald-800" : "text-amber-800"
            }`}
          >
            {setting.is_active
              ? `${LABEL_PROVIDER[setting.provider]} · ${setting.model} · kuota ${setting.daily_message_limit} pesan/peserta/hari`
              : "Isi endpoint dan API key, muat daftar model, uji koneksinya, lalu nyalakan."}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Koneksi provider</CardTitle>
          <p className="text-sm text-muted-foreground">
            Peserta tidak pernah memanggil provider langsung. Semua permintaan
            lewat server ini, jadi endpoint dan API key tidak pernah sampai ke
            browser siapa pun.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <Field label="Provider" hint="Menentukan bentuk request yang dikirim server.">
            <select
              value={draft.provider}
              onChange={(event) => {
                const provider = event.target.value as AiProvider;
                const preset = CONTOH[provider];
                // Daftar model milik provider sebelumnya tidak berlaku lagi.
                setModels(null);
                // Harga bawaan hanya diisikan kalau admin belum mengisinya,
                // supaya angka yang sudah disesuaikan tidak tertimpa saat
                // sekadar melihat pilihan provider.
                setDraft((prev) => ({
                  ...prev,
                  provider,
                  price_input_per_mtok: prev.price_input_per_mtok || preset.harga[0],
                  price_output_per_mtok: prev.price_output_per_mtok || preset.harga[1],
                  price_cached_per_mtok: prev.price_cached_per_mtok || preset.harga[2],
                }));
              }}
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:max-w-xs"
            >
              {setting.providers.map((provider) => (
                <option key={provider} value={provider}>
                  {LABEL_PROVIDER[provider]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Endpoint" hint={contoh.catatan}>
            <Input
              value={draft.endpoint}
              onChange={(event) => {
                setModels(null);
                set("endpoint", event.target.value);
              }}
              placeholder={contoh.endpoint}
            />
            <p className="mt-1 text-xs text-slate-500">
              Wajib https, dan tidak boleh menunjuk alamat internal — server yang
              memanggilnya, jadi endpoint ke jaringan dalam ditolak.
            </p>
          </Field>

          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-600" />
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-bold text-slate-800">
                  API key tidak bisa dibaca lagi setelah disimpan.
                </span>{" "}
                Kuncinya disimpan terenkripsi dan tidak pernah dikirim balik ke
                halaman ini — bahkan untukmu. Simpan salinanmu sendiri di tempat
                yang aman.
              </p>
            </div>

            <Field
              label="API Key"
              hint={
                setting.has_api_key
                  ? `Terpasang: ${setting.api_key_masked} · biarkan kosong kalau tidak ingin menggantinya`
                  : "Belum ada key terpasang."
              }
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={draft.api_key}
                  onChange={(event) => set("api_key", event.target.value)}
                  placeholder={setting.has_api_key ? "••••••••  (tidak diubah)" : "sk-..."}
                  className="bg-white pl-9"
                />
              </div>
            </Field>
          </div>

          {/* Model dimuat dari provider supaya tidak perlu dihafal, tapi tetap
              bisa diketik - daftar provider bisa gagal dimuat, dan sebagian
              gateway tidak menyediakan endpoint daftarnya sama sekali. */}
          <Field
            label="Model"
            hint={
              models
                ? `${models.length} model dimuat dari provider. Masih bisa diketik manual.`
                : `Contoh: ${contoh.model}. Muat daftarnya kalau tidak ingat id modelnya.`
            }
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              {models && models.length > 0 ? (
                <select
                  value={models.some((item) => item.id === draft.model) ? draft.model : ""}
                  onChange={(event) => set("model", event.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">— pilih model —</option>
                  {models.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name ? `${item.id} · ${item.name}` : item.id}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={draft.model}
                  onChange={(event) => set("model", event.target.value)}
                  placeholder={contoh.model}
                  className="min-w-0 flex-1"
                />
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  loadModels.mutate(probe(), {
                    onSuccess: (result) => {
                      setModels(result.data);
                      toast.success(result.message);
                    },
                    onError: (error) => tampilkanGalat("Gagal memuat daftar model", error),
                  })
                }
                disabled={loadModels.isPending || !draft.endpoint || !adaKunci}
                className="shrink-0 border-2 font-bold"
              >
                {loadModels.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                Muat Daftar
              </Button>
            </div>

            {models && models.length > 0 && (
              <button
                type="button"
                onClick={() => setModels(null)}
                className="mt-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 hover:underline"
              >
                Ketik manual saja
              </button>
            )}
          </Field>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(next) => set("is_active", next)}
                disabled={!siap && !draft.is_active}
              />
              <span className="text-sm">
                <span className="font-semibold text-slate-800">
                  {draft.is_active ? "Aktifkan untuk peserta" : "Nonaktif"}
                </span>
                <span className="block text-xs text-slate-500">
                  {siap || draft.is_active
                    ? "Berlaku setelah disimpan."
                    : "Lengkapi endpoint, key, dan model dulu."}
                </span>
              </span>
            </label>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                test.mutate(probe(), {
                  onSuccess: (result) =>
                    toast.success(result.message, {
                      description: `Model ${result.data.model} menjawab: "${result.data.reply}"`,
                    }),
                  onError: (error) => tampilkanGalat("Uji koneksi gagal", error),
                })
              }
              disabled={test.isPending || !draft.endpoint || !adaKunci || !draft.model}
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

          <p className="text-xs leading-relaxed text-slate-500">
            Uji koneksi dan muat daftar memakai isi kolom di atas —{" "}
            <span className="font-semibold">tidak perlu disimpan dulu</span>, dan
            kredensial yang diuji tidak ikut tersimpan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <FileText className="size-5 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">Persona asisten</p>
            <p className="text-xs leading-relaxed text-slate-500">
              {draft.system_prompt.length.toLocaleString("id-ID")} karakter ·
              disimpan di server, jadi peserta tidak bisa membacanya maupun
              menyuruh asisten mengabaikannya.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPersonaOpen(true)}
            className="shrink-0 border-2 font-bold"
          >
            <Pencil className="mr-2 size-4" />
            Ubah Persona
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Batas pemakaian & harga</CardTitle>
          <p className="text-sm text-muted-foreground">
            Harga dipakai untuk estimasi biaya di tab Pemantauan, dan dibekukan ke
            tiap permintaan saat terjadi — mengubahnya di sini tidak mengubah
            biaya yang sudah tercatat.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Kuota per peserta / hari" hint="Setiap pesan berbiaya.">
              <Input
                type="number"
                min={1}
                max={1000}
                value={draft.daily_message_limit}
                onChange={(event) => set("daily_message_limit", Number(event.target.value))}
              />
            </Field>

            <Field label="Riwayat dikirim" hint="0 = tiap pesan berdiri sendiri.">
              <Input
                type="number"
                min={0}
                max={40}
                value={draft.history_limit}
                onChange={(event) => set("history_limit", Number(event.target.value))}
              />
            </Field>

            <Field label="Max tokens" hint="Panjang maksimum satu jawaban.">
              <Input
                type="number"
                min={256}
                max={32000}
                step={256}
                value={draft.max_tokens}
                onChange={(event) => set("max_tokens", Number(event.target.value))}
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
                onChange={(event) => set("temperature_x100", Number(event.target.value))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
            <Field label="Harga input / 1 jt token" hint="USD. Lihat halaman harga providermu.">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={draft.price_input_per_mtok}
                onChange={(event) => set("price_input_per_mtok", Number(event.target.value))}
              />
            </Field>
            <Field label="Harga output / 1 jt token" hint="USD. Biasanya lebih mahal dari input.">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={draft.price_output_per_mtok}
                onChange={(event) => set("price_output_per_mtok", Number(event.target.value))}
              />
            </Field>
            <Field label="Harga cache / 1 jt token" hint="USD. Biasanya jauh lebih murah.">
              <Input
                type="number"
                min={0}
                step={0.001}
                value={draft.price_cached_per_mtok}
                onChange={(event) => set("price_cached_per_mtok", Number(event.target.value))}
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
          onClick={() => simpan()}
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

      <Dialog open={personaOpen} onOpenChange={setPersonaOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] max-w-3xl flex-col gap-0 p-0"
        >
          {/* key membuat state editornya lahir ulang setiap kali dibuka,
              sehingga membatalkan lalu membuka lagi tidak menyisakan suntingan
              lama - tanpa perlu useEffect untuk menyemainya. */}
          {personaOpen && (
            <PersonaEditor
              key={draft.system_prompt}
              value={draft.system_prompt}
              saving={save.isPending}
              onSave={(text) => simpan({ system_prompt: text }, "Persona berhasil disimpan.")}
              onCancel={() => setPersonaOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Editor persona.
 *
 * Modalnya menyimpan langsung ke server. Alternatifnya - hanya mengubah draft
 * lalu menunggu tombol simpan utama - membuat admin menutup modal sambil
 * mengira sudah tersimpan.
 */
function PersonaEditor({
  value,
  saving,
  onSave,
  onCancel,
}: {
  value: string;
  saving: boolean;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  const berubah = text !== value;

  return (
    <>
      <DialogHeader className="border-b px-5 py-4 text-left">
        <DialogTitle className="text-base">Persona asisten</DialogTitle>
        <DialogDescription className="text-xs leading-relaxed">
          Instruksi yang menentukan cara asisten menjawab. Disimpan di server —
          peserta tidak bisa membacanya maupun menyuruh asisten mengabaikannya.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={22}
          maxLength={20000}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-input bg-white px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="mt-2 text-xs text-slate-500">
          {text.length.toLocaleString("id-ID")} / 20.000 karakter
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setText(value)}
          disabled={!berubah || saving}
          className="border-2 font-bold"
        >
          <RotateCcw className="mr-2 size-4" />
          Kembalikan
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="border-2 font-bold"
          >
            <X className="mr-2 size-4" />
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => onSave(text)}
            disabled={!berubah || saving || !text.trim()}
            className="border-2 border-slate-900 font-bold"
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            Simpan Persona
          </Button>
        </div>
      </div>
    </>
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
