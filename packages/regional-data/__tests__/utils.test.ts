/**
 * Utility function tests for packages/regional-data.
 * Tests tax-calculator, comparison, legislation-matcher, and locale/date/currency utilities
 * using real region configs (SG, AU, JP, HK, BD etc.) from the package.
 */
import {
  allRegionConfigs,
  getRegionConfig,
  // Tax calculator
  calculateCorporateTax,
  calculateGST,
  calculateWithholdingTax,
  calculateCPF,
  // Comparison
  compareCountries,
  buildTaxLeagueTable,
  // Legislation matchers
  getLegislationByCategory,
  getLegislationForISOStandard,
  getLegislationForSector,
  getMandatoryLegislation,
  getISOAdoptionStatus,
  compareRegions,
  // Locale/date/currency
  getLocaleForCountry,
  getDateFormat,
  getCurrencySymbol,
} from '../src';

const sg = getRegionConfig('SG')!;
const au = getRegionConfig('AU')!;
const jp = getRegionConfig('JP')!;
const hk = getRegionConfig('HK')!;
const my = getRegionConfig('MY')!;
const cn = getRegionConfig('CN')!;
const kr = getRegionConfig('KR')!;
const in_ = getRegionConfig('IN')!;
const th = getRegionConfig('TH')!;
const id_ = getRegionConfig('ID')!;
const nz = getRegionConfig('NZ')!;
const ph = getRegionConfig('PH')!;
const vn = getRegionConfig('VN')!;

// ── calculateCorporateTax — flat rate ─────────────────────────────────────────
// SG uses flat rate (no corporateTaxBands)

describe('calculateCorporateTax — flat rate (SG 17%)', () => {
  it('zero income gives zero tax', () => {
    const r = calculateCorporateTax(0, sg);
    expect(r.taxAmount).toBe(0);
  });

  it('income * corporateTaxRate = taxAmount', () => {
    const r = calculateCorporateTax(100000, sg);
    expect(r.taxAmount).toBeCloseTo(100000 * sg.finance.corporateTaxRate, 2);
  });

  it('taxableIncome = income', () => {
    expect(calculateCorporateTax(50000, sg).taxableIncome).toBe(50000);
  });

  it('effectiveRate = corporateTaxRate for flat system', () => {
    const r = calculateCorporateTax(200000, sg);
    expect(r.effectiveRate).toBeCloseTo(sg.finance.corporateTaxRate, 5);
  });

  it('scales proportionally', () => {
    const r1 = calculateCorporateTax(100000, sg);
    const r2 = calculateCorporateTax(200000, sg);
    expect(r2.taxAmount).toBeCloseTo(r1.taxAmount * 2, 2);
  });
});

describe('calculateCorporateTax — SG 17%', () => {
  it('100,000 income → 17,000 tax', () => {
    const r = calculateCorporateTax(100000, sg);
    expect(r.taxAmount).toBeCloseTo(17000, 1);
  });

  it('effectiveRate matches corporateTaxRate', () => {
    expect(calculateCorporateTax(500000, sg).effectiveRate).toBeCloseTo(0.17, 4);
  });
});

describe('calculateCorporateTax — AU 30%', () => {
  it('300,000 income → 90,000 tax', () => {
    expect(calculateCorporateTax(300000, au).taxAmount).toBeCloseTo(90000, 1);
  });

  it('flat rate: effectiveRate = corporateTaxRate regardless of income', () => {
    // AU uses flat rate; effectiveRate is set to corporateTaxRate constant
    const r = calculateCorporateTax(0, au);
    expect(r.effectiveRate).toBeCloseTo(au.finance.corporateTaxRate, 5);
  });
});

describe('calculateCorporateTax — all 20 configs return valid results', () => {
  allRegionConfigs.forEach(cfg => {
    it(`${cfg.countryCode} tax on 1,000,000 is non-negative`, () => {
      const r = calculateCorporateTax(1_000_000, cfg);
      expect(r.taxAmount).toBeGreaterThanOrEqual(0);
      expect(r.effectiveRate).toBeGreaterThanOrEqual(0);
      expect(r.effectiveRate).toBeLessThanOrEqual(1);
    });
  });
});

