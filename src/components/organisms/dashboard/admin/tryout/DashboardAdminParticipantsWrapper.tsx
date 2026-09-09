"use client";

import { useSession } from "next-auth/react";
import { useGetDetailTryout } from "@/http/tryout/get-detail-tryout";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { participantsColumns } from "@/components/atoms/datacolumn/DataParticipants";
import { useState } from "react";
import { UserTryoutAccess } from "@/types/tryout/tryout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  LoaderCircleIcon,
  Search,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTryoutParticipants } from "@/http/tryout/get-tryout-participants";
import type { ParticipantTypeFilter } from "@/types/tryout/dummy-participant";
import DialogInjectDummyParticipant from "@/components/molecules/dialog/DialogInjectDummyParticipant";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  dummyParticipantKeys,
  useClearDummyParticipants,
  useGetDummySummary,
} from "@/http/tryout/admin-dummy-participants";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DashboardAdminParticipantsWrapperProps {
  id: string;
}

export default function DashboardAdminParticipantsWrapper({
  id,
}: DashboardAdminParticipantsWrapperProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [selectedAccess, setSelectedAccess] = useState<UserTryoutAccess | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [participantType, setParticipantType] =
    useState<ParticipantTypeFilter>("all");
  const [isInjectDialogOpen, setIsInjectDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const token = session?.access_token as string;

  const { data, isPending } = useGetTryoutParticipants(
    id,
    token,
    1,
    searchQuery,
    statusFilter,
    participantType,
    1000,
    {
      enabled: status === "authenticated",
    },
  );

  const { data: dummySummary } = useGetDummySummary(id, token, {
    enabled: status === "authenticated",
  });
  const clearDummy = useClearDummyParticipants();

  const { data: detailData } = useGetDetailTryout({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  const isFree = detailData?.data.is_free ?? false;

  const accesses = data?.data?.data ?? [];

  const handleViewDetail = (access: UserTryoutAccess) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  const handleClearDummy = () => {
    clearDummy.mutate(
      { id, token },
      {
        onSuccess: async (response) => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["tryout-participants", id],
            }),
            queryClient.invalidateQueries({
              queryKey: dummyParticipantKeys.summary(id),
            }),
            queryClient.invalidateQueries({
              queryKey: ["get-tryout-leaderboard", id],
            }),
          ]);
          toast.success(response.message);
          setIsClearDialogOpen(false);
        },
        onError: (error) =>
          toast.error(
            error.response?.data?.message ??
              "Peserta dummy gagal dibersihkan.",
          ),
      },
    );
  };

  return (
    <section>
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Daftar Peserta</CardTitle>
            <CardDescription>
              Kelola peserta asli dan simulasi yang masuk ke peringkat tryout.
            </CardDescription>
            {dummySummary && (
              <div className="mt-2 flex flex-wrap gap-2" aria-label="Ringkasan peserta">
                <Badge variant="outline">
                  {dummySummary.real_participants.toLocaleString("id-ID")} asli
                </Badge>
                <Badge variant="secondary">
                  {dummySummary.dummy_participants.toLocaleString("id-ID")} dummy
                </Badge>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <Button
              type="button"
              size="lg"
              className="min-h-11"
              onClick={() => setIsInjectDialogOpen(true)}
            >
              <UserPlusIcon data-icon="inline-start" />
              Inject Peserta Dummy
            </Button>
            {(dummySummary?.dummy_participants ?? 0) > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-11"
                onClick={() => setIsClearDialogOpen(true)}
              >
                <Trash2Icon data-icon="inline-start" />
                Bersihkan Dummy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="finished">Sudah Mengerjakan</SelectItem>
                    <SelectItem value="in_progress">
                      Sedang Mengerjakan
                    </SelectItem>
                    <SelectItem value="not_started">Belum Mengerjakan</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={participantType}
                onValueChange={(value) =>
                  setParticipantType(value as ParticipantTypeFilter)
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Peserta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Semua Peserta</SelectItem>
                    <SelectItem value="real">Hanya Asli</SelectItem>
                    <SelectItem value="dummy">Hanya Dummy</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama atau email..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <DataTable
            columns={participantsColumns({
              viewDetailHandler: handleViewDetail,
              isFree,
            })}
            data={accesses}
            isLoading={isPending}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Bukti Follow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-semibold">
                {selectedAccess?.user?.name ?? "Peserta"}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedAccess?.user?.email ?? "-"}
              </span>
            </div>

            {(selectedAccess?.proof_image_urls ?? []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedAccess?.proof_image_urls ?? []).map((url, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border bg-muted flex flex-col justify-between"
                  >
                    <img
                      src={url}
                      alt={`Bukti follow ${index + 1}`}
                      className="h-[60vh] w-full object-contain"
                    />
                    <div className="border-t bg-background px-2 py-1.5 mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full text-xs"
                        asChild
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Buka bukti {index + 1}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Peserta ini belum mengunggah bukti follow.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DialogInjectDummyParticipant
        id={id}
        token={token}
        open={isInjectDialogOpen}
        onOpenChange={setIsInjectDialogOpen}
      />

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bersihkan semua peserta dummy?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini menghapus akun, akses, sesi, dan jawaban milik
              {" "}
              {(dummySummary?.dummy_participants ?? 0).toLocaleString("id-ID")} peserta dummy pada tryout ini. Peserta asli tidak diubah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearDummy.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleClearDummy();
              }}
              disabled={clearDummy.isPending}
            >
              {clearDummy.isPending && (
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
              )}
              Hapus Peserta Dummy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
