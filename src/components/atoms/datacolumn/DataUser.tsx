"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Ticket, Coins, Sparkles, IdCard } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/user/user";
import { tautanInstagram } from "@/lib/instagram";

/**
 * Angka besar diringkas: 407.074 jadi "407 rb".
 *
 * Di kolom tabel, angka penuh enam digit mendorong kolom lain dan tetap tidak
 * dibaca sampai habis - yang dicari orang saat memindai daftar adalah besaran,
 * bukan satuannya. Angka penuhnya ada di tooltip.
 */
function ringkas(nilai: number): string {
  if (nilai < 1000) return String(nilai);
  if (nilai < 1_000_000) return `${(nilai / 1000).toFixed(nilai < 10_000 ? 1 : 0)} rb`;

  return `${(nilai / 1_000_000).toFixed(1)} jt`;
}

interface DataUserProps {
  deleteUserHandler: (data: User) => void;
  /** Membuka panel tiket dan pemakaian AI akun ini. */
  manageTicketHandler: (data: User) => void;
  /** Membuka profil lengkap peserta. */
  detailHandler: (data: User) => void;
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
    // Nama yang bisa ditekan: tempat pertama yang dicari mata saat ingin tahu
    // lebih banyak tentang seseorang, lebih dekat daripada menu titik tiga.
    cell: ({ row }) =>
      row.original.role === "admin" ? (
        <p suppressHydrationWarning className="font-medium">
          {row.original.name}
        </p>
      ) : (
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => props.detailHandler(row.original)}
          className="text-left font-medium hover:underline"
        >
          {row.original.name}
        </button>
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
    id: "ai_total_tokens",
    header: "Token AI",
    cell: ({ row }) => {
      const total = row.original.ai_total_tokens ?? 0;
      const requests = row.original.ai_requests ?? 0;

      // Nol ditulis sebagai tanda hubung, bukan "0": kolom penuh angka nol
      // membuat baris yang benar-benar punya angka lebih sulit ditemukan.
      if (total === 0) {
        return <p className="text-sm text-gray-400">-</p>;
      }

      return (
        <div
          className="flex items-center gap-1.5"
          title={`${total.toLocaleString("id-ID")} token · ${requests} permintaan`}
        >
          <Sparkles className="h-3.5 w-3.5 text-gray-400" />
          <span suppressHydrationWarning className="text-sm font-semibold tabular-nums">
            {ringkas(total)}
          </span>
        </div>
      );
    },
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
    id: "instagram",
    header: "Instagram",
    cell: ({ row }) => {
      const username = row.original.instagram;
      if (!username) return <p className="text-sm text-gray-400">-</p>;

      return (
        <a
          href={tautanInstagram(username)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-700 hover:underline"
        >
          @{username}
        </a>
      );
    },
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
              onClick={() => props.detailHandler(data)}
              className="flex cursor-pointer items-center hover:underline"
            >
              <IdCard className="h-4 w-4" />
              <span className="ml-2">Detail peserta</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div
              onClick={() => props.manageTicketHandler(data)}
              className="flex cursor-pointer items-center hover:underline"
            >
              <Coins className="h-4 w-4" />
              <span className="ml-2">Tiket & pemakaian AI</span>
            </div>
          </DropdownMenuItem>
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
