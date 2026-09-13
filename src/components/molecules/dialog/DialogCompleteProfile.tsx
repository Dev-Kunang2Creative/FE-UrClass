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
        className="w-full max-w-2xl sm:max-w-2xl p-0 bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 sm:px-10 pt-8 pb-3 flex flex-col items-center text-center gap-3">
          <Image
            src="/images/logo/urclass.png"
            alt="UrClass"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
              Selamat Datang di UrClass
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Lengkapi data dirimu dengan mengisi form di bawah ini!
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-6 sm:px-10 pb-8 pt-3">
          <FormCompleteProfile onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
