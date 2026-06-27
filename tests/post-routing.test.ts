import { describe, expect, it } from "vitest";
import { isPostDetailPathname } from "@/app/post-routing";

describe("isPostDetailPathname", () => {
  it("is false for the home page", () => {
    expect(isPostDetailPathname("/")).toBe(false);
  });

  it("is true for a year/slug post path", () => {
    expect(isPostDetailPathname("/2025/attention-please")).toBe(true);
  });

  it("tolerates a trailing slash", () => {
    expect(isPostDetailPathname("/2025/attention-please/")).toBe(true);
  });

  it("is true for the playground", () => {
    expect(isPostDetailPathname("/playground")).toBe(true);
  });

  it("is false for non-post top-level pages", () => {
    expect(isPostDetailPathname("/about")).toBe(false);
    expect(isPostDetailPathname("/atom")).toBe(false);
  });

  it("is false for a bare year segment", () => {
    expect(isPostDetailPathname("/2025")).toBe(false);
  });
});
