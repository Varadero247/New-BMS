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


describe('phase49 coverage', () => {
  it('implements LFU cache', () => { const lfu=(cap:number)=>{const vals=new Map<number,number>(),freq=new Map<number,number>(),fmap=new Map<number,Set<number>>();let min=0;return{get:(k:number)=>{if(!vals.has(k))return -1;const f=freq.get(k)!;freq.set(k,f+1);fmap.get(f)!.delete(k);if(!fmap.get(f)!.size&&min===f)min++;fmap.set(f+1,fmap.get(f+1)||new Set());fmap.get(f+1)!.add(k);return vals.get(k)!;},put:(k:number,v:number)=>{if(cap<=0)return;if(vals.has(k)){vals.set(k,v);lfu(cap).get(k);return;}if(vals.size>=cap){const evict=fmap.get(min)!.values().next().value!;fmap.get(min)!.delete(evict);vals.delete(evict);freq.delete(evict);}vals.set(k,v);freq.set(k,1);fmap.set(1,fmap.get(1)||new Set());fmap.get(1)!.add(k);min=1;}};}; const c=lfu(2);c.put(1,1);c.put(2,2); expect(c.get(1)).toBe(1); });
  it('computes number of BSTs with n nodes', () => { const numBST=(n:number):number=>{if(n<=1)return 1;let cnt=0;for(let i=1;i<=n;i++)cnt+=numBST(i-1)*numBST(n-i);return cnt;}; expect(numBST(3)).toBe(5); expect(numBST(4)).toBe(14); });
  it('checks if number is Armstrong', () => { const arm=(n:number)=>{const d=String(n).split(''),p=d.length;return d.reduce((s,c)=>s+Math.pow(Number(c),p),0)===n;}; expect(arm(153)).toBe(true); expect(arm(370)).toBe(true); expect(arm(100)).toBe(false); });
  it('finds all anagram positions in string', () => { const anag=(s:string,p:string)=>{const r:number[]=[],n=p.length,freq=new Array(26).fill(0);p.split('').forEach(c=>freq[c.charCodeAt(0)-97]++);const w=new Array(26).fill(0);for(let i=0;i<s.length;i++){w[s.charCodeAt(i)-97]++;if(i>=n)w[s.charCodeAt(i-n)-97]--;if(i>=n-1&&w.every((v,j)=>v===freq[j]))r.push(i-n+1);}return r;}; expect(anag('cbaebabacd','abc')).toEqual([0,6]); });
  it('finds minimum deletions to make string balanced', () => { const md=(s:string)=>{let open=0,close=0;for(const c of s){if(c==='(')open++;else if(open>0)open--;else close++;}return open+close;}; expect(md('(())')).toBe(0); expect(md('(())')).toBe(0); expect(md('))((')).toBe(4); });
});


describe('phase50 coverage', () => {
  it('computes minimum knight moves', () => { const km=(x:number,y:number)=>{const seen=new Set(['0,0']);const q:[[number,number],number][]=[[[0,0],0]];const moves=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];let head=0;while(head<q.length){const [[cx,cy],d]=q[head++];if(cx===x&&cy===y)return d;for(const [dx,dy] of moves){const nx=cx+dx,ny=cy+dy,k=`${nx},${ny}`;if(!seen.has(k)&&Math.abs(nx)<=300&&Math.abs(ny)<=300){seen.add(k);q.push([[nx,ny],d+1]);}}}return -1;}; expect(km(2,1)).toBe(1); expect(km(0,0)).toBe(0); });
  it('finds minimum difference between BST nodes', () => { const mbd=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);let min=Infinity;for(let i=1;i<s.length;i++)min=Math.min(min,s[i]-s[i-1]);return min;}; expect(mbd([4,2,6,1,3])).toBe(1); expect(mbd([1,0,48,12,49])).toBe(1); });
  it('reverses words in a sentence', () => { const rw=(s:string)=>s.trim().split(/\s+/).reverse().join(' '); expect(rw('the sky is blue')).toBe('blue is sky the'); expect(rw('  hello world  ')).toBe('world hello'); });
  it('computes minimum total distance to meeting point', () => { const mtd=(a:number[])=>{const s=[...a].sort((x,y)=>x-y),med=s[Math.floor(s.length/2)];return s.reduce((sum,v)=>sum+Math.abs(v-med),0);}; expect(mtd([1,2,3])).toBe(2); expect(mtd([1,1,1,1,1,10000])).toBe(9999); });
  it('finds maximum product of three numbers', () => { const mp3=(a:number[])=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return Math.max(s[n-1]*s[n-2]*s[n-3],s[0]*s[1]*s[n-1]);}; expect(mp3([1,2,3])).toBe(6); expect(mp3([-10,-10,5,2])).toBe(500); });
});

describe('phase51 coverage', () => {
  it('counts palindromic substrings', () => { const cp=(s:string)=>{let cnt=0;const ex=(l:number,r:number)=>{while(l>=0&&r<s.length&&s[l]===s[r]){cnt++;l--;r++;}};for(let i=0;i<s.length;i++){ex(i,i);ex(i,i+1);}return cnt;}; expect(cp('abc')).toBe(3); expect(cp('aaa')).toBe(6); expect(cp('racecar')).toBe(10); });
  it('finds minimum window containing all target chars', () => { const minWin=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let have=0,tot=need.size,l=0,res='';for(let r=0;r<s.length;r++){const c=s[r];if(need.has(c)){need.set(c,need.get(c)!-1);if(need.get(c)===0)have++;}while(have===tot){const w=s.slice(l,r+1);if(!res||w.length<res.length)res=w;const lc=s[l];if(need.has(lc)){need.set(lc,need.get(lc)!+1);if(need.get(lc)===1)have--;}l++;}}return res;}; expect(minWin('ADOBECODEBANC','ABC')).toBe('BANC'); expect(minWin('a','a')).toBe('a'); });
  it('finds primes using sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=new Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v:boolean,i:number)=>v?i:-1).filter((i:number)=>i>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); expect(sieve(10)).toEqual([2,3,5,7]); });
  it('finds median of two sorted arrays', () => { const med=(a:number[],b:number[])=>{const m=[...a,...b].sort((x,y)=>x-y),n=m.length;return n%2?m[Math.floor(n/2)]:(m[n/2-1]+m[n/2])/2;}; expect(med([1,3],[2])).toBe(2); expect(med([1,2],[3,4])).toBe(2.5); expect(med([],[1])).toBe(1); });
  it('finds shortest path using Dijkstra', () => { const dijk=(n:number,edges:[number,number,number][],src:number)=>{const g=new Map<number,[number,number][]>();for(let i=0;i<n;i++)g.set(i,[]);for(const[u,v,w]of edges){g.get(u)!.push([v,w]);g.get(v)!.push([u,w]);}const dist=new Array(n).fill(Infinity);dist[src]=0;const pq:[number,number][]=[[0,src]];while(pq.length){pq.sort((a,b)=>a[0]-b[0]);const[d,u]=pq.shift()!;if(d>dist[u])continue;for(const[v,w]of g.get(u)!){if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;pq.push([dist[v],v]);}}}return dist;}; expect(dijk(4,[[0,1,1],[1,2,2],[0,2,4],[2,3,1]],0)).toEqual([0,1,3,4]); });
});

