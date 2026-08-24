import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface PerguruanTinggiOption {
  id: string;
  kode_ptn: string | null;
  nama: string;
  program_studi_count?: number;
}

interface Paginated<T> {
  data: T[];
}

/**
 * State universities, for the target-campus picker.
 *
 * The dataset behind this is PTN only - 76 of them - so a picker built on it
 * must still accept a name that is not in the list, or anyone aiming at a
 * private campus cannot fill in their profile.
 */
export const useSearchPerguruanTinggi = ({
  search,
  token,
  enabled = true,
}: {
  search: string;
  token: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ["perguruan-tinggi", search],
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get<Paginated<PerguruanTinggiOption>>(
        "/perguruan-tinggi",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: search || undefined, per_page: 30 },
        },
      );
      return data.data;
    },
  });
