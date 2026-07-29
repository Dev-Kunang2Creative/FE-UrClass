"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect } from "react";

interface DialogTimeUpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DialogTimeUp({
  open,
  onOpenChange,
  onConfirm,
}: DialogTimeUpProps) {
  // Automatically confirm after 3 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (open) {
      timeout = setTimeout(() => {
        onConfirm();
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [open, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 rounded-2xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 flex items-center justify-center mb-1">
            <span className="text-5xl">⏰</span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
            Waktu Habis!
          </DialogTitle>
          <DialogDescription className="text-gray-600 mb-4 px-2">
            Waktu pengerjaan subtest ini telah habis. Jawaban kamu akan disubmit otomatis.
          </DialogDescription>
          <div className="w-full flex justify-center pt-2">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-[#004AAB] rounded-full"></div>
              <div className="h-2 w-2 bg-[#004AAB] rounded-full delay-75"></div>
              <div className="h-2 w-2 bg-[#004AAB] rounded-full delay-150"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
