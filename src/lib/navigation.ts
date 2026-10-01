export function isRouteActive(pathname: string, href: string) {
  const normalizedHref =
    href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;

  return (
    pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
  );
}

/**
 * Saldo dan tautan tiket hanya relevan untuk peserta di halaman non-admin.
 * Admin tidak memiliki alur pembelian atau saldo tiket ujian.
 */
export function shouldShowTicketBadge(
  role?: string | null,
  pathname?: string | null,
): boolean {
  if (role === "admin") return false;
  if (!pathname) return true;

  return (
    pathname !== "/dashboard/admin" && !pathname.startsWith("/dashboard/admin/")
  );
}

