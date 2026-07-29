import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface UnlockDiscussionRequest {
  tryoutId: string;
}

interface UnlockDiscussionResponse {
  message: string;
  discussion_unlocked: boolean;
}

export const UnlockDiscussionHandler = async (
  { tryoutId }: UnlockDiscussionRequest,
  token: string,
): Promise<UnlockDiscussionResponse> => {
  const { data } = await api.post<UnlockDiscussionResponse>(
    `/tryouts/${tryoutId}/unlock-discussion`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const useUnlockDiscussion = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<UnlockDiscussionResponse, AxiosError, UnlockDiscussionRequest>>;
}) => {
  return useMutation({
    mutationFn: (req: UnlockDiscussionRequest) => UnlockDiscussionHandler(req, token),
    ...options,
  });
};
