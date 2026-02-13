/**
 * Convert an amount from one currency to another using exchange rates.
 * Both rates should be relative to the same base currency (e.g. USD).
 * @param amount - Amount to convert
 * @param fromRate - Exchange rate of the source currency (e.g. 1 USD = fromRate units)
 * @param toRate - Exchange rate of the target currency
 * @returns Converted amount
 */
export function convertCurrency(amount: number, fromRate: number, toRate: number): number {
  if (fromRate <= 0) throw new Error('fromRate must be positive');
  if (toRate <= 0) throw new Error('toRate must be positive');
  return (amount / fromRate) * toRate;
}

/**
 * Calculate foreign exchange gain or loss.
 * @param originalAmount - Original amount in foreign currency
 * @param originalRate - Exchange rate at the time of the original transaction
 * @param currentRate - Current exchange rate
 * @returns Gain or loss amount (positive = gain, negative = loss)
 */
export function calculateFxGainLoss(
  originalAmount: number,
  originalRate: number,
  currentRate: number,
): number {
  if (originalRate <= 0) throw new Error('originalRate must be positive');
  if (currentRate <= 0) throw new Error('currentRate must be positive');
  const originalValue = originalAmount * originalRate;
  const currentValue = originalAmount * currentRate;
  return currentValue - originalValue;
}

/**
 * Round a number using banker's rounding (round half to even).
 * @param amount - Number to round
 * @param places - Number of decimal places
 * @returns Rounded number
 */
export function roundToDecimal(amount: number, places: number): number {
  if (places < 0) throw new Error('Places must be non-negative');

  const multiplier = Math.pow(10, places);
  const shifted = amount * multiplier;
  const truncated = Math.trunc(shifted);
  const remainder = Math.abs(shifted - truncated);

  // Banker's rounding: if exactly 0.5, round to even
  if (Math.abs(remainder - 0.5) < 1e-10) {
    if (truncated % 2 === 0) {
      return truncated / multiplier;
    } else {
      return (truncated + (shifted > 0 ? 1 : -1)) / multiplier;
    }
  }

  return Math.round(shifted) / multiplier;
}
