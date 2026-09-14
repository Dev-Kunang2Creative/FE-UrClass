import { api } from "@/lib/axios";
import type {
  ForgotPasswordType,
  ResetPasswordType,
} from "@/validators/auth/forgot-password-validator";

interface ForgotPasswordResponse {
  message: string;
  data: {
    email: string;
    token: string;
    expires_in_minutes: number;
  };
}

/**
 * Menukar data profil dengan token reset berumur pendek.
 *
 * Tokennya dipegang di memori halaman, tidak pernah masuk URL: alamat yang
 * memuat token akan tertinggal di riwayat peramban dan ikut terkirim sebagai
 * referrer ke setiap alamat yang dibuka setelahnya.
 */
export const forgotPasswordHandler = async (
  body: ForgotPasswordType & { cf_turnstile_response?: string },
): Promise<ForgotPasswordResponse> => {
  const { data } = await api.post("/auth/forgot-password", body);
  return data;
};

export const resetPasswordHandler = async (
  body: ResetPasswordType & { email: string; token: string },
): Promise<{ message: string }> => {
  const { data } = await api.post("/auth/reset-password", body);
  return data;
};