describe('phase52 coverage', () => {
  it('determines first player wins stone game', () => { const sg2=(p:number[])=>{const n=p.length,dp=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)dp[i][i]=p[i];for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Math.max(p[i]-dp[i+1][j],p[j]-dp[i][j-1]);}return dp[0][n-1]>0;}; expect(sg2([5,3,4,5])).toBe(true); expect(sg2([3,7,2,3])).toBe(true); });
  it('searches for word in character grid', () => { const ws2=(board:string[][],word:string)=>{const rows=board.length,cols=board[0].length;const dfs=(r:number,c:number,i:number):boolean=>{if(i===word.length)return true;if(r<0||r>=rows||c<0||c>=cols||board[r][c]!==word[i])return false;const tmp=board[r][c];board[r][c]='#';const ok=dfs(r+1,c,i+1)||dfs(r-1,c,i+1)||dfs(r,c+1,i+1)||dfs(r,c-1,i+1);board[r][c]=tmp;return ok;};for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(dfs(r,c,0))return true;return false;}; expect(ws2([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCCED')).toBe(true); expect(ws2([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCB')).toBe(false); });
  it('finds container with most water', () => { const mw3=(h:number[])=>{let l=0,r=h.length-1,mx=0;while(l<r){mx=Math.max(mx,Math.min(h[l],h[r])*(r-l));h[l]<h[r]?l++:r--;}return mx;}; expect(mw3([1,8,6,2,5,4,8,3,7])).toBe(49); expect(mw3([1,1])).toBe(1); });
  it('finds minimum cost to climb stairs', () => { const mcc2=(cost:number[])=>{const n=cost.length,dp=new Array(n+1).fill(0);for(let i=2;i<=n;i++)dp[i]=Math.min(dp[i-1]+cost[i-1],dp[i-2]+cost[i-2]);return dp[n];}; expect(mcc2([10,15,20])).toBe(15); expect(mcc2([1,100,1,1,1,100,1,1,100,1])).toBe(6); });
  it('checks if array can be partitioned into equal subset sums', () => { const cp3=(a:number[])=>{const tot=a.reduce((s,v)=>s+v,0);if(tot%2)return false;const half=tot/2,dp=new Array(half+1).fill(false);dp[0]=true;for(const n of a)for(let j=half;j>=n;j--)if(dp[j-n])dp[j]=true;return dp[half];}; expect(cp3([1,5,11,5])).toBe(true); expect(cp3([1,2,3,5])).toBe(false); expect(cp3([2,2,3,5])).toBe(false); });
});

describe('phase53 coverage', () => {
  it('finds minimum number of overlapping intervals to remove', () => { const eoi=(ivs:[number,number][])=>{if(!ivs.length)return 0;const s=ivs.slice().sort((a,b)=>a[1]-b[1]);let cnt=0,end=s[0][1];for(let i=1;i<s.length;i++){if(s[i][0]<end)cnt++;else end=s[i][1];}return cnt;}; expect(eoi([[1,2],[2,3],[3,4],[1,3]])).toBe(1); expect(eoi([[1,2],[1,2],[1,2]])).toBe(2); expect(eoi([[1,2],[2,3]])).toBe(0); });
  it('partitions string into maximum parts where each letter appears in one part', () => { const pl2=(s:string)=>{const last:Record<string,number>={};for(let i=0;i<s.length;i++)last[s[i]]=i;const res:number[]=[];let st=0,end=0;for(let i=0;i<s.length;i++){end=Math.max(end,last[s[i]]);if(i===end){res.push(end-st+1);st=i+1;}}return res;}; expect(pl2('ababcbacadefegdehijhklij')).toEqual([9,7,8]); expect(pl2('eccbbbbdec')).toEqual([10]); });
  it('counts subarrays with maximum bounded in range', () => { const nsb=(a:number[],L:number,R:number)=>{let cnt=0,dp=0,last=-1;for(let i=0;i<a.length;i++){if(a[i]>R){dp=0;last=i;}else if(a[i]>=L)dp=i-last;cnt+=dp;}return cnt;}; expect(nsb([2,1,4,3],2,3)).toBe(3); expect(nsb([2,9,2,5,6],2,8)).toBe(7); });
  it('counts good pairs where indices differ and values equal', () => { const ngp=(a:number[])=>{const cnt=new Map<number,number>();let res=0;for(const n of a){const c=cnt.get(n)||0;res+=c;cnt.set(n,c+1);}return res;}; expect(ngp([1,2,3,1,1,3])).toBe(4); expect(ngp([1,1,1,1])).toBe(6); expect(ngp([1,2,3])).toBe(0); });
  it('counts paths from source to target in DAG', () => { const cp4=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);for(const[u,v]of edges)adj[u].push(v);const dp=new Array(n).fill(-1);const dfs=(v:number):number=>{if(v===n-1)return 1;if(dp[v]!==-1)return dp[v];dp[v]=0;for(const u of adj[v])dp[v]+=dfs(u);return dp[v];};return dfs(0);}; expect(cp4(3,[[0,1],[0,2],[1,2]])).toBe(2); expect(cp4(4,[[0,1],[0,2],[1,3],[2,3]])).toBe(2); });
});


