"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";

interface DialogExitExamProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DialogExitExam({
  open,
  onOpenChange,
  onConfirm,
}: DialogExitExamProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 rounded-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-1 border border-red-100">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
            Yakin Ingin Keluar?
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 mb-4 px-2">
            Progress kamu akan tersimpan secara otomatis. Kamu dapat melanjutkan pengerjaan nanti selama waktu tryout masih tersedia.
          </DialogDescription>
          
          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-[#F4F6F9] hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_0_0_#991b1b] active:translate-y-1 active:shadow-none"
            >
              Keluar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
