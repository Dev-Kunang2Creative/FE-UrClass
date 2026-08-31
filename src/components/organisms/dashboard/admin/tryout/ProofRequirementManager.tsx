"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/utils/get-error-message";
import { PROOF_ICON_OPTIONS, proofIconOf } from "@/lib/proof-icons";
import {
  useDeleteProofRequirement,
  useGetAdminProofRequirements,
  useReorderProofRequirements,
  useSaveProofRequirement,
  type ProofIcon,
  type ProofRequirement,
} from "@/http/proof-requirements/proof-requirements";

/**
 * Pengaturan syarat bukti pendaftaran tryout gratis.
 *
 * Jumlah syarat aktif di sini menentukan berapa unggahan yang diminta saat
 * mendaftar - satu slot untuk satu syarat - dan judul tiap syarat jadi label
 * slotnya. Jadi menambah syarat di sini langsung mengubah apa yang diminta
 * tanpa menyentuh kode mana pun.
 *
 * Sebelumnya yang diatur adalah daftar akun Instagram, yang hanya bisa
 * menyatakan syarat berbentuk "follow akun X".
 */

interface Draft {
  title: string;
  instruction: string;
  link_url: string;
  link_label: string;
  icon: ProofIcon | "";
}

const EMPTY_DRAFT: Draft = {
  title: "",
  instruction: "",
  link_url: "",
  link_label: "",
  icon: "",
};

const draftOf = (item: ProofRequirement): Draft => ({
  title: item.title,
  instruction: item.instruction ?? "",
  link_url: item.link_url ?? "",
  link_label: item.link_label ?? "",
  icon: item.icon ?? "",
});

