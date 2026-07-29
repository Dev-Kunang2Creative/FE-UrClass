"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  defaultPageSize?: number;
  disablePagination?: boolean;
  tableFooter?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isError = false,
  errorMessage = "Gagal memuat data.",
  defaultPageSize = 10,
  disablePagination = false,
  tableFooter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [pageIndex, setPageIndex] = React.useState(0);

  const effectivePageSize = disablePagination ? 9999 : pageSize;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: disablePagination ? 0 : pageIndex,
        pageSize: effectivePageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (disablePagination) return;
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    manualPagination: false,
  });

  // Reset ke halaman 1 jika data berubah
  React.useEffect(() => {
    setPageIndex(0);
  }, [data]);

  const pageCount = table.getPageCount();
  const currentPage = pageIndex + 1;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, data.length);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader className="table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-red-500"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map(
                (_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`table-row-hover ${
                    index % 2 === 0 ? "table-row-even" : "table-row-odd"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {tableFooter}
        </Table>
      </div>

      {/* Footer: page size + pagination */}
      {!isLoading && data.length > 0 && !disablePagination && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Info + page size */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              {data.length > 0
                ? `Menampilkan ${from}–${to} dari ${data.length} data`
                : "Tidak ada data"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">Tampilkan</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-xs"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs">per halaman</span>
            </div>
          </div>

          {/* Prev / Next */}
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-20 text-center">
                {currentPage} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                }
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
