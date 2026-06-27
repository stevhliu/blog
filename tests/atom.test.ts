import { describe, expect, it } from "vitest";
import { GET } from "@/app/atom/route";
import { escapeXml, toRfc3339 } from "@/app/atom/feed";
import { getPosts } from "@/app/get-posts";

describe("escapeXml", () => {
  it("escapes the five XML metacharacters", () => {
    expect(escapeXml('A & B <C> "D"')).toBe("A &amp; B &lt;C&gt; &quot;D&quot;");
  });
});

describe("toRfc3339", () => {
  it("converts prose dates to RFC-3339 UTC", () => {
    expect(toRfc3339("July 05, 2026")).toBe("2026-07-05T00:00:00.000Z");
    expect(toRfc3339("Aug 10, 2025")).toBe("2025-08-10T00:00:00.000Z");
  });

  it("throws on an unparseable date", () => {
    expect(() => toRfc3339("garbage")).toThrow();
  });
});

describe("GET /atom", () => {
  it("serves a valid Atom feed", async () => {
    const res = await GET();
    expect(res.headers.get("Content-Type")).toBe("application/atom+xml; charset=utf-8");

    const body = await res.text();
    const published = await getPosts();

    // one entry per published (non-draft) post
    const entryCount = (body.match(/<entry>/g) ?? []).length;
    expect(entryCount).toBe(published.length);

    // no prose month names inside <updated>
    expect(
      /<updated>[^<]*(January|February|March|April|May|June|July|August|September|October|November|December)/.test(
        body
      )
    ).toBe(false);

    // every entry id is an absolute IRI
    const ids = [...body.matchAll(/<entry>[\s\S]*?<id>([^<]*)<\/id>/g)].map(m => m[1]);
    expect(ids.length).toBe(entryCount);
    for (const id of ids) {
      expect(id.startsWith("https://stevhliu.com/")).toBe(true);
    }
  });
});
