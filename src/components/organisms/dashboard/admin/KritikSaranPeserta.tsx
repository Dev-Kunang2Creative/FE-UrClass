"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ambilMasukan,
  eksporMasukan,
  kategoriMasukan,
  type FilterMasukan,
} from "@/http/tryout/masukan-ujian";
import { getErrorMessage } from "@/utils/get-error-message";

export default function KritikSaranPeserta() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  const [filter, setFilter] = useState<FilterMasukan>({
    search: "",
    rating: "",
    tryout_id: "",
    page: 1,
  });
  const [pencarian, setPencarian] = useState("");
  const [mengekspor, setMengekspor] = useState(false);
  const query = useQuery({
    queryKey: ["masukan-ujian", session?.user.id, filter],
    enabled: !!token,
    queryFn: () => ambilMasukan(token, filter),
  });
  const tryouts = useQuery({
    queryKey: ["pilihan-tryout-masukan", session?.user.id],
    enabled: !!token,
    queryFn: async () =>
      (
        await api.get<{ data: { id: string; title: string }[] }>(
          "/admin/tryouts",
          {
            params: { per_page: 100 },
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      ).data.data,
  });
  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kritik &amp; Saran Peserta</h1>
          <p className="mt-2 text-muted-foreground">
            Tinjau pengalaman peserta setelah menyelesaikan tryout.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={mengekspor || !query.data?.total}
          onClick={async () => {
            setMengekspor(true);
            try {
              await eksporMasukan(token, filter);
            } catch (error) {
              toast.error(
                getErrorMessage(error, "Ekspor gagal. Silakan coba lagi."),
              );
            } finally {
              setMengekspor(false);
            }
          }}
        >
          {mengekspor ? "Mengekspor…" : "Ekspor CSV"}
        </Button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFilter({ ...filter, search: pencarian.trim(), page: 1 });
        }}
      >
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="cari-masukan">
              Cari peserta atau komentar
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="cari-masukan"
                value={pencarian}
                onChange={(event) => setPencarian(event.target.value)}
              />
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="filter-rating">Penilaian</FieldLabel>
            <select
              id="filter-rating"
              className="h-10 w-full rounded-md border bg-background px-3"
              value={filter.rating}
              onChange={(event) =>
                setFilter({ ...filter, rating: event.target.value, page: 1 })
              }
            >
              <option value="">Semua penilaian</option>
              {[5, 4, 3, 2, 1].map((nilai) => (
                <option key={nilai} value={nilai}>
                  {nilai} bintang
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="filter-tryout">Tryout</FieldLabel>
            <select
              id="filter-tryout"
              className="h-10 w-full rounded-md border bg-background px-3"
              value={filter.tryout_id}
              onChange={(event) =>
                setFilter({ ...filter, tryout_id: event.target.value, page: 1 })
              }
            >
              <option value="">Semua tryout</option>
              {tryouts.data?.map((tryout) => (
                <option key={tryout.id} value={tryout.id}>
                  {tryout.title}
                </option>
              ))}
            </select>
            {tryouts.isError && (
              <p role="alert" className="text-sm text-destructive">
                Daftar tryout gagal dimuat.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => tryouts.refetch()}
                >
                  Coba lagi
                </button>
              </p>
            )}
          </Field>
        </FieldGroup>
      </form>
      {query.isPending ? (
        <p role="status">Memuat masukan peserta…</p>
      ) : query.isError ? (
        <div className="flex flex-col gap-3">
          <p role="alert">Masukan gagal dimuat.</p>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => query.refetch()}
          >
            Coba Lagi
          </Button>
        </div>
      ) : !query.data.total ? (
        <p className="py-12 text-center text-muted-foreground">
          Belum ada masukan yang sesuai filter.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peserta / Tryout</TableHead>
                <TableHead>Penilaian</TableHead>
                <TableHead>Masukan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.data.map((masukan) => (
                <TableRow key={masukan.id}>
                  <TableCell className="max-w-64 whitespace-normal align-top">
                    <p className="font-medium">
                      {masukan.user?.name ?? "Akun dihapus"}
                    </p>
                    <p className="text-muted-foreground">
                      {masukan.tryout?.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(masukan.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    {masukan.rating} / 5
                  </TableCell>
                  <TableCell className="max-w-xl whitespace-normal align-top">
                    <p className="mb-1 text-sm font-medium">
                      {
                        kategoriMasukan.find(
                          ([value]) => value === masukan.category,
                        )?.[1]
                      }
                    </p>
                    <p className="whitespace-pre-wrap wrap-anywhere">
                      {masukan.comment}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {query.data.total} masukan · Halaman {query.data.current_page}{" "}
              dari {query.data.last_page}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={filter.page <= 1}
                onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                disabled={filter.page >= query.data.last_page}
                onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
