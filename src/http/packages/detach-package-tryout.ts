import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface DetachPayload {
  token: string;
  packageId: string;
  tryoutId: string;
}

interface DetachResponse {
  message: string;
}

export const DetachPackageTryoutHandler = async ({ token, packageId, tryoutId }: DetachPayload) => {
  const { data } = await api.delete<DetachResponse>(
    `/admin/packages/${packageId}/tryouts/${tryoutId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useDetachPackageTryout = (
  options?: UseMutationOptions<DetachResponse, AxiosError<{ message: string }>, DetachPayload>
) => {
  return useMutation({ mutationFn: DetachPackageTryoutHandler, ...options });
};
