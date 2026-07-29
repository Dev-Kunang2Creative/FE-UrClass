"use client";

import { useGetTryoutLeaderboard } from "@/http/tryout/get-tryout-leaderboard";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { LeaderboardEntry } from "@/types/exam/exam";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trophy,
  Medal,
  Target,
  TrendingUp,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText,
  Users,
  Clock,
  BarChart2,
  Images,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatJakartaDateTime } from "@/utils/date-time";
import { cn } from "@/lib/utils";

interface DashboardAdminTryoutLeaderboardWrapperProps {
  tryoutId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return "-";
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return {
        rankBox: "bg-amber-50 text-amber-700 border border-amber-200",
        avatar: "bg-amber-100 text-amber-700",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        medal: "text-amber-500",
        label: "Juara 1",
      };
    case 2:
      return {
        rankBox: "bg-slate-100 text-slate-600 border border-slate-200",
        avatar: "bg-slate-200 text-slate-700",
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        medal: "text-slate-400",
        label: "Juara 2",
      };
    case 3:
      return {
        rankBox: "bg-orange-50 text-orange-700 border border-orange-200",
        avatar: "bg-orange-100 text-orange-700",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        medal: "text-orange-500",
        label: "Juara 3",
      };
    default:
      return null;
  }
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg?: string;
}

function StatCard({
  icon,
  label,
  value,
  iconBg = "bg-primary/10 text-primary",
}: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2.5", iconBg)}>{icon}</div>
        <div className="space-y-2">
          <p className="text-muted-foreground leading-none">{label}</p>
          <p className="text-lg font-bold leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AccuracyBar({ value }: { value: number }) {
  return (
    <div className="space-y-0.5 min-w-[56px]">
      <p className="text-sm font-semibold text-center">{value.toFixed(1)}%</p>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">Akurasi</p>
    </div>
  );
}

function StatPip({
  value,
  label,
  color,
  icon,
}: {
  value: number;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center min-w-[36px]">
      <div
        className={cn(
          "flex items-center justify-center gap-0.5 font-semibold",
          color,
        )}
      >
        {icon}
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function LeaderboardTableRow({
  entry,
  tryoutId,
  onViewProof,
}: {
  entry: LeaderboardEntry;
  tryoutId: string;
  onViewProof: (entry: LeaderboardEntry) => void;
}) {
  const rankStyle = getRankStyle(entry.rank);
  const finishedAt = entry.finished_at
    ? formatJakartaDateTime(entry.finished_at, { month: "short" })
    : "-";
  const duration = getDuration(entry.started_at!, entry.finished_at);

  return (
    <TableRow className="hover:bg-accent/50 transition-colors h-18">
      <TableCell className="w-[60px] text-center">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mx-auto",
            rankStyle ? rankStyle.rankBox : "bg-muted text-muted-foreground",
          )}
        >
          {entry.rank <= 3 ? (
            <Medal className={cn("w-4 h-4", rankStyle?.medal)} />
          ) : (
            <span>{entry.rank}</span>
          )}
        </div>
      </TableCell>

      {/* Peserta */}
      <TableCell className="min-w-[180px]">
        <div className="flex items-center gap-4">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback
              className={cn(
                "text-xs font-semibold",
                rankStyle?.avatar ?? "bg-muted text-muted-foreground",
              )}
            >
              {getInitials(entry.user_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-semibold text-sm text-foreground truncate">
                {entry.user_name}
              </p>
              {rankStyle && (
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px] px-1.5 py-0 h-4 border",
                    rankStyle.badge,
                  )}
                >
                  {rankStyle.label}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 shrink-0" />
              Percobaan #{entry.attempt_number} · {duration} · {finishedAt}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Total Soal */}
      <TableCell className="text-center">
        <StatPip
          value={entry.summary.total_questions}
          label="Total Soal"
          color="text-foreground"
          icon={<FileText className="w-3 h-3" />}
        />
      </TableCell>

      {/* Dijawab */}
      <TableCell className="text-center">
        <StatPip
          value={entry.summary.answered}
          label="Dijawab"
          color="text-foreground"
          icon={<CheckCircle2 className="w-3 h-3" />}
        />
      </TableCell>

      {/* Tidak Dijawab */}
      <TableCell className="text-center">
        <StatPip
          value={entry.summary.unanswered}
          label="Tidak Dijawab"
          color="text-amber-500"
          icon={<MinusCircle className="w-3 h-3" />}
        />
      </TableCell>

      {/* Benar */}
      <TableCell className="text-center">
        <StatPip
          value={entry.summary.correct}
          label="Benar"
          color="text-emerald-600"
          icon={<CheckCircle2 className="w-3 h-3" />}
        />
      </TableCell>

      {/* Salah */}
      <TableCell className="text-center">
        <StatPip
          value={entry.summary.wrong}
          label="Salah"
          color="text-red-500"
          icon={<XCircle className="w-3 h-3" />}
        />
      </TableCell>

      {/* Akurasi */}
      <TableCell className="text-center">
        <AccuracyBar value={entry.summary.accuracy} />
      </TableCell>

      {/* Skor */}
      <TableCell className="text-right">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Skor
        </p>
        <p className="text-xl font-bold text-primary leading-tight">
          {entry.score.final_score.toFixed(1)}
        </p>
      </TableCell>

      {/* Aksi */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {(entry.proof_image_urls?.length ?? 0) > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onViewProof(entry)}
            >
              <Images className="w-3 h-3 mr-1" />
              Bukti
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link
              href={`/dashboard/admin/try-out/${tryoutId}/result/${entry.user_id}?attempt=${entry.attempt_number}`}
            >
              <Eye className="w-3 h-3 mr-1" />
              Detail
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProofImagesDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: LeaderboardEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const proofUrls = entry?.proof_image_urls ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bukti Follow Instagram</DialogTitle>
          <DialogDescription>
            {entry?.user_name ?? "Peserta"} mengunggah {proofUrls.length} gambar bukti.
          </DialogDescription>
        </DialogHeader>

        {proofUrls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
            {proofUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border bg-background">
                <img
                  src={url}
                  alt={`Bukti follow ${index + 1}`}
                  className="h-64 w-full object-contain bg-muted"
                />
                <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Bukti {index + 1}
                  </span>
                  <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Buka
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada bukti gambar.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="w-9 h-9 rounded-lg mx-auto" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2.5 w-40" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i} className="text-center">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-3.5 w-7" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </TableCell>
      ))}
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-5 w-14" />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-7 w-16 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 py-4">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden w-full">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-60" />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px] w-full">
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardEmpty() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Trophy className="size-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">Belum Ada Data</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          Leaderboard akan muncul setelah peserta menyelesaikan tryout ini.
        </p>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title }: { title?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
        <Trophy className="size-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Leaderboard</h2>
        {title && <p className="text-sm text-muted-foreground">{title}</p>}
      </div>
    </div>
  );
}

