import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export const exportSubtestPdfHandler = async (
  subtestId: string,
  token: string,
): Promise<Blob> => {
  const { data } = await api.get<Blob>(
    `/admin/subtests/${subtestId}/export-pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
      timeout: 60000,
    },
  );
  return data;
};

export const exportSubtestExcelHandler = async (
  subtestId: string,
  token: string,
): Promise<Blob> => {
  const { data } = await api.get<Blob>(
    `/admin/subtests/${subtestId}/export-excel`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
      timeout: 60000,
    },
  );
  return data;
};

export interface ExportErrorResponse {
  message?: string;
}

export const useExportSubtestPdf = (
  options?: UseMutationOptions<
    Blob,
    AxiosError<ExportErrorResponse>,
    { subtestId: string; token: string; subtestName?: string }
  >,
) => {
  return useMutation({
    mutationFn: ({ subtestId, token }) =>
      exportSubtestPdfHandler(subtestId, token),
    ...options,
  });
};

export const useExportSubtestExcel = (
  options?: UseMutationOptions<
    Blob,
    AxiosError<ExportErrorResponse>,
    { subtestId: string; token: string; subtestName?: string }
  >,
) => {
  return useMutation({
    mutationFn: ({ subtestId, token }) =>
      exportSubtestExcelHandler(subtestId, token),
    ...options,
  });
};

/**
 * Membuka stream file PDF di tab baru browser (inline streaming viewer).
 * Tab dibuka secara SINKRON terlebih dahulu untuk mencegah pemblokiran popup blocker oleh Chrome/Safari,
 * lalu diisi stream PDF ketika request API selesai. Tidak akan memicu download otomatis ke disk.
 */
export const streamPdfInTab = (
  getPdfBlob: () => Promise<Blob>,
  subtestName?: string,
): Promise<string> => {
  // Buka tab baru langsung saat klik (user gesture aktif)
  const newTab = window.open("", "_blank");

  if (newTab) {
    newTab.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>Memuat Naskah Soal ${subtestName ? `- ${subtestName}` : ""}...</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              color: #004AAB;
            }
            .box {
              text-align: center;
              padding: 32px 40px;
              background: white;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
              border: 1px solid #e2e8f0;
              max-width: 420px;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e2e8f0;
              border-top-color: #004AAB;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 16px auto;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h3 { margin: 0 0 8px 0; font-size: 17px; color: #0f172a; }
            p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="spinner"></div>
            <h3>Menyiapkan Naskah Soal...</h3>
            <p>Sedang membuat naskah lembar soal ${subtestName ? `<strong>${subtestName}</strong>` : "bank soal"}. Halaman akan otomatis memuat PDF begitu siap.</p>
          </div>
        </body>
      </html>
    `);
  }

  return getPdfBlob()
    .then((blob) => {
      const fileBlob = new Blob([blob], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(fileBlob);

      if (newTab && !newTab.closed) {
        newTab.location.href = objectUrl;
      } else {
        window.open(objectUrl, "_blank");
      }

      return objectUrl;
    })
    .catch((error) => {
      if (newTab && !newTab.closed) {
        newTab.close();
      }
      throw error;
    });
};

/**
 * Utilitas untuk memicu download blob file di browser (khusus Excel .xlsx)
 */
export const triggerBlobDownload = (
  blob: Blob,
  filename: string,
  mimeType: string,
) => {
  const fileBlob = new Blob([blob], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(fileBlob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};
