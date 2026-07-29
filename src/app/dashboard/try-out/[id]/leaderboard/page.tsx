"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Medal, Trophy, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetTryoutLeaderboard } from "@/http/tryout/get-tryout-leaderboard";
import { formatJakartaDateTime } from "@/utils/date-time";
import type { LeaderboardEntry } from "@/types/exam/exam";

export default function TryoutLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const currentUserId = session?.user?.id || "";

  const { data, isLoading } = useGetTryoutLeaderboard({
    tryoutId,
    token,
  });

  const leaderboardData = data?.data;
  const entries = leaderboardData?.leaderboard ?? [];

  const myEntry = entries.find((e) => e.user_id === currentUserId);

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/dashboard/try-out/${tryoutId}/result`}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Leaderboard Tryout</h1>
      </div>

      <div className="bg-linear-to-br from-[#004AAB] to-[#002B66] rounded-2xl p-6 md:p-8 text-white mb-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-300" />
          <div>
            <h2 className="text-xl font-bold">
              {leaderboardData?.tryout_title ?? "Tryout"}
            </h2>
            <p className="text-white/70 text-sm">
              Peringkat dihitung dari percobaan pertama setiap peserta.
            </p>
          </div>
        </div>

        {/* My rank summary */}
        {myEntry && (
          <div className="mt-5 pt-5 border-t border-white/20 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-white/60 mb-0.5">Peringkat Anda</p>
              <p className="text-3xl font-extrabold text-yellow-300">
                #{myEntry.rank}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-0.5">Skor</p>
              <p className="text-3xl font-extrabold">
                {myEntry.score.final_score}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-0.5">Benar</p>
              <p className="text-3xl font-extrabold">
                {myEntry.summary.correct}/{myEntry.summary.total_questions}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-10 text-slate-500">
            Memuat leaderboard...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-4">
            <Users className="w-12 h-12 text-slate-300" />
            <p>Belum ada peserta yang menyelesaikan attempt pertama.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isMe={entry.user_id === currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  const finishedAt = entry.finished_at
    ? formatJakartaDateTime(entry.finished_at, { month: "short" })
    : "-";

  return (
    <div
      className={`grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-5 transition-colors ${
        isMe ? "bg-blue-50 border-l-4 border-l-[#004AAB]" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
          isMe ? "bg-[#004AAB] text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {entry.rank <= 3 ? (
          <Medal
            className={`w-5 h-5 ${
              entry.rank === 1
                ? "text-yellow-500"
                : entry.rank === 2
                  ? "text-slate-400"
                  : "text-orange-500"
            } ${isMe ? "brightness-0 invert" : ""}`}
          />
        ) : (
          entry.rank
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-900 truncate">{entry.user_name}</p>
          {isMe && (
            <span className="shrink-0 text-[0.65rem] font-bold text-white bg-[#004AAB] px-2 py-0.5 rounded-full">
              Anda
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Attempt {entry.attempt_number} selesai {finishedAt}
        </p>
      </div>

      <div className="text-left md:text-right col-start-2 md:col-start-auto">
        <p className="text-xs text-slate-500">Benar</p>
        <p className="font-semibold text-slate-800">
          {entry.summary.correct}/{entry.summary.total_questions}
        </p>
      </div>

      <div className="text-left md:text-right col-start-2 md:col-start-auto">
        <p className="text-xs text-slate-500">Skor</p>
        <p className="text-xl font-bold text-[#004AAB]">
          {entry.score.final_score}
        </p>
      </div>
    </div>
  );
}
