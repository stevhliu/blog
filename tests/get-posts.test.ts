import { describe, expect, it } from "vitest";
import { getPosts } from "@/app/get-posts";
import postsData from "@/app/posts.json";

describe("getPosts (no Supabase env)", () => {
  it("drops drafts and matches the published count", async () => {
    const posts = await getPosts();
    const publishedCount = postsData.posts.filter(
      p => !("draft" in p && (p as { draft?: boolean }).draft)
    ).length;

    expect(posts.length).toBe(publishedCount);
    expect(posts.some(p => p.draft)).toBe(false);
  });

  it("falls back to zero views without Supabase", async () => {
    const posts = await getPosts();
    for (const p of posts) {
      expect(p.views).toBe(0);
      expect(p.viewsFormatted).toBe("0");
    }
  });
});
