import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface ProgramStudiOption {
  id: string;
  nama: string;
  jenjang: string | null;
  daya_tampung: number | null;
  peminat: number | null;
  keketatan: number | null;
}

/**
 * Programmes offered by one university. Only queried once a university has
 * been chosen - a major list with no campus attached would be meaningless,
 * since the same programme name exists at dozens of them.
 */
export const useProgramStudi = ({
  perguruanTinggiId,
  search,
  token,
}: {
  perguruanTinggiId: string | null;
  search: string;
  token: string;
}) =>
  useQuery({
    queryKey: ["program-studi", perguruanTinggiId, search],
    enabled: !!perguruanTinggiId && !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get<{ data: ProgramStudiOption[] }>(
        `/perguruan-tinggi/${perguruanTinggiId}/program-studi`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: search || undefined },
        },
      );
      return data.data;
    },
  });
