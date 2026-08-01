"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetSalesReport,
  type SalesReportRow,
} from "@/http/sales-report/get-sales-report";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import SmartPagination from "@/components/molecules/pagination/SmartPagination";
import {
  exportAdminRowsToExcel,
  exportAdminRowsToPdf,
  type AdminExportColumn,
} from "@/components/molecules/datatable/AdminDataControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  Boxes,
  CircleDollarSign,
  FileSpreadsheet,
  FileText,
  Users,
} from "lucide-react";
import { formatPrice } from "@/utils/format-price";
import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import {
  salesColumns,
  type SortDirection,
  type SalesSortKey,
} from "@/components/atoms/datacolumn/DataSales";

const MONTH_NAMES = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2, THIS_YEAR - 3];
const PER_PAGE_OPTIONS = [10, 15, 25, 50];
const ALL_FILTER = "all";
type SalesExportRow = SalesReportRow & { period_label: string };
const salesExportColumns: AdminExportColumn<SalesExportRow>[] = [
  {
    header: "Periode",
    accessor: (row) => row.period_label || monthLabel(row.month, row.year),
  },
  { header: "Produk/TO", accessor: (row) => row.product_name },
  {
    header: "Harga",
    accessor: (row) => row.average_price,
    format: (value) => formatPrice(Number(value || 0)),
  },
  { header: "Item Terjual", accessor: (row) => row.total_item_sold },
  { header: "Order", accessor: (row) => row.order_count },
  {
    header: "Total",
    accessor: (row) => row.total_sales,
    format: (value) => formatPrice(Number(value || 0)),
  },
];

