"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DialogFinishSubtestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unansweredCount: number;
  onConfirm: () => void;
}

export default function DialogFinishSubtest({
  open,
  onOpenChange,
  unansweredCount,
  onConfirm,
}: DialogFinishSubtestProps) {
  const hasUnanswered = unansweredCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 rounded-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          {hasUnanswered ? (
            <>
              {/* Unanswered variant */}
              <div className="w-16 h-16 flex items-center justify-center mb-1">
                <span className="text-4xl">😰</span>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
                Oops, Masih Ada Soal Belum Dijawab...
              </DialogTitle>
              <DialogDescription className="text-gray-600 mb-4 px-2">
                Kamu masih memiliki {unansweredCount} soal yang belum dijawab. Periksa kembali jawabanmu sebelum mengakhiri subtest.
              </DialogDescription>
              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-[#F4F6F9] hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
                >
                  Kembali Mengerjakan
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Tetap Akhiri Subtest
                </button>
              </div>
            </>
          ) : (
            <>
              {/* All answered — "Kirim Jawaban Sekarang?" variant (matching reference) */}
              <div className="w-16 h-16 flex items-center justify-center mb-1">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="12" fill="#EBF4FF"/>
                  <path d="M14 16h20v16H14V16z" stroke="#004AAB" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 24l3 3 5-6" stroke="#004AAB" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 16l10 8 10-8" stroke="#004AAB" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
                Kirim Jawaban Sekarang?
              </DialogTitle>
              <DialogDescription className="text-gray-600 mb-4 px-2">
                Yakin ingin mengirim semua jawaban? Setelah dikirim, tidak bisa diubah lagi.
              </DialogDescription>
              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-[#F4F6F9] hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
                >
                  Periksa Lagi
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 bg-[#004AAB] hover:bg-[#003B8A] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Kirim
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
