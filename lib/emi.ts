/**
 * Standard reducing-balance EMI (equated monthly installment) formula.
 * principal in rupees, annualRatePercent e.g. 8.5, tenureYears e.g. 20.
 * Returns the monthly payment in rupees.
 */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  tenureYears: number
): number {
  const months = tenureYears * 12;
  if (months <= 0 || principal <= 0) return 0;

  const monthlyRate = annualRatePercent / 12 / 100;
  if (monthlyRate === 0) return principal / months;

  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}
