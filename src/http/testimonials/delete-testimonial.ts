import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";

interface DeleteTestimonialResponse {
  message: string;
}

export const DeleteTestimonialHandler = async (
  id: string,
  token: string,
): Promise<DeleteTestimonialResponse> => {
  const { data } = await api.delete<DeleteTestimonialResponse>(
    `/admin/testimonials/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useDeleteTestimonial = (
  options?: UseMutationOptions<
    DeleteTestimonialResponse,
    AxiosError<ErrorResponse>,
    string
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (id: string) =>
      DeleteTestimonialHandler(id, session?.access_token ?? ""),
    ...options,
  });
};
