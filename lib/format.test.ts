import { describe, it, expect } from "vitest";
import { formatInrPaise } from "./format";

describe("formatInrPaise", () => {
  it("formats lakhs", () => {
    expect(formatInrPaise(45_00_000_00)).toBe("₹45 Lakh");
  });

  it("formats crores", () => {
    expect(formatInrPaise(1_75_00_000_00)).toBe("₹1.75 Cr");
  });

  it("trims trailing zeros", () => {
    expect(formatInrPaise(1_00_00_000_00)).toBe("₹1 Cr");
    expect(formatInrPaise(50_00_000_00)).toBe("₹50 Lakh");
  });

  it("falls back to a grouped rupee figure below one lakh", () => {
    expect(formatInrPaise(45_000_00)).toBe("₹45,000");
  });

  it("formats a non-round lakh value with decimals", () => {
    expect(formatInrPaise(28_50_000_00)).toBe("₹28.5 Lakh");
  });
});