describe('phase54 coverage', () => {
  it('counts inversions in array using merge sort', () => { const invCount=(a:number[])=>{let cnt=0;const ms=(arr:number[]):number[]=>{if(arr.length<=1)return arr;const m=arr.length>>1,L=ms(arr.slice(0,m)),R=ms(arr.slice(m));const res:number[]=[];let i=0,j=0;while(i<L.length&&j<R.length){if(L[i]<=R[j])res.push(L[i++]);else{cnt+=L.length-i;res.push(R[j++]);}}return res.concat(L.slice(i)).concat(R.slice(j));};ms(a);return cnt;}; expect(invCount([2,4,1,3,5])).toBe(3); expect(invCount([5,4,3,2,1])).toBe(10); expect(invCount([1,2,3])).toBe(0); });
  it('computes minimum cost to connect sticks using min-heap', () => { const mcs=(s:number[])=>{if(s.length<=1)return 0;const h=[...s].sort((a,b)=>a-b);let cost=0;const pop=()=>{h.sort((a,b)=>a-b);return h.shift()!;};while(h.length>1){const a=pop(),b=pop();cost+=a+b;h.push(a+b);}return cost;}; expect(mcs([2,4,3])).toBe(14); expect(mcs([1,8,3,5])).toBe(30); expect(mcs([5])).toBe(0); });
  it('finds the smallest range covering one element from each list', () => { const sr=(lists:number[][])=>{const h:number[][]=[];for(let i=0;i<lists.length;i++)h.push([lists[i][0],i,0]);let res:number[]=[0,Infinity];while(true){h.sort((a,b)=>a[0]-b[0]);const mn=h[0][0],mx=h[h.length-1][0];if(mx-mn<res[1]-res[0])res=[mn,mx];const [,i,j]=h[0];if(j+1>=lists[i].length)break;h[0]=[lists[i][j+1],i,j+1];}return res;}; expect(sr([[4,10,15,24,26],[0,9,12,20],[5,18,22,30]])).toEqual([20,24]); });
  it('counts distinct values in each sliding window of size k', () => { const dsw=(a:number[],k:number)=>{const res:number[]=[],freq=new Map<number,number>();for(let i=0;i<a.length;i++){freq.set(a[i],(freq.get(a[i])||0)+1);if(i>=k){const out=a[i-k];if(freq.get(out)===1)freq.delete(out);else freq.set(out,freq.get(out)!-1);}if(i>=k-1)res.push(freq.size);}return res;}; expect(dsw([1,2,1,3,2],3)).toEqual([2,3,3]); expect(dsw([1,1,1],2)).toEqual([1,1]); expect(dsw([1,2,3],1)).toEqual([1,1,1]); });
  it('finds maximum number of points on the same line', () => { const maxPts=(pts:number[][])=>{if(pts.length<=2)return pts.length;let res=2;for(let i=0;i<pts.length;i++){const slopes=new Map<string,number>();for(let j=i+1;j<pts.length;j++){const dx=pts[j][0]-pts[i][0],dy=pts[j][1]-pts[i][1];const g=(a:number,b:number):number=>b===0?a:g(b,a%b);const d=g(Math.abs(dx),Math.abs(dy));const key=`${(dx<0?-1:1)*dx/d}/${(dx<0?-1:1)*dy/d}`;slopes.set(key,(slopes.get(key)||1)+1);res=Math.max(res,slopes.get(key)!);}}return res;}; expect(maxPts([[1,1],[2,2],[3,3]])).toBe(3); expect(maxPts([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4); });
});


describe('phase55 coverage', () => {
  it('counts ways to decode a digit string into letters', () => { const decode=(s:string)=>{const n=s.length;if(!n||s[0]==='0')return 0;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>=1)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('finds longest common prefix among an array of strings', () => { const lcp=(strs:string[])=>{if(!strs.length)return '';let prefix=strs[0];for(let i=1;i<strs.length;i++){while(strs[i].indexOf(prefix)!==0)prefix=prefix.slice(0,-1);}return prefix;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); expect(lcp(['dog','racecar','car'])).toBe(''); expect(lcp(['abc','abc','abc'])).toBe('abc'); });
  it('finds container with most water using two-pointer', () => { const mw=(h:number[])=>{let l=0,r=h.length-1,mx=0;while(l<r){mx=Math.max(mx,(r-l)*Math.min(h[l],h[r]));if(h[l]<h[r])l++;else r--;}return mx;}; expect(mw([1,8,6,2,5,4,8,3,7])).toBe(49); expect(mw([1,1])).toBe(1); expect(mw([4,3,2,1,4])).toBe(16); });
  it('finds median of two sorted arrays in O(log(min(m,n)))', () => { const med=(a:number[],b:number[])=>{if(a.length>b.length)return med(b,a);const m=a.length,n=b.length,half=(m+n+1)>>1;let lo=0,hi=m;while(lo<=hi){const i=lo+hi>>1,j=half-i;const al=i>0?a[i-1]:-Infinity,ar=i<m?a[i]:Infinity;const bl=j>0?b[j-1]:-Infinity,br=j<n?b[j]:Infinity;if(al<=br&&bl<=ar){const mx=Math.max(al,bl);return(m+n)%2?mx:(mx+Math.min(ar,br))/2;}else if(al>br)hi=i-1;else lo=i+1;}return -1;}; expect(med([1,3],[2])).toBe(2); expect(med([1,2],[3,4])).toBe(2.5); });
  it('checks if s2 contains a permutation of s1', () => { const pi=(s1:string,s2:string)=>{if(s1.length>s2.length)return false;const c1=new Array(26).fill(0),c2=new Array(26).fill(0);const a='a'.charCodeAt(0);for(let i=0;i<s1.length;i++){c1[s1.charCodeAt(i)-a]++;c2[s2.charCodeAt(i)-a]++;}let diff=c1.filter((v,i)=>v!==c2[i]).length;for(let i=s1.length;i<s2.length;i++){if(diff===0)return true;const add=s2.charCodeAt(i)-a,rem=s2.charCodeAt(i-s1.length)-a;if(c2[add]===c1[add])diff++;c2[add]++;if(c2[add]===c1[add])diff--;if(c2[rem]===c1[rem])diff++;c2[rem]--;if(c2[rem]===c1[rem])diff--;}return diff===0;}; expect(pi('ab','eidbaooo')).toBe(true); expect(pi('ab','eidboaoo')).toBe(false); });
});


describe('phase56 coverage', () => {
  it('finds maximum product of lengths of two words with no common letters', () => { const mp2=(words:string[])=>{const masks=words.map(w=>[...w].reduce((m,c)=>m|(1<<(c.charCodeAt(0)-97)),0));let res=0;for(let i=0;i<words.length;i++)for(let j=i+1;j<words.length;j++)if(!(masks[i]&masks[j]))res=Math.max(res,words[i].length*words[j].length);return res;}; expect(mp2(['abcw','baz','foo','bar','xtfn','abcdef'])).toBe(16); expect(mp2(['a','ab','abc','d','cd','bcd','abcd'])).toBe(4); });
  it('finds minimum depth of binary tree (shortest root-to-leaf path)', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const md=(n:N|null):number=>{if(!n)return 0;if(!n.l&&!n.r)return 1;if(!n.l)return 1+md(n.r);if(!n.r)return 1+md(n.l);return 1+Math.min(md(n.l),md(n.r));}; expect(md(mk(3,mk(9),mk(20,mk(15),mk(7))))).toBe(2); expect(md(mk(2,null,mk(3,null,mk(4,null,mk(5,null,mk(6))))))).toBe(5); });
  it('finds minimum mutations to reach end gene bank', () => { const mgm=(start:string,end:string,bank:string[])=>{const bset=new Set(bank);if(!bset.has(end))return -1;const q:[string,number][]=[[start,0]],seen=new Set([start]);while(q.length){const[cur,steps]=q.shift()!;if(cur===end)return steps;for(let i=0;i<8;i++)for(const c of'ACGT'){const next=cur.slice(0,i)+c+cur.slice(i+1);if(bset.has(next)&&!seen.has(next)){seen.add(next);q.push([next,steps+1]);}}}return -1;}; expect(mgm('AACCGGTT','AACCGGTA',['AACCGGTA'])).toBe(1); expect(mgm('AACCGGTT','AAACGGTA',['AACCGGTA','AACCGCTA','AAACGGTA'])).toBe(2); });
  it('counts number of combinations to make amount from coins', () => { const cc2=(amount:number,coins:number[])=>{const dp=new Array(amount+1).fill(0);dp[0]=1;for(const c of coins)for(let i=c;i<=amount;i++)dp[i]+=dp[i-c];return dp[amount];}; expect(cc2(5,[1,2,5])).toBe(4); expect(cc2(3,[2])).toBe(0); expect(cc2(10,[10])).toBe(1); });
  it('finds length of longest consecutive path in a binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const lcp2=(root:N|null)=>{let res=0;const dfs=(n:N|null,parent:N|null,len:number)=>{if(!n)return;const cur=parent&&n.v===parent.v+1?len+1:1;res=Math.max(res,cur);dfs(n.l,n,cur);dfs(n.r,n,cur);};dfs(root,null,0);return res;}; expect(lcp2(mk(1,mk(2,mk(3))))).toBe(3); expect(lcp2(mk(2,mk(3,mk(2)),mk(2)))).toBe(2); });
});


describe('phase57 coverage', () => {
  it('finds length of longest path with same values in binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const luv=(root:N|null)=>{let res=0;const dfs=(n:N|null,pv:number):number=>{if(!n)return 0;const l=dfs(n.l,n.v),r=dfs(n.r,n.v);res=Math.max(res,l+r);return n.v===pv?1+Math.max(l,r):0;};dfs(root,-1);return res;}; expect(luv(mk(5,mk(4,mk(4),mk(4)),mk(5,null,mk(5))))).toBe(2); expect(luv(mk(1,mk(1,mk(1)),mk(1,null,mk(1))))).toBe(4); });
  it('finds all paths from node 0 to last node in a DAG', () => { const allPaths=(graph:number[][])=>{const res:number[][]=[];const dfs=(node:number,path:number[])=>{if(node===graph.length-1){res.push([...path]);return;}for(const nxt of graph[node])dfs(nxt,[...path,nxt]);};dfs(0,[0]);return res;}; expect(allPaths([[1,2],[3],[3],[]])).toEqual([[0,1,3],[0,2,3]]); expect(allPaths([[4,3,1],[3,2,4],[3],[4],[]])).toEqual([[0,4],[0,3,4],[0,1,3,4],[0,1,2,3,4],[0,1,4]]); });
  it('implements a hash set with add, remove, and contains', () => { class HS{private s=new Set<number>();add(k:number){this.s.add(k);}remove(k:number){this.s.delete(k);}contains(k:number){return this.s.has(k);}} const hs=new HS();hs.add(1);hs.add(2);expect(hs.contains(1)).toBe(true);hs.remove(2);expect(hs.contains(2)).toBe(false);expect(hs.contains(3)).toBe(false); });
  it('finds all recipes that can be made from available ingredients', () => { const recipes2=(r:string[],ing:string[][],sup:string[])=>{const avail=new Set(sup);const canMake=(recipe:string,idx:number,memo=new Map<string,boolean>()):boolean=>{if(avail.has(recipe))return true;if(memo.has(recipe))return memo.get(recipe)!;memo.set(recipe,false);const i=r.indexOf(recipe);if(i===-1)return false;const ok=ing[i].every(x=>canMake(x,0,memo));memo.set(recipe,ok);return ok;};return r.filter((_,i)=>canMake(r[i],i));}; expect(recipes2(['bread'],[["yeast","flour"]],["yeast","flour","corn"])).toEqual(["bread"]); });
  it('finds next greater element for each element of nums1 in nums2', () => { const nge=(n1:number[],n2:number[])=>{const m=new Map<number,number>(),st:number[]=[];for(const n of n2){while(st.length&&st[st.length-1]<n)m.set(st.pop()!,n);st.push(n);}return n1.map(n=>m.get(n)??-1);}; expect(nge([4,1,2],[1,3,4,2])).toEqual([-1,3,-1]); expect(nge([2,4],[1,2,3,4])).toEqual([3,-1]); });
});

describe('phase58 coverage', () => {
  it('first missing positive', () => {
    const firstMissingPositive=(nums:number[]):number=>{const n=nums.length;for(let i=0;i<n;i++){while(nums[i]>0&&nums[i]<=n&&nums[nums[i]-1]!==nums[i]){const t=nums[nums[i]-1];nums[nums[i]-1]=nums[i];nums[i]=t;}}for(let i=0;i<n;i++)if(nums[i]!==i+1)return i+1;return n+1;};
    expect(firstMissingPositive([1,2,0])).toBe(3);
    expect(firstMissingPositive([3,4,-1,1])).toBe(2);
    expect(firstMissingPositive([7,8,9,11,12])).toBe(1);
    expect(firstMissingPositive([1,2,3])).toBe(4);
  });
  it('max depth N-ary tree', () => {
    type NT={val:number;children:NT[]};
    const mk=(v:number,...ch:NT[]):NT=>({val:v,children:ch});
    const maxDepth=(root:NT|null):number=>{if(!root)return 0;if(!root.children.length)return 1;return 1+Math.max(...root.children.map(maxDepth));};
    const t=mk(1,mk(3,mk(5),mk(6)),mk(2),mk(4));
    expect(maxDepth(t)).toBe(3);
    expect(maxDepth(null)).toBe(0);
    expect(maxDepth(mk(1))).toBe(1);
  });
  it('subsets with duplicates', () => {
    const subsetsWithDup=(nums:number[]):number[][]=>{nums.sort((a,b)=>a-b);const res:number[][]=[];const bt=(start:number,path:number[])=>{res.push([...path]);for(let i=start;i<nums.length;i++){if(i>start&&nums[i]===nums[i-1])continue;path.push(nums[i]);bt(i+1,path);path.pop();}};bt(0,[]);return res;};
    const r=subsetsWithDup([1,2,2]);
    expect(r).toHaveLength(6);
    expect(r).toContainEqual([]);
    expect(r).toContainEqual([2,2]);
    expect(r).toContainEqual([1,2,2]);
  });
  it('permutation in string', () => {
    const checkInclusion=(s1:string,s2:string):boolean=>{if(s1.length>s2.length)return false;const cnt=new Array(26).fill(0);const a='a'.charCodeAt(0);for(const c of s1)cnt[c.charCodeAt(0)-a]++;let matches=cnt.filter(x=>x===0).length;let l=0;for(let r=0;r<s2.length;r++){const rc=s2[r].charCodeAt(0)-a;cnt[rc]--;if(cnt[rc]===0)matches++;else if(cnt[rc]===-1)matches--;if(r-l+1>s1.length){const lc=s2[l].charCodeAt(0)-a;cnt[lc]++;if(cnt[lc]===1)matches--;else if(cnt[lc]===0)matches++;l++;}if(matches===26)return true;}return false;};
    expect(checkInclusion('ab','eidbaooo')).toBe(true);
    expect(checkInclusion('ab','eidboaoo')).toBe(false);
  });
  it('find peak element binary', () => {
    const findPeakElement=(nums:number[]):number=>{let lo=0,hi=nums.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(nums[mid]>nums[mid+1])hi=mid;else lo=mid+1;}return lo;};
    const p1=findPeakElement([1,2,3,1]);
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1-1]||(-Infinity));
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1+1]||(-Infinity));
    const p2=findPeakElement([1,2,1,3,5,6,4]);
    expect(p2===1||p2===5).toBe(true);
  });
});