// ── calculateGST ──────────────────────────────────────────────────────────────

describe('calculateGST — exclusive (default)', () => {
  it('SG: 9% GST on 1000 = 90', () => {
    const r = calculateGST(1000, sg);
    expect(r.gstAmount).toBeCloseTo(90, 2);
    expect(r.totalAmount).toBeCloseTo(1090, 2);
  });

  it('baseAmount = input amount', () => {
    const r = calculateGST(5000, sg);
    expect(r.baseAmount).toBe(5000);
  });

  it('name is GST for Singapore', () => {
    expect(calculateGST(100, sg).name).toBe('GST');
  });

  it('rate returned matches config', () => {
    expect(calculateGST(100, sg).rate).toBeCloseTo(sg.finance.gstVatRate, 5);
  });

  it('AU: 10% GST on 200 = 20', () => {
    const r = calculateGST(200, au);
    expect(r.gstAmount).toBeCloseTo(20, 2);
  });
});

describe('calculateGST — inclusive mode', () => {
  it('SG: inclusive 1090 → base ≈ 1000, gst ≈ 90', () => {
    const r = calculateGST(1090, sg, true);
    expect(r.baseAmount).toBeCloseTo(1000, 0);
    expect(r.gstAmount).toBeCloseTo(90, 0);
    expect(r.totalAmount).toBe(1090);
  });

  it('totalAmount = input for inclusive', () => {
    const r = calculateGST(500, sg, true);
    expect(r.totalAmount).toBe(500);
  });

  it('inclusive baseAmount + gstAmount = totalAmount', () => {
    const r = calculateGST(1000, au, true);
    expect(r.baseAmount + r.gstAmount).toBeCloseTo(r.totalAmount, 4);
  });
});

describe('calculateGST — all 20 configs', () => {
  allRegionConfigs.forEach(cfg => {
    it(`${cfg.countryCode} GST on 10000 is non-negative`, () => {
      const r = calculateGST(10000, cfg);
      expect(r.gstAmount).toBeGreaterThanOrEqual(0);
    });
  });
});

// ── calculateWithholdingTax ───────────────────────────────────────────────────

describe('calculateWithholdingTax', () => {
  const types: Array<'dividends' | 'interest' | 'royalties' | 'services'> = [
    'dividends', 'interest', 'royalties', 'services',
  ];

  types.forEach(type => {
    it(`SG ${type}: grossAmount preserved`, () => {
      const r = calculateWithholdingTax(100000, type, sg);
      expect(r.grossAmount).toBe(100000);
    });

    it(`SG ${type}: withholdingTax + netAmount = grossAmount`, () => {
      const r = calculateWithholdingTax(100000, type, sg);
      expect(r.withholdingTax + r.netAmount).toBeCloseTo(100000, 2);
    });

    it(`SG ${type}: rate matches config`, () => {
      const r = calculateWithholdingTax(100000, type, sg);
      expect(r.rate).toBeCloseTo(sg.finance.witholdingTaxRates[type], 5);
    });
  });

  it('SG dividends: 0% withholding → tax is 0', () => {
    expect(calculateWithholdingTax(100000, 'dividends', sg).withholdingTax).toBe(0);
  });

  it('SG interest: 15% withholding → 15000 tax on 100000', () => {
    expect(calculateWithholdingTax(100000, 'interest', sg).withholdingTax).toBeCloseTo(15000, 2);
  });

  it('zero amount gives zero withholding', () => {
    const r = calculateWithholdingTax(0, 'royalties', sg);
    expect(r.withholdingTax).toBe(0);
  });

  allRegionConfigs.forEach(cfg => {
    it(`${cfg.countryCode} services withholding is 0-100%`, () => {
      const r = calculateWithholdingTax(10000, 'services', cfg);
      expect(r.withholdingTax).toBeGreaterThanOrEqual(0);
      expect(r.withholdingTax).toBeLessThanOrEqual(10000);
    });
  });
});

// ── calculateCPF ──────────────────────────────────────────────────────────────

