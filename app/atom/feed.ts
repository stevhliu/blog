// Helpers for the Atom feed. Kept out of route.ts because a Next route file
// may only export HTTP methods and route config; extra exports fail typegen.

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// "July 05, 2026" -> "2026-07-05T00:00:00.000Z" (RFC-3339, as Atom requires)
export function toRfc3339(date: string): string {
  const parsed = new Date(`${date} UTC`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unparseable post date: ${date}`);
  }
  return parsed.toISOString();
}