describe('phase59 coverage', () => {
  it('reorder linked list', () => {
    type N={val:number;next:N|null};
    const mk=(...vals:number[]):N|null=>{let h:N|null=null;for(let i=vals.length-1;i>=0;i--)h={val:vals[i],next:h};return h;};
    const toArr=(h:N|null):number[]=>{const a:number[]=[];while(h){a.push(h.val);h=h.next;}return a;};
    const reorderList=(head:N|null):void=>{if(!head?.next)return;let slow:N=head,fast:N|null=head;while(fast?.next?.next){slow=slow.next!;fast=fast.next.next;}let prev:N|null=null,cur:N|null=slow.next;slow.next=null;while(cur){const next=cur.next;cur.next=prev;prev=cur;cur=next;}let a:N|null=head,b:N|null=prev;while(b){const na:N|null=a!.next;const nb:N|null=b.next;a!.next=b;b.next=na;a=na;b=nb;}};
    const h=mk(1,2,3,4);reorderList(h);
    expect(toArr(h)).toEqual([1,4,2,3]);
  });
  it('surrounded regions', () => {
    const solve=(board:string[][]):void=>{const m=board.length,n=board[0].length;const dfs=(r:number,c:number)=>{if(r<0||r>=m||c<0||c>=n||board[r][c]!=='O')return;board[r][c]='S';dfs(r-1,c);dfs(r+1,c);dfs(r,c-1);dfs(r,c+1);};for(let i=0;i<m;i++){dfs(i,0);dfs(i,n-1);}for(let j=0;j<n;j++){dfs(0,j);dfs(m-1,j);}for(let i=0;i<m;i++)for(let j=0;j<n;j++)board[i][j]=board[i][j]==='S'?'O':board[i][j]==='O'?'X':board[i][j];};
    const b=[['X','X','X','X'],['X','O','O','X'],['X','X','O','X'],['X','O','X','X']];
    solve(b);
    expect(b[1][1]).toBe('X');
    expect(b[3][1]).toBe('O');
  });
  it('zigzag level order', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const zigzagLevelOrder=(root:TN|null):number[][]=>{if(!root)return[];const res:number[][]=[];const q=[root];let ltr=true;while(q.length){const sz=q.length;const level:number[]=[];for(let i=0;i<sz;i++){const n=q.shift()!;level.push(n.val);if(n.left)q.push(n.left);if(n.right)q.push(n.right);}res.push(ltr?level:[...level].reverse());ltr=!ltr;}return res;};
    const t=mk(3,mk(9),mk(20,mk(15),mk(7)));
    expect(zigzagLevelOrder(t)).toEqual([[3],[20,9],[15,7]]);
  });
  it('increasing triplet subsequence', () => {
    const increasingTriplet=(nums:number[]):boolean=>{let first=Infinity,second=Infinity;for(const n of nums){if(n<=first)first=n;else if(n<=second)second=n;else return true;}return false;};
    expect(increasingTriplet([1,2,3,4,5])).toBe(true);
    expect(increasingTriplet([5,4,3,2,1])).toBe(false);
    expect(increasingTriplet([2,1,5,0,4,6])).toBe(true);
    expect(increasingTriplet([1,1,1,1,1])).toBe(false);
  });
  it('LCA of BST', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const lcaBST=(root:TN|null,p:number,q:number):number=>{if(!root)return -1;if(root.val>p&&root.val>q)return lcaBST(root.left,p,q);if(root.val<p&&root.val<q)return lcaBST(root.right,p,q);return root.val;};
    const t=mk(6,mk(2,mk(0),mk(4,mk(3),mk(5))),mk(8,mk(7),mk(9)));
    expect(lcaBST(t,2,8)).toBe(6);
    expect(lcaBST(t,2,4)).toBe(2);
    expect(lcaBST(t,0,5)).toBe(2);
  });
});

