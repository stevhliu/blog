import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import postsData from "@/app/posts.json";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "posts");

function postYear(date: string): number {
  return new Date(`${date} UTC`).getUTCFullYear();
}

describe("posts.json ↔ filesystem sync", () => {
  it("has an mdx file for every registry entry", () => {
    for (const post of postsData.posts) {
      const file = path.join(POSTS_DIR, String(postYear(post.date)), `${post.id}.mdx`);
      expect(fs.existsSync(file), `missing ${file}`).toBe(true);
    }
  });

  it("has a registry entry for every post on disk", () => {
    const ids = new Set(postsData.posts.map(p => p.id));
    const yearDirs = fs
      .readdirSync(POSTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name));

    for (const yearDir of yearDirs) {
      const files = fs
        .readdirSync(path.join(POSTS_DIR, yearDir.name), { withFileTypes: true })
        .filter(d => d.isFile() && d.name.endsWith(".mdx"));
      for (const file of files) {
        const slug = file.name.replace(/\.mdx$/, "");
        expect(ids.has(slug), `${yearDir.name}/${slug} not in posts.json`).toBe(true);
      }
    }
  });

  it("has unique ids", () => {
    const ids = postsData.posts.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
