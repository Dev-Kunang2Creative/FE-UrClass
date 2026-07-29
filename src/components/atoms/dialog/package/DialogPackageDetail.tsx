import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetDetailPackage } from "@/http/packages/get-detail-package";
import { formatPrice } from "@/utils/format-price";
import { useSession } from "next-auth/react";

interface DialogPackageDetailProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  packageId: string;
}

export default function DialogPackageDetail({
  open,
  setOpen,
  packageId,
}: DialogPackageDetailProps) {
  const { data: session, status } = useSession();

  const { data } = useGetDetailPackage({
    id: packageId,
    token: session?.access_token ?? "",
    options: {
      enabled: status === "authenticated" && !!packageId,
    },
  });

  const storageUrl =
    process.env.NEXT_PUBLIC_STORAGE_URL ??
    "https://dev-api.amunisiptn.com/storage";

  const thumbnailUrl = data?.data?.thumbnail
    ? `${storageUrl}/${data.data.thumbnail}`
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl overflow-visible">
        <DialogHeader>
          <DialogTitle>Detail Paket</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {thumbnailUrl && (
            <div className="flex flex-col gap-1">
              <h3 className="text-muted-foreground">Thumbnail</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={data?.data?.name ?? "Thumbnail"}
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground">Nama Paket</h3>
            <span>{data?.data?.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground">Deskripsi</h3>
            <span>{data?.data?.description}</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground">Harga</h3>
            <span>{formatPrice(data?.data?.price ?? 0)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground">Jumlah Tiket</h3>
            <span>{data?.data?.ticket_amount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground">Status</h3>
            <Badge
              className={
                data?.data?.is_active
                  ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                  : "bg-red-100 text-red-700 hover:bg-red-100 text-xs"
              }
            >
              {data?.data?.is_active ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