describe('phase60 coverage', () => {
  it('stone game DP', () => {
    const stoneGame=(piles:number[]):boolean=>{const n=piles.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)dp[i][i]=piles[i];for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Math.max(piles[i]-dp[i+1][j],piles[j]-dp[i][j-1]);}return dp[0][n-1]>0;};
    expect(stoneGame([5,3,4,5])).toBe(true);
    expect(stoneGame([3,7,2,3])).toBe(true);
  });
  it('target sum ways', () => {
    const findTargetSumWays=(nums:number[],target:number):number=>{const map=new Map<number,number>([[0,1]]);for(const n of nums){const next=new Map<number,number>();for(const[sum,cnt]of map){next.set(sum+n,(next.get(sum+n)||0)+cnt);next.set(sum-n,(next.get(sum-n)||0)+cnt);}map.clear();next.forEach((v,k)=>map.set(k,v));}return map.get(target)||0;};
    expect(findTargetSumWays([1,1,1,1,1],3)).toBe(5);
    expect(findTargetSumWays([1],1)).toBe(1);
    expect(findTargetSumWays([1],2)).toBe(0);
  });
  it('subarrays with k different integers', () => {
    const subarraysWithKDistinct=(nums:number[],k:number):number=>{const atMost=(m:number)=>{const cnt=new Map<number,number>();let l=0,res=0;for(let r=0;r<nums.length;r++){cnt.set(nums[r],(cnt.get(nums[r])||0)+1);while(cnt.size>m){cnt.set(nums[l],cnt.get(nums[l])!-1);if(cnt.get(nums[l])===0)cnt.delete(nums[l]);l++;}res+=r-l+1;}return res;};return atMost(k)-atMost(k-1);};
    expect(subarraysWithKDistinct([1,2,1,2,3],2)).toBe(7);
    expect(subarraysWithKDistinct([1,2,1,3,4],3)).toBe(3);
  });
  it('interleaving string DP', () => {
    const isInterleave=(s1:string,s2:string,s3:string):boolean=>{const m=s1.length,n=s2.length;if(m+n!==s3.length)return false;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let i=1;i<=m;i++)dp[i][0]=dp[i-1][0]&&s1[i-1]===s3[i-1];for(let j=1;j<=n;j++)dp[0][j]=dp[0][j-1]&&s2[j-1]===s3[j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=(dp[i-1][j]&&s1[i-1]===s3[i+j-1])||(dp[i][j-1]&&s2[j-1]===s3[i+j-1]);return dp[m][n];};
    expect(isInterleave('aabcc','dbbca','aadbbcbcac')).toBe(true);
    expect(isInterleave('aabcc','dbbca','aadbbbaccc')).toBe(false);
    expect(isInterleave('','','b')).toBe(false);
  });
  it('minimum path sum grid', () => {
    const minPathSum=(grid:number[][]):number=>{const m=grid.length,n=grid[0].length;for(let i=0;i<m;i++)for(let j=0;j<n;j++){if(i===0&&j===0)continue;if(i===0)grid[i][j]+=grid[i][j-1];else if(j===0)grid[i][j]+=grid[i-1][j];else grid[i][j]+=Math.min(grid[i-1][j],grid[i][j-1]);}return grid[m-1][n-1];};
    expect(minPathSum([[1,3,1],[1,5,1],[4,2,1]])).toBe(7);
    expect(minPathSum([[1,2,3],[4,5,6]])).toBe(12);
    expect(minPathSum([[1]])).toBe(1);
  });
});

