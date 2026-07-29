import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Package } from "@/types/packages/package";
import { PackageFormInput } from "@/validators/packages/package-validator";

interface CreatePackageResponse {
  data: Package;
  message: string;
}

export const CreatePackageHandler = async (
  body: PackageFormInput,
  token: string,
): Promise<CreatePackageResponse> => {
  const formData = new FormData();

  formData.append("name", body.name);
  formData.append("slug", body.slug);
  if (body.description) formData.append("description", body.description);
  formData.append("price", String(body.price));
  if (body.discount_price != null)
    formData.append("discount_price", String(body.discount_price));
  formData.append("ticket_amount", String(body.ticket_amount));
  formData.append("currency", body.currency ?? "IDR");
  formData.append("is_active", body.is_active ? "1" : "0");
  if (body.thumbnail instanceof File)
    formData.append("thumbnail", body.thumbnail);

  const { data } = await api.post(`/admin/packages`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const useCreatePackage = (
  options?: UseMutationOptions<
    CreatePackageResponse,
    AxiosError<ErrorResponse>,
    PackageFormInput
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (body: PackageFormInput) =>
      CreatePackageHandler(body, session?.access_token ?? ""),
    ...options,
  });
};
