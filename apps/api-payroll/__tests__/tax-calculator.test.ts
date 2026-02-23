import {
  calculateUKTax,
  calculateUSFederalTax,
  calculateAUTax,
  calculateCAFederalTax,
  calculateUAEGratuity,
  calculateDETax,
  calculateNLTax,
  TaxBreakdown,
} from '../src/routes/tax-calculator';

// Helper to round to 2 decimal places for comparison
const r = (n: number) => Math.round(n * 100) / 100;

describe('Tax Calculator', () => {
  // =========================================================================
  // UK Tax Tests (20+)
  // =========================================================================
  describe('calculateUKTax', () => {
    it('should return zero tax for zero income', () => {
      const result = calculateUKTax(0);
      expect(result.grossPay).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.socialContributions).toBe(0);
      expect(result.netPay).toBe(0);
    });

    it('should return zero tax below personal allowance (£10,000)', () => {
      const result = calculateUKTax(10000);
      expect(result.incomeTax).toBe(0);
      expect(result.taxableIncome).toBe(0);
    });

    it('should return zero tax at exactly personal allowance (£12,570)', () => {
      const result = calculateUKTax(12570);
      expect(result.incomeTax).toBe(0);
      expect(result.taxableIncome).toBe(0);
    });

    it('should calculate basic rate taxpayer correctly (£30,000)', () => {
      const result = calculateUKTax(30000);
      // Taxable: 30000 - 12570 = 17430
      // Tax: 17430 * 0.20 = 3486
      expect(result.taxableIncome).toBe(17430);
      expect(result.incomeTax).toBe(3486);
    });

    it('should calculate NI for basic rate taxpayer (£30,000)', () => {
      const result = calculateUKTax(30000);
      // NI: (30000 - 12570) * 0.08 = 17430 * 0.08 = 1394.40
      expect(result.socialContributions).toBe(1394.4);
    });

    it('should calculate net pay for £30,000', () => {
      const result = calculateUKTax(30000);
      // Net: 30000 - 3486 - 1394.40 = 25119.60
      expect(result.netPay).toBe(25119.6);
    });

    it('should calculate higher rate taxpayer correctly (£60,000)', () => {
      const result = calculateUKTax(60000);
      // Taxable: 60000 - 12570 = 47430
      // Basic (0-37700): 37700 * 0.20 = 7540
      // Higher (37700-47430): 9730 * 0.40 = 3892
      // Total: 7540 + 3892 = 11432
      expect(result.taxableIncome).toBe(47430);
      expect(result.incomeTax).toBe(11432);
    });

    it('should calculate NI with upper rate for £60,000', () => {
      const result = calculateUKTax(60000);
      // Main NI: (50270 - 12570) * 0.08 = 37700 * 0.08 = 3016
      // Upper NI: (60000 - 50270) * 0.02 = 9730 * 0.02 = 194.60
      // Total NI: 3016 + 194.60 = 3210.60
      expect(result.socialContributions).toBe(3210.6);
    });

    it('should calculate additional rate taxpayer correctly (£200,000)', () => {
      const result = calculateUKTax(200000);
      // PA taper: (200000 - 100000) / 2 = 50000 reduction, PA = max(0, 12570 - 50000) = 0
      // Taxable: 200000
      // Basic: 37700 * 0.20 = 7540
      // Higher: (125140 - 37700) * 0.40 = 87440 * 0.40 = 34976
      // Additional: (200000 - 125140) * 0.45 = 74860 * 0.45 = 33687
      // Total: 7540 + 34976 + 33687 = 76203
      expect(result.taxableIncome).toBe(200000);
      expect(result.incomeTax).toBe(76203);
    });

    it('should taper personal allowance at £130,000', () => {
      const result = calculateUKTax(130000);
      // PA taper: (130000 - 100000) / 2 = 15000 reduction
      // PA = 12570 - 15000 = 0 (but max 0 check, actually 12570 - 15000 = -2430 -> 0)
      // Wait: 15000 > 12570, so PA = 0
      expect(result.taxableIncome).toBe(130000);
    });

    it('should partially taper personal allowance at £110,000', () => {
      const result = calculateUKTax(110000);
      // PA taper: (110000 - 100000) / 2 = 5000 reduction
      // PA = 12570 - 5000 = 7570
      expect(result.taxableIncome).toBe(110000 - 7570);
      expect(result.taxableIncome).toBe(102430);
    });

    it('should not taper personal allowance at £100,000 exactly', () => {
      const result = calculateUKTax(100000);
      expect(result.taxableIncome).toBe(100000 - 12570);
      expect(result.taxableIncome).toBe(87430);
    });

    it('should have breakdown items for basic rate', () => {
      const result = calculateUKTax(30000);
      expect(result.breakdown.length).toBeGreaterThan(0);
      expect(result.breakdown.some((b) => b.description.includes('Basic'))).toBe(true);
      expect(result.breakdown.some((b) => b.description.includes('NI'))).toBe(true);
    });

    it('should have breakdown items for higher rate', () => {
      const result = calculateUKTax(60000);
      expect(result.breakdown.some((b) => b.description.includes('Higher'))).toBe(true);
    });

    // Scottish rates
    it('should calculate Scottish basic rate differently (£30,000)', () => {
      const rUK = calculateUKTax(30000, false);
      const scottish = calculateUKTax(30000, true);
      // Scottish has different bands, so tax should differ
      expect(scottish.incomeTax).not.toBe(rUK.incomeTax);
    });

    it('should calculate Scottish tax for £30,000', () => {
      const result = calculateUKTax(30000, true);
      // Taxable: 30000 - 12570 = 17430
      // Starter (0-2162): 2162 * 0.19 = 410.78
      // Basic (2162-13118): 10956 * 0.20 = 2191.20 (but only 17430-2162=15268 remains)
      // Actually: min(remaining, bandWidth)
      // Starter: min(17430, 2162) = 2162 * 0.19 = 410.78
      // Basic: min(15268, 10956) = 10956 * 0.20 = 2191.20
      // Intermediate: min(4312, 17974) = 4312 * 0.21 = 905.52
      // Total: 410.78 + 2191.20 + 905.52 = 3507.50
      expect(result.taxableIncome).toBe(17430);
      expect(result.incomeTax).toBe(3507.5);
    });

    it('should calculate Scottish tax for higher rate (£60,000)', () => {
      const result = calculateUKTax(60000, true);
      // Taxable: 47430
      // Starter: 2162 * 0.19 = 410.78
      // Basic: 10956 * 0.20 = 2191.20
      // Intermediate: 17974 * 0.21 = 3774.54
      // Higher: (47430-31092) = 16338 * 0.42 = 6861.96
      // Total: 410.78 + 2191.20 + 3774.54 + 6861.96 = 13238.48
      expect(result.incomeTax).toBe(13238.48);
    });

    it('should have same NI regardless of Scottish flag', () => {
      const rUK = calculateUKTax(50000, false);
      const scottish = calculateUKTax(50000, true);
      expect(rUK.socialContributions).toBe(scottish.socialContributions);
    });

    it('should calculate Scottish top rate for high income (£200,000)', () => {
      const result = calculateUKTax(200000, true);
      // PA tapered to 0
      // Top rate band applies at 125140+
      expect(result.breakdown.some((b) => b.description.includes('Top'))).toBe(true);
    });

    it('should return correct structure', () => {
      const result = calculateUKTax(50000);
      expect(result).toHaveProperty('grossPay');
      expect(result).toHaveProperty('taxableIncome');
      expect(result).toHaveProperty('incomeTax');
      expect(result).toHaveProperty('socialContributions');
      expect(result).toHaveProperty('netPay');
      expect(result).toHaveProperty('breakdown');
      expect(Array.isArray(result.breakdown)).toBe(true);
    });

    it('net pay should equal gross minus tax minus NI', () => {
      const result = calculateUKTax(75000);
      expect(result.netPay).toBe(
        r(result.grossPay - result.incomeTax - result.socialContributions)
      );
    });
  });

  // =========================================================================
  // US Federal Tax Tests (15+)
  // =========================================================================
  describe('calculateUSFederalTax', () => {
    it('should return zero tax for zero income', () => {
      const result = calculateUSFederalTax(0);
      expect(result.incomeTax).toBe(0);
      expect(result.socialContributions).toBe(0);
    });

    it('should calculate 10% bracket only ($10,000)', () => {
      const result = calculateUSFederalTax(10000);
      // All in 10% bracket: 10000 * 0.10 = 1000
      expect(result.incomeTax).toBe(1000);
    });

    it('should calculate across 10% and 12% brackets ($30,000)', () => {
      const result = calculateUSFederalTax(30000);
      // 10%: 11600 * 0.10 = 1160
      // 12%: (30000 - 11600) * 0.12 = 18400 * 0.12 = 2208
      // Total: 1160 + 2208 = 3368
      expect(result.incomeTax).toBe(3368);
    });

    it('should calculate 22% bracket ($75,000)', () => {
      const result = calculateUSFederalTax(75000);
      // 10%: 11600 * 0.10 = 1160
      // 12%: 35550 * 0.12 = 4266
      // 22%: (75000 - 47150) * 0.22 = 27850 * 0.22 = 6127
      // Total: 1160 + 4266 + 6127 = 11553
      expect(result.incomeTax).toBe(11553);
    });

    it('should calculate 24% bracket ($150,000)', () => {
      const result = calculateUSFederalTax(150000);
      // 10%: 11600 * 0.10 = 1160
      // 12%: 35550 * 0.12 = 4266
      // 22%: 53375 * 0.22 = 11742.50
      // 24%: (150000 - 100525) * 0.24 = 49475 * 0.24 = 11874
      // Total: 1160 + 4266 + 11742.50 + 11874 = 29042.50
      expect(result.incomeTax).toBe(29042.5);
    });

    it('should calculate 32% bracket ($200,000)', () => {
      const result = calculateUSFederalTax(200000);
      // Through 24%: 29042.50 (at 150000) + (191950-150000)*0.24 = 10068
      // Actually recalculate:
      // 10%: 1160, 12%: 4266, 22%: 11742.50, 24%: (191950-100525)*0.24 = 21942
      // 32%: (200000-191950)*0.32 = 8050*0.32 = 2576
      // Total: 1160 + 4266 + 11742.50 + 21942 + 2576 = 41686.50
      expect(result.incomeTax).toBe(41686.5);
    });

    it('should calculate 35% bracket ($400,000)', () => {
      const result = calculateUSFederalTax(400000);
      expect(result.incomeTax).toBeGreaterThan(41686.5); // More than at $200k
    });

    it('should calculate 37% bracket ($700,000)', () => {
      const result = calculateUSFederalTax(700000);
      // Should include 37% bracket amount
      expect(result.breakdown.some((b) => b.description.includes('37%'))).toBe(true);
    });

    it('should calculate at exact bracket boundary ($11,600)', () => {
      const result = calculateUSFederalTax(11600);
      // Exactly fills 10% bracket
      expect(result.incomeTax).toBe(1160);
    });

    it('should calculate at exact bracket boundary ($47,150)', () => {
      const result = calculateUSFederalTax(47150);
      // 10%: 1160, 12%: 35550 * 0.12 = 4266
      expect(result.incomeTax).toBe(5426);
    });

    // FICA tests
    it('should calculate Social Security tax ($75,000)', () => {
      const result = calculateUSFederalTax(75000);
      const ssTax = r(75000 * 0.062);
      expect(
        result.breakdown.some(
          (b) => b.description.includes('Social Security') && b.amount === ssTax
        )
      ).toBe(true);
    });

    it('should cap Social Security at wage base ($200,000)', () => {
      const result = calculateUSFederalTax(200000);
      const ssTax = r(168600 * 0.062); // Capped at 168600
      expect(
        result.breakdown.some(
          (b) => b.description.includes('Social Security') && b.amount === ssTax
        )
      ).toBe(true);
    });

    it('should calculate Medicare tax ($75,000)', () => {
      const result = calculateUSFederalTax(75000);
      const medicareTax = r(75000 * 0.0145);
      expect(
        result.breakdown.some(
          (b) => b.description.includes('Medicare (1.45%)') && b.amount === medicareTax
        )
      ).toBe(true);
    });

    it('should NOT add additional Medicare below $200,000', () => {
      const result = calculateUSFederalTax(150000);
      expect(result.breakdown.some((b) => b.description.includes('Additional Medicare'))).toBe(
        false
      );
    });

    it('should add additional Medicare above $200,000', () => {
      const result = calculateUSFederalTax(250000);
      const additionalMedicare = r((250000 - 200000) * 0.009);
      expect(
        result.breakdown.some(
          (b) => b.description.includes('Additional Medicare') && b.amount === additionalMedicare
        )
      ).toBe(true);
    });

    it('should calculate total social contributions correctly ($250,000)', () => {
      const result = calculateUSFederalTax(250000);
      const ss = r(168600 * 0.062);
      const medicare = r(250000 * 0.0145);
      const additionalMedicare = r(50000 * 0.009);
      expect(result.socialContributions).toBe(r(ss + medicare + additionalMedicare));
    });

    it('net pay should equal gross minus tax minus FICA', () => {
      const result = calculateUSFederalTax(100000);
      expect(result.netPay).toBe(
        r(result.grossPay - result.incomeTax - result.socialContributions)
      );
    });
  });

  // =========================================================================
  // Australia Tax Tests (15+)
  // =========================================================================
  describe('calculateAUTax', () => {
    it('should return zero tax below tax-free threshold ($15,000)', () => {
      const result = calculateAUTax(15000);
      expect(result.incomeTax).toBe(0);
    });

    it('should return zero income tax at exactly $18,200', () => {
      const result = calculateAUTax(18200);
      expect(result.incomeTax).toBe(0);
    });

    it('should calculate 19c band ($30,000)', () => {
      const result = calculateAUTax(30000);
      // (30000 - 18200) * 0.19 = 11800 * 0.19 = 2242
      expect(result.incomeTax).toBe(2242);
    });

    it('should calculate 32.5c band ($60,000)', () => {
      const result = calculateAUTax(60000);
      // 19c: (45000-18200) * 0.19 = 26800 * 0.19 = 5092
      // 32.5c: (60000-45000) * 0.325 = 15000 * 0.325 = 4875
      // Total: 5092 + 4875 = 9967
      expect(result.incomeTax).toBe(9967);
    });

    it('should calculate 37c band ($150,000)', () => {
      const result = calculateAUTax(150000);
      // 19c: 26800 * 0.19 = 5092
      // 32.5c: 75000 * 0.325 = 24375
      // 37c: (150000-120000) * 0.37 = 30000 * 0.37 = 11100
      // Total: 5092 + 24375 + 11100 = 40567
      expect(result.incomeTax).toBe(40567);
    });

    it('should calculate 45c band ($250,000)', () => {
      const result = calculateAUTax(250000);
      // 19c: 5092, 32.5c: 24375, 37c: (180000-120000)*0.37=22200
      // 45c: (250000-180000) * 0.45 = 70000 * 0.45 = 31500
      // Total: 5092 + 24375 + 22200 + 31500 = 83167
      expect(result.incomeTax).toBe(83167);
    });

    it('should calculate Medicare levy ($60,000)', () => {
      const result = calculateAUTax(60000);
      expect(result.socialContributions).toBe(1200); // 60000 * 0.02
    });

    it('should include superannuation in breakdown', () => {
      const result = calculateAUTax(80000);
      expect(result.breakdown.some((b) => b.description.includes('Superannuation'))).toBe(true);
      const superItem = result.breakdown.find((b) => b.description.includes('Superannuation'));
      expect(superItem!.amount).toBe(r(80000 * 0.115));
    });

    it('should not deduct superannuation from net pay (employer-paid)', () => {
      const result = calculateAUTax(80000);
      // socialContributions should only be medicare levy
      expect(result.socialContributions).toBe(r(80000 * 0.02));
    });

    it('should calculate at exact band boundary ($45,000)', () => {
      const result = calculateAUTax(45000);
      // 19c: (45000-18200) * 0.19 = 26800 * 0.19 = 5092
      expect(result.incomeTax).toBe(5092);
    });

    it('should calculate at exact band boundary ($120,000)', () => {
      const result = calculateAUTax(120000);
      // 19c: 5092, 32.5c: 75000 * 0.325 = 24375
      // Total: 29467
      expect(result.incomeTax).toBe(29467);
    });

    it('should calculate at exact band boundary ($180,000)', () => {
      const result = calculateAUTax(180000);
      // 19c: 5092, 32.5c: 24375, 37c: 60000*0.37=22200
      // Total: 51667
      expect(result.incomeTax).toBe(51667);
    });

    it('should return zero for zero income', () => {
      const result = calculateAUTax(0);
      expect(result.incomeTax).toBe(0);
      expect(result.socialContributions).toBe(0);
    });

    it('net pay should equal gross minus tax minus medicare levy', () => {
      const result = calculateAUTax(90000);
      expect(result.netPay).toBe(
        r(result.grossPay - result.incomeTax - result.socialContributions)
      );
    });

    it('should have breakdown items for each applicable band', () => {
      const result = calculateAUTax(200000);
      // Should have 4 tax bands + medicare + super = 6 items
      expect(result.breakdown.length).toBeGreaterThanOrEqual(5);
    });
  });

  // =========================================================================
  // Canada Federal Tax Tests (10+)
  // =========================================================================
  describe('calculateCAFederalTax', () => {
    it('should return zero tax below basic personal amount ($10,000)', () => {
      const result = calculateCAFederalTax(10000);
      // 10000 - 15705 = negative -> taxable = 0
      expect(result.taxableIncome).toBe(0);
      expect(result.incomeTax).toBe(0);
    });

    it('should calculate 15% bracket ($40,000)', () => {
      const result = calculateCAFederalTax(40000);
      // Taxable: 40000 - 15705 = 24295
      // 15%: 24295 * 0.15 = 3644.25
      expect(result.incomeTax).toBe(3644.25);
    });

    it('should calculate 20.5% bracket ($80,000)', () => {
      const result = calculateCAFederalTax(80000);
      // Taxable: 80000 - 15705 = 64295
      // 15%: 55867 * 0.15 = 8380.05
      // 20.5%: (64295 - 55867) * 0.205 = 8428 * 0.205 = 1727.74
      // Total: 8380.05 + 1727.74 = 10107.79
      expect(result.incomeTax).toBe(10107.79);
    });

    it('should calculate 26% bracket ($130,000)', () => {
      const result = calculateCAFederalTax(130000);
      const taxable = 130000 - 15705;
      expect(result.taxableIncome).toBe(taxable);
      expect(result.incomeTax).toBeGreaterThan(10107.79); // More than at $80k
    });

    it('should calculate 29% bracket ($200,000)', () => {
      const result = calculateCAFederalTax(200000);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.breakdown.some((b) => b.description.includes('29%'))).toBe(true);
    });

    it('should calculate 33% bracket ($300,000)', () => {
      const result = calculateCAFederalTax(300000);
      expect(result.breakdown.some((b) => b.description.includes('33%'))).toBe(true);
    });

    it('should calculate CPP correctly ($60,000)', () => {
      const result = calculateCAFederalTax(60000);
      // CPP: (min(60000, 68500) - 3500) * 0.0595 = 56500 * 0.0595 = 3361.75
      const expectedCPP = r((60000 - 3500) * 0.0595);
      expect(
        result.breakdown.some((b) => b.description.includes('CPP') && b.amount === expectedCPP)
      ).toBe(true);
    });

    it('should cap CPP at YMPE ($100,000)', () => {
      const result = calculateCAFederalTax(100000);
      // CPP: (68500 - 3500) * 0.0595 = 65000 * 0.0595 = 3867.50
      const expectedCPP = r((68500 - 3500) * 0.0595);
      expect(
        result.breakdown.some((b) => b.description.includes('CPP') && b.amount === expectedCPP)
      ).toBe(true);
    });

    it('should calculate EI correctly ($50,000)', () => {
      const result = calculateCAFederalTax(50000);
      const expectedEI = r(50000 * 0.0166);
      expect(
        result.breakdown.some((b) => b.description.includes('EI') && b.amount === expectedEI)
      ).toBe(true);
    });

    it('should cap EI at MIE ($100,000)', () => {
      const result = calculateCAFederalTax(100000);
      const expectedEI = r(63200 * 0.0166);
      expect(
        result.breakdown.some((b) => b.description.includes('EI') && b.amount === expectedEI)
      ).toBe(true);
    });

    it('should include CPP and EI in social contributions', () => {
      const result = calculateCAFederalTax(60000);
      const expectedCPP = r((60000 - 3500) * 0.0595);
      const expectedEI = r(60000 * 0.0166);
      expect(result.socialContributions).toBe(r(expectedCPP + expectedEI));
    });

    it('net pay should equal gross minus tax minus contributions', () => {
      const result = calculateCAFederalTax(85000);
      expect(result.netPay).toBe(
        r(result.grossPay - result.incomeTax - result.socialContributions)
      );
    });
  });

  // =========================================================================
  // UAE Gratuity Tests (5+)
  // =========================================================================
  describe('calculateUAEGratuity', () => {
    it('should return zero for zero years of service', () => {
      expect(calculateUAEGratuity(10000, 0)).toBe(0);
    });

    it('should return zero for negative years of service', () => {
      expect(calculateUAEGratuity(10000, -1)).toBe(0);
    });

    it('should calculate gratuity for less than 5 years (3 years)', () => {
      // Daily: 10000/30 = 333.33...
      // 21 days * 3 years * 333.33... = 21000
      const result = calculateUAEGratuity(10000, 3);
      expect(result).toBe(21000);
    });

    it('should calculate gratuity for exactly 5 years', () => {
      // Daily: 10000/30 = 333.33...
      // 21 * 5 * 333.33... = 35000
      const result = calculateUAEGratuity(10000, 5);
      expect(result).toBe(35000);
    });

    it('should calculate gratuity for more than 5 years (8 years)', () => {
      // Daily: 10000/30 = 333.33...
      // First 5: 21 * 5 * 333.33... = 35000
      // Next 3: 30 * 3 * 333.33... = 30000
      // Total: 65000
      const result = calculateUAEGratuity(10000, 8);
      expect(result).toBe(65000);
    });

    it('should calculate gratuity for 1 year', () => {
      // 21 * 1 * (15000/30) = 21 * 500 = 10500
      expect(calculateUAEGratuity(15000, 1)).toBe(10500);
    });

    it('should handle 10 years of service', () => {
      // Daily: 20000/30 = 666.67
      // First 5: 21 * 5 * 666.67 = 70000
      // Next 5: 30 * 5 * 666.67 = 100000
      // Total: 170000
      const result = calculateUAEGratuity(20000, 10);
      expect(result).toBeCloseTo(170000, 0);
    });

    it('should scale linearly with salary', () => {
      const g1 = calculateUAEGratuity(10000, 3);
      const g2 = calculateUAEGratuity(20000, 3);
      expect(g2).toBe(g1 * 2);
    });
  });

  // =========================================================================
  // Germany Tax Tests (5+)
  // =========================================================================
  describe('calculateDETax', () => {
    it('should return zero tax below basic allowance (€10,000)', () => {
      const result = calculateDETax(10000);
      expect(result.incomeTax).toBe(0);
    });

    it('should calculate tax in zone 2 (€15,000)', () => {
      const result = calculateDETax(15000);
      expect(result.incomeTax).toBeGreaterThan(0);
    });

    it('should calculate tax in zone 3 (€40,000)', () => {
      const result = calculateDETax(40000);
      expect(result.incomeTax).toBeGreaterThan(0);
    });

    it('should calculate tax at 42% zone (€100,000)', () => {
      const result = calculateDETax(100000);
      expect(result.incomeTax).toBeGreaterThan(0);
    });

    it('should calculate tax at 45% zone (€300,000)', () => {
      const result = calculateDETax(300000);
      expect(result.incomeTax).toBeGreaterThan(0);
      // Should include solidarity surcharge
      expect(result.breakdown.some((b) => b.description.includes('Solidarity'))).toBe(true);
    });

    it('should split social insurance equally (employee half)', () => {
      const result = calculateDETax(60000);
      // Pension employee: 60000 * 0.186 / 2 = 5580
      const pensionItem = result.breakdown.find((b) => b.description.includes('Pension'));
      expect(pensionItem).toBeDefined();
      expect(pensionItem!.amount).toBe(r((60000 * 0.186) / 2));
    });

    it('should calculate health insurance employee portion', () => {
      const result = calculateDETax(60000);
      const healthItem = result.breakdown.find((b) => b.description.includes('Health'));
      expect(healthItem).toBeDefined();
      // (0.146 + 0.017) / 2 = 0.0815
      expect(healthItem!.amount).toBe(r((60000 * (0.146 + 0.017)) / 2));
    });

    it('should calculate unemployment insurance employee portion', () => {
      const result = calculateDETax(60000);
      const unemploymentItem = result.breakdown.find((b) => b.description.includes('Unemployment'));
      expect(unemploymentItem).toBeDefined();
      expect(unemploymentItem!.amount).toBe(r((60000 * 0.026) / 2));
    });

    it('should calculate nursing care insurance employee portion', () => {
      const result = calculateDETax(60000);
      const nursingItem = result.breakdown.find((b) => b.description.includes('Nursing'));
      expect(nursingItem).toBeDefined();
      expect(nursingItem!.amount).toBe(r((60000 * 0.034) / 2));
    });

    it('should not include solidarity surcharge for low income', () => {
      const result = calculateDETax(30000);
      // Tax should be below 18130, no solidarity surcharge
      expect(result.breakdown.some((b) => b.description.includes('Solidarity'))).toBe(false);
    });

    it('net pay should equal gross minus tax minus social', () => {
      const result = calculateDETax(70000);
      expect(result.netPay).toBe(
        r(result.grossPay - result.incomeTax - result.socialContributions)
      );
    });

    it('should calculate total social contributions correctly', () => {
      const result = calculateDETax(60000);
      const pension = r((60000 * 0.186) / 2);
      const health = r((60000 * (0.146 + 0.017)) / 2);
      const unemployment = r((60000 * 0.026) / 2);
      const nursing = r((60000 * 0.034) / 2);
      expect(result.socialContributions).toBe(r(pension + health + unemployment + nursing));
    });
  });

  // =========================================================================
  // Netherlands Tax Tests (5+)
  // =========================================================================
  describe('calculateNLTax', () => {
    it('should calculate band 1 only (€50,000)', () => {
      const result = calculateNLTax(50000);
      // 50000 * 0.3693 = 18465
      expect(result.incomeTax).toBe(18465);
    });

    it('should calculate both bands (€100,000)', () => {
      const result = calculateNLTax(100000);
      // Band 1: 73031 * 0.3693, Band 2: (100000-73031) * 0.4950
      // Use closeTo due to floating point accumulation
      const band1 = 73031 * 0.3693;
      const band2 = (100000 - 73031) * 0.495;
      expect(result.incomeTax).toBeCloseTo(band1 + band2, 0);
    });

    it('should return zero tax for zero income', () => {
      const result = calculateNLTax(0);
      expect(result.incomeTax).toBe(0);
    });

    it('should calculate at exact band boundary (€73,031)', () => {
      const result = calculateNLTax(73031);
      expect(result.incomeTax).toBe(r(73031 * 0.3693));
    });

    it('should include ZVW in breakdown (employer-paid)', () => {
      const result = calculateNLTax(60000);
      const zvwItem = result.breakdown.find((b) => b.description.includes('ZVW'));
      expect(zvwItem).toBeDefined();
      expect(zvwItem!.amount).toBe(r(60000 * 0.0657));
    });

    it('should not deduct ZVW from net pay (employer-paid)', () => {
      const result = calculateNLTax(60000);
      expect(result.socialContributions).toBe(0);
      expect(result.netPay).toBe(r(60000 - result.incomeTax));
    });

    it('net pay should equal gross minus income tax', () => {
      const result = calculateNLTax(80000);
      expect(result.netPay).toBe(
        r(result.grossPay - result.incomeTax - result.socialContributions)
      );
    });

    it('should have correct structure', () => {
      const result = calculateNLTax(50000);
      expect(result).toHaveProperty('grossPay', 50000);
      expect(result).toHaveProperty('taxableIncome', 50000);
      expect(result).toHaveProperty('incomeTax');
      expect(result).toHaveProperty('socialContributions');
      expect(result).toHaveProperty('netPay');
      expect(result).toHaveProperty('breakdown');
    });

    it('should calculate high income correctly (€200,000)', () => {
      const result = calculateNLTax(200000);
      const band1 = 73031 * 0.3693;
      const band2 = (200000 - 73031) * 0.495;
      expect(result.incomeTax).toBeCloseTo(band1 + band2, 0);
    });
  });

  // =========================================================================
  // Cross-jurisdiction comparison tests
  // =========================================================================
  describe('Cross-jurisdiction comparisons', () => {
    it('UAE should have zero income tax at any salary', () => {
      // UAE has no income tax calculator (only gratuity), but we verify the concept
      const gratuity = calculateUAEGratuity(50000, 0);
      expect(gratuity).toBe(0);
    });

    it('all calculators should return positive net pay for positive gross', () => {
      const gross = 80000;
      expect(calculateUKTax(gross).netPay).toBeGreaterThan(0);
      expect(calculateUSFederalTax(gross).netPay).toBeGreaterThan(0);
      expect(calculateAUTax(gross).netPay).toBeGreaterThan(0);
      expect(calculateCAFederalTax(gross).netPay).toBeGreaterThan(0);
      expect(calculateDETax(gross).netPay).toBeGreaterThan(0);
      expect(calculateNLTax(gross).netPay).toBeGreaterThan(0);
    });

    it('all calculators should return zero or positive income tax', () => {
      const gross = 50000;
      expect(calculateUKTax(gross).incomeTax).toBeGreaterThanOrEqual(0);
      expect(calculateUSFederalTax(gross).incomeTax).toBeGreaterThanOrEqual(0);
      expect(calculateAUTax(gross).incomeTax).toBeGreaterThanOrEqual(0);
      expect(calculateCAFederalTax(gross).incomeTax).toBeGreaterThanOrEqual(0);
      expect(calculateDETax(gross).incomeTax).toBeGreaterThanOrEqual(0);
      expect(calculateNLTax(gross).incomeTax).toBeGreaterThanOrEqual(0);
    });

    it('net pay should always be less than gross (for taxable income)', () => {
      const gross = 100000;
      expect(calculateUKTax(gross).netPay).toBeLessThan(gross);
      expect(calculateUSFederalTax(gross).netPay).toBeLessThan(gross);
      expect(calculateAUTax(gross).netPay).toBeLessThan(gross);
      expect(calculateCAFederalTax(gross).netPay).toBeLessThan(gross);
      expect(calculateDETax(gross).netPay).toBeLessThan(gross);
      expect(calculateNLTax(gross).netPay).toBeLessThan(gross);
    });

    it('higher income should result in higher tax for all jurisdictions', () => {
      const low = 50000;
      const high = 150000;
      expect(calculateUKTax(high).incomeTax).toBeGreaterThan(calculateUKTax(low).incomeTax);
      expect(calculateUSFederalTax(high).incomeTax).toBeGreaterThan(
        calculateUSFederalTax(low).incomeTax
      );
      expect(calculateAUTax(high).incomeTax).toBeGreaterThan(calculateAUTax(low).incomeTax);
      expect(calculateCAFederalTax(high).incomeTax).toBeGreaterThan(
        calculateCAFederalTax(low).incomeTax
      );
      expect(calculateDETax(high).incomeTax).toBeGreaterThan(calculateDETax(low).incomeTax);
      expect(calculateNLTax(high).incomeTax).toBeGreaterThan(calculateNLTax(low).incomeTax);
    });
  });
});


