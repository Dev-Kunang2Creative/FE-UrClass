import { api } from "@/lib/axios";
import { User } from "@/types/user/user";

interface GetAuthResponse {
  user: User;
}

/**
 * Profil pengguna dari backend.
 *
 * `timeoutMs` ada karena pemanggil terpentingnya adalah callback session
 * NextAuth, yang jalan di server pada setiap render layout dashboard. Dengan
 * timeout axios bawaan (30 detik), backend yang lambat atau mati membuat setiap
 * navigasi dashboard menggantung selama itu sebelum apa pun tergambar.
 */
export const getAuthApiHandler = async (
  token: string,
  timeoutMs?: number,
): Promise<User> => {
  const { data } = await api.get<GetAuthResponse>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    ...(timeoutMs ? { timeout: timeoutMs } : {}),
  });
  return data.user;
};
