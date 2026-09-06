import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function useAmbangSkd() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  return useQuery({
    queryKey: ["ambang-skd-peserta", session?.user.id],
    enabled: !!token && session?.user.kategori === "cpns",
    queryFn: async (): Promise<Record<string, number>> => {
      const { data: response } = await api.get(
        "/settings/exam-passing-grades",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        TWK: response.data.skd_passing_grade_twk,
        TIU: response.data.skd_passing_grade_tiu,
        TKP: response.data.skd_passing_grade_tkp,
      };
    },
  });
}