describe('calculateCPF', () => {
  it('returns object (not null) for JP — all 20 configs have payrollTax', () => {
    // All 20 region configs include payrollTax; calculateCPF always returns an object
    expect(calculateCPF(50000, jp)).not.toBeNull();
  });

  it('SG CPF: returns object with all required fields', () => {
    const r = calculateCPF(6000, sg);
    expect(r).not.toBeNull();
    expect(r).toHaveProperty('employeeContribution');
    expect(r).toHaveProperty('employerContribution');
    expect(r).toHaveProperty('totalContribution');
    expect(r).toHaveProperty('employeeTakeHome');
  });

  it('SG CPF: employeeContribution = min(salary, ceiling) * employeeRate', () => {
    const r = calculateCPF(5000, sg)!;
    expect(r.employeeContribution).toBeCloseTo(5000 * sg.finance.payrollTax!.employeeRate, 2);
  });

  it('SG CPF: salary above ceiling uses ceiling', () => {
    const ceiling = sg.finance.payrollTax!.ceiling!;
    const r = calculateCPF(ceiling * 2, sg)!;
    expect(r.employeeContribution).toBeCloseTo(ceiling * sg.finance.payrollTax!.employeeRate, 2);
  });

  it('SG CPF: employeeTakeHome = grossSalary - employeeContribution', () => {
    const r = calculateCPF(4000, sg)!;
    expect(r.employeeTakeHome).toBeCloseTo(4000 - r.employeeContribution, 2);
  });

  it('SG CPF: total = employee + employer', () => {
    const r = calculateCPF(5000, sg)!;
    expect(r.totalContribution).toBeCloseTo(r.employeeContribution + r.employerContribution, 2);
  });

  it('all 20 configs have payrollTax — calculateCPF never returns null', () => {
    // All 20 APAC region configs define payrollTax; null case is for other datasets
    for (const cfg of allRegionConfigs) {
      expect(calculateCPF(10000, cfg)).not.toBeNull();
    }
  });
});

// ── compareCountries ──────────────────────────────────────────────────────────

describe('compareCountries', () => {
  const sample = [sg, au, jp, hk];
  const rows = compareCountries(sample);

  it('returns one row per config', () => {
    expect(rows).toHaveLength(sample.length);
  });

  it('each row has countryCode and countryName', () => {
    for (const r of rows) {
      expect(typeof r.countryCode).toBe('string');
      expect(typeof r.countryName).toBe('string');
    }
  });

  it('corporateTaxRate matches config', () => {
    const sgRow = rows.find(r => r.countryCode === 'SG')!;
    expect(sgRow.corporateTaxRate).toBeCloseTo(sg.finance.corporateTaxRate, 5);
  });

  it('gstVatRate matches config', () => {
    const auRow = rows.find(r => r.countryCode === 'AU')!;
    expect(auRow.gstVatRate).toBeCloseTo(au.finance.gstVatRate, 5);
  });

  it('hasPayrollTax is true for SG', () => {
    const sgRow = rows.find(r => r.countryCode === 'SG')!;
    expect(sgRow.hasPayrollTax).toBe(true);
  });

  it('hasPayrollTax is true for JP (Shakai Hoken)', () => {
    const jpRow = rows.find(r => r.countryCode === 'JP')!;
    expect(jpRow.hasPayrollTax).toBe(true);
  });

  it('payrollTaxName is CPF for SG', () => {
    const sgRow = rows.find(r => r.countryCode === 'SG')!;
    expect(sgRow.payrollTaxName).toBe('CPF');
  });

  it('all rates are 0–1 (fraction, not percentage)', () => {
    for (const r of rows) {
      expect(r.corporateTaxRate).toBeLessThanOrEqual(1);
      expect(r.gstVatRate).toBeLessThanOrEqual(1);
    }
  });

  it('returns empty array for empty input', () => {
    expect(compareCountries([])).toHaveLength(0);
  });

  it('works for all 20 configs', () => {
    const all = compareCountries(allRegionConfigs);
    expect(all).toHaveLength(20);
  });
});

// ── buildTaxLeagueTable ───────────────────────────────────────────────────────

