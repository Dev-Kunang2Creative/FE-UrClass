/**
 * Where uploaded files (package thumbnails, tryout proofs) are served from.
 *
 * Three components each hardcoded the same fallback,
 * `https://dev-api.amunisiptn.com/storage` - a host from an earlier project.
 * NEXT_PUBLIC_STORAGE_URL is not set in either deploy environment, so every
 * thumbnail on app.urclass.id and app-dev.urclass.id was being requested from
 * that domain. Deriving it from NEXT_PUBLIC_API_URL, which is always set,
 * keeps each environment pointing at its own backend without a new secret.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ??
  (API_URL ? `${API_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/storage` : "/storage");

/** Absolute URL for a stored path, or null when there is nothing to show. */
export function storageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${STORAGE_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