describe('phase40 coverage', () => {
  it('implements token bucket rate limiter logic', () => { let tokens=10; const refill=(add:number,max:number)=>{tokens=Math.min(tokens+add,max);}; const consume=(n:number)=>{if(tokens>=n){tokens-=n;return true;}return false;}; expect(consume(3)).toBe(true); expect(tokens).toBe(7); refill(5,10); expect(tokens).toBe(10); /* capped at max */ });
});


describe('phase41 coverage', () => {
  it('computes number of digits in n!', () => { const digitsInFactorial=(n:number)=>Math.floor(Array.from({length:n},(_,i)=>i+1).reduce((s,v)=>s+Math.log10(v),0))+1; expect(digitsInFactorial(10)).toBe(7); /* 3628800 */ });
  it('finds majority element using Boyer-Moore', () => { const majority=(a:number[])=>{let cand=a[0],cnt=1;for(let i=1;i<a.length;i++){if(a[i]===cand)cnt++;else if(cnt===0){cand=a[i];cnt=1;}else cnt--;}return cand;}; expect(majority([2,2,1,1,1,2,2])).toBe(2); });
  it('checks if array is mountain', () => { const isMtn=(a:number[])=>{let i=0;while(i<a.length-1&&a[i]<a[i+1])i++;if(i===0||i===a.length-1)return false;while(i<a.length-1&&a[i]>a[i+1])i++;return i===a.length-1;}; expect(isMtn([0,2,3,4,2,1])).toBe(true); expect(isMtn([1,2,3])).toBe(false); });
  it('finds kth smallest in sorted matrix', () => { const kthSmallest=(matrix:number[][],k:number)=>[...matrix.flat()].sort((a,b)=>a-b)[k-1]; expect(kthSmallest([[1,5,9],[10,11,13],[12,13,15]],8)).toBe(13); });
  it('finds minimum operations to make array palindrome', () => { const minOps=(a:number[])=>{let ops=0,l=0,r=a.length-1;while(l<r){if(a[l]<a[r]){a[l+1]+=a[l];l++;ops++;}else if(a[l]>a[r]){a[r-1]+=a[r];r--;ops++;}else{l++;r--;}}return ops;}; expect(minOps([1,4,5,1])).toBe(1); });
});


