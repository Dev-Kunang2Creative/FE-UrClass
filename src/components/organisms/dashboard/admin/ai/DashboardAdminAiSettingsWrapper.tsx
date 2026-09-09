"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
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
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
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
import ModelPicker from "@/components/organisms/dashboard/admin/ai/ModelPicker";
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
    // Rupiah per satu juta token. Angka bawaan ini hanya titik awal - harga
    // provider terbit dalam USD, jadi admin perlu mengonversinya sendiri sesuai
    // kurs yang ia pakai. Tidak ada kurs yang disimpan aplikasi, supaya tidak
    // ada angka yang diam-diam basi.
    harga: [2400, 9600, 600],
  },
  anthropic: {
    endpoint: "https://api.anthropic.com",
    model: "claude-opus-5",
    catatan:
      "Server memanggil {endpoint}/v1/messages dengan header x-api-key. Isi alamat dasarnya saja, tanpa /v1.",
    harga: [80000, 400000, 8000],
  },
};

type Draft = Omit<AiSettingsPayload, "api_key" | "endpoint"> & {
  api_key: string;
  endpoint: string;
};

/**
 * Tab yang sedang terbuka disimpan di URL.
 *
 * Sebelumnya ia hanya state komponen, jadi setiap muat ulang halaman kembali ke
 * Pengaturan - dan halaman ini dibuka berulang kali justru untuk memantau, yang
 * berarti satu klik tambahan setiap kali. Di URL, tabnya bertahan melewati muat
 * ulang, dan tautannya bisa dikirim ke orang lain langsung ke tab yang dimaksud.
 *
 * Ditulis dengan window.history.replaceState, bukan router.replace: yang kedua
 * menjalankan navigasi app-router penuh setiap kali tab diklik. replaceState
 * didukung Next dan tetap tersinkron dengan useSearchParams - lihat
 * node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md.
 *
 * replace, bukan push: tombol kembali tidak perlu menyusuri riwayat pergantian
 * tab. Yang dibutuhkan adalah tidak kehilangan tempat saat muat ulang, bukan
 * riwayat tab.
 */
const TABS = ["pengaturan", "pemantauan"] as const;

type Tab = (typeof TABS)[number];

