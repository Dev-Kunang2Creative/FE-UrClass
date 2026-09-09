"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getErrorMessage } from "@/utils/get-error-message";

type Ambang = {
  skd_passing_grade_twk: number;
  skd_passing_grade_tiu: number;
  skd_passing_grade_tkp: number;
};

function FormAmbang({ awal, token }: { awal: Ambang; token: string }) {
  const queryClient = useQueryClient();
  const [nilai, setNilai] = useState(awal);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState("");
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setMenyimpan(true);
        setGalat("");
        try {
          await api.put("/admin/settings/exam-passing-grades", nilai, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await queryClient.invalidateQueries();
          toast.success("Ambang batas SKD berhasil diperbarui.");
        } catch (error) {
          setGalat(
            getErrorMessage(error, "Pengaturan gagal disimpan. Coba lagi."),
          );
        } finally {
          setMenyimpan(false);
        }
      }}
    >
      <FieldGroup className="grid gap-4 sm:grid-cols-3">
        {(["twk", "tiu", "tkp"] as const).map((kode) => {
          const key = `skd_passing_grade_${kode}` as const;
          return (
            <Field key={kode}>
              <FieldLabel htmlFor={key}>{kode.toUpperCase()}</FieldLabel>
              <Input
                id={key}
                type="number"
                min={0}
                max={65535}
                step={1}
                required
                disabled={menyimpan}
                value={Number.isNaN(nilai[key]) ? "" : nilai[key]}
                onChange={(event) =>
                  setNilai({ ...nilai, [key]: event.target.valueAsNumber })
                }
              />
            </Field>
          );
        })}
      </FieldGroup>
      {galat && (
        <p role="alert" className="text-sm text-destructive">
          {galat}
        </p>
      )}
      <Button type="submit" disabled={menyimpan} className="self-start">
        {menyimpan ? "Menyimpan…" : "Simpan Ambang Batas"}
      </Button>
    </form>
  );
}

export default function PengaturanAmbangSkd() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  const query = useQuery({
    queryKey: ["ambang-skd", session?.user.id],
    enabled: !!token && session?.user.role === "admin",
    queryFn: async () =>
      (
        await api.get<{ data: Ambang }>("/admin/settings/exam-passing-grades", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data.data,
  });
  if (session?.user.role !== "admin") return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ambang Batas SKD / CPNS</CardTitle>
        <CardDescription>
          Pengaturan ini berlaku global untuk seluruh paket tryout CPNS dan
          Kedinasan sesuai regulasi KemenPAN-RB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <p role="status">Memuat ambang batas…</p>
        ) : query.isError ? (
          <div className="flex flex-col gap-3">
            <p role="alert">Pengaturan gagal dimuat.</p>
            <Button onClick={() => query.refetch()} variant="outline">
              Coba Lagi
            </Button>
          </div>
        ) : (
          <FormAmbang
            key={JSON.stringify(query.data)}
            awal={query.data}
            token={token}
          />
        )}
      </CardContent>
    </Card>
  );
}