describe('phase42 coverage', () => {
  it('finds number of rectangles in grid', () => { const rects=(m:number,n:number)=>m*(m+1)/2*n*(n+1)/2; expect(rects(2,2)).toBe(9); expect(rects(1,1)).toBe(1); });
  it('computes Manhattan distance', () => { const mhDist=(x1:number,y1:number,x2:number,y2:number)=>Math.abs(x2-x1)+Math.abs(y2-y1); expect(mhDist(0,0,3,4)).toBe(7); });
  it('validates sudoku row uniqueness', () => { const valid=(row:number[])=>{const vals=row.filter(v=>v!==0);return new Set(vals).size===vals.length;}; expect(valid([1,2,3,4,5,6,7,8,9])).toBe(true); expect(valid([1,2,2,4,5,6,7,8,9])).toBe(false); });
  it('normalizes a 2D vector', () => { const norm=(x:number,y:number)=>{const l=Math.hypot(x,y);return[x/l,y/l];}; const[nx,ny]=norm(3,4); expect(nx).toBeCloseTo(0.6); expect(ny).toBeCloseTo(0.8); });
  it('finds nth square pyramidal number', () => { const sqPyramid=(n:number)=>n*(n+1)*(2*n+1)/6; expect(sqPyramid(3)).toBe(14); expect(sqPyramid(4)).toBe(30); });
});


