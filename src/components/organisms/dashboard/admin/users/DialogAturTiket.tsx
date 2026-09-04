"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdjustTickets, useUserDetail, type TicketEntry } from "@/http/users/user-detail";
import { compactNumber, formatRupiah, fullNumber, fullRupiah } from "@/lib/format-usage";
import { getErrorMessage } from "@/utils/get-error-message";
import type { User } from "@/types/user/user";

/**
 * Tiket dan pemakaian AI satu pengguna.
 *
 * Keduanya di satu tempat karena dibuka untuk pertanyaan yang sama - "akun ini
 * masih bisa apa, dan sudah memakai apa" - dan memisahkannya berarti admin
 * membuka dua panel untuk satu keputusan.
 *
 * Penyesuaian tiket ada di sini karena ada kasus yang tidak bisa diselesaikan
 * alur pembelian: pembayaran yang masuk tapi callback-nya gagal, tryout yang
 * batal karena gangguan di sisi kami, dan hadiah lomba. Tanpa jalan ini,
 * satu-satunya pilihannya adalah menyunting basis data langsung - yang tidak
 * meninggalkan jejak siapa pun.
 */

const LABEL_SUMBER: Record<string, string> = {
  paket: "Beli paket",
  kelas: "Beli kelas",
  redeem: "Kode redeem",
  tryout: "Kerjakan tryout",
  admin: "Penyesuaian admin",
};

/** Pilihan cepat. Angka yang benar-benar sering dipakai, bukan seluruh rentang. */
const CEPAT = [1, 3, 5, 10];

export default function DialogAturTiket({
  user,
  token,
  open,
  onOpenChange,
}: {
  user: User | null;
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * Tingginya dibatasi, dan yang menggulir hanya bagian dalamnya.
       *
       * Sebelumnya seluruh dialog yang menggulir (`overflow-y-auto` di
       * DialogContent), jadi riwayat tiket yang panjang mendorong saldo dan form
       * penyesuaian keluar dari pandangan - padahal keduanya justru alasan panel
       * ini dibuka. Sekarang kepala dan form tetap di tempatnya, dan riwayatnya
       * punya kotak gulir sendiri.
       */}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg!">
        <DialogHeader className="shrink-0 border-b px-5 py-3.5 text-left">
          <DialogTitle className="text-base">Tiket & pemakaian AI</DialogTitle>
          <DialogDescription className="text-xs">
            {user ? `${user.name} · ${user.email}` : "-"}
          </DialogDescription>
        </DialogHeader>

        {/* key membuat isinya lahir ulang tiap kali pengguna yang dibuka berganti,
            sehingga angka dan isi form tidak tertinggal dari orang sebelumnya -
            tanpa perlu useEffect untuk menyemainya. */}
        {open && user && <Isi key={user.id} user={user} token={token} />}
      </DialogContent>
    </Dialog>
  );
}

