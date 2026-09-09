"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SmartPaginationProps {
  page: number;
  totalItems: number;
  perPage: number;
  perPageOptions: number[];
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  /**
   * "split" pushes the summary left and the controls right - right for a wide
   * table, wrong under a card grid, where the two halves latch onto the cards
   * and read as part of them. "stacked" centres both rows in their own band
   * below the content.
   */
  layout?: "split" | "stacked";
}

function buildVisiblePages(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

export default function SmartPagination({
  page,
  totalItems,
  perPage,
  perPageOptions,
  itemLabel,
  onPageChange,
  onPerPageChange,
  layout = "split",
}: SmartPaginationProps) {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage + 1;
  const end = Math.min(safePage * perPage, totalItems);
  const visiblePages = buildVisiblePages(safePage, totalPages);

  const stacked = layout === "stacked";

  return (
    <div
      className={
        stacked
          ? "mt-8 flex flex-col items-center gap-4 border-t-2 border-dashed border-slate-200 pt-6"
          : "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2"
      }
    >
      <div
        className={`flex flex-wrap items-center gap-3 text-sm text-gray-500 ${
          stacked ? "order-1 justify-center" : ""
        }`}
      >
        <span>
          Menampilkan {start}-{end} dari {totalItems} {itemLabel}
        </span>
        <div className="flex items-center gap-2">
          <span>Per halaman</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-20 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 overflow-x-auto pb-1 ${
          stacked ? "order-2 justify-center" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center shrink-0"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {visiblePages.map((visiblePage, index) => {
          const prevPage = visiblePages[index - 1];
          const showGap = prevPage && visiblePage - prevPage > 1;

          return (
            <div key={visiblePage} className="flex items-center gap-2">
              {showGap && <span className="text-gray-400">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(visiblePage)}
                className={`h-10 min-w-10 rounded-lg px-3 text-sm font-bold transition-colors ${
                  visiblePage === safePage
                    ? "bg-primary text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {visiblePage}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center shrink-0"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