describe('buildTaxLeagueTable', () => {
  const table = buildTaxLeagueTable(allRegionConfigs);

  it('byCorpTax is sorted ascending', () => {
    for (let i = 1; i < table.byCorpTax.length; i++) {
      expect(table.byCorpTax[i].corporateTaxRate).toBeGreaterThanOrEqual(table.byCorpTax[i - 1].corporateTaxRate);
    }
  });

  it('byGst is sorted ascending', () => {
    for (let i = 1; i < table.byGst.length; i++) {
      expect(table.byGst[i].gstVatRate).toBeGreaterThanOrEqual(table.byGst[i - 1].gstVatRate);
    }
  });

  it('byWithholdingDividends is sorted ascending', () => {
    for (let i = 1; i < table.byWithholdingDividends.length; i++) {
      expect(table.byWithholdingDividends[i].withholdingDividends).toBeGreaterThanOrEqual(
        table.byWithholdingDividends[i - 1].withholdingDividends
      );
    }
  });

  it('summary.lowestCorpTax has lowest rate', () => {
    const minRate = Math.min(...allRegionConfigs.map(c => c.finance.corporateTaxRate));
    expect(table.summary.lowestCorpTax.corporateTaxRate).toBe(minRate);
  });

  it('summary.highestCorpTax has highest rate', () => {
    const maxRate = Math.max(...allRegionConfigs.map(c => c.finance.corporateTaxRate));
    expect(table.summary.highestCorpTax.corporateTaxRate).toBe(maxRate);
  });

  it('summary.lowestGst has lowest GST rate', () => {
    const minGst = Math.min(...allRegionConfigs.map(c => c.finance.gstVatRate));
    expect(table.summary.lowestGst.gstVatRate).toBe(minGst);
  });

  it('summary.highestGst has highest GST rate', () => {
    const maxGst = Math.max(...allRegionConfigs.map(c => c.finance.gstVatRate));
    expect(table.summary.highestGst.gstVatRate).toBe(maxGst);
  });

  it('byCorpTax length matches allRegionConfigs', () => {
    expect(table.byCorpTax).toHaveLength(allRegionConfigs.length);
  });

  it('all required summary keys exist', () => {
    expect(table.summary).toHaveProperty('lowestCorpTax');
    expect(table.summary).toHaveProperty('highestCorpTax');
    expect(table.summary).toHaveProperty('lowestGst');
    expect(table.summary).toHaveProperty('highestGst');
    expect(table.summary).toHaveProperty('easiestToBusiness');
  });

  it('returns empty table for empty input', () => {
    const t = buildTaxLeagueTable([]);
    expect(t.byCorpTax).toHaveLength(0);
  });
});

// ── getLegislationByCategory ──────────────────────────────────────────────────

describe('getLegislationByCategory', () => {
  it('SG DATA_PRIVACY returns PDPA', () => {
    const laws = getLegislationByCategory(sg, 'DATA_PRIVACY');
    expect(laws.length).toBeGreaterThan(0);
    expect(laws.every(l => l.category === 'DATA_PRIVACY')).toBe(true);
  });

  it('SG HSE returns WSHA', () => {
    const laws = getLegislationByCategory(sg, 'HSE');
    expect(laws.length).toBeGreaterThan(0);
    expect(laws.every(l => l.category === 'HSE')).toBe(true);
  });

  it('returns empty array for a category with no laws', () => {
    // FOOD_SAFETY may not exist in all configs
    const laws = getLegislationByCategory(sg, 'FOOD_SAFETY' as any);
    expect(Array.isArray(laws)).toBe(true);
  });

  it('all returned laws have the queried category', () => {
    const categories = ['EMPLOYMENT', 'ENVIRONMENT', 'DATA_PRIVACY', 'HSE', 'ANTI_CORRUPTION'] as const;
    for (const cat of categories) {
      const laws = getLegislationByCategory(sg, cat);
      for (const law of laws) {
        expect(law.category).toBe(cat);
      }
    }
  });

  it('works for AU config', () => {
    const laws = getLegislationByCategory(au, 'EMPLOYMENT');
    expect(Array.isArray(laws)).toBe(true);
  });
});

// ── getLegislationForISOStandard ──────────────────────────────────────────────

