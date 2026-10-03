import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { PromoBanner } from "@/types/promo-banner/promo-banner";

/**
 * Banner promosi untuk jalur peserta yang sedang masuk.
 *
 * Jalurnya ditentukan server dari akun peserta, bukan dikirim dari sini -
 * kalau dari parameter, banner jalur lain bisa dipanggil hanya dengan mengubah
 * URL.
 */
export const useGetPromoBanners = (token: string) =>
  useQuery({
    queryKey: ["promo-banners", token],
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get<{ data: PromoBanner[] }>("/promo-banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data;
    },
  });

export const useGetAdminPromoBanners = (token: string) =>
  useQuery({
    queryKey: ["admin-promo-banners"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<{ data: PromoBanner[] }>(
        "/admin/promo-banners",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data.data;
    },
  });

function buatFormData(isi: {
  image?: File | null;
  alt: string;
  href: string;
  kategori: string;
  order_no: number;
  is_active: boolean;
}): FormData {
  const form = new FormData();
  if (isi.image) form.append("image", isi.image);
  form.append("alt", isi.alt);
  form.append("href", isi.href);
  form.append("kategori", isi.kategori);
  form.append("order_no", String(isi.order_no));
  form.append("is_active", isi.is_active ? "1" : "0");
  return form;
}

export const useSimpanPromoBanner = (token: string) => {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...isi
    }: Parameters<typeof buatFormData>[0] & { id?: string }) => {
      // POST juga untuk perubahan: unggahan berkas tidak terbaca Laravel lewat
      // PUT multipart, jadi rutenya memang POST di kedua keadaan.
      const url = id ? `/admin/promo-banners/${id}` : "/admin/promo-banners";
      const { data } = await api.post<{ data: PromoBanner }>(
        url,
        buatFormData(isi),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data.data;
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["promo-banners"] });
      cache.invalidateQueries({ queryKey: ["admin-promo-banners"] });
    },
  });
};

export const useHapusPromoBanner = (token: string) => {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/promo-banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["promo-banners"] });
      cache.invalidateQueries({ queryKey: ["admin-promo-banners"] });
    },
  });
};
