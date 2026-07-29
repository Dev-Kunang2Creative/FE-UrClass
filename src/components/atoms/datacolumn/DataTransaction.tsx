"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transactions/transaction";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Menunggu",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  waiting_approval: {
    label: "Menunggu Persetujuan",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  paid: {
    label: "Dibayar",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },
};

const formatCurrency = (amount: number, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(
    amount,
  );

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "name",
    header: "Pengguna",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="max-w-xs truncate font-medium">
        {row.original.user.name}
      </p>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status] ?? {
        label: status,
        className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
      };

      return (
        <Badge className={`${config.className} text-xs`}>{config.label}</Badge>
      );
    },
  },
  {
    id: "grand_total",
    header: "Total",
    cell: ({ row }) => (
      <p
        suppressHydrationWarning
        className="font-semibold text-sm whitespace-nowrap"
      >
        {formatCurrency(row.original.grand_total, row.original.currency)}
      </p>
    ),
  },
  {
    id: "created_at",
    header: "Tanggal Order",
    cell: ({ row }) => (
      <p suppressHydrationWarning>
        {format(
          new Date(row.original.created_at),
          "EEEE, dd MMMM yyyy HH:mm:ss",
          {
            locale: id,
          },
        )}
      </p>
    ),
  },
  {
    id: "paid_at",
    header: "Tanggal Bayar",
    cell: ({ row }) => {
      const paidAt = row.original.paid_at;

      if (!paidAt) {
        return (
          <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">
            Belum Dibayar
          </Badge>
        );
      }

      return (
        <p suppressHydrationWarning>
          {format(new Date(paidAt), "EEEE, dd MMMM yyyy HH:mm:ss", {
            locale: id,
          })}
        </p>
      );
    },
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
              href={`/dashboard/admin/transactions/${data.id}`}
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
