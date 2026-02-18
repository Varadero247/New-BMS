import { UAETaxResult } from './types';

// GCC nationalities eligible for social security
const GCC_NATIONALITIES = ['UAE', 'SA', 'KW', 'BH', 'OM', 'QA'];

/**
 * Calculate UAE payroll.
 * UAE has 0% personal income tax.
 * End of Service Gratuity applies to all employees.
 * Social security contributions apply only to GCC nationals.
 *
 * @param grossPay - Monthly gross pay in AED
 * @param nationality - ISO country code of the employee
 * @param yearsOfService - Years of completed service
 */
export function calculateUAEPayroll(
  grossPay: number,
  nationality: string = 'OTHER',
  yearsOfService: number = 0
): UAETaxResult {
  // No income tax in UAE
  const tax = 0;

  // End of Service Gratuity (EOSG)
  // First 5 years: 21 days basic salary per year
  // After 5 years: 30 days basic salary per year
  let gratuityDays = 0;
  if (yearsOfService > 0) {
    if (yearsOfService <= 5) {
      gratuityDays = yearsOfService * 21;
    } else {
      gratuityDays = 5 * 21 + (yearsOfService - 5) * 30;
    }
  }
  // Daily rate = monthly / 30
  const dailyRate = grossPay / 30;
  const gratuity = Math.round(dailyRate * gratuityDays * 100) / 100;

  // Social security: 5% employee + 12.5% employer for UAE nationals
  // For other GCC nationals: 5% employee
  let socialSecurity = 0;
  if (GCC_NATIONALITIES.includes(nationality.toUpperCase())) {
    socialSecurity = Math.round(grossPay * 0.05 * 100) / 100;
  }

  const netPay = Math.round((grossPay - tax - socialSecurity) * 100) / 100;

  return {
    grossPay,
    tax,
    gratuity,
    socialSecurity,
    netPay,
  };
}