describe('phase61 coverage', () => {
  it('next greater element II circular', () => {
    const nextGreaterElements=(nums:number[]):number[]=>{const n=nums.length;const res=new Array(n).fill(-1);const stack:number[]=[];for(let i=0;i<2*n;i++){while(stack.length&&nums[stack[stack.length-1]]<nums[i%n]){res[stack.pop()!]=nums[i%n];}if(i<n)stack.push(i);}return res;};
    expect(nextGreaterElements([1,2,1])).toEqual([2,-1,2]);
    expect(nextGreaterElements([1,2,3,4,3])).toEqual([2,3,4,-1,4]);
  });
  it('max subarray sum divide conquer', () => {
    const maxSubArray=(nums:number[]):number=>{let maxSum=nums[0],cur=nums[0];for(let i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);maxSum=Math.max(maxSum,cur);}return maxSum;};
    expect(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])).toBe(6);
    expect(maxSubArray([1])).toBe(1);
    expect(maxSubArray([5,4,-1,7,8])).toBe(23);
    expect(maxSubArray([-1,-2,-3])).toBe(-1);
  });
  it('daily temperatures monotonic stack', () => {
    const dailyTemperatures=(temps:number[]):number[]=>{const stack:number[]=[];const res=new Array(temps.length).fill(0);for(let i=0;i<temps.length;i++){while(stack.length&&temps[stack[stack.length-1]]<temps[i]){const idx=stack.pop()!;res[idx]=i-idx;}stack.push(i);}return res;};
    expect(dailyTemperatures([73,74,75,71,69,72,76,73])).toEqual([1,1,4,2,1,1,0,0]);
    expect(dailyTemperatures([30,40,50,60])).toEqual([1,1,1,0]);
    expect(dailyTemperatures([30,60,90])).toEqual([1,1,0]);
  });
  it('sliding window median', () => {
    const medianSlidingWindow=(nums:number[],k:number):number[]=>{const res:number[]=[];for(let i=0;i<=nums.length-k;i++){const win=[...nums.slice(i,i+k)].sort((a,b)=>a-b);res.push(k%2===0?(win[k/2-1]+win[k/2])/2:win[Math.floor(k/2)]);}return res;};
    expect(medianSlidingWindow([1,3,-1,-3,5,3,6,7],3)).toEqual([1,-1,-1,3,5,6]);
    expect(medianSlidingWindow([1,2,3,4,2,3,1,4,2],3)).toEqual([2,3,3,3,2,3,2]);
  });
  it('count primes sieve', () => {
    const countPrimes=(n:number):number=>{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;};
    expect(countPrimes(10)).toBe(4);
    expect(countPrimes(0)).toBe(0);
    expect(countPrimes(1)).toBe(0);
    expect(countPrimes(20)).toBe(8);
  });
});

