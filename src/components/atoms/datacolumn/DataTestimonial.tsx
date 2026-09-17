"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, Star } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Testimonial } from "@/types/testimonials/testimonial";

interface DataTestimonialProps {
  editTestimonialHandler: (data: Testimonial) => void;
  deleteTestimonialHandler: (data: Testimonial) => void;
}

export const testimonialColumns: (
  props: DataTestimonialProps,
) => ColumnDef<Testimonial>[] = (props) => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
  },
  {
    id: "profile",
    header: "Siswa & Status",
    cell: ({ row }) => {
      const item = row.original;
      const initial = item.name ? item.name.charAt(0).toUpperCase() : "?";
      const bg = item.avatar_bg || "#be185d";

      return (
        <div className="flex items-center gap-3">
          {item.avatar_url ? (
            <img
              src={item.avatar_url}
              alt={item.name}
              className="w-9 h-9 rounded-full object-cover border shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm"
              style={{ backgroundColor: bg }}
            >
              {initial}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground truncate max-w-[200px]">
              {item.name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {item.role}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "program",
    header: "Program",
    cell: ({ row }) => {
      const isCpns = row.original.program === "CPNS";
      return (
        <Badge
          className={
            isCpns
              ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100"
              : "bg-blue-100 text-blue-900 border border-blue-300 font-bold hover:bg-blue-100"
          }
        >
          {row.original.program}
        </Badge>
      );
    },
  },
  {
    id: "quote",
    header: "Ulasan / Quote",
    cell: ({ row }) => (
      <p className="line-clamp-2 text-sm text-foreground max-w-md italic">
        &ldquo;{row.original.quote}&rdquo;
      </p>
    ),
  },
  {
    id: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
        <span className="text-sm font-semibold">{row.original.rating}</span>
      </div>
    ),
  },
  {
    id: "order_no",
    header: "Urutan",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.order_no}</span>
    ),
  },
  {
    id: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <Badge
          className={
            active
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        >
          {active ? "Aktif" : "Nonaktif"}
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
        <ActionButton contentClassName="w-44">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => props.editTestimonialHandler(data)}
            className="flex cursor-pointer items-center text-amber-700 hover:text-amber-900 hover:underline"
          >
            <SquarePen className="h-4 w-4" />
            <span className="ml-2">Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => props.deleteTestimonialHandler(data)}
            className="flex cursor-pointer items-center text-red-600 hover:text-red-800 hover:underline"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-2">Hapus</span>
          </DropdownMenuItem>
        </ActionButton>
      );
    },
  },
];
