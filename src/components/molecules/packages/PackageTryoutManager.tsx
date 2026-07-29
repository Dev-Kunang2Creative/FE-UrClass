"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPackageTryouts } from "@/http/packages/get-package-tryouts";
import { useAttachPackageTryout } from "@/http/packages/attach-package-tryout";
import { useDetachPackageTryout } from "@/http/packages/detach-package-tryout";
import { useGetAllTryout } from "@/http/tryout/get-all-tryout";

interface PackageTryoutManagerProps {
  packageId: string;
}

export default function PackageTryoutManager({ packageId }: PackageTryoutManagerProps) {
  const { data: session } = useSession();
  const token = session?.access_token as string;
  const queryClient = useQueryClient();

  const [selectedTryout, setSelectedTryout] = useState("");

  const { data: packageTryoutsData, isLoading } = useGetPackageTryouts({ token, packageId });
  const { data: allTryoutsData } = useGetAllTryout({ token });

  const attachedIds = new Set((packageTryoutsData?.data ?? []).map((t) => t.id));
  const availableTryouts = (allTryoutsData?.data ?? []).filter((t) => !attachedIds.has(t.id));

  const { mutate: attach, isPending: isAttaching } = useAttachPackageTryout({
    onError: (error) => {
      toast.error("Gagal menambahkan try out!", {
        description: error.response?.data?.message,
      });
    },
    onSuccess: () => {
      toast.success("Try out berhasil ditambahkan ke paket!");
      setSelectedTryout("");
      queryClient.invalidateQueries({ queryKey: ["get-package-tryouts", packageId] });
    },
  });

  const { mutate: detach, isPending: isDetaching } = useDetachPackageTryout({
    onError: (error) => {
      toast.error("Gagal menghapus try out!", {
        description: error.response?.data?.message,
      });
    },
    onSuccess: () => {
      toast.success("Try out berhasil dihapus dari paket!");
      queryClient.invalidateQueries({ queryKey: ["get-package-tryouts", packageId] });
    },
  });

  const handleAttach = () => {
    if (!selectedTryout) return;
    attach({ token, packageId, tryout_id: selectedTryout });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">Try Out dalam Paket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attach form */}
        <div className="flex gap-2">
          <Select value={selectedTryout} onValueChange={setSelectedTryout}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Pilih try out untuk ditambahkan..." />
            </SelectTrigger>
            <SelectContent>
              {availableTryouts.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Semua try out sudah ditambahkan
                </SelectItem>
              ) : (
                availableTryouts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAttach}
            disabled={!selectedTryout || isAttaching}
            size="default"
          >
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </div>

        {/* List attached tryouts */}
        {isLoading ? (
          <p className="text-sm text-gray-400">Memuat daftar try out...</p>
        ) : (packageTryoutsData?.data ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada try out yang ditambahkan ke paket ini.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {(packageTryoutsData?.data ?? []).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-800">{t.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  disabled={isDetaching}
                  onClick={() => detach({ token, packageId, tryoutId: t.id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