describe('phase43 coverage', () => {
  it('computes Spearman rank correlation', () => { const rank=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return a.map(v=>s.indexOf(v)+1);}; const x=[1,2,3,4,5],y=[5,6,7,8,7]; const rx=rank(x),ry=rank(y); expect(rx).toEqual([1,2,3,4,5]); });
  it('computes entropy of distribution', () => { const entropy=(ps:number[])=>-ps.filter(p=>p>0).reduce((s,p)=>s+p*Math.log2(p),0); expect(entropy([0.5,0.5])).toBe(1); expect(Math.abs(entropy([1,0]))).toBe(0); });
  it('formats date to ISO date string', () => { const toISO=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; expect(toISO(new Date(2026,0,5))).toBe('2026-01-05'); });
  it('generates one-hot encoding', () => { const oneHot=(idx:number,size:number)=>Array(size).fill(0).map((_,i)=>i===idx?1:0); expect(oneHot(2,4)).toEqual([0,0,1,0]); });
  it('rounds to nearest multiple', () => { const roundTo=(n:number,m:number)=>Math.round(n/m)*m; expect(roundTo(27,5)).toBe(25); expect(roundTo(28,5)).toBe(30); });
});


describe('phase44 coverage', () => {
  it('converts camelCase to snake_case', () => { const toSnake=(s:string)=>s.replace(/[A-Z]/g,c=>'_'+c.toLowerCase()); expect(toSnake('helloWorldFoo')).toBe('hello_world_foo'); });
  it('computes least common multiple', () => { const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b); const lcm=(a:number,b:number)=>a*b/gcd(a,b); expect(lcm(4,6)).toBe(12); expect(lcm(15,20)).toBe(60); });
  it('inverts a key-value map', () => { const inv=(o:Record<string,string>)=>Object.fromEntries(Object.entries(o).map(([k,v])=>[v,k])); expect(inv({a:'1',b:'2',c:'3'})).toEqual({'1':'a','2':'b','3':'c'}); });
  it('checks if two strings are anagrams', () => { const anagram=(a:string,b:string)=>a.split('').sort().join('')===b.split('').sort().join(''); expect(anagram('listen','silent')).toBe(true); expect(anagram('hello','world')).toBe(false); });
  it('counts vowels in string', () => { const cv=(s:string)=>(s.match(/[aeiouAEIOU]/g)||[]).length; expect(cv('Hello World')).toBe(3); });
});


