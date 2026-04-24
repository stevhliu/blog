/**
 * True for URL paths that render a post in `app/(post)/` (the big "Observation Log"
 * title in the site header is hidden on these routes only).
 */
export function isPostDetailPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/") return false;
  // e.g. /2026/transformers-compendium-1, /2024/…
  if (/^\/\d{4}\/[^/]+$/.test(p)) return true;
  // e.g. /playground
  if (p === "/playground") return true;
  return false;
}
