"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetDetailTryout } from "@/http/tryout/get-detail-tryout";
import { useExportTryoutPdf } from "@/http/tryout/export-tryout-pdf";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { id as IdLocale } from "date-fns/locale";
import { useGetSubtestByTryout } from "@/http/subtest/get-subtest-by-tryout";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { subtestTryoutColumns } from "@/components/atoms/datacolumn/DataSubtestByTryout";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Download, Users } from "lucide-react";
import { useState } from "react";
import DialogCreateSubtestTryout from "@/components/atoms/dialog/subtest/DialogCreateSubtestTryout";
import Image from "next/image";
import { useDeleteSubtestFromTryout } from "@/http/subtest/delete-subtest-from-tryout";
import AlertDialogDeleteSubtest from "@/components/atoms/alert-dialog/subtest/AlertDialogDeleteSubtest";
import { SubtestByTryout } from "@/types/subtest/subtest";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardAdminTryoutDetailWrapperProps {
  id: string;
}

export default function DashboardAdminTryoutDetailWrapper({
  id,
}: DashboardAdminTryoutDetailWrapperProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubtest, setSelectedSubtest] =
    useState<SubtestByTryout | null>(null);
  const { mutate: exportPdf, isPending: isDownloadingPdf } = useExportTryoutPdf(
    {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Tryout_${data?.data.title?.replace(/\s+/g, "_") ?? "Package"}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success("PDF berhasil diunduh");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Gagal mengunduh PDF");
      },
    },
  );

  const handleDownloadPdf = () => {
    if (!session?.access_token) return;
    exportPdf({ tryoutId: id, token: session.access_token });
  };

  const { mutate: deleteSubtest, isPending: isDeleting } =
    useDeleteSubtestFromTryout({
      onSuccess: () => {
        toast.success("Subtes berhasil dihapus dari tryout.");
        setDeleteDialogOpen(false);
        setSelectedSubtest(null);
        queryClient.invalidateQueries({
          queryKey: ["get-subtest-by-tryout", id],
        });
      },
      onError: () => {
        toast.error("Gagal menghapus subtes dari tryout.");
      },
    });

  const handleDeleteClick = (data: SubtestByTryout) => {
    setSelectedSubtest(data);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedSubtest || !session?.access_token) return;
    deleteSubtest({
      tryoutId: id,
      tryoutSubtestId: selectedSubtest.id,
      token: session.access_token,
    });
  };

  const { data } = useGetDetailTryout({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  const { data: subtest, isPending: isPendingSubtest } = useGetSubtestByTryout({
    id,
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <section>
      <Card>
        <CardContent className="space-y-12">
          <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Judul Tryout</h3>
              <span className="font-medium">{data?.data.title}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Deskripsi Tryout</h3>
              <span className="font-medium">{data?.data.description}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Status Tryout</h3>
              <Badge
                className={
                  data?.data.is_published
                    ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                    : "bg-red-100 text-red-700 hover:bg-red-100 text-xs"
                }
              >
                {data?.data.is_published ? "Dipublish" : "Draft"}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Dibuat Oleh</h3>
              <span className="font-medium">{data?.data.creator.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Tanggal Dibuat</h3>
              <span className="font-medium">
                {data?.data.created_at
                  ? format(
                      new Date(data.data.created_at),
                      "dd MMM yyyy HH:mm",
                      {
                        locale: IdLocale,
                      },
                    )
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Tanggal Diubah</h3>
              <span className="font-medium">
                {data?.data.updated_at
                  ? format(
                      new Date(data.data.updated_at),
                      "dd MMM yyyy HH:mm",
                      {
                        locale: IdLocale,
                      },
                    )
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Tanggal Mulai</h3>
              <span className="font-medium">
                {data?.data.start_date
                  ? format(
                      new Date(data.data.start_date),
                      "dd MMM yyyy HH:mm",
                      {
                        locale: IdLocale,
                      },
                    )
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Tanggal Selesai</h3>
              <span className="font-medium">
                {data?.data.end_date
                  ? format(new Date(data.data.end_date), "dd MMM yyyy HH:mm", {
                      locale: IdLocale,
                    })
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Thumbnail</h3>
              <Image
                src={data?.data.image_url ?? ""}
                alt="Thumbnail"
                width={200}
                height={100}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-4">
              <h3 className="font-medium text-lg">Subtes</h3>
              <div className="flex md:flex-row flex-wrap gap-3 items-center">
                <Button size={"lg"} variant={"outline"} asChild>
                  <Link href={`/dashboard/admin/try-out/${id}/participants`}>
                    <Users className="mr-2 h-4 w-4" /> Lihat Peserta
                  </Link>
                </Button>
                <Button size={"lg"} variant={"outline"} asChild>
                  <Link href={`/dashboard/admin/try-out/${id}/result`}>
                    <Eye className="mr-2 h-4 w-4" /> Lihat Hasil
                  </Link>
                </Button>
                <Button
                  size={"lg"}
                  variant={"outline"}
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                >
                  <Download
                    className={
                      isDownloadingPdf
                        ? "animate-pulse mr-2 h-4 w-4"
                        : "mr-2 h-4 w-4"
                    }
                  />{" "}
                  Download PDF
                </Button>
                <Button size={"lg"} onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Tambahkan Subtes
                </Button>
              </div>
            </div>
            <DataTable
              columns={subtestTryoutColumns({
                deleteHandler: handleDeleteClick,
              })}
              data={subtest?.data ?? []}
              isLoading={isPendingSubtest}
            />
          </div>
        </CardContent>
      </Card>

      <DialogCreateSubtestTryout
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        tryoutId={id}
      />

      <AlertDialogDeleteSubtest
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        confirmDelete={handleConfirmDelete}
        isPending={isDeleting}
      />
    </section>
  );
}
