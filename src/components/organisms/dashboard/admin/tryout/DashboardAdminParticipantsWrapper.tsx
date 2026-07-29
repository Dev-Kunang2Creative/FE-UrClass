"use client";

import { useSession } from "next-auth/react";
import { useGetDetailTryout } from "@/http/tryout/get-detail-tryout";
import { DataTable } from "@/components/molecules/datatable/DataTable";
import { participantsColumns } from "@/components/atoms/datacolumn/DataParticipants";
import { useState } from "react";
import { UserTryoutAccess } from "@/types/tryout/tryout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTryoutParticipants } from "@/http/tryout/get-tryout-participants";

interface DashboardAdminParticipantsWrapperProps {
  id: string;
}

export default function DashboardAdminParticipantsWrapper({
  id,
}: DashboardAdminParticipantsWrapperProps) {
  const { data: session, status } = useSession();
  const [selectedAccess, setSelectedAccess] = useState<UserTryoutAccess | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isPending } = useGetTryoutParticipants(
    id,
    session?.access_token as string,
    1,
    searchQuery,
    statusFilter,
    1000,
    {
      enabled: status === "authenticated",
    },
  );

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

  return (
    <section>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">Daftar Peserta</h3>
              <p className="text-sm text-muted-foreground">
                Daftar semua peserta tryout dan bukti follow jika diunggah.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="finished">Sudah Mengerjakan</SelectItem>
                  <SelectItem value="in_progress">
                    Sedang Mengerjakan
                  </SelectItem>
                  <SelectItem value="not_started">Belum Mengerjakan</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full md:w-72">
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
    </section>
  );
}
