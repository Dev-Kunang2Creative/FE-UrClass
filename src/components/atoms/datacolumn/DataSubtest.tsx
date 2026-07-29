"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, Plus, SquarePen, Trash2 } from "lucide-react";

import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Subtest } from "@/types/subtest/subtest";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DataSubtestProps {
  deleteSubtestHandler: (data: Subtest) => void;
}

export const subtestColumns = (
  props: DataSubtestProps,
): ColumnDef<Subtest>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "name",
    header: "Nama Subtes",
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
        <ActionButton contentClassName="w-50">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/subtest/${data.id}/create`}
              className="flex items-center text-gray-700 hover:underline"
            >
              <Plus className="h-4 w-4 text-gray-700" />
              <span className="ml-2">Tambah Pertanyaan</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/subtest/${data.id}`}
              className="flex items-center text-gray-700 hover:underline"
            >
              <Eye className="h-4 w-4 text-gray-700" />
              <span className="ml-2">Detail</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/subtest/${data.id}/edit`}
              className="flex cursor-pointer items-center text-yellow-700 hover:underline hover:text-yellow-900"
            >
              <SquarePen className="h-4 w-4 text-yellow-700 hover:text-yellow-900" />
              <span className="ml-2">Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div
              className="flex cursor-pointer items-center text-red-600 hover:text-red-800 hover:underline"
              onClick={() => props.deleteSubtestHandler(data)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
              <span className="ml-2">Hapus</span>
            </div>
          </DropdownMenuItem>
        </ActionButton>
      );
    },
  },
];
