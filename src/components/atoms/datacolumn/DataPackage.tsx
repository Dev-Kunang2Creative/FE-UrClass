"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Package } from "@/types/packages/package";
import { formatPrice } from "@/utils/format-price";

interface DataPackageProps {
  detailPackageHandler: (data: Package) => void;
  deletePackageHandler: (data: Package) => void;
}

export const packageColumns: (
  props: DataPackageProps,
) => ColumnDef<Package>[] = (props) => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "name",
    header: "Nama Paket",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="max-w-xs md:max-w-6xl truncate">
        {row.original.name}
      </p>
    ),
  },
  {
    id: "description",
    header: "Deskripsi",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="max-w-xl truncate">
        {row.original.description}
      </p>
    ),
  },
  {
    id: "ticket_amount",
    header: "Jumlah Tiket",
    cell: ({ row }) => (
      <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
        {row.original.ticket_amount}
      </p>
    ),
  },
  {
    id: "currency",
    header: "Harga",
    cell: ({ row }) => {
      const { price, discount_price } = row.original;
      return discount_price ? (
        <div suppressHydrationWarning className="flex flex-col">
          <span className="line-through text-gray-400 text-xs">{formatPrice(price)}</span>
          <span className="text-green-600 font-semibold">{formatPrice(discount_price)}</span>
        </div>
      ) : (
        <p suppressHydrationWarning>{formatPrice(price)}</p>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;

      return (
        <Badge
          className={
            isActive
              ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
              : "bg-red-100 text-red-700 hover:bg-red-100 text-xs"
          }
        >
          {isActive ? "Aktif" : "Tidak Aktif"}
        </Badge>
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
            <div
              onClick={() => props.detailPackageHandler(data)}
              className="flex items-center text-gray-700 hover:underline"
            >
              <Eye className="h-4 w-4 text-gray-700" />
              <span className="ml-2">Detail</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/packages/${data.id}/edit`}
              className="flex cursor-pointer items-center text-yellow-700 hover:underline hover:text-yellow-900"
            >
              <SquarePen className="h-4 w-4 text-yellow-700 hover:text-yellow-900" />
              <span className="ml-2">Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div
              onClick={() => props.deletePackageHandler(data)}
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