function Isi({ user, token }: { user: User; token: string }) {
  const { data, isPending } = useUserDetail({ token, userId: user.id });
  const adjust = useAdjustTickets({ token });

  const [jumlah, setJumlah] = useState("");
  const [alasan, setAlasan] = useState("");
  const [arah, setArah] = useState<1 | -1>(1);

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Memuat data akun...
      </div>
    );
  }

  const { tickets, ai_usage: ai } = data.meta;

  const angka = Number(jumlah);
  const sah = Number.isInteger(angka) && angka > 0 && angka <= 1000 && alasan.trim().length >= 3;

  const kirim = () => {
    if (!sah) return;

    adjust.mutate(
      { userId: user.id, amount: angka * arah, reason: alasan.trim() },
      {
        onSuccess: (hasil) => {
          toast.success(hasil.message);
          setJumlah("");
          setAlasan("");
        },
        onError: (error) => {
          const data = (
            error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
          ).response?.data;

          toast.error("Gagal menyesuaikan tiket", {
            description:
              data?.errors
                ? Object.values(data.errors).flat().join(" ")
                : data?.message ?? getErrorMessage(error, "Terjadi kesalahan."),
          });
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/*
       * Bagian yang tidak boleh hilang dari pandangan. Ia sendiri bisa menggulir
       * pada layar yang sangat pendek - tanpa itu, isinya terpotong dan tombol
       * simpannya tidak bisa dijangkau sama sekali.
       */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
      {/* Saldo jadi angka utama: itu yang menentukan apakah peserta masih bisa
          mengerjakan tryout, dan satu-satunya yang diubah dari panel ini. */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 rounded-xl border bg-white p-3.5">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Ticket className="size-3.5 text-slate-400" />
            Saldo tiket
          </p>
          <p className="mt-1 text-3xl font-bold leading-none tabular-nums text-slate-900">
            {tickets.balance}
          </p>
        </div>

        <p className="text-xs tabular-nums text-slate-500">
          <span className="font-bold text-emerald-700">+{tickets.total_credited}</span> masuk ·{" "}
          <span className="font-bold text-slate-700">−{tickets.total_debited}</span> terpakai
        </p>
      </div>

      {/* Penyesuaian */}
      <div className="rounded-xl border bg-white p-3.5">
        <p className="text-sm font-bold text-slate-900">Sesuaikan tiket</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-slate-50 p-0.5">
            {(
              [
                [1, "Tambah", Plus],
                [-1, "Kurangi", Minus],
              ] as const
            ).map(([nilai, label, Ikon]) => (
              <button
                key={label}
                type="button"
                onClick={() => setArah(nilai)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  arah === nilai
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Ikon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          <Input
            type="number"
            min={1}
            max={1000}
            value={jumlah}
            onChange={(event) => setJumlah(event.target.value)}
            placeholder="Jumlah"
            className="w-24"
          />

          {CEPAT.map((nilai) => (
            <button
              key={nilai}
              type="button"
              onClick={() => setJumlah(String(nilai))}
              className="rounded-lg border px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              {nilai}
            </button>
          ))}
        </div>

        <Input
          value={alasan}
          onChange={(event) => setAlasan(event.target.value)}
          maxLength={200}
          placeholder="Alasan — mis. pembayaran masuk tapi callback gagal"
          className="mt-2"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {/* Hasilnya disebut sebelum tombolnya ditekan. Penyesuaian tiket tidak
              punya tombol batal, jadi angka akhirnya harus terlihat lebih dulu. */}
          <p className="text-xs text-slate-500">
            {sah ? (
              <>
                Saldo jadi{" "}
                <span className="font-bold tabular-nums text-slate-900">
                  {Math.max(0, tickets.balance + angka * arah)}
                </span>
                {arah === -1 && angka > tickets.balance && (
                  <span className="text-amber-700"> — dibatasi sebesar saldo</span>
                )}
              </>
            ) : (
              "Isi jumlah dan alasannya dulu"
            )}
          </p>

          <Button
            type="button"
            onClick={kirim}
            disabled={!sah || adjust.isPending}
            className="border-2 border-slate-900 font-bold"
          >
            {adjust.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {arah === 1 ? "Tambah Tiket" : "Kurangi Tiket"}
          </Button>
        </div>
      </div>

      {/* Pemakaian AI */}
      <div className="rounded-xl border bg-white p-3.5">
        <p className="text-sm font-bold text-slate-900">Pemakaian asisten AI</p>

        {ai.requests === 0 ? (
          <p className="mt-2 text-xs text-slate-500">Belum pernah memakai asisten.</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Angka label="Total token" nilai={compactNumber(ai.total_tokens)} penuh={fullNumber(ai.total_tokens)} />
              <Angka label="Permintaan" nilai={String(ai.requests)} />
              <Angka
                label="Estimasi biaya"
                nilai={formatRupiah(ai.cost_idr, { compact: true })}
                penuh={fullRupiah(ai.cost_idr)}
              />
              <Angka label="Hari ini" nilai={String(ai.used_today)} />
            </div>

            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-slate-500">
              <span title={fullNumber(ai.input_tokens)}>
                {compactNumber(ai.input_tokens)} masuk
              </span>
              <span title={fullNumber(ai.output_tokens)}>
                {compactNumber(ai.output_tokens)} keluar
              </span>
              {ai.cached_tokens > 0 && (
                <span title={fullNumber(ai.cached_tokens)}>
                  {compactNumber(ai.cached_tokens)} dari cache
                </span>
              )}
              {ai.failed > 0 && <span className="font-bold text-red-700">{ai.failed} gagal</span>}
              {ai.last_used_at && (
                <span>terakhir {new Date(ai.last_used_at).toLocaleString("id-ID")}</span>
              )}
            </p>
          </>
        )}
      </div>

      </div>

      {/*
       * Riwayat dipisah ke kaki panel dengan gulirnya sendiri.
       *
       * Panjangnya tidak bisa diperkirakan - satu akun bisa punya puluhan baris -
       * dan itu satu-satunya bagian di panel ini yang begitu. Dibatasi tinggi di
       * sini, bukan dengan memotong jumlah barisnya lebih pendek: yang dicari
       * orang di riwayat kadang justru baris yang agak ke bawah.
       */}
      {tickets.recent.length > 0 && (
        <div className="shrink-0 border-t bg-slate-50/60">
          <p className="px-5 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Riwayat tiket
            <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-400">
              {tickets.recent.length} terakhir
            </span>
          </p>

          <div className="max-h-40 divide-y overflow-y-auto px-1 pb-2">
            {tickets.recent.map((entri) => (
              <Baris key={entri.id} entri={entri} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Angka({ label, nilai, penuh }: { label: string; nilai: string; penuh?: string }) {
  return (
    <div className="rounded-lg border bg-slate-50/60 px-2.5 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm font-bold tabular-nums text-slate-900" title={penuh}>
        {nilai}
      </p>
    </div>
  );
}

function Baris({ entri }: { entri: TicketEntry }) {
  const masuk = entri.type === "credit";

  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <span
        className={`shrink-0 text-sm font-bold tabular-nums ${
          masuk ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {masuk ? "+" : "−"}
        {entri.amount}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-slate-700">{entri.description}</span>
        <span className="block text-[11px] text-slate-400">
          {LABEL_SUMBER[entri.source] ?? entri.source}
          {entri.created_at && ` · ${new Date(entri.created_at).toLocaleString("id-ID")}`}
        </span>
      </span>
    </div>
  );
}
