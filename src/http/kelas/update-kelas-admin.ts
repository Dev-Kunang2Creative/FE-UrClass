import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Kelas } from "@/types/kelas/kelas";
import { KelasFormType } from "@/validators/kelas/kelas-validator";

interface UpdateKelasAdminPayload {
  id: string;
  body: KelasFormType;
}

interface UpdateKelasAdminResponse {
  message: string;
  data: Kelas;
}

export const UpdateKelasAdminHandler = async (
  { id, body }: UpdateKelasAdminPayload,
  token: string
): Promise<UpdateKelasAdminResponse> => {
  const formData = new FormData();
  formData.append("_method", "PUT");
  formData.append("name", body.name);
  formData.append("description", body.description ?? "");
  formData.append("price", String(body.price));
  formData.append(
    "discount_price",
    body.discount_price != null ? String(body.discount_price) : ""
  );
  formData.append("ticket_amount", String(body.ticket_amount ?? 0));
  formData.append("wa_group_link", body.wa_group_link ?? "");
  formData.append("wa_consultation_number", body.wa_consultation_number ?? "");
  formData.append("meet_link", body.meet_link ?? "");
  if (body.image instanceof File) formData.append("image", body.image);
  formData.append("is_active", body.is_active ? "1" : "0");

  const { data } = await api.post<UpdateKelasAdminResponse>(
    `/admin/kelas/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

export const useUpdateKelasAdmin = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<
    UseMutationOptions<
      UpdateKelasAdminResponse,
      AxiosError,
      UpdateKelasAdminPayload
    >
  >;
}) => {
  return useMutation({
    mutationFn: (payload: UpdateKelasAdminPayload) =>
      UpdateKelasAdminHandler(payload, token),
    ...options,
  });
};
