"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Ticket } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/user/user";

interface DataUserProps {
  deleteUserHandler: (data: User) => void;
}

export const userColumns: (props: DataUserProps) => ColumnDef<User>[] = (
  props,
) => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "name",
    header: "Nama",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="font-medium">
        {row.original.name}
      </p>
    ),
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => <p suppressHydrationWarning>{row.original.email}</p>,
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const isAdmin = row.original.role === "admin";
      return (
        <Badge
          className={
            isAdmin
              ? "bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs"
              : "bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs"
          }
        >
          {isAdmin ? "Admin" : "Siswa"}
        </Badge>
      );
    },
  },
  {
    id: "ticket_balance",
    header: "Tiket",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-semibold">
        <Ticket className="w-4 h-4" />
        <span suppressHydrationWarning>{row.original.ticket_balance ?? 0}</span>
      </div>
    ),
  },
  {
    id: "phone_number",
    header: "No. HP",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="text-sm text-gray-600 font-mono">
        {row.original.phone_number || "-"}
      </p>
    ),
  },
  {
    id: "school_origin",
    header: "Asal Sekolah",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="text-sm text-gray-600">
        {row.original.school_origin || "-"}
      </p>
    ),
  },
  {
    id: "grade_level",
    header: "Kelas",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="text-sm text-gray-600">
        {row.original.grade_level || "-"}
      </p>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      if (data.role === "admin") return null;
      return (
        <ActionButton>
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <div
              onClick={() => props.deleteUserHandler(data)}
              className="flex cursor-pointer items-center text-red-700 hover:underline hover:text-red-900"
            >
              <Trash2 className="h-4 w-4 text-red-700 hover:text-red-900" />
              <span className="ml-2">Hapus</span>
            </div>
          </DropdownMenuItem>
        </ActionButton>
      );
    },
  },
];
