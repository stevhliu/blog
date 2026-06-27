import { describe, expect, it } from "vitest";
import {
  formatInteger,
  formatShortPostDate,
  getPostYear,
} from "@/app/post-format";

describe("formatInteger", () => {
  it("groups thousands", () => {
    expect(formatInteger(1234)).toBe("1,234");
  });
});

describe("getPostYear", () => {
  it("reads the year from a prose date", () => {
    expect(getPostYear("July 05, 2026")).toBe(2026);
    expect(getPostYear("June 04, 2024")).toBe(2024);
  });
});

describe("formatShortPostDate", () => {
  it("formats as MM-DD", () => {
    expect(formatShortPostDate("July 05, 2026")).toBe("07-05");
  });
});
