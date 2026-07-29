"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBulkUpdateQuestionImages } from "@/http/questions/bulk-update-question-images";
import { ImageUp, Upload, X, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

interface DialogUpdateQuestionImagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtestId: string;
}

export default function DialogUpdateQuestionImages({
  open,
  onOpenChange,
  subtestId,
}: DialogUpdateQuestionImagesProps) {
  const { data: session } = useSession();
  const token = session?.access_token as string;
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const { mutate: updateImages, isPending } = useBulkUpdateQuestionImages({
    onSuccess: (data) => {
      setResult({ updated: data.updated, skipped: data.skipped, errors: data.errors });
      if (data.updated > 0) {
        queryClient.invalidateQueries({ queryKey: ["get-all-question-by-subtest", subtestId] });
        queryClient.invalidateQueries({ queryKey: ["get-detail-subtest", subtestId] });
        toast.success(data.message);
      } else {
        toast.error("Tidak ada gambar soal yang diperbarui.");
      }
    },
    onError: (error) => {
      toast.error("Update gambar gagal!", {
        description: error.response?.data?.message || "Terjadi kesalahan.",
      });
    },
  });

  const isValidFile = (file: File) => file.name.toLowerCase().endsWith(".xlsx");

  const handleFileChange = (file: File | null) => {
    setResult(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) handleFileChange(file);
    else toast.error("Format tidak valid. Gunakan file .xlsx");
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    updateImages({ subtestId, file: selectedFile, token });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageUp className="w-5 h-5 text-amber-600" />
            Perbaiki Gambar Soal (Emergency)
          </DialogTitle>
          <DialogDescription>
            Update <span className="font-medium">hanya gambar</span> soal dari file Excel. Teks soal,
            opsi, dan kunci jawaban tidak diubah.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Peringatan & cara kerja */}
          <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-800 space-y-1.5 border border-amber-200">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Cara kerja
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pencocokan <b>berdasarkan urutan</b>: baris ke-1 → soal ke-1, dst.</li>
              <li>Gunakan file Excel yang <b>urutan & jumlah barisnya sama</b> dengan soal yang ada.</li>
              <li>Hanya baris yang ada gambarnya yang akan memperbarui soal. Baris tanpa gambar dibiarkan.</li>
              <li>Embed gambar di <b>kolom A</b> (Insert → Pictures → Place in Cell). Format: jpg, png, webp.</li>
            </ul>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-amber-400 bg-amber-50"
                : selectedFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && isValidFile(file)) handleFileChange(file);
                else if (file) toast.error("Format tidak valid. Gunakan file .xlsx");
              }}
            />

            {selectedFile ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-green-700">
                  <ImageUp className="w-8 h-8 shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-sm truncate max-w-60">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium">Drag & drop file .xlsx di sini atau klik untuk pilih</p>
                <p className="text-xs text-gray-400">Format: .xlsx — Maks 10 MB</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 space-y-2 text-sm ${result.updated > 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.updated > 0
                  ? <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-green-800">Selesai</span></>
                  : <><AlertCircle className="w-4 h-4 text-red-600" /><span className="text-red-800">Gagal</span></>
                }
              </div>
              <p className="text-gray-700">
                <span className="font-medium text-green-700">{result.updated} gambar</span> soal diperbarui
                {result.skipped > 0 && <>, <span className="font-medium text-red-600">{result.skipped} baris</span> dilewati</>}.
              </p>
              {result.errors.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              {result?.updated ? "Tutup" : "Batal"}
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              onClick={handleSubmit}
              disabled={!selectedFile || isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Memperbarui...
                </span>
              ) : (
                <>
                  <ImageUp className="w-4 h-4 mr-2" />
                  Perbaiki Gambar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
