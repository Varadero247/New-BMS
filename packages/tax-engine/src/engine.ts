import { TaxConfig, TaxJurisdiction, TaxResult } from './types';
import { calculateUKIncomeTax } from './uk';
import { calculateUAEPayroll } from './uae';
import { calculateAUPayroll } from './australia';
import { calculateUSFederal } from './usa';
import { calculateCAFederal } from './canada';

/**
 * Universal tax calculation dispatcher.
 * Routes to the appropriate jurisdiction calculator.
 *
 * @param jurisdiction - Tax jurisdiction code
 * @param grossPay - Gross pay amount
 * @param options - Additional tax configuration options
 */
export function calculateTax(
  jurisdiction: TaxJurisdiction,
  grossPay: number,
  options: Partial<TaxConfig> = {},
): TaxResult {
  const period = options.period ?? 'annual';

  switch (jurisdiction) {
    case 'UK':
      return calculateUKIncomeTax(grossPay, options.taxCode ?? '1257L', period);
    case 'UAE':
      return calculateUAEPayroll(grossPay, options.nationality ?? 'OTHER', options.yearsOfService ?? 0);
    case 'AU':
      return calculateAUPayroll(grossPay, period);
    case 'US':
      return calculateUSFederal(grossPay, options.filingStatus ?? 'single', period);
    case 'CA':
      return calculateCAFederal(grossPay, period);
    default:
      throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
  }
}
