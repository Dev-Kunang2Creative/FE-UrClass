"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { FileSpreadsheet, FileText, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

export type AdminExportColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
  format?: (value: string | number | boolean | null | undefined, row: T) => string | number;
};

export type AdminFilterOption<T> = {
  key: string;
  label: string;
  placeholder: string;
  options: { label: string; value: string }[];
  getValue: (row: T) => string | number | boolean | null | undefined;
};

export type AdminSortOption<T> = {
  key: string;
  label: string;
  compare: (a: T, b: T) => number;
};

type UseAdminTableControlsProps<T> = {
  data: T[];
  searchFields?: ((row: T) => string | number | null | undefined)[];
  filters?: AdminFilterOption<T>[];
  sortOptions?: AdminSortOption<T>[];
  defaultSort?: string;
};

type GetControlledAdminRowsProps<T> = UseAdminTableControlsProps<T> & {
  search: string;
  filterValues: Record<string, string>;
  sortKey: string;
};

export function getControlledAdminRows<T>({
  data,
  search,
  filterValues,
  sortKey,
  searchFields = [],
  filters = [],
  sortOptions = [],
}: GetControlledAdminRowsProps<T>) {
  const normalizedSearch = search.trim().toLowerCase();
  const selectedSort = sortOptions.find((option) => option.key === sortKey);

  return data
    .filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        searchFields.some((field) =>
          String(field(row) ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      if (!matchesSearch) return false;

      return filters.every((filter) => {
        const selected = filterValues[filter.key];
        if (!selected || selected === ALL_VALUE) return true;
        return String(filter.getValue(row) ?? "") === selected;
      });
    })
    .slice()
    .sort((a, b) => (selectedSort ? selectedSort.compare(a, b) : 0));
}

