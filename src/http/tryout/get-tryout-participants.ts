import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { UserTryoutAccess } from "@/types/tryout/tryout";
import { api } from "@/lib/axios";
import type { ParticipantTypeFilter } from "@/types/tryout/dummy-participant";

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface GetTryoutParticipantsResponse {
  data: {
    data: UserTryoutAccess[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export const getTryoutParticipants = async (
  id: string,
  token: string,
  page: number = 1,
  search: string = "",
  status: string = "all",
  participantType: ParticipantTypeFilter = "all",
  perPage: number = 15,
): Promise<GetTryoutParticipantsResponse> => {
  const { data } = await api.get(
    `/admin/tryouts/${id}/participants`,
    {
      params: {
        page,
        per_page: perPage,
        search,
        status,
        participant_type: participantType,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetTryoutParticipants = (
  id: string,
  token: string,
  page: number,
  search: string,
  status: string,
  participantType: ParticipantTypeFilter,
  perPage: number,
  options?: Pick<UseQueryOptions<GetTryoutParticipantsResponse, AxiosError>, "enabled">,
) => {
  return useQuery({
    queryKey: [
      "tryout-participants",
      id,
      page,
      search,
      status,
      participantType,
      perPage,
    ],
    queryFn: () =>
      getTryoutParticipants(
        id,
        token,
        page,
        search,
        status,
        participantType,
        perPage,
      ),
    ...options,
  });
};
