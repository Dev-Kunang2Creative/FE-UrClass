import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface GoogleRedirectResponse {
  url: string;
}

export const GetGoogleRedirectHandler =
  async (): Promise<GoogleRedirectResponse> => {
    const { data } = await api.get<GoogleRedirectResponse>(
      "/auth/google/redirect",
    );

    return data;
  };

export const useGetGoogleRedirect = ({
  options,
}: {
  options?: Partial<UseQueryOptions<GoogleRedirectResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-google-redirect"],
    queryFn: GetGoogleRedirectHandler,
    enabled: false,
    ...options,
  });
};
