import axios from "axios";

export const AUTH_TOKEN_INVALID_EVENT = "amunisi:auth-token-invalid";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Accept": "application/json",
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || "");
    const authorization = String(error?.config?.headers?.Authorization || "");
    const hasBearerToken = authorization.startsWith("Bearer ") && authorization.trim() !== "Bearer";

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      hasBearerToken &&
      !url.includes("/auth/login")
    ) {
      window.dispatchEvent(new CustomEvent(AUTH_TOKEN_INVALID_EVENT));
    }

    return Promise.reject(error);
  },
);

export { api };