export function useAdminTableControls<T>({
  data,
  searchFields = [],
  filters = [],
  sortOptions = [],
  defaultSort,
}: UseAdminTableControlsProps<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState(defaultSort || sortOptions[0]?.key || "");

  const rows = useMemo(() => {
    return getControlledAdminRows({
      data,
      search,
      filterValues,
      sortKey,
      searchFields,
      filters,
      sortOptions,
    });
  }, [data, filterValues, filters, search, searchFields, sortKey, sortOptions]);

  const setFilter = (key: string, value: string) => {
    setFilterValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const reset = () => {
    setSearch("");
    setFilterValues({});
    setSortKey(defaultSort || sortOptions[0]?.key || "");
  };

  const hasActiveControls =
    Boolean(search.trim()) ||
    Object.values(filterValues).some((value) => value && value !== ALL_VALUE) ||
    Boolean(sortKey && sortKey !== (defaultSort || sortOptions[0]?.key || ""));

  return {
    search,
    setSearch,
    filterValues,
    setFilter,
    sortKey,
    setSortKey,
    rows,
    reset,
    hasActiveControls,
  };
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function buildExportRows<T>(rows: T[], columns: AdminExportColumn<T>[]) {
  return rows.map((row) =>
    columns.reduce<Record<string, string | number>>((acc, column) => {
      const value = column.accessor(row);
      acc[column.header] = column.format ? column.format(value, row) : String(value ?? "-");
      return acc;
    }, {}),
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadImageAsDataUrl(src: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const image = await loadImage(dataUrl);

  return {
    dataUrl,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

export async function exportAdminRowsToExcel<T>({
  rows,
  columns,
  title,
}: {
  rows: T[];
  columns: AdminExportColumn<T>[];
  title: string;
}) {
  if (!rows.length) {
    toast.error("Tidak ada data untuk diexport.");
    return;
  }

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(buildExportRows(rows, columns));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${safeFileName(title)}-${today()}.xlsx`);
}

export async function exportAdminRowsToPdf<T>({
  rows,
  columns,
  title,
  filterSummary,
}: {
  rows: T[];
  columns: AdminExportColumn<T>[];
  title: string;
  filterSummary?: string;
}) {
  if (!rows.length) {
    toast.error("Tidak ada data untuk diexport.");
    return;
  }

  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    const logo = await loadImageAsDataUrl("/images/logo/urclass.png");
    const logoWidth = 96;
    const logoHeight = logo.height > 0 ? (logoWidth * logo.height) / logo.width : 32;
    doc.addImage(logo.dataUrl, "PNG", pageWidth - 40 - logoWidth, 24, logoWidth, logoHeight);
  } catch {
    // Logo is optional for export generation; keep the PDF downloadable if the asset fails to load.
  }

  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.text(`Tanggal export: ${new Date().toLocaleString("id-ID")}`, 40, 58);
  if (filterSummary) {
    doc.text(`Filter aktif: ${filterSummary}`, 40, 74, { maxWidth: 760 });
  }

  autoTable(doc, {
    startY: filterSummary ? 92 : 76,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) =>
      columns.map((column) => {
        const value = column.accessor(row);
        return String(column.format ? column.format(value, row) : value ?? "-");
      }),
    ),
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [0, 74, 171] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${safeFileName(title)}-${today()}.pdf`);
}

type AdminDataToolbarProps<T> = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: AdminFilterOption<T>[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  sortOptions?: AdminSortOption<T>[];
  sortKey: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  hasActiveControls: boolean;
  rows: T[];
  exportRows?: T[] | (() => Promise<T[]>);
  exportColumns: AdminExportColumn<T>[];
  exportTitle: string;
  filterSummary?: string;
  children?: React.ReactNode;
};

export function AdminDataToolbar<T>({
  search,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  filters = [],
  filterValues,
  onFilterChange,
  sortOptions = [],
  sortKey,
  onSortChange,
  onReset,
  hasActiveControls,
  rows,
  exportRows,
  exportColumns,
  exportTitle,
  filterSummary,
  children,
}: AdminDataToolbarProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const runExport = async (type: "excel" | "pdf") => {
    setIsExporting(true);
    try {
      const rowsToExport =
        typeof exportRows === "function" ? await exportRows() : exportRows ?? rows;

      if (type === "excel") {
        await exportAdminRowsToExcel({ rows: rowsToExport, columns: exportColumns, title: exportTitle });
      } else {
        await exportAdminRowsToPdf({
          rows: rowsToExport,
          columns: exportColumns,
          title: exportTitle,
          filterSummary,
        });
      }
    } catch {
      toast.error(`Gagal membuat file ${type === "excel" ? "Excel" : "PDF"}.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    // items-end: kelompok tombol dirapatkan ke baris terbawah kelompok kiri.
    //
    // Dengan items-center ia mengambang di tengah tinggi kelompok kiri, dan
    // dengan items-start ia sejajar dengan kolom cari di baris pertama. Yang
    // dicari adalah sebaris dengan filter - dan filter selalu berada di baris
    // terakhir kelompok kiri - jadi yang disamakan adalah tepi bawahnya.
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      {/* Kontrolnya dibuat cukup ringkas supaya muat satu baris: sebelumnya
          kolom cari dipatok minimal 15rem dan tiap select 12rem, sehingga di
          layar biasa satu select terdorong turun sendirian dan menyisakan
          separuh baris kosong di sebelahnya. */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1 lg:max-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        {/*
          Filter dikurung dalam satu baris yang tidak boleh membungkus, dan
          isinya boleh menyusut.

          Sebelumnya tiap filter adalah item lepas berlebar tetap di dalam
          flex-wrap, jadi begitu ruangnya kurang sedikit saja, filter terakhir
          turun sendirian dan menyisakan baris kedua yang nyaris kosong. Dengan
          min-w-0 dan lebar maksimum, ketiganya mengecil bersama-sama lebih dulu
          - teksnya terpotong rapi karena trigger-nya memang memotong isinya.
          Penyusutannya berhenti di 8rem supaya labelnya tetap terbaca; di bawah
          itu kelompok kanan yang turun utuh ke baris kedua, bukan satu filter
          yang tercecer.
        */}
        {(filters.length > 0 || sortOptions.length > 0) && (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-1 sm:flex-nowrap">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filterValues[filter.key] || ALL_VALUE}
                onValueChange={(value) => onFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-full min-w-32 bg-white sm:max-w-40">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>{filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Urutan berdiri sejajar dengan filter, bukan di kelompok tombol:
                sama-sama menyaring atau menata apa yang tampil di tabel, dan
                ikut menyusut bersama mereka. */}
            {sortOptions.length > 0 && (
              <Select value={sortKey} onValueChange={onSortChange}>
                <SelectTrigger className="w-full min-w-32 bg-white sm:max-w-40">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {hasActiveControls && (
          <Button type="button" variant="ghost" size="icon" onClick={onReset} title="Reset filter">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Kelompok kanan hanya berisi tindakan: mengunduh data yang sedang
          tampil, lalu aksi milik halamannya, dipisah garis tipis. Kalau tidak
          muat, seluruh kelompok ini yang turun utuh dan tetap rata kanan -
          bukan satu kontrol yang tercecer sendirian. */}
      <div className="flex flex-wrap items-center justify-end gap-2">

        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("excel")}
          disabled={isExporting}
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("pdf")}
          disabled={isExporting}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>

        {children && (
          <>
            <span className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" />
            {children}
          </>
        )}
      </div>
    </div>
  );
}
