import { api } from "@/lib/axios";
import { User } from "@/types/user/user";

interface GetAuthResponse {
  user: User;
}

export const getAuthApiHandler = async (token: string): Promise<User> => {
  const { data } = await api.get<GetAuthResponse>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.user;
};