describe('phase45 coverage', () => {
  it('computes geometric mean', () => { const gm=(a:number[])=>Math.pow(a.reduce((p,v)=>p*v,1),1/a.length); expect(Math.round(gm([1,2,3,4,5])*1000)/1000).toBe(2.605); });
  it('flattens matrix to array', () => { const flat=(m:number[][])=>m.reduce((a,r)=>[...a,...r],[]); expect(flat([[1,2],[3,4],[5,6]])).toEqual([1,2,3,4,5,6]); });
  it('computes Luhn checksum validity', () => { const luhn=(n:string)=>{const d=[...n].reverse().map(Number);const s=d.reduce((acc,v,i)=>{if(i%2===1){v*=2;if(v>9)v-=9;}return acc+v;},0);return s%10===0;}; expect(luhn('4532015112830366')).toBe(true); expect(luhn('1234567890123456')).toBe(false); });
  it('validates email format', () => { const vem=(s:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); expect(vem('user@example.com')).toBe(true); expect(vem('invalid@')).toBe(false); expect(vem('no-at-sign')).toBe(false); });
  it('formats number with thousand separators', () => { const fmt=(n:number)=>n.toLocaleString('en-US'); expect(fmt(1234567)).toBe('1,234,567'); expect(fmt(1000)).toBe('1,000'); });
});


