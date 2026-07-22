import { describe, it, expect } from "vitest";
import { calculateEmi } from "./emi";

describe("calculateEmi", () => {
  it("matches a known reference EMI value", () => {
    // ₹50L at 8.5% over 20 years -> ₹43,391.16/mo (standard reference figure)
    expect(calculateEmi(5000000, 8.5, 20)).toBeCloseTo(43391.16, 2);
  });

  it("handles 0% interest as a plain division", () => {
    expect(calculateEmi(120000, 0, 1)).toBeCloseTo(10000, 2);
  });

  it("returns 0 for a zero or negative principal", () => {
    expect(calculateEmi(0, 8.5, 20)).toBe(0);
    expect(calculateEmi(-1000, 8.5, 20)).toBe(0);
  });

  it("returns 0 for a zero or negative tenure (no division by zero)", () => {
    expect(calculateEmi(5000000, 8.5, 0)).toBe(0);
    expect(calculateEmi(5000000, 8.5, -5)).toBe(0);
  });

  it("increases EMI as the interest rate increases", () => {
    const low = calculateEmi(5000000, 6, 20);
    const high = calculateEmi(5000000, 10, 20);
    expect(high).toBeGreaterThan(low);
  });

  it("decreases EMI as the tenure lengthens", () => {
    const short = calculateEmi(5000000, 8.5, 10);
    const long = calculateEmi(5000000, 8.5, 30);
    expect(long).toBeLessThan(short);
  });
});
