/**
 * Simple interest calculation.
 * @param principal - Initial principal amount
 * @param rate - Annual interest rate (e.g. 0.05 for 5%)
 * @param periods - Number of periods (years)
 * @returns Total interest earned
 */
export function simpleInterest(principal: number, rate: number, periods: number): number {
  if (principal < 0) throw new Error('Principal must be non-negative');
  if (rate < 0) throw new Error('Rate must be non-negative');
  if (periods < 0) throw new Error('Periods must be non-negative');
  return principal * rate * periods;
}

/**
 * Compound interest calculation.
 * @param principal - Initial principal amount
 * @param rate - Annual interest rate (e.g. 0.05 for 5%)
 * @param periods - Number of years
 * @param compoundsPerPeriod - Number of times interest compounds per year
 * @returns Total amount (principal + interest)
 */
export function compoundInterest(
  principal: number,
  rate: number,
  periods: number,
  compoundsPerPeriod: number,
): number {
  if (principal < 0) throw new Error('Principal must be non-negative');
  if (rate < 0) throw new Error('Rate must be non-negative');
  if (periods < 0) throw new Error('Periods must be non-negative');
  if (compoundsPerPeriod <= 0) throw new Error('Compounds per period must be greater than 0');

  return principal * Math.pow(1 + rate / compoundsPerPeriod, compoundsPerPeriod * periods);
}

/**
 * Net Present Value calculation.
 * @param rate - Discount rate per period (e.g. 0.10 for 10%)
 * @param cashFlows - Array of cash flows, where index 0 is the initial investment (usually negative)
 * @returns Net present value
 */
export function npv(rate: number, cashFlows: number[]): number {
  if (cashFlows.length === 0) throw new Error('Cash flows array must not be empty');
  if (rate <= -1) throw new Error('Rate must be greater than -1');

  return cashFlows.reduce((acc, cf, i) => {
    return acc + cf / Math.pow(1 + rate, i);
  }, 0);
}

/**
 * Internal Rate of Return using Newton's method.
 * @param cashFlows - Array of cash flows, where index 0 is the initial investment (usually negative)
 * @param guess - Initial guess for IRR (default 0.1)
 * @returns Internal rate of return
 */
export function irr(cashFlows: number[], guess: number = 0.1): number {
  if (cashFlows.length < 2) throw new Error('Cash flows must have at least 2 values');

  const maxIterations = 1000;
  const tolerance = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let fValue = 0;
    let fDerivative = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const denominator = Math.pow(1 + rate, j);
      fValue += cashFlows[j] / denominator;
      if (j > 0) {
        fDerivative -= (j * cashFlows[j]) / Math.pow(1 + rate, j + 1);
      }
    }

    if (Math.abs(fDerivative) < 1e-12) {
      throw new Error('IRR calculation failed: derivative too small');
    }

    const newRate = rate - fValue / fDerivative;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  throw new Error('IRR calculation did not converge');
}
