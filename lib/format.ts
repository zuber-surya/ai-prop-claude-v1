/**
 * Formats a price stored in INR paise (SCHEMA.md §3) as a compact
 * Indian-style display string, e.g. 450000000 -> "₹45 Lakh",
 * 1750000000 -> "₹1.75 Cr". Falls back to a grouped rupee figure
 * below one lakh.
 */
export function formatInrPaise(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 1_00_00_000) {
    return `₹${trimTrailingZero(rupees / 1_00_00_000)} Cr`;
  }
  if (rupees >= 1_00_000) {
    return `₹${trimTrailingZero(rupees / 1_00_000)} Lakh`;
  }
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function trimTrailingZero(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}
