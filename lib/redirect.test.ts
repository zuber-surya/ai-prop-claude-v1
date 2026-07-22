import { describe, it, expect } from "vitest";
import { getSafeRedirect } from "./redirect";

describe("getSafeRedirect", () => {
  it("allows a same-origin relative path", () => {
    expect(getSafeRedirect("/admin/properties")).toBe("/admin/properties");
  });

  it("defaults to / when next is missing", () => {
    expect(getSafeRedirect(null)).toBe("/");
    expect(getSafeRedirect(undefined)).toBe("/");
    expect(getSafeRedirect("")).toBe("/");
  });

  it("rejects an absolute URL to another host (open redirect)", () => {
    expect(getSafeRedirect("https://evil.example")).toBe("/");
    expect(getSafeRedirect("http://evil.example/phish")).toBe("/");
  });

  it("rejects a protocol-relative URL (still points off-site)", () => {
    expect(getSafeRedirect("//evil.example")).toBe("/");
  });

  it("rejects a path with no leading slash", () => {
    expect(getSafeRedirect("admin")).toBe("/");
  });
});
