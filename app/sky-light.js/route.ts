import { pageLightScript } from "../sky-lighting";

// The page-lighting script as its own file, so browsers cache it across
// pages instead of carrying 15KB of it in every HTML document. It changes
// only when sky-lighting.ts does, so it is built once per deploy, and the
// layout versions its URL with a hash of the script so a new deploy is
// never served the old one from cache.
export const dynamic = "force-static";

export function GET() {
  return new Response(pageLightScript(), {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