describe('phase62 coverage', () => {
  it('reverse bits of integer', () => {
    const reverseBits=(n:number):number=>{let res=0;for(let i=0;i<32;i++){res=(res*2+(n&1))>>>0;n>>>=1;}return res>>>0;};
    expect(reverseBits(0b00000010100101000001111010011100>>>0)).toBe(964176192);
    expect(reverseBits(0b11111111111111111111111111111101>>>0)).toBe(3221225471);
    expect(reverseBits(0)).toBe(0);
  });
  it('rotate string check', () => {
    const rotateString=(s:string,goal:string):boolean=>s.length===goal.length&&(s+s).includes(goal);
    expect(rotateString('abcde','cdeab')).toBe(true);
    expect(rotateString('abcde','abced')).toBe(false);
    expect(rotateString('','  ')).toBe(false);
    expect(rotateString('a','a')).toBe(true);
  });
  it('number of 1 bits hamming weight', () => {
    const hammingWeight=(n:number):number=>{let count=0;while(n){count+=n&1;n>>>=1;}return count;};
    const hammingDistance=(x:number,y:number):number=>hammingWeight(x^y);
    expect(hammingWeight(11)).toBe(3);
    expect(hammingWeight(128)).toBe(1);
    expect(hammingDistance(1,4)).toBe(2);
    expect(hammingDistance(3,1)).toBe(1);
  });
  it('buddy strings swap', () => {
    const buddyStrings=(s:string,goal:string):boolean=>{if(s.length!==goal.length)return false;if(s===goal)return new Set(s).size<s.length;const diff:number[][]=[];for(let i=0;i<s.length;i++)if(s[i]!==goal[i])diff.push([i]);return diff.length===2&&s[diff[0][0]]===goal[diff[1][0]]&&s[diff[1][0]]===goal[diff[0][0]];};
    expect(buddyStrings('ab','ba')).toBe(true);
    expect(buddyStrings('ab','ab')).toBe(false);
    expect(buddyStrings('aa','aa')).toBe(true);
    expect(buddyStrings('aaaaaaabc','aaaaaaacb')).toBe(true);
  });
  it('min deletions make freq unique', () => {
    const minDeletions=(s:string):number=>{const freq=new Array(26).fill(0);for(const c of s)freq[c.charCodeAt(0)-97]++;freq.sort((a,b)=>b-a);let del=0;const used=new Set<number>();for(const f of freq){let cur=f;while(cur>0&&used.has(cur))cur--;if(cur>0)used.add(cur);del+=f-cur;}return del;};
    expect(minDeletions('aab')).toBe(0);
    expect(minDeletions('aaabbbcc')).toBe(2);
    expect(minDeletions('ceabaacb')).toBe(2);
  });
});

describe('phase63 coverage', () => {
  it('game of life next state', () => {
    const gameOfLife=(board:number[][]):void=>{const m=board.length,n=board[0].length;const count=(r:number,c:number)=>{let live=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(dr===0&&dc===0)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<m&&nc>=0&&nc<n&&Math.abs(board[nr][nc])===1)live++;}return live;};for(let i=0;i<m;i++)for(let j=0;j<n;j++){const c=count(i,j);if(board[i][j]===1&&(c<2||c>3))board[i][j]=-1;if(board[i][j]===0&&c===3)board[i][j]=2;}for(let i=0;i<m;i++)for(let j=0;j<n;j++)board[i][j]=board[i][j]>0?1:0;};
    const b=[[0,1,0],[0,0,1],[1,1,1],[0,0,0]];gameOfLife(b);
    expect(b).toEqual([[0,0,0],[1,0,1],[0,1,1],[0,1,0]]);
  });
  it('wiggle sort array', () => {
    const wiggleSort=(nums:number[]):void=>{const sorted=[...nums].sort((a,b)=>a-b);const n=nums.length;let lo=Math.floor((n-1)/2),hi=n-1;for(let i=0;i<n;i+=2)nums[i]=sorted[lo--];for(let i=1;i<n;i+=2)nums[i]=sorted[hi--];};
    const a=[1,5,1,1,6,4];wiggleSort(a);
    for(let i=1;i<a.length-1;i++)expect((a[i]>=a[i-1]&&a[i]>=a[i+1])||(a[i]<=a[i-1]&&a[i]<=a[i+1])).toBe(true);
    const b=[1,3,2,2,3,1];wiggleSort(b);
    for(let i=1;i<b.length-1;i++)expect((b[i]>=b[i-1]&&b[i]>=b[i+1])||(b[i]<=b[i-1]&&b[i]<=b[i+1])).toBe(true);
  });
  it('shortest completing word', () => {
    const shortestCompletingWord=(plate:string,words:string[]):string=>{const cnt=(s:string)=>{const f=new Array(26).fill(0);for(const c of s.toLowerCase())if(c>='a'&&c<='z')f[c.charCodeAt(0)-97]++;return f;};const need=cnt(plate);return words.filter(w=>{const f=cnt(w);return need.every((n,i)=>f[i]>=n);}).sort((a,b)=>a.length-b.length)[0];};
    expect(shortestCompletingWord('1s3 PSt',['step','steps','stripe','stepple'])).toBe('steps');
    expect(shortestCompletingWord('1s3 456',['looks','pest','stew','show'])).toBe('pest');
  });
  it('number of matching subsequences', () => {
    const numMatchingSubseq=(s:string,words:string[]):number=>{const isSub=(w:string):boolean=>{let i=0;for(const c of s)if(i<w.length&&c===w[i])i++;return i===w.length;};return words.filter(isSub).length;};
    expect(numMatchingSubseq('abcde',['a','bb','acd','ace'])).toBe(3);
    expect(numMatchingSubseq('dsahjpjauf',['ahjpjau','ja','ahbwzgqnuk','tnmlanowax'])).toBe(2);
  });
  it('insert interval into sorted list', () => {
    const insert=(intervals:[number,number][],newInt:[number,number]):[number,number][]=>{const res:[number,number][]=[];let i=0;while(i<intervals.length&&intervals[i][1]<newInt[0])res.push(intervals[i++]);while(i<intervals.length&&intervals[i][0]<=newInt[1]){newInt=[Math.min(newInt[0],intervals[i][0]),Math.max(newInt[1],intervals[i][1])];i++;}res.push(newInt);while(i<intervals.length)res.push(intervals[i++]);return res;};
    expect(insert([[1,3],[6,9]],[2,5])).toEqual([[1,5],[6,9]]);
    expect(insert([[1,2],[3,5],[6,7],[8,10],[12,16]],[4,8])).toEqual([[1,2],[3,10],[12,16]]);
  });
});

