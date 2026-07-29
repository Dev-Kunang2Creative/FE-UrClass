import { api } from "@/lib/axios";
import { User } from "@/types/user/user";
import { LoginType } from "@/validators/auth/login-validator";

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export const loginApiHandler = async (
  body: LoginType,
): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", body);
  return data;
};
