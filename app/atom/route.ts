import { getPosts } from "@/app/get-posts";
import { escapeXml, toRfc3339 } from "./feed";

const SITE = "https://stevhliu.com";
const MAX_ENTRIES = 100;

export async function GET() {
  const posts = (await getPosts()).slice(0, MAX_ENTRIES);

  const entries = posts.map(post => {
    const year = new Date(`${post.date} UTC`).getUTCFullYear();
    const url = `${SITE}/${year}/${post.id}`;
    return `<entry>
      <id>${escapeXml(url)}</id>
      <title>${escapeXml(post.title)}</title>
      <link href="${escapeXml(url)}"/>
      <updated>${toRfc3339(post.date)}</updated>
    </entry>`;
  });

  const updated =
    posts.length > 0 ? toRfc3339(posts[0].date) : new Date(0).toISOString();

  return new Response(
    `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>Steven Liu</title>
    <subtitle>Essays</subtitle>
    <link href="${SITE}/atom" rel="self"/>
    <link href="${SITE}/"/>
    <updated>${updated}</updated>
    <id>${SITE}/</id>
    <author>
      <name>Steven Liu</name>
      <email>stevhliu@gmail.com</email>
    </author>
    ${entries.join("\n")}
  </feed>`,
    {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
      },
    }
  );
}