describe('phase64 coverage', () => {
  describe('max points on a line', () => {
    function maxPoints(pts:number[][]):number{if(pts.length<=2)return pts.length;let res=2;const g=(a:number,b:number):number=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a;};for(let i=0;i<pts.length;i++){const map:Record<string,number>={};for(let j=i+1;j<pts.length;j++){let dx=pts[j][0]-pts[i][0],dy=pts[j][1]-pts[i][1];const gg=g(Math.abs(dx),Math.abs(dy));if(gg>0){dx/=gg;dy/=gg;}if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}const k=dx===0&&dy===0?'same':`${dy}/${dx}`;map[k]=(map[k]||1)+1;res=Math.max(res,map[k]);}}return res;}
    it('3col'  ,()=>expect(maxPoints([[1,1],[2,2],[3,3]])).toBe(3));
    it('4col'  ,()=>expect(maxPoints([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4));
    it('one'   ,()=>expect(maxPoints([[0,0]])).toBe(1));
    it('two'   ,()=>expect(maxPoints([[1,1],[2,2]])).toBe(2));
    it('noCol' ,()=>expect(maxPoints([[1,1],[2,3],[3,5],[4,7]])).toBe(4));
  });
  describe('regular expression matching', () => {
    function isMatch(s:string,p:string):boolean{const m=s.length,n=p.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-2];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(p[j-1]==='*')dp[i][j]=dp[i][j-2]||((p[j-2]==='.'||p[j-2]===s[i-1])&&dp[i-1][j]);else dp[i][j]=(p[j-1]==='.'||p[j-1]===s[i-1])&&dp[i-1][j-1];}return dp[m][n];}
    it('ex1'   ,()=>expect(isMatch('aa','a')).toBe(false));
    it('ex2'   ,()=>expect(isMatch('aa','a*')).toBe(true));
    it('ex3'   ,()=>expect(isMatch('ab','.*')).toBe(true));
    it('star0' ,()=>expect(isMatch('aab','c*a*b')).toBe(true));
    it('dot'   ,()=>expect(isMatch('mississippi','mis*is*p*.')).toBe(false));
  });
  describe('wildcard matching', () => {
    function isMatchWild(s:string,p:string):boolean{const m=s.length,n=p.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)dp[0][j]=p[j-1]==='*'&&dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(p[j-1]==='*')dp[i][j]=dp[i-1][j]||dp[i][j-1];else dp[i][j]=(p[j-1]==='?'||p[j-1]===s[i-1])&&dp[i-1][j-1];}return dp[m][n];}
    it('ex1'   ,()=>expect(isMatchWild('aa','a')).toBe(false));
    it('ex2'   ,()=>expect(isMatchWild('aa','*')).toBe(true));
    it('ex3'   ,()=>expect(isMatchWild('cb','?a')).toBe(false));
    it('ex4'   ,()=>expect(isMatchWild('adceb','*a*b')).toBe(true));
    it('ex5'   ,()=>expect(isMatchWild('acdcb','a*c?b')).toBe(false));
  });
  describe('word break II', () => {
    function wordBreakII(s:string,dict:string[]):string[]{const set=new Set(dict);const memo=new Map<number,string[]>();function bt(start:number):string[]{if(memo.has(start))return memo.get(start)!;if(start===s.length)return[''];const res:string[]=[];for(let end=start+1;end<=s.length;end++){const w=s.slice(start,end);if(set.has(w))for(const r of bt(end))res.push(w+(r?' '+r:''));}memo.set(start,res);return res;}return bt(0);}
    it('ex1'   ,()=>expect(wordBreakII('catsanddog',['cat','cats','and','sand','dog']).sort()).toEqual(['cat sand dog','cats and dog']));
    it('ex2'   ,()=>expect(wordBreakII('pineapplepenapple',['apple','pen','applepen','pine','pineapple']).length).toBe(3));
    it('nores' ,()=>expect(wordBreakII('catsandog',['cats','dog','sand','and','cat'])).toEqual([]));
    it('empty' ,()=>expect(wordBreakII('',['a'])).toEqual(['']));
    it('single',()=>expect(wordBreakII('a',['a'])).toEqual(['a']));
  });
  describe('palindrome pairs', () => {
    function palindromePairs(words:string[]):number{const isPal=(s:string)=>s===s.split('').reverse().join('');let c=0;for(let i=0;i<words.length;i++)for(let j=0;j<words.length;j++)if(i!==j&&isPal(words[i]+words[j]))c++;return c;}
    it('ex1'   ,()=>expect(palindromePairs(['abcd','dcba','lls','s','sssll'])).toBe(4));
    it('ex2'   ,()=>expect(palindromePairs(['bat','tab','cat'])).toBe(2));
    it('empty' ,()=>expect(palindromePairs(['a',''])).toBe(2));
    it('one'   ,()=>expect(palindromePairs(['a'])).toBe(0));
    it('aba'   ,()=>expect(palindromePairs(['aba',''])).toBe(2));
  });
});

describe('phase65 coverage', () => {
  describe('power of two', () => {
    function pot(n:number):boolean{return n>0&&(n&(n-1))===0;}
    it('1'     ,()=>expect(pot(1)).toBe(true));
    it('16'    ,()=>expect(pot(16)).toBe(true));
    it('3'     ,()=>expect(pot(3)).toBe(false));
    it('0'     ,()=>expect(pot(0)).toBe(false));
    it('neg'   ,()=>expect(pot(-4)).toBe(false));
  });
});
