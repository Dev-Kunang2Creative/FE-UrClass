import { api } from "@/lib/axios";
import { User } from "@/types/user/user";
import { RegisterType } from "@/validators/auth/register-validator";

interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export const registerApiHandler = async (
  body: RegisterType,
): Promise<RegisterResponse> => {
  const { data } = await api.post("/auth/register", body);
  return data;
};
