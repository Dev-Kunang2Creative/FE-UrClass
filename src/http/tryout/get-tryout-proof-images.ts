import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { User } from "@/types/user/user";

export interface TryoutProofItem {
  id: string;
  granted_at: string | null;
  user: Pick<User, "id" | "name" | "email"> | null;
  tryout: {
    id: string;
    title: string;
    is_free: boolean;
  } | null;
  proof_images: string[];
  proof_image_urls: string[];
}

export interface GetTryoutProofImagesResponse {
  data: TryoutProofItem[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export const GetTryoutProofImagesHandler = async (
  token: string,
  page = 1,
  search = "",
  perPage = 12,
): Promise<GetTryoutProofImagesResponse> => {
  const { data } = await api.get<GetTryoutProofImagesResponse>(
    "/admin/tryout-proof-images",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, search: search || undefined, per_page: perPage },
    },
  );

  return data;
};

export const useGetTryoutProofImages = ({
  token,
  page = 1,
  search = "",
  perPage = 12,
  options,
}: {
  token: string;
  page?: number;
  search?: string;
  perPage?: number;
  options?: Partial<UseQueryOptions<GetTryoutProofImagesResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-tryout-proof-images", page, search, perPage],
    queryFn: () => GetTryoutProofImagesHandler(token, page, search, perPage),
    enabled: !!token,
    ...options,
  });
};