export default function DashboardAdminAiSettingsWrapper() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const { data: setting, isPending } = useAiSettings({ token });

  const searchParams = useSearchParams();
  const diminta = searchParams.get("tab");
  const tab: Tab = TABS.includes(diminta as Tab) ? (diminta as Tab) : "pengaturan";

  const gantiTab = (nilai: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nilai);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  if (isPending || !setting) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={gantiTab} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="pengaturan">Pengaturan</TabsTrigger>
          <TabsTrigger value="pemantauan">Monitoring</TabsTrigger>
        </TabsList>

        {tab === "pemantauan" && <TombolSegarkan />}
      </div>

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
    // Selalu kosong: endpoint dan kunci aslinya tidak pernah sampai ke sini,
    // dan kosong berarti "jangan ubah".
    endpoint: "",
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
    // Tidak ada kontrolnya di layar - pengali disetel langsung di basis data,
    // karena ia kebijakan penagihan gateway dan bukan sesuatu yang disetel
    // sehari-hari. Tetap ikut dikirim: PUT menimpa seluruh objek, jadi peta yang
    // tidak disertakan akan terhapus setiap kali admin menyimpan hal lain.
    model_multipliers: setting.model_multipliers ?? {},
  });

  const [personaOpen, setPersonaOpen] = useState(false);
  const [models, setModels] = useState<AiModel[] | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /** Kredensial yang sedang di layar, untuk uji koneksi dan daftar model. */
  const probe = () => ({
    provider: draft.provider,
    endpoint: draft.endpoint.trim() || undefined,
    api_key: draft.api_key.trim() || undefined,
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
          setDraft((prev) => ({ ...prev, ...override, api_key: "", endpoint: "" }));
          setPersonaOpen(false);
        },
        onError: (error) => tampilkanGalat("Gagal menyimpan", error),
      },
    );
  };

  const contoh = CONTOH[draft.provider];
  const adaEndpoint = Boolean(setting.has_endpoint || draft.endpoint.trim().length > 0);
  const adaKunci = Boolean(setting.has_api_key || draft.api_key.trim().length > 0);
  const siap = Boolean(adaEndpoint && draft.model && adaKunci);

  /**
   * Apakah ada yang belum disimpan.
   *
   * Tanpa ini tombol simpan selalu menyala dan tidak memberi tahu apa pun -
   * admin harus mengingat sendiri apakah suntingannya sudah masuk. Kolom
   * endpoint dan API key dikecualikan ketika kosong, karena kosong di situ
   * berarti "jangan ubah", bukan sebuah perubahan.
   */
  const berubah =
    (draft.endpoint.trim() !== "" ) ||
    (draft.api_key.trim() !== "") ||
    draft.provider !== setting.provider ||
    draft.model !== (setting.model ?? "") ||
    draft.system_prompt !== (setting.system_prompt ?? "") ||
    draft.max_tokens !== setting.max_tokens ||
    draft.temperature_x100 !== setting.temperature_x100 ||
    draft.price_input_per_mtok !== setting.price_input_per_mtok ||
    draft.price_output_per_mtok !== setting.price_output_per_mtok ||
    draft.price_cached_per_mtok !== setting.price_cached_per_mtok ||
    draft.daily_message_limit !== setting.daily_message_limit ||
    draft.history_limit !== setting.history_limit ||
    draft.is_active !== setting.is_active;

  return (
    <div className="space-y-4">
      {/* Keadaan yang sedang berlaku, satu baris di paling atas: itu pertanyaan
          pertama siapa pun yang membuka halaman ini, dan satu baris cukup untuk
          menjawabnya. */}
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-4 py-2.5 text-sm ${
          setting.is_active
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {setting.is_active ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        ) : (
          <AlertTriangle className="size-4 shrink-0 text-amber-600" />
        )}
        <span className="font-bold">{setting.is_active ? "Aktif" : "Nonaktif"}</span>
        <span className="opacity-40">·</span>
        <span className="min-w-0 text-xs opacity-80">
          {setting.is_active
            ? `${LABEL_PROVIDER[setting.provider]} · ${setting.model} · ${setting.daily_message_limit} pesan/peserta/hari`
            : "Lengkapi koneksi di bawah, uji, lalu nyalakan"}
        </span>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Koneksi provider</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            <Row label="Provider">
              <Segmented
                value={draft.provider}
                options={setting.providers.map((provider) => ({
                  value: provider,
                  label: LABEL_PROVIDER[provider],
                }))}
                onChange={(provider) => {
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
              />
            </Row>

            {/* Catatannya cuma nilai tersamarnya. "Tersimpan ... — kosongkan untuk
                mempertahankan" sudah diwakili placeholder kolomnya sendiri
                ("••• (tidak diubah)"), jadi kalimat itu hanya mengulang apa yang
                sudah terbaca dua senti di sebelahnya. */}
            <Row
              label="Endpoint"
              note={
                setting.has_endpoint ? <Masked value={setting.endpoint_masked} /> : undefined
              }
            >
              <Input
                value={draft.endpoint}
                onChange={(event) => {
                  setModels(null);
                  set("endpoint", event.target.value);
                }}
                placeholder={setting.has_endpoint ? "•••  (tidak diubah)" : contoh.endpoint}
              />
            </Row>

            <Row
              label="API key"
              note={setting.has_api_key ? <Masked value={setting.api_key_masked} /> : undefined}
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={draft.api_key}
                  onChange={(event) => set("api_key", event.target.value)}
                  placeholder={setting.has_api_key ? "•••  (tidak diubah)" : "sk-..."}
                  className="pl-9"
                />
              </div>
            </Row>

            {/* Model dimuat dari provider supaya tidak perlu dihafal, tapi tetap
                bisa diketik - daftar provider bisa gagal dimuat, dan sebagian
                gateway tidak menyediakan endpoint daftarnya sama sekali. */}
            <Row
              label="Model"
              note={
                models && models.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setModels(null)}
                    className="font-semibold text-slate-500 transition-colors hover:text-slate-900 hover:underline"
                  >
                    {models.length} model dimuat · ketik manual saja
                  </button>
                ) : undefined
              }
            >
              <div className="flex gap-2">
                {models && models.length > 0 ? (
                  <div className="min-w-0 flex-1">
                    <ModelPicker
                      value={draft.model}
                      models={models}
                      onChange={(model) => set("model", model)}
                    />
                  </div>
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
                  size="icon"
                  aria-label="Muat daftar model dari provider"
                  title="Muat daftar model dari provider"
                  onClick={() =>
                    loadModels.mutate(probe(), {
                      onSuccess: (result) => {
                        setModels(result.data);
                        toast.success(result.message);
                      },
                      onError: (error) => tampilkanGalat("Gagal memuat daftar model", error),
                    })
                  }
                  disabled={loadModels.isPending || !adaEndpoint || !adaKunci}
                  className="size-9 shrink-0"
                >
                  {loadModels.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </Button>
              </div>
            </Row>

            <Row label="Aktif untuk peserta">
              <div className="flex items-center gap-3">
                <Switch
                  checked={draft.is_active}
                  onCheckedChange={(next) => set("is_active", next)}
                  disabled={!siap && !draft.is_active}
                />
                <span className="text-xs text-slate-500">
                  {siap || draft.is_active
                    ? draft.is_active
                      ? "Tombol asisten muncul di dashboard peserta"
                      : "Tombol asisten tidak dirender"
                    : "Lengkapi endpoint, key, dan model dulu"}
                </span>
              </div>
            </Row>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Satu kalimat untuk seluruh kartu, menggantikan empat hint. */}
            <p className="text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mr-1 inline size-3.5 -translate-y-px text-slate-400" />
              Endpoint dan key disimpan terenkripsi, tidak pernah dikirim ke browser.
              Uji koneksi memakai isi kolom di atas — tanpa perlu disimpan dulu.
            </p>

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
              disabled={test.isPending || !adaEndpoint || !adaKunci || !draft.model}
              className="shrink-0 border-2 font-bold"
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

      {/* Satu baris, bukan kartu berpadding penuh: isinya cuma satu tautan ke
          modal, dan kartu setinggi 90px untuk itu memakan ruang yang seharusnya
          jadi milik kontrol yang benar-benar disetel. */}
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5">
        <FileText className="size-4 shrink-0 text-slate-400" />
        <p className="min-w-0 flex-1 truncate text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Persona asisten</span>
          <span className="text-slate-400"> · </span>
          {draft.system_prompt.length.toLocaleString("id-ID")} karakter
        </p>
        <button
          type="button"
          onClick={() => setPersonaOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Pencil className="size-3.5" />
          Ubah
        </button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Batas pemakaian & harga</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            <Row label="Kuota per peserta" unit="pesan / hari">
              <Input
                type="number"
                min={1}
                max={1000}
                value={draft.daily_message_limit}
                onChange={(event) => set("daily_message_limit", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>

            <Row label="Riwayat dikirim" unit={draft.history_limit === 0 ? "tiap pesan berdiri sendiri" : "pesan terakhir"}>
              <Input
                type="number"
                min={0}
                max={40}
                value={draft.history_limit}
                onChange={(event) => set("history_limit", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>

            <Row label="Panjang jawaban" unit="token maksimum">
              <Input
                type="number"
                min={256}
                max={32000}
                step={256}
                value={draft.max_tokens}
                onChange={(event) => set("max_tokens", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>

            <Row
              label="Temperature"
              unit={draft.temperature_x100 <= 30 ? "konsisten" : draft.temperature_x100 >= 120 ? "sangat bervariasi" : "seimbang"}
            >
              <Input
                type="number"
                min={0}
                max={200}
                step={5}
                value={draft.temperature_x100}
                onChange={(event) => set("temperature_x100", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>
          </div>

          <div className="mt-4 divide-y border-t pt-2">
            <Row label="Harga input" unit="Rp / 1 jt token">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={draft.price_input_per_mtok}
                onChange={(event) => set("price_input_per_mtok", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>

            <Row label="Harga output" unit="Rp / 1 jt token">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={draft.price_output_per_mtok}
                onChange={(event) => set("price_output_per_mtok", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>

            <Row label="Harga cache" unit="Rp / 1 jt token">
              <Input
                type="number"
                min={0}
                step={0.001}
                value={draft.price_cached_per_mtok}
                onChange={(event) => set("price_cached_per_mtok", Number(event.target.value))}
                className="sm:max-w-32"
              />
            </Row>
          </div>

          <p className="mt-4 border-t pt-4 text-xs leading-relaxed text-slate-500">
            Harga diisi dalam Rupiah per satu juta token — halaman harga provider
            biasanya dalam USD, jadi konversikan dulu dengan kursmu sendiri.
            Aplikasi tidak menyimpan kurs, supaya tidak ada angka yang diam-diam
            basi. Angka ini dibekukan ke tiap permintaan saat terjadi, jadi
            mengubahnya tidak mengubah biaya yang sudah tercatat.
          </p>
        </CardContent>
      </Card>

      {/* Bilah simpan melayang di atas isi halaman, bukan garis pemisah yang
          isinya rata mepet ke tepi. Sebelumnya ia hanya punya padding vertikal,
          jadi tombolnya menyentuh tepi kontainer sementara seluruh kartu di
          atasnya berpadding - dan garis putus-putusnya terbaca sebagai garis
          nyasar, bukan kaki panel. */}
      <div className="sticky bottom-4 z-10 pt-2">
        <div className="flex flex-col gap-3 rounded-xl border bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {berubah ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                Ada perubahan yang belum disimpan
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {setting.updated_at
                  ? `Tersimpan · terakhir diubah ${new Date(setting.updated_at).toLocaleString("id-ID")}`
                  : "Belum pernah disimpan"}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={() => simpan()}
            disabled={save.isPending || !berubah}
            className="w-full border-2 border-slate-900 font-bold sm:w-auto"
          >
            {save.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            {save.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      </div>

      <Dialog open={personaOpen} onOpenChange={setPersonaOpen}>
        <DialogContent
          showCloseButton={false}
          // sm:max-w-3xl! dengan penanda penting: dialog.tsx menanam
          // sm:max-w-md (448px), dan varian yang sama membuat kelas biasa
          // kalah di CSS - itu yang membuat modal ini sempit meski diberi
          // max-w-3xl.
          className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-3xl!"
        >
          {/* key membuat state editornya lahir ulang setiap kali dibuka,
              sehingga membatalkan lalu membuka lagi tidak menyisakan suntingan
              lama - tanpa perlu useEffect untuk menyemainya. */}
          {personaOpen && (
            <PersonaEditor
              key={draft.system_prompt}
              value={draft.system_prompt}
              defaultValue={setting.default_system_prompt}
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
  defaultValue,
  saving,
  onSave,
  onCancel,
}: {
  value: string;
  /** Persona bawaan dari server, untuk tombol pulihkan. */
  defaultValue?: string;
  saving: boolean;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  const berubah = text !== value;
  const bedaDariBawaan = Boolean(defaultValue && text.trim() !== defaultValue.trim());

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
          rows={20}
          maxLength={20000}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-input bg-white px-3.5 py-3 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="mt-2 text-right text-xs tabular-nums text-slate-400">
          {text.length.toLocaleString("id-ID")} / 20.000 karakter
        </p>
      </div>

      {/* Empat tombol sejajar tidak punya hierarki - mata harus membaca
          keempatnya untuk menemukan yang utama, dan "Batalkan suntingan" nyaris
          tak terbedakan dari "Batal". Sekarang aksi pemulih jadi tautan teks di
          kiri, dan hanya dua tombol berbentuk di kanan. */}
      <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <button
            type="button"
            onClick={() => setText(value)}
            disabled={!berubah || saving}
            className="flex items-center gap-1.5 font-semibold text-slate-500 transition-colors hover:text-slate-900 hover:underline disabled:opacity-40 disabled:hover:no-underline"
          >
            <RotateCcw className="size-3.5" />
            Kembalikan suntingan
          </button>

          {/* Jalan kembali ke persona bawaan. Tanpa ini, persona yang sudah
              disunting tidak bisa dipulihkan - dan pengerasan terhadap injeksi
              yang dikirim lewat pembaruan tidak akan pernah terpakai. */}
          {defaultValue && (
            <button
              type="button"
              onClick={() => setText(defaultValue)}
              disabled={!bedaDariBawaan || saving}
              title="Ganti dengan persona bawaan UrClass"
              className="flex items-center gap-1.5 font-semibold text-slate-500 transition-colors hover:text-slate-900 hover:underline disabled:opacity-40 disabled:hover:no-underline"
            >
              <Sparkles className="size-3.5" />
              Pakai persona bawaan
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
            className="font-bold"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => onSave(text)}
            disabled={!berubah || saving || !text.trim()}
            className="flex-1 border-2 border-slate-900 font-bold sm:flex-none"
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

/**
 * Satu baris pengaturan: nama di kiri, kontrolnya di kanan.
 *
 * Menggantikan pola label-di-atas-input-lalu-paragraf-hint. Pola itu membuat
 * sebelas field jadi dua puluh delapan potong teks, dan halaman yang isinya
 * penjelasan lebih banyak daripada kontrol justru lebih lambat dibaca - mata
 * harus melewati satu paragraf untuk sampai ke kolom berikutnya.
 *
 * Penjelasan yang benar-benar mencegah kesalahan dipindah ke satu kalimat per
 * kartu, bukan satu per field. Sisanya diwakili placeholder dan satuan.
 */
/**
 * Menyegarkan seluruh data pemantauan.
 *
 * Ada karena tidak semua yang ada di tab ini menyegarkan diri sendiri: peta
 * pemakaian langsung memang menyegar tiap lima detik, tapi grafik per periode,
 * pemakai terbanyak, dan kuota provider tidak - dan ketiganya yang paling sering
 * ingin dilihat ulang setelah ada yang berubah.
 *
 * Membatalkan cache query, bukan memuat ulang halaman: memuat ulang halaman
 * mengembalikan gulir ke atas dan membangun ulang seluruh pohon komponen untuk
 * sesuatu yang cukup diselesaikan tiga permintaan.
 */
/**
 * Query yang keadaan memuatnya diwakili tombol Segarkan.
 *
 * Semua query pemantauan kecuali peta langsung, yang menyegar sendiri.
 */
const dipantauTombol = (query: { queryKey: readonly unknown[] }) => {
  const kunci = String(query.queryKey[0]);

  return kunci.startsWith("admin-ai-") && kunci !== "admin-ai-live";
};

function TombolSegarkan() {
  const queryClient = useQueryClient();


  // Menghitung permintaan yang sedang berjalan, bukan menyimpan state sendiri:
  // state buatan sendiri harus dinolkan lagi setelah selesai, dan ia tidak tahu
  // kapan query-query itu benar-benar berhenti.
  //
  // Peta pemakaian langsung dikecualikan. Ia menyegar sendiri tiap lima detik,
  // jadi memasukkannya membuat tombol ini berkedip "Menyegarkan..." dan
  // nonaktif setiap lima detik tanpa ada yang menekannya - indikator yang
  // menyala terus-menerus berhenti berarti apa pun.
  const berjalan = useIsFetching({ predicate: dipantauTombol });

  return (
    <button
      type="button"
      // Yang dibatalkan termasuk peta langsung: ia memang akan menyegar sendiri
      // sebentar lagi, tapi orang yang menekan tombol ini ingin semuanya baru
      // sekarang.
      onClick={() =>
        queryClient.invalidateQueries({
          predicate: (query) => String(query.queryKey[0]).startsWith("admin-ai-"),
        })
      }
      disabled={berjalan > 0}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
    >
      <RefreshCw className={`size-3.5 ${berjalan > 0 ? "animate-spin" : ""}`} />
      {berjalan > 0 ? "Menyegarkan..." : "Segarkan"}
    </button>
  );
}

/** Nilai tersamar, ditampilkan sebagai kode supaya jelas ini bukan teks biasa. */
function Masked({ value }: { value?: string | null }) {
  return (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">
      {value ?? "•••"}
    </code>
  );
}

function Row({
  label,
  children,
  unit,
  note,
}: {
  label: string;
  children: React.ReactNode;
  /** Satuan yang menempel di kanan input, mis. "token" atau "/1jt token". */
  unit?: string;
  /** Dipakai hemat - hanya ketika keadaannya perlu diberitahukan. */
  note?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-2.5 sm:flex-row sm:items-center sm:gap-4">
      <label className="w-full shrink-0 text-sm text-slate-600 sm:w-44">{label}</label>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">{children}</div>
          {unit && (
            <span className="shrink-0 text-xs text-slate-400">{unit}</span>
          )}
        </div>
        {note && <div className="mt-1 text-xs leading-relaxed text-slate-500">{note}</div>}
      </div>
    </div>
  );
}

/** Pemilih dua nilai, menggantikan select untuk pilihan yang sudah jelas. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-lg border bg-slate-50 p-0.5 sm:w-auto">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
            value === option.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
