"use client";

import { useState, type DragEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  LoaderCircleIcon,
  UploadIcon,
  UsersRoundIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadDummyExcelTemplate,
  dummyParticipantKeys,
  useInjectDummyExcel,
  useInjectDummyRandom,
} from "@/http/tryout/admin-dummy-participants";
import type { DummyScorePreset } from "@/types/tryout/dummy-participant";

interface DialogInjectDummyParticipantProps {
  id: string;
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const acceptedExtensions = ["xlsx", "csv"];

const errorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    return response?.data?.message;
  }

  return undefined;
};

export default function DialogInjectDummyParticipant({
  id,
  token,
  open,
  onOpenChange,
}: DialogInjectDummyParticipantProps) {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(50);
  const [scorePreset, setScorePreset] =
    useState<DummyScorePreset>("normal");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const injectRandom = useInjectDummyRandom();
  const injectExcel = useInjectDummyExcel();

  const refreshParticipantData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["tryout-participants", id] }),
      queryClient.invalidateQueries({
        queryKey: dummyParticipantKeys.summary(id),
      }),
      queryClient.invalidateQueries({
        queryKey: ["get-tryout-leaderboard", id],
      }),
    ]);
  };

  const closeAfterSuccess = async (message: string) => {
    await refreshParticipantData();
    toast.success(message);
    onOpenChange(false);
  };

  const handleGenerate = () => {
    if (count < 1 || count > 200) {
      return;
    }

    injectRandom.mutate(
      { id, token, count, scorePreset },
      {
        onSuccess: (response) => closeAfterSuccess(response.message),
        onError: (error) =>
          toast.error(
            errorMessage(error) ?? "Peserta dummy gagal dibuat.",
          ),
      },
    );
  };

  const chooseFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() ?? "";
    if (!acceptedExtensions.includes(extension)) {
      setFile(null);
      setFileError("Gunakan berkas .xlsx atau .csv.");
      return;
    }

    setFile(selectedFile);
    setFileError(null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    chooseFile(event.dataTransfer.files.item(0));
  };

  const handleUpload = () => {
    if (!file) {
      setFileError("Pilih berkas peserta sebelum mengunggah.");
      return;
    }

    injectExcel.mutate(
      { id, token, file },
      {
        onSuccess: (response) => closeAfterSuccess(response.message),
        onError: (error) =>
          toast.error(
            errorMessage(error) ?? "Berkas peserta gagal diproses.",
          ),
      },
    );
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await downloadDummyExcelTemplate(token);
      toast.success("Template peserta dummy berhasil diunduh.");
    } catch (error) {
      toast.error(errorMessage(error) ?? "Template gagal diunduh.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inject Peserta Dummy</DialogTitle>
          <DialogDescription>
            Tambahkan simulasi peserta ke tryout ini. Setiap peserta mendapat
            akun terisolasi, sesi selesai, dan jawaban yang ikut dihitung oleh
            leaderboard.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="automatic" className="mt-2">
          <TabsList className="grid h-10 w-full grid-cols-2">
            <TabsTrigger value="automatic">
              <UsersRoundIcon data-icon="inline-start" />
              Generate Otomatis
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileSpreadsheetIcon data-icon="inline-start" />
              Import Berkas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automatic" className="pt-5">
            <FieldGroup>
              <Field data-invalid={count < 1 || count > 200}>
                <FieldLabel htmlFor="dummy-count">
                  Jumlah peserta dummy
                </FieldLabel>
                <Input
                  id="dummy-count"
                  type="number"
                  min={1}
                  max={200}
                  value={count}
                  aria-invalid={count < 1 || count > 200}
                  onChange={(event) => setCount(Number(event.target.value))}
                />
                <FieldDescription>
                  Maksimal 200 peserta dalam satu proses.
                </FieldDescription>
                {(count < 1 || count > 200) && (
                  <FieldError>Jumlah harus berada di antara 1 dan 200.</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dummy-score-preset">
                  Preset distribusi nilai
                </FieldLabel>
                <Select
                  value={scorePreset}
                  onValueChange={(value) =>
                    setScorePreset(value as DummyScorePreset)
                  }
                >
                  <SelectTrigger id="dummy-score-preset" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="normal">
                        Realistis (kurva normal)
                      </SelectItem>
                      <SelectItem value="competitive">
                        Kompetitif (nilai tinggi)
                      </SelectItem>
                      <SelectItem value="random">Acak</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Preset mengatur peluang jawaban benar dan bobot opsi setiap
                  peserta.
                </FieldDescription>
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={injectRandom.isPending || count < 1 || count > 200}
              >
                {injectRandom.isPending && (
                  <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
                )}
                Mulai Generate
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="file" className="pt-5">
            <div className="flex flex-col gap-5">
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
                ) : (
                  <DownloadIcon data-icon="inline-start" />
                )}
                Unduh Template Excel
              </Button>

              <Field data-invalid={Boolean(fileError)}>
                <FieldLabel
                  htmlFor="dummy-participant-file"
                  className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/10"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="text-primary" />
                  <span className="font-medium">
                    {file?.name ?? "Pilih atau tarik berkas ke area ini"}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Format .xlsx atau .csv
                  </span>
                </FieldLabel>
                <Input
                  id="dummy-participant-file"
                  type="file"
                  accept=".xlsx,.csv"
                  className="sr-only"
                  aria-invalid={Boolean(fileError)}
                  onChange={(event) =>
                    chooseFile(event.target.files?.item(0) ?? null)
                  }
                />
                {fileError && <FieldError>{fileError}</FieldError>}
              </Field>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={injectExcel.isPending || !file}
              >
                {injectExcel.isPending && (
                  <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
                )}
                Unggah &amp; Proses
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
