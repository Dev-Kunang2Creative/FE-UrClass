import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { TrackCard } from "@/types/track-card/track-card";

export interface TrackCardPayload {
  title: string;
  badge: string;
  cta: string;
  description: string;
  features: string[];
}

export const useUpdateTrackCard = (token: string) => {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kategori,
      body,
    }: {
      kategori: string;
      body: TrackCardPayload;
    }) => {
      const { data } = await api.put<{ data: TrackCard }>(
        `/admin/track-cards/${kategori}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data.data;
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["track-cards"] });
      cache.invalidateQueries({ queryKey: ["admin-track-cards"] });
    },
  });
};

/** Mengembalikan satu kartu ke teks bawaannya. */
export const useResetTrackCard = (token: string) => {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async (kategori: string) => {
      const { data } = await api.post<{ data: TrackCard }>(
        `/admin/track-cards/${kategori}/reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data.data;
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["track-cards"] });
      cache.invalidateQueries({ queryKey: ["admin-track-cards"] });
    },
  });
};

export const useGetAdminTrackCards = (token: string) =>
  useMutation({
    mutationFn: async () => {
      const { data } = await api.get<{ data: TrackCard[] }>("/admin/track-cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data;
    },
  });
