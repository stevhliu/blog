/**
 * URL rules for routes rendered through `app/(post)`.
 *
 * `/playground` intentionally uses post chrome without a `posts.json` entry.
 */
export function isPostDetailPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/") return false;
  if (/^\/\d{4}\/[^/]+$/.test(p)) return true;
  return p === "/playground";
}

export function postIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? null;
}
