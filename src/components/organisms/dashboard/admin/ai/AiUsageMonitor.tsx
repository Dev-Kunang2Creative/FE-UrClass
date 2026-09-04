"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Ban, CheckCircle2, Clock, Gauge, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AiLiveUsage from "@/components/organisms/dashboard/admin/ai/AiLiveUsage";
import { useAiQuota } from "@/http/ai/admin-ai-quota";
import {
  useAiUsage,
  type UsageBucket,
  type UsagePoint,
  type UsageWindow,
} from "@/http/ai/admin-ai-usage";
import {
  bucketLabel,
  bucketTitle,
  compactNumber,
  formatDuration,
  formatRupiah,
  fullRupiah,
  fullNumber,
} from "@/lib/format-usage";

/**
 * Pemantauan pemakaian asisten AI.
 *
 * Menjawab tiga pertanyaan yang muncul begitu fitur berbiaya dinyalakan: berapa
 * yang sudah terpakai, kapan lonjakannya, dan siapa yang memakainya.
 *
 * Grafiknya **satu seri**, dengan pengalih token/biaya - bukan dua seri pada dua
 * sumbu. Token dan biaya berbeda besaran ribuan kali; menumpuknya pada dua sumbu
 * y membuat kedua garis bisa dibuat terlihat apa pun, tergantung skala yang
 * dipilih. Satu besaran pada satu waktu selalu bisa dibaca apa adanya.
 */

/** Biru seri-1, lolos seluruh pemeriksaan kontras dan CVD di permukaan putih. */
const SERIES = "#2a78d6";
const GRID = "#e1e0d9";
const AXIS_INK = "#898781";

/**
 * Lebar minimum satu titik pada grafik, dalam piksel.
 *
 * Menentukan seberapa lebar grafiknya jadi, dan karenanya berapa banyak yang
 * bisa digulir. 34px cukup untuk satu label jam ("14.00") tanpa bertumpuk, dan
 * cukup rapat supaya sehari penuh masih masuk dalam dua kali geser.
 */
const LEBAR_PER_TITIK = 34;

type Metric = "tokens" | "cost";

