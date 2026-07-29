import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Package } from "@/types/packages/package";

interface DeletePackagePayload {
  id: string;
  token: string;
}

interface DeletePackageResponse {
  data: Package;
}

export const DeletePackageHandler = async ({
  id,
  token,
}: DeletePackagePayload): Promise<DeletePackageResponse> => {
  const { data } = await api.delete(`/admin/packages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useDeletePackage = (
  options?: UseMutationOptions<
    DeletePackageResponse,
    AxiosError<ErrorResponse>,
    DeletePackagePayload
  >,
) => {
  return useMutation({
    mutationFn: DeletePackageHandler,
    ...options,
  });
};