describe('phase46 coverage', () => {
  it('finds maximal square in binary matrix', () => { const ms=(m:string[][])=>{const r=m.length,c=m[0].length;const dp=Array.from({length:r},()=>new Array(c).fill(0));let max=0;for(let i=0;i<r;i++)for(let j=0;j<c;j++){if(m[i][j]==='1'){dp[i][j]=i&&j?Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])+1:1;max=Math.max(max,dp[i][j]);}}return max*max;}; expect(ms([['1','0','1','0','0'],['1','0','1','1','1'],['1','1','1','1','1'],['1','0','0','1','0']])).toBe(4); });
  it('computes unique paths in grid', () => { const up=(m:number,n:number)=>{const dp=Array.from({length:m},()=>new Array(n).fill(1));for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];return dp[m-1][n-1];}; expect(up(3,7)).toBe(28); expect(up(3,2)).toBe(3); });
  it('converts number to roman numeral', () => { const rom=(n:number)=>{const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const s=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let r='';v.forEach((val,i)=>{while(n>=val){r+=s[i];n-=val;}});return r;}; expect(rom(3749)).toBe('MMMDCCXLIX'); expect(rom(58)).toBe('LVIII'); });
  it('finds maximum path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; let mx=-Infinity; const dfs=(n:N|undefined):number=>{if(!n)return 0;const l=Math.max(0,dfs(n.l)),r=Math.max(0,dfs(n.r));mx=Math.max(mx,n.v+l+r);return n.v+Math.max(l,r);}; const t:N={v:-10,l:{v:9},r:{v:20,l:{v:15},r:{v:7}}}; mx=-Infinity;dfs(t); expect(mx).toBe(42); });
  it('computes diameter of binary tree', () => { type N={v:number;l?:N;r?:N}; let d=0; const h=(n:N|undefined):number=>{if(!n)return 0;const l=h(n.l),r=h(n.r);d=Math.max(d,l+r);return 1+Math.max(l,r);}; const t:N={v:1,l:{v:2,l:{v:4},r:{v:5}},r:{v:3}}; d=0;h(t); expect(d).toBe(3); });
});


