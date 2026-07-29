"use client";

import { useSession } from "next-auth/react";
import { useGetAdminStats } from "@/http/stats/get-admin-stats";
import { formatPrice } from "@/utils/format-price";
import {
  Users,
  BookOpen,
  ShoppingCart,
  Banknote,
  UserPlus,
  FileQuestion,
  Package,
  Activity,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import { Progress } from "@/components/ui/progress";

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  paid: "Sudah Bayar",
  approved: "Disetujui",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};

const pieChartConfig = {
  count: { label: "Total" },
  pending: { label: "Menunggu", color: "#F59E0B" }, // amber-500
  paid: { label: "Sudah Bayar", color: "#3B82F6" }, // blue-500
  approved: { label: "Disetujui", color: "#10B981" }, // emerald-500
  rejected: { label: "Ditolak", color: "#EF4444" }, // red-500
  cancelled: { label: "Dibatalkan", color: "#6B7280" }, // gray-500
} satisfies ChartConfig;

const barChartConfig = {
  total: { label: "Pendapatan", color: "var(--primary)" },
} satisfies ChartConfig;

const lineChartConfig = {
  count: { label: "Pendaftar", color: "var(--primary)" },
} satisfies ChartConfig;

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColorClass = "bg-primary/10 text-primary",
  isLoading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconColorClass?: string;
  isLoading: boolean;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm ring-1 ring-border/5">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 opacity-100" />
      <CardContent className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-medium tracking-tight text-muted-foreground truncate">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-semibold tracking-tight truncate">
                {isLoading ? (
                  <span className="text-muted-foreground/50">...</span>
                ) : (
                  value
                )}
              </h2>
            </div>
            {sub && !isLoading && (
              <p className="text-xs font-medium text-muted-foreground/80 truncate">
                {sub}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-2xl shrink-0 ${iconColorClass}`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardAdminPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const { data, isLoading } = useGetAdminStats({ token });
  const stats = data?.data;

  const pieData = (stats?.order_by_status ?? []).map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    status: s.status,
    count: s.count,
    fill: `var(--color-${s.status})`,
  }));

  const topTryoutsData = (stats?.top_tryouts ?? []).map((t) => ({
    name: t.title.length > 20 ? t.title.slice(0, 20) + "…" : t.title,
    fullName: t.title,
    enrolled: t.enrolled,
  }));

  return (
    <main className="space-y-8 pb-8">
      <DashboardTitle title="Dashboard Admin" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Pengguna"
            value={stats?.total_users ?? 0}
            sub={`+${stats?.new_users_week ?? 0} minggu ini`}
            icon={Users}
            iconColorClass="bg-blue-500/10 text-blue-500"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Pendapatan"
            value={formatPrice(stats?.total_revenue ?? 0)}
            sub={`dari ${stats?.total_orders ?? 0} transaksi`}
            icon={Banknote}
            iconColorClass="bg-purple-500/10 text-purple-500"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Try Out"
            value={stats?.total_tryouts ?? 0}
            icon={BookOpen}
            iconColorClass="bg-green-500/10 text-green-500"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Transaksi"
            value={stats?.total_orders ?? 0}
            icon={ShoppingCart}
            iconColorClass="bg-amber-500/10 text-amber-500"
            isLoading={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Pendaftar Baru (30h)"
            value={stats?.new_users_month ?? 0}
            sub={`${stats?.new_users_week ?? 0} minggu ini`}
            icon={UserPlus}
            iconColorClass="bg-indigo-500/10 text-indigo-500"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Soal"
            value={stats?.total_questions ?? 0}
            icon={FileQuestion}
            iconColorClass="bg-orange-500/10 text-orange-500"
            isLoading={isLoading}
          />
          <StatCard
            label="Paket Aktif"
            value={stats?.total_packages ?? 0}
            icon={Package}
            iconColorClass="bg-pink-500/10 text-pink-500"
            isLoading={isLoading}
          />
          <StatCard
            label="Sesi Hari Ini"
            value={stats?.sessions_today ?? 0}
            icon={Activity}
            iconColorClass="bg-teal-500/10 text-teal-500"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Row 3 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Monthly Revenue */}
        <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              Pendapatan per Bulan
            </CardTitle>
            <CardDescription>
              Tren pendapatan bulanan dari penjualan tryout dan paket
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground/50">
                Memuat data...
              </div>
            ) : (stats?.monthly_revenue?.length ?? 0) === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground/50">
                Belum ada data pendapatan.
              </div>
            ) : (
              <ChartContainer config={barChartConfig} className="h-64 w-full">
                <BarChart
                  accessibilityLayer
                  data={stats!.monthly_revenue}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{
                      fontSize: 12,
                      fill: "var(--muted-foreground)",
                    }}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("id-ID", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(v)
                    }
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "var(--muted-foreground)",
                    }}
                    width={40}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatPrice(Number(value))}
                        hideLabel={false}
                      />
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Order Status */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              Status Transaksi
            </CardTitle>
            <CardDescription>
              Distribusi status dari semua pesanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground/50">
                Memuat data...
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground/50">
                Belum ada data transaksi.
              </div>
            ) : (
              <ChartContainer
                config={pieChartConfig}
                className="h-64 w-full pb-4"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="var(--background)"
                    paddingAngle={2}
                  ></Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend
                    content={
                      <ChartLegendContent className="flex-wrap justify-center" />
                    }
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — Pendaftaran & Top Tryout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Pendaftaran 30 hari */}
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              Pendaftaran Pengguna (30 Hari Terakhir)
            </CardTitle>
            <CardDescription>Pertumbuhan pengguna baru harian</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground/50">
                Memuat data...
              </div>
            ) : (stats?.user_registrations?.length ?? 0) === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground/50">
                Belum ada pendaftar baru.
              </div>
            ) : (
              <ChartContainer
                config={lineChartConfig}
                className="h-[250px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={stats!.user_registrations}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{
                      fontSize: 10,
                      fill: "var(--muted-foreground)",
                    }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis hide domain={["dataMin", "dataMax + 2"]} />
                  <ChartTooltip
                    cursor={{
                      stroke: "var(--border)",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => `Tanggal: ${label}`}
                        indicator="dot"
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--color-count)",
                      stroke: "var(--background)",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Tryouts */}
        <Card className="border-0 shadow-sm ring-1 ring-border/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              Try Out Terlaris
            </CardTitle>
            <CardDescription>
              Try out dengan jumlah peserta terbanyak
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground/50">
                Memuat data...
              </div>
            ) : topTryoutsData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground/50">
                Belum ada data pendaftar.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {topTryoutsData.map((t, i) => {
                  const percentage = Math.min(
                    100,
                    (t.enrolled / (topTryoutsData[0]?.enrolled || 1)) * 100,
                  );
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span className="text-sm text-muted-foreground font-mono w-4 text-right shrink-0">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p
                            className="text-sm font-medium leading-none truncate text-foreground"
                            title={t.fullName}
                          >
                            {t.fullName}
                          </p>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
                        {new Intl.NumberFormat("id-ID").format(t.enrolled)}{" "}
                        peserta
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
