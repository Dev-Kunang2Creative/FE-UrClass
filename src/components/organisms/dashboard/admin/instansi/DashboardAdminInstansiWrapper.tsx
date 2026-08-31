"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/utils/get-error-message";
import {
  useAdminFormasi,
  useAdminInstansi,
  useCreateFormasi,
  useDeleteFormasi,
} from "@/http/instansi/admin-instansi";

/**
 * Pengelolaan formasi per instansi.
 *
 * Seeder CSV mengisi 557 instansi borongan dari rekap resmi BKN, tapi rekap
 * formasinya tidak diterbitkan dalam bentuk yang bisa diunduh - jadi tanpa layar
 * ini formasi hanya bisa masuk dengan menyunting berkas lalu menjalankan seeder
 * di server. Instansi tetap dibuat lewat seeder; yang perlu ditambah tangan
 * hanyalah formasinya, karena itulah yang tidak bisa diambil dari mana pun.
 */
export default function DashboardAdminInstansiWrapper() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ nama: "", jenjang: "" });

  const { data, isPending } = useAdminInstansi({ token, search });
  const rows = data?.data ?? [];

  const { data: formasi, isPending: isLoadingFormasi } = useAdminFormasi({
    token,
    instansiId: openId,
  });

  const create = useCreateFormasi({ token });
  const remove = useDeleteFormasi({ token });

  const handleAdd = (instansiId: string) => {
    const nama = draft.nama.trim();
    if (!nama) return;

    create.mutate(
      { instansiId, nama, jenjang: draft.jenjang.trim() },
      {
        onSuccess: () => {
          setDraft({ nama: "", jenjang: "" });
          toast.success(`Formasi "${nama}" ditambahkan.`);
        },
        onError: (error) =>
          toast.error("Gagal menambahkan formasi", {
            description: getErrorMessage(error, "Terjadi kesalahan."),
          }),
      },
    );
  };

  return (
    <section className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Formasi per Instansi
            </h2>
            <p className="text-sm text-muted-foreground">
              Instansi diisi otomatis dari data wilayah dan rilis BKN. Formasi
              harus ditambahkan manual - BKN tidak menerbitkan rekapnya dalam
              bentuk yang bisa diunduh, jadi ambil dari pengumuman formasi
              instansi yang bersangkutan.
            </p>
          </div>

          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari instansi..."
              className="pl-9"
            />
          </div>

          {isPending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Memuat instansi...
            </p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada instansi yang cocok.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {rows.map((instansi) => {
                const isOpen = openId === instansi.id;

                return (
                  <li key={instansi.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenId(isOpen ? null : instansi.id);
                        setDraft({ nama: "", jenjang: "" });
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      {isOpen ? (
                        <ChevronDown className="size-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-slate-400" />
                      )}

                      <span className="min-w-0 flex-1 truncate font-medium">
                        {instansi.nama}
                      </span>

                      <Badge
                        className={
                          instansi.tingkat === "daerah"
                            ? "border border-blue-300 bg-blue-100 text-xs text-blue-900 hover:bg-blue-100"
                            : "border border-orange-300 bg-orange-100 text-xs text-orange-900 hover:bg-orange-100"
                        }
                      >
                        {instansi.tingkat === "daerah" ? "Daerah" : "Pusat"}
                      </Badge>

                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                          instansi.formasi_count > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {instansi.formasi_count} formasi
                      </span>
                    </button>

                    {isOpen && (
                      <div className="space-y-3 border-t bg-slate-50/60 px-4 py-4">
                        {isLoadingFormasi ? (
                          <p className="text-sm text-muted-foreground">
                            Memuat formasi...
                          </p>
                        ) : (formasi ?? []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Belum ada formasi. Tambahkan di bawah.
                          </p>
                        ) : (
                          <ul className="space-y-1.5">
                            {(formasi ?? []).map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
                              >
                                <span className="min-w-0 flex-1 truncate text-sm">
                                  {item.nama}
                                </span>
                                {item.jenjang && (
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {item.jenjang}
                                  </span>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-8 shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() =>
                                    remove.mutate(
                                      { instansiId: instansi.id, formasiId: item.id },
                                      {
                                        onSuccess: () =>
                                          toast.success(`"${item.nama}" dihapus.`),
                                        onError: (error) =>
                                          toast.error("Gagal menghapus formasi", {
                                            description: getErrorMessage(
                                              error,
                                              "Terjadi kesalahan.",
                                            ),
                                          }),
                                      },
                                    )
                                  }
                                  aria-label={`Hapus ${item.nama}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                          <Input
                            value={draft.nama}
                            onChange={(event) =>
                              setDraft((prev) => ({ ...prev, nama: event.target.value }))
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAdd(instansi.id);
                              }
                            }}
                            placeholder="Mis: Ahli Pertama - Perencana"
                            className="min-w-56 flex-1 bg-white"
                          />
                          <Input
                            value={draft.jenjang}
                            onChange={(event) =>
                              setDraft((prev) => ({ ...prev, jenjang: event.target.value }))
                            }
                            placeholder="Jenjang, mis: S-1"
                            className="w-40 bg-white"
                          />
                          <Button
                            type="button"
                            onClick={() => handleAdd(instansi.id)}
                            disabled={create.isPending || !draft.nama.trim()}
                          >
                            <Plus className="mr-1 size-4" />
                            Tambah Formasi
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
