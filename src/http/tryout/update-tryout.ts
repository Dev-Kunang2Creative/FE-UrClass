import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Tryout } from "@/types/tryout/tryout";
import { TryoutType } from "@/validators/tryout/tryout-validator";

interface UpdateTryoutResponse {
  data: Tryout;
}

export const UpdateTryoutHandler = async (
  id: string,
  body: TryoutType,
  token: string,
): Promise<UpdateTryoutResponse> => {
  const formData = new FormData();

  formData.append("title", body.title);
  formData.append("_method", "PUT");

  if (body.description) formData.append("description", body.description);
  if (body.image) formData.append("image", body.image);
  if (body.start_date) formData.append("start_date", body.start_date);
  if (body.end_date) formData.append("end_date", body.end_date);
  if (body.category) formData.append("category", body.category);
  if (body.is_published !== undefined)
    formData.append("is_published", body.is_published ? "1" : "0");
  if (body.is_free !== undefined)
    formData.append("is_free", body.is_free ? "1" : "0");
  if (body.use_irt !== undefined)
    formData.append("use_irt", body.use_irt ? "1" : "0");
  if (body.randomize_options !== undefined)
    formData.append("randomize_options", body.randomize_options ? "1" : "0");

  const { data } = await api.post(`/admin/tryouts/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const useUpdateTryout = (
  options?: UseMutationOptions<
    UpdateTryoutResponse,
    AxiosError<ErrorResponse>,
    { id: string; body: TryoutType }
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({ id, body }) =>
      UpdateTryoutHandler(id, body, session?.access_token ?? ""),
    ...options,
  });
};