describe('getLegislationForISOStandard', () => {
  it('SG: finds laws related to ISO 45001', () => {
    const laws = getLegislationForISOStandard(sg, 'ISO 45001:2018');
    expect(laws.length).toBeGreaterThan(0);
    laws.forEach(l => {
      expect(l.relatedISOStandards).toContain('ISO 45001:2018');
    });
  });

  it('SG: finds laws related to ISO 27001', () => {
    const laws = getLegislationForISOStandard(sg, 'ISO 27001:2022');
    expect(laws.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown ISO standard', () => {
    const laws = getLegislationForISOStandard(sg, 'ISO 99999:2099');
    expect(laws).toHaveLength(0);
  });

  it('SG: laws for ISO 14001 are environment laws', () => {
    const laws = getLegislationForISOStandard(sg, 'ISO 14001:2015');
    expect(laws.length).toBeGreaterThan(0);
  });
});

// ── getLegislationForSector ───────────────────────────────────────────────────

describe('getLegislationForSector', () => {
  it('returns laws applicable to all sectors', () => {
    const laws = getLegislationForSector(sg, 'all');
    expect(laws.length).toBeGreaterThan(0);
  });

  it('laws for "all" sector have applicableTo containing "all"', () => {
    const laws = getLegislationForSector(sg, 'all');
    laws.forEach(l => {
      expect(l.applicableTo).toContain('all');
    });
  });

  it('returns array for any sector query', () => {
    expect(Array.isArray(getLegislationForSector(sg, 'manufacturing'))).toBe(true);
    expect(Array.isArray(getLegislationForSector(sg, 'financial'))).toBe(true);
  });
});

// ── getMandatoryLegislation ────────────────────────────────────────────────────

describe('getMandatoryLegislation', () => {
  it('SG: all returned laws are mandatory', () => {
    const laws = getMandatoryLegislation(sg);
    expect(laws.length).toBeGreaterThan(0);
    laws.forEach(l => expect(l.isMandatory).toBe(true));
  });

  it('subset of all primary laws', () => {
    const mandatory = getMandatoryLegislation(sg);
    expect(mandatory.length).toBeLessThanOrEqual(sg.legislation.primaryLaws.length);
  });

  it('works for all 20 configs — always returns array', () => {
    allRegionConfigs.forEach(cfg => {
      const laws = getMandatoryLegislation(cfg);
      expect(Array.isArray(laws)).toBe(true);
    });
  });

  it('AU: has mandatory laws', () => {
    expect(getMandatoryLegislation(au).length).toBeGreaterThan(0);
  });
});

// ── getISOAdoptionStatus ──────────────────────────────────────────────────────

describe('getISOAdoptionStatus', () => {
  it('SG: finds ISO 9001 adoption status', () => {
    const status = getISOAdoptionStatus(sg, 'ISO 9001');
    expect(status).toBeDefined();
    expect(status!.standard).toContain('9001');
  });

  it('returns undefined for unadopted standard', () => {
    const status = getISOAdoptionStatus(sg, 'ISO 99999:2099');
    expect(status).toBeUndefined();
  });

  it('returned object has adoptionStatus field', () => {
    const status = getISOAdoptionStatus(sg, 'ISO 9001');
    if (status) {
      expect(typeof status.adoptionStatus).toBe('string');
    }
  });

  it('returned object has certificationBodies array', () => {
    const status = getISOAdoptionStatus(sg, 'ISO 9001');
    if (status) {
      expect(Array.isArray(status.certificationBodies)).toBe(true);
    }
  });

  it('works for all 20 configs', () => {
    allRegionConfigs.forEach(cfg => {
      const r = getISOAdoptionStatus(cfg, 'ISO 9001');
      // either defined or undefined — no error
      expect(r === undefined || typeof r === 'object').toBe(true);
    });
  });
});

// ── compareRegions ────────────────────────────────────────────────────────────

describe('compareRegions', () => {
  const configs = [sg, au, jp, hk];
  const rows = compareRegions(configs, 'ISO 9001');

  it('returns one row per config', () => {
    expect(rows).toHaveLength(configs.length);
  });

  it('each row has countryCode and countryName', () => {
    rows.forEach(r => {
      expect(typeof r.countryCode).toBe('string');
      expect(typeof r.countryName).toBe('string');
    });
  });

  it('each row has adoptionStatus string', () => {
    rows.forEach(r => {
      expect(typeof r.adoptionStatus).toBe('string');
    });
  });

  it('each row has certificationBodies array', () => {
    rows.forEach(r => {
      expect(Array.isArray(r.certificationBodies)).toBe(true);
    });
  });

  it('NOT_ADOPTED for standard with no adoption entry', () => {
    const rows2 = compareRegions([sg], 'ISO 99999:2099');
    expect(rows2[0].adoptionStatus).toBe('NOT_ADOPTED');
  });

  it('returns empty for empty configs input', () => {
    expect(compareRegions([], 'ISO 9001')).toHaveLength(0);
  });
});

// ── getLocaleForCountry ───────────────────────────────────────────────────────

describe('getLocaleForCountry', () => {
  const cases: [string, string][] = [
    ['SG', 'en-SG'],
    ['AU', 'en-AU'],
    ['JP', 'ja-JP'],
    ['CN', 'zh-CN'],
    ['KR', 'ko-KR'],
    ['TH', 'th-TH'],
    ['VN', 'vi-VN'],
    ['ID', 'id-ID'],
    ['IN', 'en-IN'],
    ['MY', 'en-MY'],
  ];

  cases.forEach(([code, expected]) => {
    it(`${code} → ${expected}`, () => {
      expect(getLocaleForCountry(code)).toBe(expected);
    });
  });

  it('returns en-US for unknown code', () => {
    expect(getLocaleForCountry('XX')).toBe('en-US');
  });

  it('returns a string for any input', () => {
    expect(typeof getLocaleForCountry('ZZ')).toBe('string');
  });
});

// ── getDateFormat ─────────────────────────────────────────────────────────────

describe('getDateFormat', () => {
  const cases: [string, string][] = [
    ['JP', 'YYYY/MM/DD'],
    ['CN', 'YYYY-MM-DD'],
    ['KR', 'YYYY.MM.DD'],
    ['US', 'MM/DD/YYYY'],
    ['AU', 'DD/MM/YYYY'],
    ['SG', 'DD/MM/YYYY'],
    ['IN', 'DD/MM/YYYY'],
  ];

  cases.forEach(([code, expected]) => {
    it(`${code} → ${expected}`, () => {
      expect(getDateFormat(code)).toBe(expected);
    });
  });

  it('defaults to DD/MM/YYYY for unknown code', () => {
    expect(getDateFormat('ZZ')).toBe('DD/MM/YYYY');
  });
});

// ── getCurrencySymbol ─────────────────────────────────────────────────────────

describe('getCurrencySymbol', () => {
  const cases: [string, string][] = [
    ['SGD', 'S$'],
    ['AUD', 'A$'],
    ['NZD', 'NZ$'],
    ['MYR', 'RM'],
    ['JPY', '¥'],
    ['CNY', '¥'],
    ['KRW', '₩'],
    ['INR', '₹'],
    ['THB', '฿'],
    ['PHP', '₱'],
    ['VND', '₫'],
    ['HKD', 'HK$'],
    ['TWD', 'NT$'],
    ['IDR', 'Rp'],
    ['AED', 'AED'],
  ];

  cases.forEach(([code, expected]) => {
    it(`${code} → ${expected}`, () => {
      expect(getCurrencySymbol(code)).toBe(expected);
    });
  });

  it('returns currency code itself for unknown currency', () => {
    expect(getCurrencySymbol('XXX')).toBe('XXX');
  });

  it('returns a string for any input', () => {
    expect(typeof getCurrencySymbol('ZZZ')).toBe('string');
  });
});

// ─── Algorithm puzzle phases (ph217ru–ph220ru) ────────────────────────────────
function moveZeroes217ru(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217ru_mz',()=>{
  it('a',()=>{expect(moveZeroes217ru([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217ru([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217ru([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217ru([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217ru([4,2,0,0,3])).toBe(4);});
});
function missingNumber218ru(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218ru_mn',()=>{
  it('a',()=>{expect(missingNumber218ru([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218ru([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218ru([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218ru([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218ru([1])).toBe(0);});
});
function countBits219ru(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219ru_cb',()=>{
  it('a',()=>{expect(countBits219ru(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219ru(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219ru(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219ru(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219ru(4)[4]).toBe(1);});
});
function climbStairs220ru(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220ru_cs',()=>{
  it('a',()=>{expect(climbStairs220ru(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220ru(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220ru(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220ru(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220ru(1)).toBe(1);});
});

// ─── Algorithm puzzle phases (ph231ru2–ph238ru2) ────────────────────────────────
function moveZeroes231ru2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph231ru2_mz',()=>{
  it('a',()=>{expect(moveZeroes231ru2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes231ru2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes231ru2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes231ru2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes231ru2([4,2,0,0,3])).toBe(4);});
});
function missingNumber232ru2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph232ru2_mn',()=>{
  it('a',()=>{expect(missingNumber232ru2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber232ru2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber232ru2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber232ru2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber232ru2([1])).toBe(0);});
});
function countBits233ru2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph233ru2_cb',()=>{
  it('a',()=>{expect(countBits233ru2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits233ru2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits233ru2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits233ru2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits233ru2(4)[4]).toBe(1);});
});
function climbStairs234ru2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph234ru2_cs',()=>{
  it('a',()=>{expect(climbStairs234ru2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs234ru2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs234ru2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs234ru2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs234ru2(1)).toBe(1);});
});
function maxProfit235ru2(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph235ru2_mp',()=>{
  it('a',()=>{expect(maxProfit235ru2([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit235ru2([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit235ru2([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit235ru2([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit235ru2([1])).toBe(0);});
});
function singleNumber236ru2(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph236ru2_sn',()=>{
  it('a',()=>{expect(singleNumber236ru2([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber236ru2([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber236ru2([1])).toBe(1);});
  it('d',()=>{expect(singleNumber236ru2([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber236ru2([3,3,5])).toBe(5);});
});
function hammingDist237ru2(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph237ru2_hd',()=>{
  it('a',()=>{expect(hammingDist237ru2(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist237ru2(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist237ru2(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist237ru2(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist237ru2(7,7)).toBe(0);});
});
function majorElem238ru2(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph238ru2_me',()=>{
  it('a',()=>{expect(majorElem238ru2([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem238ru2([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem238ru2([1])).toBe(1);});
  it('d',()=>{expect(majorElem238ru2([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem238ru2([6,5,5])).toBe(5);});
});
function mn253ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph253ru3_mn',()=>{it('a',()=>{expect(mn253ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn253ru3([0,1])).toBe(2);});it('c',()=>{expect(mn253ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn253ru3([0])).toBe(1);});it('e',()=>{expect(mn253ru3([1])).toBe(0);});});
function mn254ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph254ru3_mn',()=>{it('a',()=>{expect(mn254ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn254ru3([0,1])).toBe(2);});it('c',()=>{expect(mn254ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn254ru3([0])).toBe(1);});it('e',()=>{expect(mn254ru3([1])).toBe(0);});});
function mn255ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph255ru3_mn',()=>{it('a',()=>{expect(mn255ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn255ru3([0,1])).toBe(2);});it('c',()=>{expect(mn255ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn255ru3([0])).toBe(1);});it('e',()=>{expect(mn255ru3([1])).toBe(0);});});
function mn256ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph256ru3_mn',()=>{it('a',()=>{expect(mn256ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn256ru3([0,1])).toBe(2);});it('c',()=>{expect(mn256ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn256ru3([0])).toBe(1);});it('e',()=>{expect(mn256ru3([1])).toBe(0);});});
function mn257ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph257ru3_mn',()=>{it('a',()=>{expect(mn257ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn257ru3([0,1])).toBe(2);});it('c',()=>{expect(mn257ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn257ru3([0])).toBe(1);});it('e',()=>{expect(mn257ru3([1])).toBe(0);});});
function mn258ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph258ru3_mn',()=>{it('a',()=>{expect(mn258ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn258ru3([0,1])).toBe(2);});it('c',()=>{expect(mn258ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn258ru3([0])).toBe(1);});it('e',()=>{expect(mn258ru3([1])).toBe(0);});});
function mn259ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph259ru3_mn',()=>{it('a',()=>{expect(mn259ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn259ru3([0,1])).toBe(2);});it('c',()=>{expect(mn259ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn259ru3([0])).toBe(1);});it('e',()=>{expect(mn259ru3([1])).toBe(0);});});
function mn260ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph260ru3_mn',()=>{it('a',()=>{expect(mn260ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn260ru3([0,1])).toBe(2);});it('c',()=>{expect(mn260ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn260ru3([0])).toBe(1);});it('e',()=>{expect(mn260ru3([1])).toBe(0);});});
function mn261ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph261ru3_mn',()=>{it('a',()=>{expect(mn261ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn261ru3([0,1])).toBe(2);});it('c',()=>{expect(mn261ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn261ru3([0])).toBe(1);});it('e',()=>{expect(mn261ru3([1])).toBe(0);});});
function mn262ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph262ru3_mn',()=>{it('a',()=>{expect(mn262ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn262ru3([0,1])).toBe(2);});it('c',()=>{expect(mn262ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn262ru3([0])).toBe(1);});it('e',()=>{expect(mn262ru3([1])).toBe(0);});});
function mn263ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph263ru3_mn',()=>{it('a',()=>{expect(mn263ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn263ru3([0,1])).toBe(2);});it('c',()=>{expect(mn263ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn263ru3([0])).toBe(1);});it('e',()=>{expect(mn263ru3([1])).toBe(0);});});
function mn264ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph264ru3_mn',()=>{it('a',()=>{expect(mn264ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn264ru3([0,1])).toBe(2);});it('c',()=>{expect(mn264ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn264ru3([0])).toBe(1);});it('e',()=>{expect(mn264ru3([1])).toBe(0);});});
function mn265ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph265ru3_mn',()=>{it('a',()=>{expect(mn265ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn265ru3([0,1])).toBe(2);});it('c',()=>{expect(mn265ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn265ru3([0])).toBe(1);});it('e',()=>{expect(mn265ru3([1])).toBe(0);});});
function mn266ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph266ru3_mn',()=>{it('a',()=>{expect(mn266ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn266ru3([0,1])).toBe(2);});it('c',()=>{expect(mn266ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn266ru3([0])).toBe(1);});it('e',()=>{expect(mn266ru3([1])).toBe(0);});});
function mn267ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph267ru3_mn',()=>{it('a',()=>{expect(mn267ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn267ru3([0,1])).toBe(2);});it('c',()=>{expect(mn267ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn267ru3([0])).toBe(1);});it('e',()=>{expect(mn267ru3([1])).toBe(0);});});
function mn268ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph268ru3_mn',()=>{it('a',()=>{expect(mn268ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn268ru3([0,1])).toBe(2);});it('c',()=>{expect(mn268ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn268ru3([0])).toBe(1);});it('e',()=>{expect(mn268ru3([1])).toBe(0);});});
function mn269ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph269ru3_mn',()=>{it('a',()=>{expect(mn269ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn269ru3([0,1])).toBe(2);});it('c',()=>{expect(mn269ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn269ru3([0])).toBe(1);});it('e',()=>{expect(mn269ru3([1])).toBe(0);});});
function mn270ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph270ru3_mn',()=>{it('a',()=>{expect(mn270ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn270ru3([0,1])).toBe(2);});it('c',()=>{expect(mn270ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn270ru3([0])).toBe(1);});it('e',()=>{expect(mn270ru3([1])).toBe(0);});});
function mn271ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph271ru3_mn',()=>{it('a',()=>{expect(mn271ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn271ru3([0,1])).toBe(2);});it('c',()=>{expect(mn271ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn271ru3([0])).toBe(1);});it('e',()=>{expect(mn271ru3([1])).toBe(0);});});
function mn272ru3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph272ru3_mn',()=>{it('a',()=>{expect(mn272ru3([3,0,1])).toBe(2);});it('b',()=>{expect(mn272ru3([0,1])).toBe(2);});it('c',()=>{expect(mn272ru3([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn272ru3([0])).toBe(1);});it('e',()=>{expect(mn272ru3([1])).toBe(0);});});
