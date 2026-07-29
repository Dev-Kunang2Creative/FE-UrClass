"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/utils/format-price";
import { ChevronUp, ChevronDown } from "lucide-react";

export type SortDirection = "asc" | "desc";
export type SalesSortKey =
  | "period_start"
  | "product_name"
  | "average_price"
  | "total_sales"
  | "total_item_sold"
  | "order_count";

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
    >
      <span>{label}</span>
      {active ? (
        direction === "asc" ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )
      ) : null}
    </button>
  );
}

export interface SalesReportCombinedRow {
  product_name: string;
  type?: string;
  average_price: number;
  total_item_sold: number;
  order_count: number;
  total_sales: number;
  period_label: string;
}

interface DataSalesProps {
  sortKey: SalesSortKey;
  sortDirection: SortDirection;
  onSort: (key: SalesSortKey) => void;
}

export const salesColumns: (
  props: DataSalesProps,
) => ColumnDef<SalesReportCombinedRow>[] = (props) => {
  return [
    {
      id: "index",
      header: () => <div className="px-4">No</div>,
      cell: ({ row }) => (
        <div className="px-4" suppressHydrationWarning>
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "period_label",
      header: () => (
        <div className="px-4">
          <SortButton
            label="Tanggal"
            active={props.sortKey === "period_start"}
            direction={props.sortDirection}
            onClick={() => props.onSort("period_start")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-4" suppressHydrationWarning>
          {row.getValue("period_label")}
        </div>
      ),
    },
    {
      accessorKey: "product_name",
      header: () => (
        <div className="px-4">
          <SortButton
            label="Produk/TO"
            active={props.sortKey === "product_name"}
            direction={props.sortDirection}
            onClick={() => props.onSort("product_name")}
          />
        </div>
      ),
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div
            className="px-4 font-medium flex flex-col gap-1 items-start"
            suppressHydrationWarning
          >
            <span>{row.getValue("product_name")}</span>
            {type && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  type === "tryout"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {type === "tryout" ? "TRYOUT" : "KELAS"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "average_price",
      header: () => (
        <div className="px-4 flex justify-end">
          <SortButton
            label="Harga"
            active={props.sortKey === "average_price"}
            direction={props.sortDirection}
            onClick={() => props.onSort("average_price")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-right" suppressHydrationWarning>
          {formatPrice(row.getValue("average_price") as number)}
        </div>
      ),
    },
    {
      accessorKey: "total_item_sold",
      header: () => (
        <div className="px-4 flex justify-end">
          <SortButton
            label="Item Terjual"
            active={props.sortKey === "total_item_sold"}
            direction={props.sortDirection}
            onClick={() => props.onSort("total_item_sold")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-right" suppressHydrationWarning>
          {Number(row.getValue("total_item_sold") || 0).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      accessorKey: "order_count",
      header: () => (
        <div className="px-4 flex justify-end">
          <SortButton
            label="Order"
            active={props.sortKey === "order_count"}
            direction={props.sortDirection}
            onClick={() => props.onSort("order_count")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-right" suppressHydrationWarning>
          {Number(row.getValue("order_count") || 0).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      accessorKey: "total_sales",
      header: () => (
        <div className="px-4 flex justify-end">
          <SortButton
            label="Total"
            active={props.sortKey === "total_sales"}
            direction={props.sortDirection}
            onClick={() => props.onSort("total_sales")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-right font-semibold" suppressHydrationWarning>
          {formatPrice(row.getValue("total_sales") as number)}
        </div>
      ),
    },
  ];
};
