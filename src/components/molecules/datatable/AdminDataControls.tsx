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

function formatReportTitle(title: string): string {
  const clean = title.replace(/[-_]+/g, " ").trim();
  if (clean.toLowerCase().startsWith("laporan") || clean.toLowerCase().startsWith("data")) {
    return clean.toUpperCase();
  }
  return `LAPORAN DATA ${clean.toUpperCase()}`;
}

function buildExportRows<T>(rows: T[], columns: AdminExportColumn<T>[]) {
  return rows.map((row) =>
    columns.reduce<Record<string, string | number>>((acc, column) => {
      const raw = column.accessor(row);
      const val = column.format ? column.format(raw, row) : raw;
      if (val === null || val === undefined || val === "") {
        acc[column.header] = "-";
      } else if (typeof val === "boolean") {
        acc[column.header] = val ? "Ya" : "Tidak";
      } else if ((val as unknown) instanceof Date) {
        acc[column.header] = (val as unknown as Date).toLocaleDateString("id-ID");
      } else if (typeof val === "string") {
        acc[column.header] = val.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "-";
      } else if (typeof val === "number") {
        acc[column.header] = val;
      } else {
        acc[column.header] = String(val);
      }
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

  // Top Accent Bar
  doc.setFillColor(0, 74, 171); // Brand Blue #004AAB
  doc.rect(36, 16, pageWidth - 72, 3, "F");

  // Try loading logo with bounded dimensions
  try {
    const logo = await loadImageAsDataUrl("/images/logo/urclass.png");
    const maxLogoW = 75;
    const maxLogoH = 22;
    let logoW = maxLogoW;
    let logoH = logo.height > 0 ? (maxLogoW * logo.height) / logo.width : maxLogoH;
    if (logoH > maxLogoH) {
      logoH = maxLogoH;
      logoW = logo.width > 0 ? (maxLogoH * logo.width) / logo.height : maxLogoW;
    }
    doc.addImage(logo.dataUrl, "PNG", pageWidth - 36 - logoW, 26, logoW, logoH);
  } catch {
    // Logo is optional; proceed gracefully
  }

  // Header Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 74, 171);
  doc.text("URCLASS", 36, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Platform Tryout & Akademik Digital • Dokumen Ekspor Resmi", 98, 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(formatReportTitle(title), 36, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  doc.text(`Dicetak: ${dateStr}, ${timeStr} WIB  •  Total Baris Data: ${rows.length}`, 36, 60);

  if (filterSummary) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filter Aktif: ${filterSummary}`, 36, 70, { maxWidth: pageWidth - 72 });
  }

  // Sanitized body rows
  const formattedBody = rows.map((row) =>
    columns.map((column) => {
      const raw = column.accessor(row);
      const val = column.format ? column.format(raw, row) : raw;
      if (val === null || val === undefined || val === "") {
        return "-";
      }
      if (typeof val === "boolean") {
        return val ? "Ya" : "Tidak";
      }
      if ((val as unknown) instanceof Date) {
        return (val as unknown as Date).toLocaleDateString("id-ID");
      }
      if (typeof val === "string") {
        return val.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "-";
      }
      if (typeof val === "object") {
        try {
          return JSON.stringify(val);
        } catch {
          return "-";
        }
      }
      return String(val);
    }),
  );

  autoTable(doc, {
    startY: filterSummary ? 78 : 68,
    head: [columns.map((column) => column.header)],
    body: formattedBody,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59], // Slate-800
      cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    styles: {
      overflow: "linebreak",
      valign: "middle",
    },
    margin: { left: 36, right: 36, bottom: 25 },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`UrClass Export System  •  Halaman ${currentPage}`, 36, pageHeight - 12);
      doc.text(`Dokumen Internal & Rahasia`, pageWidth - 36, pageHeight - 12, { align: "right" });
    },
  });

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  const newWindow = window.open(blobUrl, "_blank");
  if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
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
