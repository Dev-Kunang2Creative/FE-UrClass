export function isRouteActive(pathname: string, href: string) {
  const normalizedHref =
    href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;

  return (
    pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
  );
}
