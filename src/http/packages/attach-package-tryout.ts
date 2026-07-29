import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface AttachPayload {
  token: string;
  packageId: string;
  tryout_id: string;
}

interface AttachResponse {
  message: string;
}

export const AttachPackageTryoutHandler = async ({ token, packageId, tryout_id }: AttachPayload) => {
  const { data } = await api.post<AttachResponse>(
    `/admin/packages/${packageId}/tryouts`,
    { tryout_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useAttachPackageTryout = (
  options?: UseMutationOptions<AttachResponse, AxiosError<{ message: string }>, AttachPayload>
) => {
  return useMutation({ mutationFn: AttachPackageTryoutHandler, ...options });
};
