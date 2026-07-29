import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const LOGIN_PATH = "/login";
const USER_DASHBOARD_PATH = "/dashboard";
const ADMIN_DASHBOARD_PATH = "/dashboard/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  if (pathname.startsWith(ADMIN_DASHBOARD_PATH) && role !== "admin") {
    return NextResponse.redirect(new URL(USER_DASHBOARD_PATH, request.url));
  }

  if (pathname === USER_DASHBOARD_PATH && role === "admin") {
    return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