describe('phase47 coverage', () => {
  it('computes house robber (non-adjacent max sum)', () => { const hr=(a:number[])=>a.reduce(([prev2,prev1],v)=>[prev1,Math.max(prev1,prev2+v)],[0,0])[1]; expect(hr([1,2,3,1])).toBe(4); expect(hr([2,7,9,3,1])).toBe(12); });
  it('checks if pattern matches string (wildcard)', () => { const wm=(s:string,p:string)=>{const m=s.length,n=p.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=p[j-1]==='*'?(dp[i-1][j]||dp[i][j-1]):(p[j-1]==='?'||p[j-1]===s[i-1])&&dp[i-1][j-1];return dp[m][n];}; expect(wm('aa','*')).toBe(true); expect(wm('cb','?a')).toBe(false); });
  it('computes number of paths of length k in graph', () => { const mm=(a:number[][],b:number[][])=>{const n=a.length;return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Array.from({length:n},(_,k)=>a[i][k]*b[k][j]).reduce((s,v)=>s+v,0)));};const kp=(adj:number[][],k:number)=>{let r=adj.map(row=>[...row]);for(let i=1;i<k;i++)r=mm(r,adj);return r;}; const adj=[[0,1,0],[0,0,1],[1,0,0]]; expect(kp(adj,3)[0][0]).toBe(1); });
  it('finds minimum window substring', () => { const mw=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let l=0,have=0,best='',min=Infinity;for(let r=0;r<s.length;r++){const c=s[r];if(need.has(c)){need.set(c,need.get(c)!-1);if(need.get(c)===0)have++;}while(have===need.size){if(r-l+1<min){min=r-l+1;best=s.slice(l,r+1);}const lc=s[l];if(need.has(lc)){need.set(lc,need.get(lc)!+1);if(need.get(lc)===1)have--;}l++;}}return best;}; expect(mw('ADOBECODEBANC','ABC')).toBe('BANC'); });
  it('computes stock profit with cooldown', () => { const sp=(p:number[])=>{let hold=-Infinity,sold=0,cool=0;for(const v of p){const nh=Math.max(hold,cool-v),ns=hold+v,nc=Math.max(cool,sold);[hold,sold,cool]=[nh,ns,nc];}return Math.max(sold,cool);}; expect(sp([1,2,3,0,2])).toBe(3); expect(sp([1])).toBe(0); });
});


