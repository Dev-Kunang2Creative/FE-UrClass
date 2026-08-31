"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useImportFormasi,
  type FormasiImportResult,
} from "@/http/instansi/admin-instansi";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";

interface DialogImportFormasiProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLUMNS = [
  ["Kolom A", "NAMA_INSTANSI — wajib, harus cocok dengan instansi yang ada"],
  ["Kolom B", "KODE_INSTANSI — opsional, mis. PEMKOT-SBY"],
  ["Kolom C", "NAMA_FORMASI — wajib, tulis persis seperti pengumumannya"],
  ["Kolom D", "JENJANG — opsional, mis. S-1, D-III"],
  ["Kolom E", "PERIODE — opsional, tahun seleksi. Kosong = tahun ini"],
];

export default function DialogImportFormasi({
  open,
  onOpenChange,
}: DialogImportFormasiProps) {
  const { data: session } = useSession();
  const token = session?.access_token as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [createMissing, setCreateMissing] = useState(false);
  const [result, setResult] = useState<FormasiImportResult | null>(null);

  const { mutate: importFormasi, isPending } = useImportFormasi({ token });

  const isValidFile = (file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith(".xlsx") || name.endsWith(".xls");
  };

  const handleFileChange = (file: File | null) => {
    setResult(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) handleFileChange(file);
    else toast.error("Format tidak valid. Gunakan file Excel (.xlsx atau .xls).");
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    importFormasi(
      { file: selectedFile, createMissingInstansi: createMissing },
      {
        onSuccess: (data) => {
          setResult(data.data);
          toast.success(data.message);
        },
        onError: (error) => {
          // Berkas yang seluruhnya ditolak tetap mengembalikan rincian per baris,
          // dan justru di situlah admin paling butuh melihatnya - jadi hasilnya
          // ditampilkan, bukan diganti pesan galat umum.
          const payload = error.response?.data?.data;
          if (payload) setResult(payload);
          toast.error(
            error.response?.data?.message ?? "Impor gagal. Periksa berkasnya.",
          );
        },
      },
    );
  };

  const handleDownloadTemplate = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await fetch(
        `${baseUrl}/admin/formasi/import/template`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) {
        toast.error("Gagal mengunduh template.");
        return;
      }

      // Namanya dibaca dari Content-Disposition: server yang menyusun berkasnya,
      // jadi server pula yang menamainya.
      const filename =
        response.headers
          .get("content-disposition")
          ?.match(/filename="?([^"]+)"?/i)?.[1] ?? "template-formasi-cpns.xlsx";

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
      toast.error("Gagal mengunduh template.", {
        description: "Periksa koneksi atau hubungi admin.",
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setCreateMissing(false);
    onOpenChange(false);
  };

  const berhasil = result ? result.imported + result.updated : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-green-600" />
            Import Formasi
          </DialogTitle>
          <DialogDescription>
            Upload rekap formasi dari SSCASN atau pengumuman instansi. Format
            Excel (.xlsx atau .xls), maksimal 10 MB.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full border-2 font-bold"
          >
            <Download className="mr-2 size-4" />
            Download Template Excel
          </Button>

          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-bold text-slate-700">
              Susunan kolom
            </p>
            <dl className="space-y-1">
              {COLUMNS.map(([col, desc]) => (
                <div key={col} className="flex gap-2 text-xs">
                  <dt className="w-16 shrink-0 font-semibold text-slate-500">
                    {col}
                  </dt>
                  <dd className="text-slate-600">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              isDragging
                ? "border-slate-900 bg-slate-100"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file && isValidFile(file)) handleFileChange(file);
                else if (file)
                  toast.error(
                    "Format tidak valid. Gunakan file Excel (.xlsx atau .xls).",
                  );
              }}
            />
            <Upload className="mx-auto mb-2 size-8 text-slate-400" />
            {selectedFile ? (
              <p className="text-sm font-bold text-slate-900">
                {selectedFile.name}
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700">
                  Klik atau tarik berkas ke sini
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Format: .xlsx / .xls — Maks 10 MB
                </p>
              </>
            )}
          </div>

          {/* Bawaannya mati. Instansi adalah daftar referensi terkurasi, dan satu
              salah ketik nama akan menghasilkan instansi kembar yang memecah
              formasinya ke dua entri. */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 px-4 py-3 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={createMissing}
              onChange={(e) => setCreateMissing(e.target.checked)}
              className="mt-0.5 size-4 shrink-0"
            />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-800">
                Buat instansi yang belum ada
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                Biarkan mati kalau berkasmu hanya memuat instansi yang sudah
                terdaftar. Kalau dinyalakan, nama instansi yang tidak dikenali
                akan dibuat baru — termasuk kalau namanya salah ketik.
              </p>
            </div>
          </label>

          {result && (
            <div className="space-y-3 rounded-xl border-2 border-slate-200 px-4 py-3">
              <div className="flex items-start gap-2">
                {berhasil > 0 ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                )}
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-slate-900">
                    {result.imported} baru, {result.updated} diperbarui,{" "}
                    {result.skipped} dilewati
                  </p>
                  {result.instansi_created > 0 && (
                    <p className="text-xs text-slate-600">
                      {result.instansi_created} instansi baru dibuat.
                    </p>
                  )}
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-700">
                    {result.error_total} baris bermasalah
                    {result.error_total > result.errors.length &&
                      ` (${result.errors.length} pertama ditampilkan)`}
                  </p>
                  <ul className="max-h-40 space-y-0.5 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-xs text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-2 font-bold sm:flex-1"
            >
              <X className="mr-2 size-4" />
              {result ? "Tutup" : "Batal"}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isPending}
              className="border-2 border-slate-900 font-bold sm:flex-1"
            >
              {isPending ? "Mengimpor..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
