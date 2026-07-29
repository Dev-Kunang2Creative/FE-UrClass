import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Question } from "@/types/questions/question";
import Image from "next/image";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextRenderer from "@/components/atoms/rich-text/RichTextRenderer";

interface CardQuestionDetailProps {
  data?: Question;
  isPending?: boolean;
}

function CardQuestionDetailSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between border-b pb-4 border-border">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Pertanyaan Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Pilihan Jawaban Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3.5 py-3 border border-border"
              >
                <Skeleton className="shrink-0 w-7 h-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Pembahasan Skeleton */}
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CardQuestionDetail({
  data,
  isPending,
}: CardQuestionDetailProps) {
  if (isPending) return <CardQuestionDetailSkeleton />;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between border-b pb-4 border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-medium text-muted-foreground uppercase tracking-widest">
              Soal #{data?.order_no}
            </span>
            <Badge variant="secondary" className="rounded-full">
              {data?.question_type === "essay" ? "Essay" : "Pilihan Ganda"}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full",
              data?.is_active
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-muted text-muted-foreground",
            )}
          >
            {data?.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-muted-foreground uppercase tracking-widest">
            Pertanyaan
          </span>
          <RichTextRenderer html={data?.question_text} className="text-foreground" />
        </div>

        {data?.question_image && data?.question_image_url && (
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground uppercase tracking-widest">
              Gambar Pertanyaan
            </span>
            <Image
              src={data.question_image_url}
              alt="Gambar Pertanyaan"
              className="rounded-lg max-w-xs max-h-60 object-contain border border-border"
              width={780}
              height={400}
            />
          </div>
        )}

        {data?.options && data.options.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground uppercase tracking-widest">
              Pilihan Jawaban
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.options.map((option) => {
                const isCorrect = option.option_key === data.correct_answer;
                return (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3.5 py-3 border transition-colors",
                      isCorrect
                        ? "bg-emerald-50 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700"
                        : "border-border bg-background",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold",
                        isCorrect
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {option.option_key}
                    </span>
                    <RichTextRenderer
                      html={option.option_text}
                      className={cn(
                        isCorrect
                          ? "font-medium text-emerald-800 dark:text-emerald-300"
                          : "text-foreground",
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="font-medium text-muted-foreground uppercase tracking-widest">
                Pembahasan
              </span>
            </div>
            <Badge className="rounded-full bg-muted text-muted-foreground border-0">
              {data?.question_type === "essay" ? "Otomatis Benar" : `Kunci: ${data?.correct_answer ?? "-"}`}
            </Badge>
          </div>
          <RichTextRenderer
            html={data?.discussion}
            className="text-foreground"
            fallback="Pembahasan belum tersedia untuk soal ini."
          />
        </div>

        {data?.discussion_image && data?.discussion_image_url && (
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground uppercase tracking-widest">
              Gambar Pembahasan
            </span>
            <Image
              src={data.discussion_image_url}
              alt="Gambar Pembahasan"
              className="rounded-lg max-w-xs max-h-60 object-contain border border-border"
              width={780}
              height={400}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