export default function ProofRequirementManager() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  // null = tidak ada form terbuka, "new" = form tambah, id = form ubah.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const { data, isPending } = useGetAdminProofRequirements({ token });
  const requirements = data?.data ?? [];
  const activeCount = requirements.filter((item) => item.is_active).length;

  const save = useSaveProofRequirement({ token });
  const remove = useDeleteProofRequirement({ token });
  const reorder = useReorderProofRequirements({ token });

  const openNew = () => {
    setEditing("new");
    setDraft(EMPTY_DRAFT);
  };

  const openEdit = (item: ProofRequirement) => {
    setEditing(item.id);
    setDraft(draftOf(item));
  };

  const close = () => {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleSave = () => {
    const title = draft.title.trim();
    if (!title) return;

    save.mutate(
      {
        id: editing && editing !== "new" ? editing : undefined,
        body: {
          title,
          instruction: draft.instruction.trim() || null,
          link_url: draft.link_url.trim() || null,
          link_label: draft.link_label.trim() || null,
          icon: draft.icon || null,
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success(
            editing === "new" ? `Syarat "${title}" ditambahkan.` : "Syarat diperbarui.",
          );
        },
        onError: (error) =>
          toast.error("Gagal menyimpan syarat", {
            description: getErrorMessage(error, "Terjadi kesalahan."),
          }),
      },
    );
  };

  /** Menggeser satu baris mengirim seluruh urutan, bukan satu baris saja. */
  const move = (index: number, arah: -1 | 1) => {
    const next = [...requirements];
    const tujuan = index + arah;
    if (tujuan < 0 || tujuan >= next.length) return;

    [next[index], next[tujuan]] = [next[tujuan], next[index]];

    reorder.mutate(
      next.map((item) => item.id),
      {
        onError: (error) =>
          toast.error("Gagal menyimpan urutan", {
            description: getErrorMessage(error, "Terjadi kesalahan."),
          }),
      },
    );
  };

  const form = (
    <div className="space-y-3 rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Judul syarat <span className="text-red-600">*</span>
        </label>
        <Input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="Mis: Bukti tag teman di komentar"
          className="bg-white"
        />
        <p className="text-xs text-slate-500">
          Ini jadi label slot unggahan yang dilihat peserta.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Instruksi</label>
        <textarea
          value={draft.instruction}
          onChange={(event) => setDraft({ ...draft, instruction: event.target.value })}
          placeholder="Mis: Tag minimal 3 temanmu di kolom komentar postingan tryout ini, lalu unggah tangkapan layar komentarmu."
          rows={3}
          maxLength={500}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="text-xs text-slate-500">
          Jelaskan apa yang harus terlihat di tangkapan layarnya. Maksimal 500
          karakter.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Tautan yang perlu dibuka
          </label>
          <Input
            value={draft.link_url}
            onChange={(event) => setDraft({ ...draft, link_url: event.target.value })}
            placeholder="@urclass atau https://..."
            className="bg-white"
          />
          <p className="text-xs text-slate-500">
            Opsional. Untuk syarat Instagram cukup tulis @username.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Teks tombol</label>
          <Input
            value={draft.link_label}
            onChange={(event) => setDraft({ ...draft, link_label: event.target.value })}
            placeholder="Mis: Buka Instagram"
            className="bg-white"
          />
          <p className="text-xs text-slate-500">
            Opsional. Kalau kosong dipakai &quot;Buka tautan&quot;.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Ikon</label>
        <div className="flex flex-wrap gap-2">
          {PROOF_ICON_OPTIONS.map(({ value, label, Icon, className }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setDraft({ ...draft, icon: draft.icon === value ? "" : value })
              }
              className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                draft.icon === value
                  ? "border-slate-900 bg-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Icon className={`size-3.5 ${className}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={close}
          className="border-2 font-bold sm:flex-1"
        >
          <X className="mr-1 size-4" />
          Batal
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={save.isPending || !draft.title.trim()}
          className="border-2 border-slate-900 font-bold sm:flex-1"
        >
          {save.isPending ? "Menyimpan..." : "Simpan Syarat"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Syarat Bukti Pendaftaran</CardTitle>
        <p className="text-sm text-muted-foreground">
          Peserta tryout gratis mengunggah satu tangkapan layar untuk tiap syarat
          aktif. Saat ini{" "}
          <span className="font-semibold text-foreground">
            {activeCount} syarat aktif
          </span>
          , jadi peserta melihat {activeCount} slot unggahan dengan judul dan
          instruksi sesuai yang kamu tulis di sini.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {editing === "new" ? (
          form
        ) : (
          <Button
            type="button"
            onClick={openNew}
            className="w-full border-2 border-slate-900 font-bold sm:w-auto"
          >
            <Plus className="mr-1 size-4" />
            Tambah Syarat
          </Button>
        )}

        {isPending ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Memuat syarat...
          </p>
        ) : requirements.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada syarat. Tambahkan minimal satu, kalau tidak pendaftaran
            tryout gratis berjalan tanpa bukti apa pun.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {requirements.map((item, index) => {
              const { Icon, className } = proofIconOf(item.icon);

              if (editing === item.id) {
                return (
                  <li key={item.id} className="p-4">
                    {form}
                  </li>
                );
              }

              return (
                <li key={item.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || reorder.isPending}
                      className="text-slate-400 transition-colors hover:text-slate-900 disabled:opacity-30"
                      aria-label={`Pindahkan "${item.title}" ke atas`}
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === requirements.length - 1 || reorder.isPending}
                      className="text-slate-400 transition-colors hover:text-slate-900 disabled:opacity-30"
                      aria-label={`Pindahkan "${item.title}" ke bawah`}
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>

                  <Icon className={`mt-0.5 size-4 shrink-0 ${className}`} />

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium">{item.title}</p>
                    {item.instruction && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.instruction}
                      </p>
                    )}
                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        {item.link_label || "Buka tautan"}
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>

                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(next) =>
                          save.mutate(
                            {
                              id: item.id,
                              body: {
                                title: item.title,
                                instruction: item.instruction,
                                link_url: item.link_url,
                                link_label: item.link_label,
                                icon: item.icon,
                                order_no: item.order_no,
                                is_active: next,
                              },
                            },
                            {
                              onError: (error) =>
                                toast.error("Gagal mengubah status syarat", {
                                  description: getErrorMessage(
                                    error,
                                    "Terjadi kesalahan.",
                                  ),
                                }),
                            },
                          )
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(item)}
                      aria-label={`Ubah "${item.title}"`}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() =>
                        remove.mutate(item.id, {
                          onSuccess: () => toast.success(`"${item.title}" dihapus.`),
                          onError: (error) =>
                            toast.error("Gagal menghapus syarat", {
                              description: getErrorMessage(error, "Terjadi kesalahan."),
                            }),
                        })
                      }
                      aria-label={`Hapus "${item.title}"`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
