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
import { AlertTriangle, Ban, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAiUsage,
  type UsagePoint,
  type UsageWindow,
} from "@/http/ai/admin-ai-usage";
import {
  bucketLabel,
  bucketTitle,
  compactNumber,
  formatDuration,
  formatUsd,
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

type Metric = "tokens" | "cost";

export default function AiUsageMonitor() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const [periode, setPeriode] = useState<UsageWindow>("24h");
  const [metric, setMetric] = useState<Metric>("tokens");

  const { data, isPending, isFetching } = useAiUsage({ token, window: periode });

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat pemantauan...
      </div>
    );
  }

  const { totals, series, bucket, by_model, top_users, recent } = data;
  const kosong = totals.requests === 0;

  return (
    <div className="space-y-4">
      {/* Filter dalam satu baris di atas grafik. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border bg-white p-1">
          {data.windows.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriode(item.key)}
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
          value={formatUsd(totals.cost_usd)}
          full={`$${totals.cost_usd}`}
          hint="Menurut harga yang berlaku saat tiap permintaan terjadi"
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

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-900">
              {metric === "tokens" ? "Token per periode" : "Biaya per periode"}
            </p>
            <p className="text-xs text-slate-500">
              {bucket === "hour" ? "Dikelompokkan per jam" : "Dikelompokkan per hari"}
            </p>
          </div>

          {kosong ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Belum ada permintaan pada periode ini.
            </p>
          ) : (
            <div className="h-64 w-full">
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
                    tickFormatter={(value: string) => bucketLabel(value, bucket)}
                    tick={{ fill: AXIS_INK, fontSize: 11 }}
                    stroke={GRID}
                    minTickGap={28}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={(value: number) =>
                      metric === "tokens" ? compactNumber(value) : formatUsd(value)
                    }
                    tick={{ fill: AXIS_INK, fontSize: 11 }}
                    stroke={GRID}
                    width={metric === "tokens" ? 56 : 72}
                  />

                  <Tooltip
                    cursor={{ stroke: AXIS_INK, strokeWidth: 1, strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;

                      const point = payload[0].payload as UsagePoint;

                      return (
                        <div className="rounded-xl border-2 border-slate-900 bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="font-bold text-slate-900">
                            {bucketTitle(point.bucket, bucket)}
                          </p>
                          <dl className="mt-1.5 space-y-0.5 tabular-nums">
                            <Row label="Permintaan" value={fullNumber(point.requests)} />
                            <Row label="Token masuk" value={fullNumber(point.input_tokens)} />
                            <Row label="Token keluar" value={fullNumber(point.output_tokens)} />
                            <Row label="Biaya" value={formatUsd(point.cost_usd)} />
                          </dl>
                        </div>
                      );
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey={metric === "tokens" ? "total_tokens" : "cost_usd"}
                    stroke={SERIES}
                    strokeWidth={2}
                    fill="url(#aiUsageFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: SERIES, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Pemakai terbanyak" empty={top_users.length === 0}>
          <ul className="divide-y">
            {top_users.map((user) => (
              <li key={user.email ?? user.name} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                  {user.email && (
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  )}
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <p className="text-sm font-semibold text-slate-900">{user.requests}×</p>
                  <p className="text-xs text-slate-500">{formatUsd(user.cost_usd)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Per model" empty={by_model.length === 0}>
          <ul className="divide-y">
            {by_model.map((row) => (
              <li key={row.model} className="flex items-center gap-3 py-2.5">
                <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                  {row.model}
                </p>
                <div className="shrink-0 text-right tabular-nums">
                  <p className="text-sm font-semibold text-slate-900">{row.requests}×</p>
                  <p className="text-xs text-slate-500">
                    {compactNumber(row.total_tokens)} token · {formatUsd(row.cost_usd)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="20 permintaan terakhir"
        subtitle="Tidak mengikuti filter periode — kalau asisten baru rusak, ini yang dicari."
        empty={recent.length === 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-xs">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 pr-3 font-semibold">Jam</th>
                <th className="py-2 pr-3 font-semibold">Pengguna</th>
                <th className="py-2 pr-3 font-semibold">Model</th>
                <th className="py-2 pr-3 text-right font-semibold">Masuk</th>
                <th className="py-2 pr-3 text-right font-semibold">Keluar</th>
                <th className="py-2 pr-3 text-right font-semibold">Biaya</th>
                <th className="py-2 font-semibold">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y tabular-nums">
              {recent.map((row) => (
                <tr key={row.id}>
                  <td className="py-2 pr-3 whitespace-nowrap text-slate-600">
                    {new Date(row.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="max-w-[10rem] truncate py-2 pr-3 text-slate-700">
                    {row.user_name}
                  </td>
                  <td className="max-w-[10rem] truncate py-2 pr-3 font-mono text-slate-500">
                    {row.model ?? "—"}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-600">
                    {compactNumber(row.input_tokens)}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-600">
                    {compactNumber(row.output_tokens)}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-600">
                    {formatUsd(row.cost_usd)}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={row.status} reason={row.reason} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

/** Status selalu ikon + label, tidak pernah warna sendirian. */
function StatusBadge({ status, reason }: { status: string; reason: string | null }) {
  const meta = {
    ok: { Icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Berhasil" },
    failed: { Icon: AlertTriangle, cls: "text-red-700 bg-red-50 border-red-200", label: "Gagal" },
    blocked: { Icon: Ban, cls: "text-amber-700 bg-amber-50 border-amber-200", label: "Ditolak" },
  }[status] ?? {
    Icon: AlertTriangle,
    cls: "text-slate-700 bg-slate-50 border-slate-200",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}
      title={reason ?? undefined}
    >
      <meta.Icon className="size-3" />
      {meta.label}
      {reason && <span className="font-normal opacity-70">· {reason}</span>}
    </span>
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
