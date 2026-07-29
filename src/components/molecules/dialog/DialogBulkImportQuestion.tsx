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
import { useBulkImportQuestions } from "@/http/questions/bulk-import-questions";
import { FileSpreadsheet, Upload, Download, X, CheckCircle2, AlertCircle } from "lucide-react";

interface DialogBulkImportQuestionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtestId: string;
}

const EXCEL_COLUMNS = [
  ["Kolom A", "Gambar (embed gambar ke cell)"],
  ["Kolom B", "Soal"],
  ["Kolom C", "Opsi A"],
  ["Kolom D", "Opsi B"],
  ["Kolom E", "Opsi C"],
  ["Kolom F", "Opsi D"],
  ["Kolom G", "Opsi E"],
  ["Kolom H", "Kunci Jawaban (A/B/C/D/E)"],
  ["Kolom I", "Pembahasan"],
];

const CSV_COLUMNS = [
  ["Kolom 1", "Soal"],
  ["Kolom 2–6", "Jawaban A–E"],
  ["Kolom 7", "Penjelasan"],
  ["Kolom 8", "Kunci Jawaban"],
];

export default function DialogBulkImportQuestion({
  open,
  onOpenChange,
  subtestId,
}: DialogBulkImportQuestionProps) {
  const { data: session } = useSession();
  const token = session?.access_token as string;
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"xlsx" | "csv">("xlsx");
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const { mutate: bulkImport, isPending } = useBulkImportQuestions({
    onSuccess: (data) => {
      setResult({ imported: data.imported, skipped: data.skipped, errors: data.errors });
      if (data.imported > 0) {
        queryClient.invalidateQueries({ queryKey: ["get-all-question-by-subtest", subtestId] });
        queryClient.invalidateQueries({ queryKey: ["get-detail-subtest", subtestId] });
        toast.success(data.message);
      } else {
        toast.error("Tidak ada soal yang berhasil diimpor.");
      }
    },
    onError: (error) => {
      toast.error("Import gagal!", {
        description: error.response?.data?.message || "Terjadi kesalahan.",
      });
    },
  });

  const isValidFile = (file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith(".csv") || name.endsWith(".xlsx");
  };

  const handleFileChange = (file: File | null) => {
    setResult(null);
    setSelectedFile(file);
    if (file) {
      setActiveTab(file.name.toLowerCase().endsWith(".xlsx") ? "xlsx" : "csv");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) handleFileChange(file);
    else toast.error("Format tidak valid. Gunakan file .xlsx atau .csv");
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    bulkImport({ subtestId, file: selectedFile, token });
  };

  const handleDownloadTemplate = async (type: "csv" | "xlsx") => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = type === "xlsx"
      ? "/admin/questions/bulk-import/excel-template"
      : "/admin/questions/bulk-import/template";
    const filename = type === "xlsx" ? "template-soal-amunisi.xlsx" : "template-soal-amunisi.csv";

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        toast.error("Gagal mengunduh template.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh template.", { description: "Periksa koneksi atau hubungi admin." });
    }
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
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Import Soal
          </DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) dengan dukungan gambar, atau CSV untuk format lama.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Tab pilih format */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {(["xlsx", "csv"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#004AAB] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab === "xlsx" ? "Excel (.xlsx) — dengan Gambar" : "CSV — format lama"}
              </button>
            ))}
          </div>

          {/* Format Info */}
          <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 space-y-1">
            <p className="font-semibold mb-2">
              {activeTab === "xlsx" ? "Format Kolom Excel:" : "Format Kolom CSV:"}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {(activeTab === "xlsx" ? EXCEL_COLUMNS : CSV_COLUMNS).map(([col, label]) => (
                <div key={col} className="flex gap-1">
                  <span className="font-medium w-20 shrink-0">{col}:</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {activeTab === "xlsx" && (
              <p className="mt-2 text-blue-600 italic">
                Embed gambar: Insert → Pictures → Place in Cell di kolom A.
                Format didukung: jpg, png, webp.
              </p>
            )}
          </div>

          {/* Download Template */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => handleDownloadTemplate("xlsx")}
            >
              <Download className="w-4 h-4 mr-2" />
              Template Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => handleDownloadTemplate("csv")}
            >
              <Download className="w-4 h-4 mr-2" />
              Template CSV
            </Button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : selectedFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && isValidFile(file)) handleFileChange(file);
                else if (file) toast.error("Format tidak valid. Gunakan file .xlsx atau .csv");
              }}
            />

            {selectedFile ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-green-700">
                  <FileSpreadsheet className="w-8 h-8 shrink-0" />
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
                <p className="text-sm font-medium">Drag & drop file di sini atau klik untuk pilih</p>
                <p className="text-xs text-gray-400">Format: .xlsx / .csv — Maks 10 MB</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 space-y-2 text-sm ${result.imported > 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.imported > 0
                  ? <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-green-800">Import Selesai</span></>
                  : <><AlertCircle className="w-4 h-4 text-red-600" /><span className="text-red-800">Import Gagal</span></>
                }
              </div>
              <p className="text-gray-700">
                <span className="font-medium text-green-700">{result.imported} soal</span> berhasil diimpor
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
              {result?.imported ? "Tutup" : "Batal"}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedFile || isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Mengimpor...
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Soal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
