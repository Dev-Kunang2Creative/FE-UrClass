import FormCreateSubtestTryout from "@/components/molecules/form/subtest/FormCreateSubtestTryout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogCreateSubtestTryoutProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  tryoutId: string;
  /** Durasi per subtes tidak berlaku di CPNS; lihat FormCreateSubtestTryout. */
  isCpns?: boolean;
}

export default function DialogCreateSubtestTryout({
  open,
  setOpen,
  tryoutId,
  isCpns,
}: DialogCreateSubtestTryoutProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl overflow-visible">
        <DialogHeader>
          <DialogTitle>Tambah Subtes ke Tryout</DialogTitle>
        </DialogHeader>
        <FormCreateSubtestTryout
          tryoutId={tryoutId}
          setOpen={setOpen}
          isCpns={isCpns}
        />
      </DialogContent>
    </Dialog>
  );
}
