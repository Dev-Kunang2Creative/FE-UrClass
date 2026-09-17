import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Testimonial } from "@/types/testimonials/testimonial";

interface GetAllTestimonialsResponse {
  data: Testimonial[];
}

export const GetAllTestimonialsHandler = async (
  token: string,
): Promise<GetAllTestimonialsResponse> => {
  const { data } = await api.get<GetAllTestimonialsResponse>("/admin/testimonials", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useGetAllTestimonials = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetAllTestimonialsResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-testimonials"],
    queryFn: () => GetAllTestimonialsHandler(token),
    enabled: !!token,
    ...options,
  });
};
