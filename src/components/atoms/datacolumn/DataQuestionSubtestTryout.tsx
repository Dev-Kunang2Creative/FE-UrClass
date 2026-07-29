"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, SquarePen } from "lucide-react";
import ActionButton from "@/components/molecules/datatable/ActionButton";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { QuestionBankBySubtestTryout } from "@/types/question-bank/question-bank";
import {
  difficultyColor,
  difficultyOptions,
} from "@/constants/difficult-option";
import { stripHtmlToPreviewText } from "@/utils/rich-text";

export const questionSubtestTryoutColumns: ColumnDef<QuestionBankBySubtestTryout>[] =
  [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <p suppressHydrationWarning>{row.index + 1}</p>,
    },
    {
      id: "name",
      header: "Pertanyaan",
      cell: ({ row }) => {
        const preview = stripHtmlToPreviewText(row.original.question_bank.question_text);

        return (
          <p
            suppressHydrationWarning
            title={preview}
            className="max-w-[360px] truncate whitespace-nowrap overflow-hidden text-sm"
          >
            {preview || "-"}
          </p>
        );
      },
    },
    {
      id: "category",
      header: "Kategori",
      cell: ({ row }) => {
        return (
          <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
            {row.original.question_bank.subtest.category}
          </p>
        );
      },
    },
    {
      id: "difficulty",
      header: "Tingkat Kesulitan",
      cell: ({ row }) => {
        const difficulty = row.original.question_bank.difficulty;

        const option = difficultyOptions.find(
          (item) => item.value === difficulty,
        );

        return (
          <Badge
            variant="outline"
            className={difficultyColor[difficulty] ?? ""}
          >
            {option?.label ?? difficulty}
          </Badge>
        );
      },
    },
    {
      id: "order_no",
      header: "Urutan",
      cell: ({ row }) => (
        <p suppressHydrationWarning className="line-clamp-1 md:line-clamp-2">
          {row.original.order_no}
        </p>
      ),
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
              <Link
                href={`/dashboard/admin/try-out/${data.tryout_subtest_id}/subtests/${data.question_bank_id}`}
                className="flex items-center text-gray-700 hover:underline"
              >
                <Eye className="h-4 w-4 text-gray-700" />
                <span className="ml-2">Detail</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/admin/try-out/${data.tryout_subtest_id}/subtests/${data.question_bank_id}/edit`}
                className="flex cursor-pointer items-center text-yellow-700 hover:underline hover:text-yellow-900"
              >
                <SquarePen className="h-4 w-4 text-yellow-700 hover:text-yellow-900" />
                <span className="ml-2">Edit</span>
              </Link>
            </DropdownMenuItem>
          </ActionButton>
        );
      },
    },
  ];
