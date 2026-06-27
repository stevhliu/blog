import { describe, expect, it } from "vitest";
import { archiveSecYearForPost, groupByYear } from "@/app/archive-section";
import type { Post } from "@/app/get-posts";

function post(id: string, date: string): Post {
  return { id, date, title: id, views: 0, viewsFormatted: "0" };
}

// Newest first, the order getPosts() / posts.json maintains.
const newer = post("newer", "May 05, 2026");
const olderA = post("older-a", "Mar 10, 2025");
const olderB = post("older-b", "Feb 20, 2025");
const fixture: Post[] = [newer, olderA, olderB];

describe("groupByYear", () => {
  it("returns years descending and preserves input order within a year", () => {
    const grouped = groupByYear(fixture);
    expect(grouped.map(([year]) => year)).toEqual([2026, 2025]);
    expect(grouped[1][1]).toEqual([olderA, olderB]);
  });
});

describe("archiveSecYearForPost", () => {
  it("numbers the oldest year section 1 and the newest year highest", () => {
    expect(archiveSecYearForPost(olderA, fixture)).toEqual({ section: 1, year: 2025 });
    expect(archiveSecYearForPost(newer, fixture)).toEqual({ section: 2, year: 2026 });
  });
});
