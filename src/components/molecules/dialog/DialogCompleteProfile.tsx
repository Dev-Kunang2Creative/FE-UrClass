"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import FormCompleteProfile from "../form/profile/FormCompleteProfile";

interface DialogCompleteProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogCompleteProfile({
  open,
  onOpenChange,
}: DialogCompleteProfileProps) {

  // Prevent closing by clicking outside — user should fill the form
  const handleOpenChange = () => {
    // intentionally no-op — only the X button or form success can close it
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="w-full max-w-[420px] p-0 bg-white border border-border max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-2 flex flex-col items-center text-center gap-3">
          <Image
            src="/images/logo/urclass.png"
            alt="UrClass"
            width={150}
            height={38}
          />
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold">
              Selamat Datang di UrClass
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Lengkapi data dirimu dengan mengisi form di bawah ini!
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 pt-3">
          <FormCompleteProfile onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
