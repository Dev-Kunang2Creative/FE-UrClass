"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, FileSpreadsheet, FileText } from "lucide-react";

import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Subtest } from "@/types/subtest/subtest";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface QuestionBankColumnsProps {
  onExportPdf?: (subtest: Subtest) => void;
  onExportExcel?: (subtest: Subtest) => void;
}

export const questionBankColumns = ({
  onExportPdf,
  onExportExcel,
}: QuestionBankColumnsProps = {}): ColumnDef<Subtest>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "name",
    header: "Nama Bank Soal",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2 font-medium text-slate-800">
        {row.original.name}
      </p>
    ),
  },
  {
    id: "category",
    header: "Kategori",
    cell: ({ row }) => {
      return (
        <span
          suppressHydrationWarning
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
        >
          {row.original.category}
        </span>
      );
    },
  },
  {
    id: "max_questions",
    header: "Maksimal Soal",
    cell: ({ row }) => {
      return (
        <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
          {row.original.max_questions === 0 ? "Tidak terbatas" : `${row.original.max_questions} soal`}
        </p>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Tanggal Dibuat",
    cell: ({ row }) => (
      <p suppressHydrationWarning>
        {format(row.original.created_at, "dd MMMM yyyy", { locale: id })}
      </p>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Tanggal Diubah",
    cell: ({ row }) => (
      <p suppressHydrationWarning>
        {format(row.original.updated_at, "dd MMMM yyyy", { locale: id })}
      </p>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <ActionButton>
          <DropdownMenuLabel>Aksi Bank Soal</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/question-bank/${data.id}`}
              className="flex items-center text-gray-700 hover:underline cursor-pointer"
            >
              <Eye className="h-4 w-4 text-gray-700 mr-2" />
              <span>Detail Soal</span>
            </Link>
          </DropdownMenuItem>

          {(onExportPdf || onExportExcel) && <DropdownMenuSeparator />}

          {onExportPdf && (
            <DropdownMenuItem
              onClick={() => onExportPdf(data)}
              className="flex items-center text-blue-700 hover:bg-blue-50 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-blue-600 mr-2" />
              <span>Export PDF (Lembar Soal)</span>
            </DropdownMenuItem>
          )}

          {onExportExcel && (
            <DropdownMenuItem
              onClick={() => onExportExcel(data)}
              className="flex items-center text-emerald-700 hover:bg-emerald-50 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 mr-2" />
              <span>Export Excel (Lembar Soal)</span>
            </DropdownMenuItem>
          )}
        </ActionButton>
      );
    },
  },
];
