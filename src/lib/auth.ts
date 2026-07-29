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
    jwt: async ({ token, user, trigger, session }) => {
      // Intercept purely front-end fields on session update and store them in the JWT token.
      // Exclude server-managed fields (ticket_balance, id, role, email) so they always come
      // fresh from BE and are never frozen by an optimistic session update.
      if (trigger === "update" && session?.user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ticket_balance, id, role, email, ...safeOverrides } = session.user as Auth & { ticket_balance?: number };
        token.userOverrides = {
          ...(token.userOverrides || {}),
          ...safeOverrides,
        };
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
        const auth = await getAuthApiHandler(access_token);

        // Merge fresh backend data with any front-end only overrides (like province, city) we stored
        const overrides = token.userOverrides || {};
        const mergedUser = { ...auth, ...overrides };

        return { ...session, user: mergedUser, access_token };
      } catch (error: unknown) {
        // If BE returns 401 or is unreachable, return a degraded session
        // This prevents the entire app from crashing
        const status = (error as { response?: { status?: number } })?.response?.status;
        const authError = status === 401 ? "TOKEN_INVALID" : "AUTH_UNAVAILABLE";
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[auth] Failed to fetch user from BE:", message);

        const overrides = token.userOverrides || {};
        return {
          ...session,
          user: {
            id: token.sub || "",
            name: overrides?.name || session?.user?.name || "Amunisian",
            email: overrides?.email || session?.user?.email || "",
            role: overrides?.role || token.role || "user",
            ...overrides,
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
