export function postIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? null;
}
