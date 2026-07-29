import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { Tryout } from "@/types/tryout/tryout";

export interface TryoutHistoryData {
  id: string;
  historyId: string;
  attemptNumber: number;
  tryoutName: string;
  dateTaken: string;
  score: number;
  status: "selesai" | "sedang dikerjakan";
  hasAttempted: boolean;
  isFree: boolean;
  attemptCount: number;
}

function mapMyTryoutToHistory(tryout: Tryout): TryoutHistoryData[] {
  const isFinished = tryout.user_session_status === "finished";
  const attemptCount = Number(tryout.user_attempt_count ?? 0);
  // "not_started" means enrolled but never opened; any other status means at least one attempt exists
  const hasAttempted = attemptCount > 0 || (!!tryout.user_session_status && tryout.user_session_status !== "not_started");

  if (tryout.user_attempts?.length) {
    return tryout.user_attempts.map((attempt) => ({
      id: tryout.id,
      historyId: attempt.session_id,
      attemptNumber: Number(attempt.attempt_number ?? 1),
      tryoutName: tryout.title,
      dateTaken: attempt.finished_at
        ? String(attempt.finished_at)
        : attempt.started_at
          ? String(attempt.started_at)
          : "",
      score: Number(attempt.score?.final_score ?? 0),
      status: "selesai",
      hasAttempted: true,
      isFree: tryout.is_free ?? false,
      attemptCount,
    }));
  }

  if (!hasAttempted) {
    return [];
  }

  return [{
    id: tryout.id,
    historyId: `${tryout.id}-current`,
    attemptNumber: attemptCount || 0,
    tryoutName: tryout.title,
    dateTaken: tryout.user_started_at
      ? String(tryout.user_started_at)
      : tryout.start_date
        ? String(tryout.start_date)
        : "",
    score: 0, // Score needs separate API call to /result
    status: isFinished ? "selesai" : "sedang dikerjakan",
    hasAttempted,
    isFree: tryout.is_free ?? false,
    attemptCount,
  }];
}

export interface GetHistoryTryoutResponse {
  data: TryoutHistoryData[];
}

export const GetHistoryTryoutHandler = async (token: string): Promise<GetHistoryTryoutResponse> => {
  const { data } = await api.get<{ data: Tryout[] }>("/my-tryouts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const histories = data.data
    .flatMap(mapMyTryoutToHistory)
    .sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());

  return { data: histories };
};

export const useGetHistoryTryout = ({ token, options }: { token: string; options?: Partial<UseQueryOptions<GetHistoryTryoutResponse, AxiosError>> }) => {
  return useQuery({
    queryKey: ["get-history-tryout", token],
    queryFn: () => GetHistoryTryoutHandler(token),
    enabled: !!token,
    ...options,
  });
};