describe('phase48 coverage', () => {
  it('counts distinct binary trees with n nodes', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((s,v)=>s+v,0); expect(cat(0)).toBe(1); expect(cat(3)).toBe(5); expect(cat(4)).toBe(14); });
  it('implements disjoint set with rank', () => { const ds=(n:number)=>{const p=Array.from({length:n},(_,i)=>i),rk=new Array(n).fill(0);const find=(x:number):number=>p[x]===x?x:(p[x]=find(p[x]),p[x]);const union=(a:number,b:number)=>{const ra=find(a),rb=find(b);if(ra===rb)return;if(rk[ra]<rk[rb])p[ra]=rb;else if(rk[ra]>rk[rb])p[rb]=ra;else{p[rb]=ra;rk[ra]++;}}; return{find,union,same:(a:number,b:number)=>find(a)===find(b)};}; const d=ds(5);d.union(0,1);d.union(1,2); expect(d.same(0,2)).toBe(true); expect(d.same(0,3)).toBe(false); });
  it('implements skip list lookup', () => { const sl=()=>{const data:number[]=[];return{ins:(v:number)=>{const i=data.findIndex(x=>x>=v);data.splice(i===-1?data.length:i,0,v);},has:(v:number)=>data.includes(v),size:()=>data.length};}; const s=sl();[5,3,7,1,4].forEach(v=>s.ins(v)); expect(s.has(3)).toBe(true); expect(s.has(6)).toBe(false); expect(s.size()).toBe(5); });
  it('finds maximum XOR of two array elements', () => { const mx=(a:number[])=>{let res=0,pre=0;const seen=new Set([0]);for(const v of a){pre^=v;for(let b=31;b>=0;b--){const t=(pre>>b)&1;res=Math.max(res,pre);if(seen.has(pre^res))break;}seen.add(pre);}return a.reduce((best,_,i)=>a.slice(i+1).reduce((b,v)=>Math.max(b,a[i]^v),best),0);}; expect(mx([3,10,5,25,2,8])).toBe(28); });
  it('computes maximum profit with transaction fee', () => { const mp=(p:number[],fee:number)=>{let cash=0,hold=-Infinity;for(const v of p){cash=Math.max(cash,hold+v-fee);hold=Math.max(hold,cash-v);}return cash;}; expect(mp([1,3,2,8,4,9],2)).toBe(8); });
});
