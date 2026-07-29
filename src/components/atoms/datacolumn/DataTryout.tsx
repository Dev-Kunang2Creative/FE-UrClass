"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, SquarePen, Trash2 } from "lucide-react";

import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Tryout } from "@/types/tryout/tryout";
import { Badge } from "@/components/ui/badge";

interface DataTryoutProps {
  deleteTryoutHandler: (data: Tryout) => void;
}

export const tryoutColumns = (props: DataTryoutProps): ColumnDef<Tryout>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "title",
    header: "Judul Tryout",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
        {row.original.title}
      </p>
    ),
  },
  {
    id: "description",
    header: "Deskripsi",
    cell: ({ row }) => {
      return (
        <p suppressHydrationWarning className="max-w-xs truncate">
          {row.original.description}
        </p>
      );
    },
  },
  {
    id: "is_published",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.original.is_published;

      return (
        <Badge
          className={
            isPublished
              ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
              : "bg-red-100 text-red-700 hover:bg-red-100 text-xs"
          }
        >
          {isPublished ? "Dipublish" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "participants",
    header: "Peserta",
    cell: ({ row }) => (
      <p suppressHydrationWarning>
        {(row.original.user_accesses_count ?? 0).toLocaleString("id-ID")}
      </p>
    ),
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
              href={`/dashboard/admin/try-out/${data.id}`}
              className="flex items-center text-gray-700 hover:underline"
            >
              <Eye className="h-4 w-4 text-gray-700" />
              <span className="ml-2">Detail</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/try-out/${data.id}/edit`}
              className="flex items-center text-yellow-700 hover:underline hover:text-yellow-900"
            >
              <SquarePen className="h-4 w-4 text-yellow-700 hover:text-yellow-900" />
              <span className="ml-2">Edit</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <div
              className="flex cursor-pointer items-center text-red-600 hover:text-red-800 hover:underline"
              onClick={() => props.deleteTryoutHandler(data)}
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
