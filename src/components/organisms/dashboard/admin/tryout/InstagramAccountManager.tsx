"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ExternalLink, Instagram, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/utils/get-error-message";
import {
  useDeleteInstagramAccount,
  useGetAdminInstagramAccounts,
  useSaveInstagramAccount,
} from "@/http/instagram/get-instagram-accounts";

/**
 * Pengaturan akun Instagram yang wajib di-follow peserta tryout gratis.
 *
 * Jumlah akun aktif di sini juga menentukan berapa bukti follow yang diminta
 * saat mendaftar - satu bukti untuk satu akun - jadi menambah akun di sini
 * langsung menaikkan syaratnya tanpa perlu menyentuh kode mana pun.
 */
export default function InstagramAccountManager() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";

  const [username, setUsername] = useState("");

  const { data, isPending } = useGetAdminInstagramAccounts({ token });
  const accounts = data?.data ?? [];
  const activeCount = accounts.filter((account) => account.is_active).length;

  const save = useSaveInstagramAccount({ token });
  const remove = useDeleteInstagramAccount({ token });

  const handleAdd = () => {
    const clean = username.trim().replace(/^@/, "");
    if (!clean) return;

    save.mutate(
      { body: { username: clean, order_no: accounts.length + 1 } },
      {
        onSuccess: () => {
          setUsername("");
          toast.success(`@${clean} ditambahkan.`);
        },
        onError: (error) =>
          toast.error("Gagal menambahkan akun", {
            description: getErrorMessage(error, "Terjadi kesalahan."),
          }),
      },
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Akun Instagram yang Wajib Di-follow</CardTitle>
        <p className="text-sm text-muted-foreground">
          Peserta tryout gratis harus mengunggah satu bukti follow untuk tiap akun
          aktif di sini. Saat ini{" "}
          <span className="font-semibold text-foreground">
            {activeCount} akun aktif
          </span>
          , jadi minimal {Math.max(1, activeCount)} bukti yang diminta.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              @
            </span>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="username_instagram"
              className="pl-7"
            />
          </div>
          <Button type="button" onClick={handleAdd} disabled={save.isPending || !username.trim()}>
            <Plus className="mr-1 h-4 w-4" />
            Tambah Akun
          </Button>
        </div>

        {isPending ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Memuat akun...</p>
        ) : accounts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada akun. Tambahkan minimal satu supaya syarat follow bisa
            diperiksa.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <Instagram className="h-4 w-4 shrink-0 text-pink-600" />

                <a
                  href={account.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1.5 font-medium hover:underline"
                >
                  <span className="truncate">@{account.username}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </a>

                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(next) =>
                        save.mutate(
                          {
                            id: account.id,
                            body: {
                              username: account.username,
                              label: account.label,
                              order_no: account.order_no,
                              is_active: next,
                            },
                          },
                          {
                            onError: (error) =>
                              toast.error("Gagal mengubah status akun", {
                                description: getErrorMessage(error, "Terjadi kesalahan."),
                              }),
                          },
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {account.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() =>
                      remove.mutate(account.id, {
                        onSuccess: () => toast.success(`@${account.username} dihapus.`),
                        onError: (error) =>
                          toast.error("Gagal menghapus akun", {
                            description: getErrorMessage(error, "Terjadi kesalahan."),
                          }),
                      })
                    }
                    aria-label={`Hapus @${account.username}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
