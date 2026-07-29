import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Kelas } from "@/types/kelas/kelas";
import { KelasFormType } from "@/validators/kelas/kelas-validator";

interface CreateKelasAdminResponse {
  message: string;
  data: Kelas;
}

export const CreateKelasAdminHandler = async (
  body: KelasFormType,
  token: string
): Promise<CreateKelasAdminResponse> => {
  const formData = new FormData();
  formData.append("name", body.name);
  if (body.description) formData.append("description", body.description);
  formData.append("price", String(body.price));
  formData.append(
    "discount_price",
    body.discount_price != null ? String(body.discount_price) : ""
  );
  formData.append("ticket_amount", String(body.ticket_amount ?? 0));
  if (body.wa_group_link) formData.append("wa_group_link", body.wa_group_link);
  if (body.wa_consultation_number)
    formData.append("wa_consultation_number", body.wa_consultation_number);
  if (body.meet_link) formData.append("meet_link", body.meet_link);
  if (body.image instanceof File) formData.append("image", body.image);
  formData.append("is_active", body.is_active ? "1" : "0");

  const { data } = await api.post<CreateKelasAdminResponse>(
    "/admin/kelas",
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

export const useCreateKelasAdmin = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<
    UseMutationOptions<CreateKelasAdminResponse, AxiosError, KelasFormType>
  >;
}) => {
  return useMutation({
    mutationFn: (body: KelasFormType) => CreateKelasAdminHandler(body, token),
    ...options,
  });
};
