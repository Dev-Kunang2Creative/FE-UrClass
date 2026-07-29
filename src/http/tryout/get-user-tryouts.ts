import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { Tryout } from "@/types/tryout/tryout";
import type { SubtestByTryout } from "@/types/subtest/subtest";

export interface UserTryoutData {
  id: string;
  title: string;
  type: "Premium" | "Gratis";
  category?: string | null;
  startDate: string;
  endDate: string;
  is_free?: boolean;
  description?: string;
  image_url?: string | null;
  tryoutSubtests?: SubtestByTryout[];
  participantsCount: number;
  isEnrolled: boolean;
  hasAttempted: boolean;
  attemptCount: number;
}

function mapTryoutBEtoFE(tryout: Tryout): UserTryoutData {
  const attemptCount = Number(tryout.user_attempt_count ?? 0);

  return {
    id: tryout.id,
    title: tryout.title,
    type: tryout.is_free ? "Gratis" : "Premium",
    category: tryout.category,
    startDate: tryout.start_date ? String(tryout.start_date) : "",
    endDate: tryout.end_date ? String(tryout.end_date) : "",
    is_free: tryout.is_free,
    description: tryout.description,
    image_url: tryout.image_url,
    tryoutSubtests: tryout.tryout_subtests,
    participantsCount: tryout.user_accesses_count ?? 0,
    isEnrolled: Boolean(tryout.user_is_enrolled),
    hasAttempted: attemptCount > 0 || (!!tryout.user_session_status && tryout.user_session_status !== "not_started"),
    attemptCount,
  };
}

export interface GetUserTryoutsResponse {
  data: UserTryoutData[];
}

export const GetUserTryoutsHandler = async (token: string): Promise<GetUserTryoutsResponse> => {
  const { data } = await api.get<{ data: Tryout[] }>("/tryouts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data: data.data.map(mapTryoutBEtoFE) };
};

export const useGetUserTryouts = ({ token, options }: { token: string; options?: Partial<UseQueryOptions<GetUserTryoutsResponse, AxiosError>> }) => {
  return useQuery({
    queryKey: ["get-user-tryouts"],
    queryFn: () => GetUserTryoutsHandler(token),
    enabled: !!token,
    ...options,
  });
};
