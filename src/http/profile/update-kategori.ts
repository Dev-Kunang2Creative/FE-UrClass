import { api } from "@/lib/axios";

export const updateKategoriApiHandler = async (
  token: string,
  kategori: "utbk" | "cpns",
) => {
  const { data } = await api.put(
    "/profile/kategori",
    { kategori },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};
