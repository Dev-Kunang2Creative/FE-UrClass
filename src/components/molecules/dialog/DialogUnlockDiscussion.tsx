"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Ticket } from "lucide-react";

interface DialogUnlockDiscussionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  ticketCount: number;
  isPending: boolean;
}

export default function DialogUnlockDiscussion({
  open,
  onOpenChange,
  onConfirm,
  ticketCount,
  isPending,
}: DialogUnlockDiscussionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 rounded-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-1 border border-amber-100">
            <Ticket className="w-8 h-8 text-amber-600" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
            Buka Semua Pembahasan?
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 mb-4 px-2">
            Gunakan 1 tiket untuk membuka semua pembahasan dan kunci jawaban di tryout ini selamanya.
          </DialogDescription>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 w-full flex items-center justify-center gap-3 mb-2">
             <span className="text-sm font-semibold text-amber-900">Sisa Tiket Kamu: {ticketCount}</span>
          </div>
          
          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 bg-[#F4F6F9] hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Nanti Saja
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending || (ticketCount < 1)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_0_0_#b45309] active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isPending ? "Memproses..." : (ticketCount < 1 ? "Tiket Habis" : "Gunakan 1 Tiket")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