function monthLabel(month: number, year: number) {
  return `${MONTH_NAMES[month] || "-"} ${year}`;
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function toTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortString(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: SortDirection,
) {
  const result = String(a || "").localeCompare(String(b || ""), "id-ID");
  return direction === "asc" ? result : -result;
}

function sortNumber(
  a: number | null | undefined,
  b: number | null | undefined,
  direction: SortDirection,
) {
  const result = Number(a || 0) - Number(b || 0);
  return direction === "asc" ? result : -result;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  isLoading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  tone: string;
  isLoading?: boolean;
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
          <div className={`p-3 rounded-2xl shrink-0 ${tone}`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StateBox({ message }: { message: string }) {
  return (
    <div className="flex h-52 items-center justify-center p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

function buildSalesTrend(rows: SalesReportRow[]) {
  const map = new Map<
    string,
    {
      label: string;
      sort: number;
      total_sales: number;
      total_item_sold: number;
    }
  >();

  rows.forEach((row) => {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    const current = map.get(key) ?? {
      label: monthLabel(row.month, row.year),
      sort: row.year * 100 + row.month,
      total_sales: 0,
      total_item_sold: 0,
    };

    current.total_sales += Number(row.total_sales || 0);
    current.total_item_sold += Number(row.total_item_sold || 0);
    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
}

export default function SalesReportPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const [year, setYear] = useState<number | undefined>(THIS_YEAR);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [salesProductFilter, setSalesProductFilter] = useState(ALL_FILTER);
  const [salesSort, setSalesSort] = useState<{
    key: SalesSortKey;
    direction: SortDirection;
  }>({
    key: "period_start",
    direction: "desc",
  });
  const [salesPage, setSalesPage] = useState(1);
  const [salesPerPage, setSalesPerPage] = useState(10);

  const salesQuery = useGetSalesReport({ token, year, month });

  const salesRows = useMemo(
    () => salesQuery.data?.data ?? [],
    [salesQuery.data?.data],
  );

  const salesProductOptions = useMemo(
    () =>
      Array.from(new Set(salesRows.map((row) => row.product_name))).sort(
        (a, b) => a.localeCompare(b, "id-ID"),
      ),
    [salesRows],
  );

  const filteredSalesRows = useMemo(() => {
    return salesRows.filter(
      (row) =>
        salesProductFilter === ALL_FILTER ||
        row.product_name === salesProductFilter,
    );
  }, [salesProductFilter, salesRows]);

  const tableRows = useMemo(() => {
    const map = new Map<string, SalesExportRow>();

    filteredSalesRows.forEach((row) => {
      const key = `${row.product_name}-${row.average_price}`;
      const existing = map.get(key);
      if (existing) {
        existing.total_item_sold += Number(row.total_item_sold || 0);
        existing.order_count += Number(row.order_count || 0);
        existing.total_sales += Number(row.total_sales || 0);
        // Do not recalculate average_price, they are explicitly grouped by it
      } else {
        const periodLabel = month
          ? monthLabel(month, year || THIS_YEAR)
          : year
            ? `Tahun ${year}`
            : "Semua Periode";

        map.set(key, {
          ...row,
          total_item_sold: Number(row.total_item_sold || 0),
          order_count: Number(row.order_count || 0),
          total_sales: Number(row.total_sales || 0),
          period_label: periodLabel,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (salesSort.key === "period_start") {
        return sortNumber(
          toTimestamp(a.period_start),
          toTimestamp(b.period_start),
          salesSort.direction,
        );
      }
      if (salesSort.key === "product_name") {
        return sortString(a.product_name, b.product_name, salesSort.direction);
      }
      return sortNumber(
        a[salesSort.key],
        b[salesSort.key],
        salesSort.direction,
      );
    });
  }, [filteredSalesRows, salesSort, month, year]);

  const filteredSalesSummary = useMemo(() => {
    let totalSalesTryout = 0;
    let totalSalesKelas = 0;
    let totalItemSoldTryout = 0;
    let totalItemSoldKelas = 0;
    let orderCountTryout = 0;
    let orderCountKelas = 0;

    filteredSalesRows.forEach((row) => {
      const sales = Number(row.total_sales || 0);
      const items = Number(row.total_item_sold || 0);
      const orders = Number(row.order_count || 0);

      if (row.type === "tryout") {
        totalSalesTryout += sales;
        totalItemSoldTryout += items;
        orderCountTryout += orders;
      } else if (row.type === "kelas") {
        totalSalesKelas += sales;
        totalItemSoldKelas += items;
        orderCountKelas += orders;
      } else {
        // Fallback jika tidak ada type
        totalSalesTryout += sales;
        totalItemSoldTryout += items;
        orderCountTryout += orders;
      }
    });

    const totalSales = totalSalesTryout + totalSalesKelas;
    const totalItemSold = totalItemSoldTryout + totalItemSoldKelas;
    const orderCount = orderCountTryout + orderCountKelas;

    const amunisiTryoutRev = Math.round(totalSalesTryout * 0.4);
    const devTryoutRev = Math.round(totalSalesTryout * 0.6);

    const amunisiKelasRev = Math.round(totalSalesKelas * 0.8);
    const devKelasRev = Math.round(totalSalesKelas * 0.2);

    return {
      total_sales: totalSales,
      total_item_sold: totalItemSold,
      order_count: orderCount,
      total_amunisi_revenue: amunisiTryoutRev + amunisiKelasRev,
      total_developer_revenue: devTryoutRev + devKelasRev,
      tryout: {
        total_sales: totalSalesTryout,
        total_item_sold: totalItemSoldTryout,
        order_count: orderCountTryout,
        amunisi_revenue: amunisiTryoutRev,
        developer_revenue: devTryoutRev,
      },
      kelas: {
        total_sales: totalSalesKelas,
        total_item_sold: totalItemSoldKelas,
        order_count: orderCountKelas,
        amunisi_revenue: amunisiKelasRev,
        developer_revenue: devKelasRev,
      },
    };
  }, [filteredSalesRows]);
  const salesTrend = useMemo(
    () => buildSalesTrend(filteredSalesRows),
    [filteredSalesRows],
  );

  const revenueSplit = [
    {
      name: "UrClass",
      value: filteredSalesSummary.total_amunisi_revenue,
      fill: "#10b981",
    },
    {
      name: "Developer",
      value: filteredSalesSummary.total_developer_revenue,
      fill: "oklch(0.4348 0.1683 258.97)",
    },
  ];

  const salesTotalPages = Math.max(
    1,
    Math.ceil(tableRows.length / salesPerPage),
  );

  const safeSalesPage = Math.min(salesPage, salesTotalPages);
  const paginatedSalesRows = tableRows.slice(
    (safeSalesPage - 1) * salesPerPage,
    safeSalesPage * salesPerPage,
  );

  const setSalesSortKey = (key: SalesSortKey) => {
    setSalesSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <main>
      <DashboardTitle title="Laporan Penjualan" />

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter Periode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Select
                value={year ? String(year) : ALL_FILTER}
                onValueChange={(value) => {
                  setYear(value === ALL_FILTER ? undefined : Number(value));
                  setSalesPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full bg-white md:w-40">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Semua Tahun</SelectItem>
                  {YEAR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={month ? String(month) : ALL_FILTER}
                onValueChange={(value) => {
                  setMonth(value === ALL_FILTER ? undefined : Number(value));
                  setSalesPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full bg-white md:w-44">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Semua Bulan</SelectItem>
                  {MONTH_NAMES.slice(1).map((name, index) => (
                    <SelectItem key={name} value={String(index + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={salesProductFilter}
                onValueChange={(value) => {
                  setSalesProductFilter(value);
                  setSalesPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full bg-white md:w-72">
                  <SelectValue placeholder="Produk/Paket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Semua Produk</SelectItem>
                  {salesProductOptions.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total Penjualan"
              value={formatPrice(filteredSalesSummary.total_sales)}
              icon={Banknote}
              tone="bg-purple-500/10 text-purple-500"
              isLoading={salesQuery.isLoading}
            />
            <KpiCard
              label="Total Item Terjual"
              value={filteredSalesSummary.total_item_sold.toLocaleString(
                "id-ID",
              )}
              icon={Boxes}
              tone="bg-blue-500/10 text-blue-500"
              isLoading={salesQuery.isLoading}
            />
            <KpiCard
              label="Total Pendapatan Amunisi"
              value={formatPrice(filteredSalesSummary.total_amunisi_revenue)}
              icon={CircleDollarSign}
              tone="bg-emerald-500/10 text-emerald-500"
              isLoading={salesQuery.isLoading}
            />
            <KpiCard
              label="Total Pendapatan Developer"
              value={formatPrice(filteredSalesSummary.total_developer_revenue)}
              icon={Users}
              tone="bg-primary/10 text-primary"
              isLoading={salesQuery.isLoading}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center justify-between text-gray-800">
                  <span>Pendapatan Tryout</span>
                  <span className="text-[11px] font-medium text-gray-500 bg-white border border-border/50 px-2.5 py-1 rounded-full shadow-sm">
                    Dev 60% | Amunisi 40%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-6 gap-x-6 pt-6 pb-6">
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 font-medium">
                    Total Penjualan
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">
                    {formatPrice(filteredSalesSummary.tryout.total_sales)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 font-medium">
                    Item Terjual
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">
                    {filteredSalesSummary.tryout.total_item_sold.toLocaleString(
                      "id-ID",
                    )}
                  </p>
                </div>
                <div className="space-y-3 col-span-2 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between bg-emerald-50/80 px-4 py-3.5 rounded-xl border border-emerald-100/60 shadow-sm">
                    <p className="text-sm text-emerald-800 font-medium">
                      Amunisi (40%)
                    </p>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatPrice(filteredSalesSummary.tryout.amunisi_revenue)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-primary/5 px-4 py-3.5 rounded-xl border border-primary/10 shadow-sm">
                    <p className="text-sm text-primary font-medium">
                      Developer (60%)
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(
                        filteredSalesSummary.tryout.developer_revenue,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center justify-between text-gray-800">
                  <span>Pendapatan Kelas</span>
                  <span className="text-[11px] font-medium text-gray-500 bg-white border border-border/50 px-2.5 py-1 rounded-full shadow-sm">
                    Dev 20% | Amunisi 80%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-6 gap-x-6 pt-6 pb-6">
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 font-medium">
                    Total Penjualan
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">
                    {formatPrice(filteredSalesSummary.kelas.total_sales)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 font-medium">
                    Item Terjual
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">
                    {filteredSalesSummary.kelas.total_item_sold.toLocaleString(
                      "id-ID",
                    )}
                  </p>
                </div>
                <div className="space-y-3 col-span-2 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between bg-emerald-50/80 px-4 py-3.5 rounded-xl border border-emerald-100/60 shadow-sm">
                    <p className="text-sm text-emerald-800 font-medium">
                      Amunisi (80%)
                    </p>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatPrice(filteredSalesSummary.kelas.amunisi_revenue)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-primary/5 px-4 py-3.5 rounded-xl border border-primary/10 shadow-sm">
                    <p className="text-sm text-primary font-medium">
                      Developer (20%)
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(
                        filteredSalesSummary.kelas.developer_revenue,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Tren Penjualan dan Item Terjual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesQuery.isLoading ? (
                  <StateBox message="Memuat chart penjualan..." />
                ) : salesTrend.length === 0 ? (
                  <StateBox message="Belum ada data penjualan untuk periode ini." />
                ) : (
                  <ChartContainer
                    config={{
                      total_sales: {
                        label: "Penjualan",
                        color: "oklch(0.4348 0.1683 258.97)",
                      },
                      total_item_sold: {
                        label: "Item Terjual",
                        color: "oklch(0.627 0.194 149.214)",
                      },
                    }}
                    className="h-[280px] w-full"
                  >
                    <LineChart
                      data={salesTrend}
                      margin={{ left: 0, right: 12, top: 24, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="sales"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          compactCurrency(Number(value))
                        }
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="items"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip
                        cursor={{ stroke: "#e5e7eb", strokeWidth: 2 }}
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) =>
                              name === "total_sales" || name === "Penjualan"
                                ? formatPrice(Number(value))
                                : Number(value).toLocaleString("id-ID")
                            }
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        yAxisId="sales"
                        type="monotone"
                        dataKey="total_sales"
                        name="Penjualan"
                        stroke="var(--color-total_sales)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="items"
                        type="monotone"
                        dataKey="total_item_sold"
                        name="Item Terjual"
                        stroke="var(--color-total_item_sold)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Distribusi Pendapatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesQuery.isLoading ? (
                  <StateBox message="Memuat distribusi pendapatan..." />
                ) : filteredSalesSummary.total_sales <= 0 ? (
                  <StateBox message="Belum ada pendapatan untuk periode ini." />
                ) : (
                  <ChartContainer
                    config={{
                      "UrClass": {
                        label: "UrClass",
                        color: "oklch(0.627 0.194 149.214)",
                      },
                      Developer: {
                        label: "Developer",
                        color: "oklch(0.4348 0.1683 258.97)",
                      },
                    }}
                    className="h-[280px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={revenueSplit}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        stroke="none"
                      >
                        {revenueSplit.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        cursor={{ fill: "transparent" }}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value) => formatPrice(Number(value))}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">Tabel Penjualan</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportAdminRowsToExcel({
                        rows: tableRows,
                        columns: salesExportColumns,
                        title: "laporan-penjualan",
                      })
                    }
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportAdminRowsToPdf({
                        rows: tableRows,
                        columns: salesExportColumns,
                        title: "laporan-penjualan",
                        filterSummary: `Tahun: ${year ?? "Semua"}; Bulan: ${month ? MONTH_NAMES[month] : "Semua"}; Produk: ${salesProductFilter === ALL_FILTER ? "Semua" : salesProductFilter}`,
                      })
                    }
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {salesQuery.isError ? (
                <StateBox message="Gagal memuat laporan penjualan. Coba refresh halaman." />
              ) : salesQuery.isLoading ? (
                <StateBox message="Memuat data penjualan..." />
              ) : filteredSalesRows.length === 0 ? (
                <StateBox message="Tidak ada data penjualan yang cocok dengan filter." />
              ) : (
                <>
                  <DataTable
                    columns={salesColumns({
                      sortKey: salesSort.key,
                      sortDirection: salesSort.direction,
                      onSort: setSalesSortKey,
                    })}
                    data={paginatedSalesRows}
                    isLoading={salesQuery.isLoading}
                    disablePagination={true}
                    tableFooter={
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={4} className="px-4 font-bold">
                            Grand Total
                          </TableCell>
                          <TableCell className="px-4 text-right font-bold">
                            {filteredSalesSummary.total_item_sold.toLocaleString(
                              "id-ID",
                            )}
                          </TableCell>
                          <TableCell className="px-4 text-right font-bold">
                            {filteredSalesSummary.order_count.toLocaleString(
                              "id-ID",
                            )}
                          </TableCell>
                          <TableCell className="px-4 text-right font-bold text-green-600">
                            {formatPrice(filteredSalesSummary.total_sales)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    }
                  />

                  <SmartPagination
                    page={safeSalesPage}
                    totalItems={tableRows.length}
                    perPage={salesPerPage}
                    perPageOptions={PER_PAGE_OPTIONS}
                    itemLabel="baris"
                    onPageChange={setSalesPage}
                    onPerPageChange={(value) => {
                      setSalesPerPage(value);
                      setSalesPage(1);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
