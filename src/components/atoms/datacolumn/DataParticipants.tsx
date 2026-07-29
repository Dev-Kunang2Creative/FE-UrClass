"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { UserTryoutAccess } from "@/types/tryout/tryout";
import { Badge } from "@/components/ui/badge";

interface DataParticipantsProps {
  viewDetailHandler: (data: UserTryoutAccess) => void;
  isFree: boolean;
}

export const participantsColumns: (
  props: DataParticipantsProps,
) => ColumnDef<UserTryoutAccess>[] = (props) => {
  const columns: ColumnDef<UserTryoutAccess>[] = [
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
          {row.original.user?.name ?? "-"}
        </p>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => (
        <p suppressHydrationWarning>{row.original.user?.email ?? "-"}</p>
      ),
    },
    {
      id: "tiket_balances",
      header: "Tiket",
      cell: ({ row }) => (
        <p suppressHydrationWarning>
          {row.original.user?.ticket_balance ?? "-"}
        </p>
      ),
    },
    {
      id: "status",
      header: "Status Ujian",
      cell: ({ row }) => {
        const status = row.original.tryout_status;

        let label = "Belum Mulai";
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "outline";

        if (status === "finished") {
          label = "Selesai";
          variant = "default";
        } else if (status === "in_progress") {
          label = "Sedang Mengerjakan";
          variant = "secondary";
        }

        return (
          <Badge
            variant={variant}
            className={
              status === "finished" ? "bg-green-500 hover:bg-green-600" : ""
            }
          >
            {label}
          </Badge>
        );
      },
    },
  ];

  if (props.isFree) {
    columns.push({
      id: "proof_count",
      header: "Bukti Follow",
      cell: ({ row }) => (
        <p suppressHydrationWarning>
          {row.original.proof_image_urls?.length ?? 0} Gambar
        </p>
      ),
    });

    columns.push({
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <ActionButton>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <div
                onClick={() => props.viewDetailHandler(data)}
                className="flex cursor-pointer items-center"
              >
                <Eye className="h-4 w-4" />
                <span className="ml-2">Lihat Bukti</span>
              </div>
            </DropdownMenuItem>
          </ActionButton>
        );
      },
    });
  }

  return columns;
};