export default function AiUsageMonitor() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const [periode, setPeriode] = useState<UsageWindow>("24h");
  const [metric, setMetric] = useState<Metric>("tokens");
  // undefined = pakai bawaan jendelanya. Dipilih sendiri hanya kalau admin
  // memang menggantinya.
  const [bucket, setBucket] = useState<UsageBucket | undefined>(undefined);

  const { data, isPending, isFetching } = useAiUsage({ token, window: periode, bucket });

  // Dipanggil di sini, bukan di dalam KartuKuota: komponen itu baru dirender
  // setelah query pemakaian selesai, jadi permintaan kuotanya - yang menempuh
  // jaringan ke provider dan paling lambat di halaman ini - baru mulai setelah
  // penantian pertama berakhir. Dua penantian berurutan yang sebenarnya bisa
  // berjalan bersamaan.
  const kuota = useAiQuota({ token });

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat pemantauan...
      </div>
    );
  }

  const { totals, series, bucket: bucketAktif, peak, top_users } = data;
  const kosong = totals.requests === 0;

  return (
    <div className="space-y-4">
      <KartuKuota query={kuota} />

      {/* Filter dalam satu baris di atas grafik. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border bg-white p-1">
          {data.windows.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setPeriode(item.key);
                // Pilihan per jam tidak berlaku di jendela panjang; dikembalikan
                // ke bawaan supaya tidak diam-diam turun ke harian tanpa
                // tombolnya ikut berubah.
                setBucket(undefined);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                periode === item.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl border bg-white p-1">
          {(
            [
              ["tokens", "Token"],
              ["cost", "Biaya"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMetric(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                metric === value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lebar ember. Hanya muncul untuk jendela yang mengizinkan per jam -
            menawarkan tombol yang diam-diam tidak berlaku lebih buruk daripada
            tidak menawarkannya. */}
        {data.windows.find((item) => item.key === periode)?.hourly && (
          <div className="flex gap-1 rounded-xl border bg-white p-1">
            {(
              [
                ["hour", "Per jam"],
                ["day", "Per hari"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBucket(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  bucketAktif === value
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isFetching && (
          <Loader2 className="size-3.5 animate-spin text-slate-400" aria-label="Memuat" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Permintaan" value={compactNumber(totals.requests)} full={fullNumber(totals.requests)} />
        <StatTile label="Token masuk" value={compactNumber(totals.input_tokens)} full={fullNumber(totals.input_tokens)} />
        <StatTile
          label="Token dari cache"
          value={compactNumber(totals.cached_tokens)}
          full={fullNumber(totals.cached_tokens)}
          hint={
            totals.input_tokens > 0
              ? `${Math.round((totals.cached_tokens / totals.input_tokens) * 100)}% dari token masuk`
              : undefined
          }
        />
        <StatTile label="Token keluar" value={compactNumber(totals.output_tokens)} full={fullNumber(totals.output_tokens)} />
        <StatTile
          label="Estimasi biaya"
          value={formatRupiah(totals.cost_idr, { compact: true })}
          full={fullRupiah(totals.cost_idr)}
          hint="Rupiah, menurut harga saat tiap permintaan terjadi"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatusTile
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          label="Berhasil"
          value={totals.ok}
        />
        <StatusTile
          icon={AlertTriangle}
          iconClass="text-red-600"
          label="Gagal"
          value={totals.failed}
        />
        <StatusTile
          icon={Ban}
          iconClass="text-amber-600"
          label="Ditolak kuota"
          value={totals.blocked}
        />
        <StatusTile
          icon={Clock}
          iconClass="text-slate-500"
          label="Rata-rata waktu"
          value={formatDuration(totals.avg_duration_ms)}
        />
      </div>

      {/* Pemakaian langsung di atas grafik riwayat: yang pertama ditanyakan
          orang yang membuka halaman ini adalah keadaan sekarang, dan riwayatnya
          dibaca sesudah itu. Ia tidak mengikuti filter periode di atas - node-nya
          hidup satu menit lalu hilang, karena itu arti "langsung". */}
      <AiLiveUsage />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {metric === "tokens" ? "Token per periode" : "Biaya per periode"}
              </p>
              <p className="text-xs text-slate-500">
                {bucketAktif === "hour" ? "Dikelompokkan per jam" : "Dikelompokkan per hari"}
                {series.length > 0 && ` · ${series.length} titik · geser untuk lihat riwayat`}
              </p>
            </div>

            {/* Puncaknya ditulis apa adanya, bukan diserahkan ke mata. Ini
                pertanyaan yang paling sering dibawa orang ke grafik pemakaian:
                kapan paling ramai. */}
            {peak && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-right">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Puncak</p>
                <p className="text-xs font-bold text-slate-900">
                  {bucketTitle(peak.bucket, bucketAktif)}
                </p>
                <p className="text-[11px] tabular-nums text-slate-500">
                  {compactNumber(peak.total_tokens)} token · {peak.requests}×
                </p>
              </div>
            )}
          </div>

          {kosong ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Belum ada permintaan pada periode ini.
            </p>
          ) : (
            /* Grafik dibuat selebar jumlah titiknya lalu digulir di dalam
               wadahnya sendiri, bukan dipadatkan ke lebar panel. Enam puluh
               titik yang dijejalkan ke 600px tidak bisa dibaca satu pun, dan
               justru riwayat itulah yang dicari - jam berapa ramainya. */
            <div className="-mx-2 overflow-x-auto px-2 pb-1">
              <div
                className="h-64"
                style={{ minWidth: `${Math.max(560, series.length * LEBAR_PER_TITIK)}px` }}
              >
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiUsageFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={SERIES} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  {/* Grid mendatar saja dan setipis mungkin: ia alat bantu baca,
                      bukan bagian datanya. */}
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="bucket"
                    tickFormatter={(value: string) => bucketLabel(value, bucketAktif)}
                    tick={{ fill: AXIS_INK, fontSize: 11 }}
                    stroke={GRID}
                    minTickGap={12}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={(value: number) =>
                      metric === "tokens"
                        ? compactNumber(value)
                        : formatRupiah(value, { compact: true })
                    }
                    tick={{ fill: AXIS_INK, fontSize: 11 }}
                    stroke={GRID}
                    width={metric === "tokens" ? 56 : 84}
                  />

                  <Tooltip
                    cursor={{ stroke: AXIS_INK, strokeWidth: 1, strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;

                      const point = payload[0].payload as UsagePoint;

                      return (
                        <div className="rounded-xl border-2 border-slate-900 bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="font-bold text-slate-900">
                            {bucketTitle(point.bucket, bucketAktif)}
                          </p>
                          <dl className="mt-1.5 space-y-0.5 tabular-nums">
                            <Row label="Permintaan" value={fullNumber(point.requests)} />
                            <Row label="Token masuk" value={fullNumber(point.input_tokens)} />
                            <Row label="Token keluar" value={fullNumber(point.output_tokens)} />
                            <Row label="Biaya" value={formatRupiah(point.cost_idr)} />
                          </dl>
                        </div>
                      );
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey={metric === "tokens" ? "total_tokens" : "cost_idr"}
                    stroke={SERIES}
                    strokeWidth={2}
                    fill="url(#aiUsageFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: SERIES, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Panel
        title="10 pemakai terbanyak"
        subtitle="Pada periode yang dipilih."
        empty={top_users.length === 0}
      >
        <ul className="divide-y">
          {top_users.map((user, index) => (
            <li key={user.email ?? user.name} className="flex items-center gap-3 py-2.5">
              {/* Nomor urut: daftar peringkat tanpa nomor memaksa mata
                  menghitung sendiri. */}
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                {user.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
              </div>

              {/* Token ikut ditampilkan: jumlah permintaan saja tidak
                  membedakan pemakai yang banyak bertanya pendek dari yang
                  sedikit tapi mahal. */}
              <div className="shrink-0 text-right tabular-nums">
                <p className="text-sm font-semibold text-slate-900">
                  {user.requests}× · {formatRupiah(user.cost_idr)}
                </p>
                <p className="text-xs text-slate-500" title={fullNumber(user.total_tokens)}>
                  {compactNumber(user.total_tokens)} token
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

    </div>
  );
}

function StatTile({
  label,
  value,
  full,
  hint,
}: {
  label: string;
  value: string;
  full?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {/* Angka besar memakai figur proporsional; tabular-nums hanya untuk
          kolom yang harus lurus vertikal. */}
      <p className="mt-1 text-2xl font-semibold text-slate-900" title={full}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{hint}</p>}
    </div>
  );
}

function StatusTile({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3">
      <Icon className={`size-4 shrink-0 ${iconClass}`} />
      <div className="min-w-0">
        <p className="truncate text-[11px] text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}


function Panel({
  title,
  subtitle,
  empty,
  children,
}: {
  title: string;
  subtitle?: string;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {empty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}

/**
 * Kuota yang tersisa di provider.
 *
 * Ini satu-satunya angka di halaman ini yang tidak berasal dari catatan
 * aplikasi sendiri, dan justru karena itu ia perlu ada: kunci yang sama bisa
 * dipakai dari tempat lain - pengujian manual, skrip, aplikasi lain - dan
 * pemakaian itu tetap memotong kuota tanpa meninggalkan jejak di tabel
 * pemakaian. Total di bawah menjawab "berapa yang kita pakai"; kartu ini
 * menjawab "berapa yang masih ada", dan keduanya bisa berbeda jauh.
 *
 * Ditaruh paling atas karena ia satu-satunya yang bisa mematikan fiturnya:
 * kuota habis berarti setiap peserta menerima galat.
 *
 * Yang ditampilkan **hanya sisa token, persen terpakai, dan tanggal habisnya**.
 * Respons provider memuat lebih banyak - nama akun, jumlah permintaan di
 * sisinya, panjang masa berlaku paket - tapi tidak satu pun dari itu mengubah
 * keputusan yang diambil dari kartu ini, dan merendernya membuat angka yang
 * penting harus dicari dulu. Warna merah sudah menyampaikan urgensinya tanpa
 * perlu paragraf yang menjelaskannya.
 */
function KartuKuota({ query }: { query: ReturnType<typeof useAiQuota> }) {
  const { data, isPending, isError } = query;

  // Selama menunggu, kartunya tetap ada - dengan tinggi yang sama seperti versi
  // terisinya, supaya isi di bawahnya tidak tergeser saat datanya tiba.
  // Mengembalikan null di sini membuat halaman terlihat sudah selesai memuat,
  // lalu ada yang menyelip masuk beberapa saat kemudian.
  if (isPending) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Gauge className="size-3.5 shrink-0 text-slate-400" />
          Kuota provider
          <Loader2 className="size-3 animate-spin text-slate-400" />
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="h-8 w-32 animate-pulse rounded bg-slate-100" />
          <span className="text-xs text-slate-400">memeriksa di provider...</span>
        </div>

        <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    );
  }

  // Diam untuk yang memang tidak akan pernah ada: gateway tanpa endpoint kuota,
  // atau koneksi yang belum disetel. Beda dari keadaan di atas - ini bukan
  // sesuatu yang sedang dalam perjalanan.
  if (isError || !data || !data.configured || !data.supported || !data.quota) {
    return null;
  }

  const kuota = data.quota;
  const persen = kuota.used_percent;

  // Dihitung saat pengambilan, bukan di sini - lihat catatan di useAiQuota.
  // Yang penting: ini bukan valid_days dari provider, karena angka itu panjang
  // masa berlaku paketnya, bukan sisanya.
  const sisaHari = kuota.days_left;

  const kritis = (persen !== null && persen >= 90) || (sisaHari !== null && sisaHari <= 3);
  const waspada =
    !kritis && ((persen !== null && persen >= 75) || (sisaHari !== null && sisaHari <= 7));

  const nada = kritis
    ? "border-red-200 bg-red-50"
    : waspada
      ? "border-amber-200 bg-amber-50"
      : "border-slate-200 bg-white";

  const bar = kritis ? "bg-red-500" : waspada ? "bg-amber-500" : "bg-slate-900";
  const tinta = kritis ? "text-red-700" : waspada ? "text-amber-700" : "text-slate-900";

  return (
    <div className={`rounded-xl border p-4 ${nada}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        {/* Sisa token adalah angka utama kartu ini, dan satu-satunya yang
            diberi ukuran besar: ia yang menentukan berapa lama fiturnya masih
            hidup. Sisanya keterangan. */}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Gauge
              className={`size-3.5 shrink-0 ${
                kritis ? "text-red-600" : waspada ? "text-amber-600" : "text-slate-400"
              }`}
            />
            Kuota provider
            {kuota.status && kuota.status !== "active" && (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[11px] font-bold uppercase text-red-700">
                {kuota.status}
              </span>
            )}
          </p>

          {kuota.remaining_tokens !== null && (
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 tabular-nums">
              <span
                className={`text-3xl font-bold leading-none tracking-tight ${tinta}`}
                title={fullNumber(kuota.remaining_tokens)}
              >
                {compactNumber(kuota.remaining_tokens)}
              </span>
              <span className="text-xs text-slate-500">
                token tersisa
                {kuota.max_tokens !== null && ` dari ${compactNumber(kuota.max_tokens)}`}
              </span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-slate-500">
          {persen !== null && (
            <span className="tabular-nums">
              <span className="font-bold text-slate-700">{persen.toFixed(2)}%</span> terpakai
            </span>
          )}
          {kuota.expires_at && (
            <span>
              Habis{" "}
              <span className="font-semibold text-slate-700">
                {new Date(kuota.expires_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {sisaHari !== null &&
                (sisaHari > 0
                  ? ` · ${sisaHari} hari lagi`
                  : sisaHari === 0
                    ? " · hari ini"
                    : " · sudah lewat")}
            </span>
          )}
        </div>
      </div>

      {persen !== null && (
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={Math.round(persen)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Kuota terpakai"
        >
          <div
            className={`h-full rounded-full transition-all ${bar}`}
            style={{ width: `${Math.min(100, Math.max(0, persen))}%` }}
          />
        </div>
      )}

      {/* Penalti tetap disebut: selama ia aktif, permintaan bisa ditolak
          provider meski kuotanya masih ada - gejala yang akan salah
          didiagnosis sebagai kerusakan aplikasi, dan tidak terbaca dari angka
          mana pun di atas. */}
      {kuota.penalty_active && (
        <p className="mt-3 flex items-start gap-2 border-t border-red-200 pt-3 text-xs leading-relaxed text-red-700">
          <Ban className="mt-px size-3.5 shrink-0" />
          <span>
            <span className="font-bold">Provider sedang menerapkan penalti.</span>{" "}
            {kuota.penalty_reason ?? "Tanpa alasan yang disebutkan."}
            {kuota.penalty_until &&
              ` Sampai ${new Date(kuota.penalty_until).toLocaleString("id-ID")}.`}
          </span>
        </p>
      )}
    </div>
  );
}
