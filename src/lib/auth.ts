import { cache } from "react";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuthApiHandler } from "@/http/auth/get-user";
import { loginApiHandler } from "@/http/auth/login";
import { User as Auth } from "@/types/user/user";
import { LoginType } from "@/validators/auth/login-validator";

declare module "next-auth" {
  interface User {
    id: string;
    token?: string;
    role?: string;
  }

  interface Session {
    user: Auth;
    access_token: string;
    authError?: "TOKEN_INVALID" | "AUTH_UNAVAILABLE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    role?: string;
    userOverrides?: Partial<Auth>;
  }
}

/**
 * Profil pengguna untuk satu permintaan server.
 *
 * Callback session di bawah memanggil backend setiap kali session dibaca, dan
 * satu navigasi dashboard membacanya lebih dari sekali: layout dashboard
 * memanggil getServerSession, lalu layout admin memanggilnya lagi, lalu
 * halamannya sendiri. Tanpa dedupe ini, membuka satu halaman admin berarti dua
 * sampai tiga panggilan /auth/me berurutan yang harus selesai sebelum apa pun
 * tergambar. cache() dari React membatasi cakupannya per permintaan, jadi
 * pengguna berbeda tidak mungkin saling memakai hasil yang sama.
 *
 * Timeoutnya jauh lebih pendek dari 30 detik bawaan axios: kalau backend tidak
 * menjawab, lebih baik session terdegradasi dalam 8 detik daripada halamannya
 * menggantung setengah menit.
 */
const fetchAuthUser = cache((accessToken: string) =>
  getAuthApiHandler(accessToken, 8000),
);

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        try {
          if (credentials.token) {
            const auth = await getAuthApiHandler(credentials.token);

            return {
              id: auth.id,
              token: credentials.token,
              role: auth.role,
            };
          }

          const { email, password } = credentials as LoginType;

          if (!email || !password) return null;

          const res = await loginApiHandler({ email, password });

          if (!res?.user) return null;

          return {
            id: res.user.id,
            token: res.token,
            role: res.user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // userOverrides is gone, and any left in an existing token is cleared
      // here so it heals on the next session read rather than at the next
      // login.
      //
      // It existed to keep optimistically-updated profile fields on screen,
      // from a time when ProfileController::update saved only some of them.
      // It saves all of them now, so overrides had nothing left to carry and
      // one real cost: they were merged OVER the backend response, so a value
      // frozen by an earlier edit shadowed the database indefinitely. Changing
      // a target university would save correctly and still show the old one.
      if (token.userOverrides) {
        delete token.userOverrides;
      }

      if (user) {
        token.access_token = user.token;
        token.sub = String(user.id);
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const access_token = token.access_token as string;

      try {
        const auth = await fetchAuthUser(access_token);

        // The backend is the only source. Dropping province and city from the
        // overrides was not enough: the same shadowing applied to every other
        // profile field, which is why a changed target university kept
        // displaying the old value.
        return { ...session, user: auth, access_token };
      } catch (error: unknown) {
        // If BE returns 401 or is unreachable, return a degraded session
        // This prevents the entire app from crashing
        const status = (error as { response?: { status?: number } })?.response?.status;
        const authError = status === 401 ? "TOKEN_INVALID" : "AUTH_UNAVAILABLE";
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[auth] Failed to fetch user from BE:", message);

        // Degraded session: the backend is unreachable, so only what the token
        // itself carries is trustworthy. Showing stale profile data here would
        // be a guess dressed up as the truth.
        return {
          ...session,
          user: {
            id: token.sub || "",
            name: session?.user?.name || "Sobat UrClass",
            email: session?.user?.email || "",
            role: token.role || "user",
          } as Auth,
          access_token,
          authError,
        };
      }
    },
  },
};

const authHandler = NextAuth(authOptions);
export default authHandler;
