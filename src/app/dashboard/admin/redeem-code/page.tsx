"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Gift, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminDataToolbar,
  AdminExportColumn,
  AdminFilterOption,
  AdminSortOption,
  useAdminTableControls,
} from "@/components/molecules/datatable/AdminDataControls";
import {
  useCreateTicketRedeemCode,
  useDeleteTicketRedeemCode,
  useGetTicketRedeemCodes,
  useUpdateTicketRedeemCode,
  type TicketRedeemCode,
} from "@/http/ticket-redeem-codes/ticket-redeem-codes";
import { getErrorMessage } from "@/utils/get-error-message";

interface DraftForm {
  code: string;
  ticket_amount: number;
  quota: number;
  is_active: boolean;
  expired_at: string;
}

const emptyForm: DraftForm = {
  code: "",
  ticket_amount: 1,
  quota: 1,
  is_active: true,
  expired_at: "",
};
const redeemExportColumns: AdminExportColumn<TicketRedeemCode>[] = [
  { header: "Kode", accessor: (row) => row.code },
  { header: "Tiket", accessor: (row) => row.ticket_amount },
  { header: "Kuota", accessor: (row) => row.quota },
  { header: "Terpakai", accessor: (row) => row.used_count },
  { header: "Status", accessor: (row) => row.is_active ? "Aktif" : "Nonaktif" },
  { header: "Expired", accessor: (row) => row.expired_at ? new Date(row.expired_at).toLocaleDateString("id-ID") : "-" },
];
const redeemSortOptions: AdminSortOption<TicketRedeemCode>[] = [
  { key: "newest", label: "Terbaru", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
  { key: "code-az", label: "Kode A-Z", compare: (a, b) => a.code.localeCompare(b.code, "id-ID") },
  { key: "quota", label: "Kuota terbanyak", compare: (a, b) => Number(b.quota || 0) - Number(a.quota || 0) },
  { key: "used", label: "Terpakai terbanyak", compare: (a, b) => Number(b.used_count || 0) - Number(a.used_count || 0) },
];

export default function AdminRedeemCodePage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DraftForm>(emptyForm);
  const [editing, setEditing] = useState<TicketRedeemCode | null>(null);

  const { data, isLoading } = useGetTicketRedeemCodes({ token });
  const codeRows = data?.data ?? [];
  const redeemFilters: AdminFilterOption<TicketRedeemCode>[] = [
    {
      key: "status",
      label: "Semua Status",
      placeholder: "Status",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Nonaktif", value: "inactive" },
      ],
      getValue: (row) => row.is_active ? "active" : "inactive",
    },
  ];
  const controls = useAdminTableControls({
    data: codeRows,
    searchFields: [(row) => row.code],
    filters: redeemFilters,
    sortOptions: redeemSortOptions,
    defaultSort: "newest",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["ticket-redeem-codes"] });

  const createMutation = useCreateTicketRedeemCode({
    token,
    options: {
      onSuccess: () => {
        toast.success("Kode redeem berhasil dibuat");
        setForm(emptyForm);
        invalidate();
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal membuat kode redeem")),
    },
  });

  const updateMutation = useUpdateTicketRedeemCode({
    token,
    options: {
      onSuccess: () => {
        toast.success("Kode redeem berhasil diupdate");
        setEditing(null);
        setForm(emptyForm);
        invalidate();
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal mengupdate kode redeem")),
    },
  });

  const deleteMutation = useDeleteTicketRedeemCode({
    token,
    options: {
      onSuccess: () => {
        toast.success("Kode redeem berhasil dihapus");
        invalidate();
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal menghapus kode redeem")),
    },
  });

  const submit = () => {
    const payload = {
      code: form.code.trim() || undefined,
      ticket_amount: Number(form.ticket_amount),
      quota: Number(form.quota),
      is_active: form.is_active,
      expired_at: form.expired_at || null,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: { ...payload, code: payload.code ?? editing.code } });
      return;
    }

    createMutation.mutate(payload);
  };

  const startEdit = (code: TicketRedeemCode) => {
    setEditing(code);
    setForm({
      code: code.code,
      ticket_amount: code.ticket_amount,
      quota: code.quota,
      is_active: code.is_active,
      expired_at: code.expired_at ? code.expired_at.slice(0, 10) : "",
    });
  };

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Gift className="w-6 h-6 text-[#004AAB]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kode Redeem Tiket</h1>
          <p className="text-sm text-gray-500">Buat voucher tiket dengan kuota dan batas redeem per akun.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Kode</label>
              <Input
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="Kosongkan untuk generate otomatis"
                maxLength={40}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Tiket</label>
              <Input
                type="number"
                min={1}
                value={form.ticket_amount}
                onChange={(e) => setForm((prev) => ({ ...prev, ticket_amount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Kuota</label>
              <Input
                type="number"
                min={editing ? Math.max(1, editing.used_count) : 1}
                value={form.quota}
                onChange={(e) => setForm((prev) => ({ ...prev, quota: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Expired</label>
              <Input
                type="date"
                value={form.expired_at}
                onChange={(e) => setForm((prev) => ({ ...prev, expired_at: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Aktif
            </label>
            <div className="flex gap-2">
              {editing && (
                <Button type="button" variant="outline" onClick={reset}>
                  Batal Edit
                </Button>
              )}
              <Button type="button" onClick={submit} disabled={isPending}>
                {editing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isPending ? "Menyimpan..." : editing ? "Simpan" : "Buat Kode"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <AdminDataToolbar
              search={controls.search}
              onSearchChange={controls.setSearch}
              searchPlaceholder="Cari kode redeem..."
              filters={redeemFilters}
              filterValues={controls.filterValues}
              onFilterChange={controls.setFilter}
              sortOptions={redeemSortOptions}
              sortKey={controls.sortKey}
              onSortChange={controls.setSortKey}
              onReset={controls.reset}
              hasActiveControls={controls.hasActiveControls}
              rows={controls.rows}
              exportColumns={redeemExportColumns}
              exportTitle="laporan-kode-redeem"
              filterSummary={`Total hasil: ${controls.rows.length}`}
            />
          </div>
          {isLoading ? (
            <div className="p-10 text-center text-gray-400">Memuat kode redeem...</div>
          ) : controls.rows.length === 0 ? (
            <div className="p-10 text-center text-gray-400">Belum ada kode redeem tiket.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kode</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Tiket</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Kuota</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Terpakai</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Expired</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {controls.rows.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.code}</td>
                      <td className="px-4 py-3 text-right">{item.ticket_amount}</td>
                      <td className="px-4 py-3 text-right">{item.quota}</td>
                      <td className="px-4 py-3 text-right">{item.used_count}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.expired_at ? new Date(item.expired_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(item)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
