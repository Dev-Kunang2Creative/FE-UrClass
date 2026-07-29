"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";

import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Subtest } from "@/types/subtest/subtest";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const questionBankColumns: ColumnDef<Subtest>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "name",
    header: "Nama Bank Soal",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
        {row.original.name}
      </p>
    ),
  },
  {
    id: "category",
    header: "Kategori",
    cell: ({ row }) => {
      return (
        <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
          {row.original.category}
        </p>
      );
    },
  },
  {
    id: "max_questions",
    header: "Maksimal Soal",
    cell: ({ row }) => {
      return (
        <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
          {row.original.max_questions} soal
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
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/question-bank/${data.id}`}
              className="flex items-center text-gray-700 hover:underline"
            >
              <Eye className="h-4 w-4 text-gray-700" />
              <span className="ml-2">Detail</span>
            </Link>
          </DropdownMenuItem>
        </ActionButton>
      );
    },
  },
];