export default function DashboardAdminTryoutLeaderboardWrapper({
  tryoutId,
}: DashboardAdminTryoutLeaderboardWrapperProps) {
  const { data: session } = useSession();
  const [selectedProofEntry, setSelectedProofEntry] = useState<LeaderboardEntry | null>(null);

  const { data, isPending } = useGetTryoutLeaderboard({
    token: session?.access_token ?? "",
    tryoutId,
  });

  if (isPending) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-64" />
          </div>
        </div>
        <LeaderboardSkeleton />
      </section>
    );
  }

  const leaderboard = data?.data.leaderboard ?? [];
  const tryoutTitle = data?.data.tryout_title;
  const leaderboardBasis = data?.data.leaderboard_basis;

  if (leaderboard.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeader title={tryoutTitle} />
        <LeaderboardEmpty />
      </section>
    );
  }

  const maxScore = leaderboard[0]?.score.final_score ?? 0;
  const avgScore =
    leaderboard.reduce((s, e) => s + e.score.final_score, 0) /
    leaderboard.length;
  const avgAccuracy =
    leaderboard.reduce((s, e) => s + e.summary.accuracy, 0) /
    leaderboard.length;

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="size-4" />}
          label="Total Peserta"
          value={leaderboard.length}
          iconBg="bg-teal-500/10 text-teal-600"
        />
        <StatCard
          icon={<Trophy className="size-4" />}
          label="Skor Tertinggi"
          value={maxScore.toFixed(1)}
          iconBg="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Rata-rata Skor"
          value={avgScore.toFixed(1)}
          iconBg="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={<Target className="size-4" />}
          label="Rata-rata Akurasi"
          value={`${avgAccuracy.toFixed(1)}%`}
          iconBg="bg-purple-500/10 text-purple-600"
        />
      </div>

      {/* Basis tag */}
      {leaderboardBasis && (
        <p className="text-xs text-muted-foreground bg-muted inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full">
          <BarChart2 className="w-3 h-3" />
          {leaderboardBasis === "attempt_number_1"
            ? "Peringkat berdasarkan percobaan ke-1"
            : "Peringkat berdasarkan skor terbaik"}
        </p>
      )}

      {/* Table */}
      <Card className="overflow-hidden w-full">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Hasil Tryout Peserta</CardTitle>
            <CardDescription>
              Daftar hasil tryout berdasarkan skor
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {leaderboard.length} peserta
          </Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px] w-full">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[60px] text-center">#</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead className="text-center">Total Soal</TableHead>
                <TableHead className="text-center">Dijawab</TableHead>
                <TableHead className="text-center">Tdk Dijawab</TableHead>
                <TableHead className="text-center">Benar</TableHead>
                <TableHead className="text-center">Salah</TableHead>
                <TableHead className="text-center">Akurasi</TableHead>
                <TableHead className="text-right">Skor</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <LeaderboardTableRow
                  key={`${entry.user_id}-${entry.attempt_number}-${index}`}
                  entry={entry}
                  tryoutId={tryoutId}
                  onViewProof={setSelectedProofEntry}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProofImagesDialog
        entry={selectedProofEntry}
        open={!!selectedProofEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedProofEntry(null);
        }}
      />
    </section>
  );
}
