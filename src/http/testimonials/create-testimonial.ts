import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Testimonial } from "@/types/testimonials/testimonial";
import { TestimonialFormInput } from "@/validators/testimonials/testimonial-validator";

interface CreateTestimonialResponse {
  data: Testimonial;
  message: string;
}

export const CreateTestimonialHandler = async (
  body: TestimonialFormInput,
  token: string,
): Promise<CreateTestimonialResponse> => {
  const formData = new FormData();

  formData.append("name", body.name);
  formData.append("role", body.role);
  formData.append("program", body.program);
  formData.append("quote", body.quote);
  formData.append("rating", String(body.rating ?? 5));
  formData.append("color_theme", body.color_theme ?? "pink");
  formData.append("order_no", String(body.order_no ?? 0));
  formData.append("is_active", body.is_active ? "1" : "0");
  if (body.avatar_bg) formData.append("avatar_bg", body.avatar_bg);
  if (body.avatar instanceof File) {
    formData.append("avatar", body.avatar);
  }

  const { data } = await api.post<CreateTestimonialResponse>(
    "/admin/testimonials",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export const useCreateTestimonial = (
  options?: UseMutationOptions<
    CreateTestimonialResponse,
    AxiosError<ErrorResponse>,
    TestimonialFormInput
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (body: TestimonialFormInput) =>
      CreateTestimonialHandler(body, session?.access_token ?? ""),
    ...options,
  });
};
