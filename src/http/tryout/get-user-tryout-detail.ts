import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { Kategori } from "@/lib/kategori";
import type { Tryout } from "@/types/tryout/tryout";

interface GetUserTryoutDetailResponse {
  data: Tryout;
}

/** A 403 from the detail endpoint means the tryout belongs to the other jalur. */
export interface WrongTrackError {
  kategori?: Kategori;
  message?: string;
}

export function wrongTrackFrom(error: unknown): WrongTrackError | null {
  const response = (
    error as {
      response?: { status?: number; data?: { message?: string; kategori?: string } };
    }
  )?.response;

  if (response?.status !== 403) return null;

  const kategori = response.data?.kategori;
  return {
    kategori: kategori === "utbk" || kategori === "cpns" ? kategori : undefined,
    message: response.data?.message,
  };
}

/**
 * One request for one tryout.
 *
 * This used to GET /tryouts and find the id in the response on the client,
 * because no detail endpoint existed. Two consequences: opening any tryout
 * downloaded all of them, and since that list is filtered by track, a tryout
 * on the other jalur surfaced as a flat "not found" - the page said the thing
 * did not exist when it did.
 */
export const GetUserTryoutDetailHandler = async (
  id: string,
  token: string,
): Promise<GetUserTryoutDetailResponse> => {
  const { data } = await api.get<{ data: Tryout }>(`/tryouts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { data: data.data };
};

export const useGetUserTryoutDetail = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetUserTryoutDetailResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-user-tryout-detail", id],
    queryFn: () => GetUserTryoutDetailHandler(id, token),
    enabled: !!token && !!id,
    // A wrong-track 403 and a missing 404 are both settled answers; retrying
    // only delays the message.
    retry: (count, error) => {
      const status = (error as AxiosError)?.response?.status;
      if (status === 403 || status === 404) return false;
      return count < 2;
    },
    ...options,
  });
};
