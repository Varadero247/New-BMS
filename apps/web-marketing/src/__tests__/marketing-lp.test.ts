// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 171 — web-marketing LP + secondary pages data-integrity spec tests

// ─── Inline constants mirrored from LP / secondary pages ─────────────────────

// From lp/replace-[competitor]/page.tsx
interface CompetitorProfile {
  displayName: string;
  theirPrice: number | null;
  weaknesses: [string, string, string];
  ourAdvantage: string;
}

const COMPETITORS: Record<string, CompetitorProfile> = {
  qualityone: {
    displayName: 'QualityOne',
    theirPrice: 79,
    weaknesses: ['ISO 9001 only', 'No environmental module', 'Outdated UI'],
    ourAdvantage: 'Full 43-module suite at half the price',
  },
  isopro: {
    displayName: 'ISOPro',
    theirPrice: 65,
    weaknesses: ['No AI features', 'Per-standard pricing', 'Poor mobile'],
    ourAdvantage: 'AI-powered insights, all standards included',
  },
  simplysis: {
    displayName: 'Simplysis',
    theirPrice: 55,
    weaknesses: ['Limited reporting', 'No supplier portal', 'Manual workflows'],
    ourAdvantage: 'Automated workflows, built-in portals, advanced reporting',
  },
  qmsware: {
    displayName: 'QMSWare',
    theirPrice: 48,
    weaknesses: ['Quality only', 'On-premise required', 'No API'],
    ourAdvantage: 'Cloud-native, REST API, all modules',
  },
};

const GENERIC_PROFILE: CompetitorProfile = {
  displayName: 'Your Current Tool',
  theirPrice: null,
  weaknesses: ['Single-standard focus', 'No unified reporting', 'Manual processes'],
  ourAdvantage: 'All standards unified in one intelligent platform',
};

const FEATURE_ROWS: Array<{ feature: string }> = [
  { feature: 'All 43 compliance modules' },
  { feature: '30+ ISO standards included' },
  { feature: 'AI-powered insights' },
  { feature: 'Built-in supplier portal' },
  { feature: 'Cloud-native (no on-premise)' },
  { feature: 'REST API access' },
  { feature: 'Automated workflows' },
  { feature: 'Real-time dashboards' },
  { feature: 'Mobile app' },
  { feature: 'Single login for all modules' },
];

const NEXARA_PRICE_MONTHLY = 39; // PRICING.tiers.PROFESSIONAL.listPriceMonthly

// From lp/compliance-software-pricing/page.tsx
const STANDARDS = [
  { name: 'ISO 9001', description: 'Quality Management' },
  { name: 'ISO 14001', description: 'Environmental Management' },
  { name: 'ISO 45001', description: 'Health & Safety' },
  { name: 'ISO 27001', description: 'Information Security' },
  { name: 'ISO 42001', description: 'AI Management' },
  { name: 'ISO 37001', description: 'Anti-Bribery' },
  { name: 'ISO 50001', description: 'Energy Management' },
  { name: 'ISO 22000', description: 'Food Safety' },
  { name: 'ISO 55001', description: 'Asset Management' },
  { name: 'ISO 13485', description: 'Medical Devices QMS' },
];

const REPLACED_TOOLS = [
  'ISO 9001 QMS platform',
  'Environmental management software',
  'Health & safety incident system',
  'InfoSec risk management tool',
  'Document control system',
  'Audit management platform',
  'Supplier portal & risk',
  'Training & competency tracker',
  'Asset / CMMS platform',
  'Incident reporting software',
  'HR compliance integration',
  'Regulatory compliance tracker',
];

const FAQ_ITEMS = [
  { q: 'Does one licence really cover all standards?', a: 'Yes.' },
  { q: 'How does Nexara compare to buying separate tools?', a: 'The average organisation...' },
  { q: 'What does the 14-day free trial include?', a: 'Your trial gives you full Professional-tier access...' },
  { q: 'How is the per-standard price calculated?', a: 'At £49/user/month for Starter...' },
  { q: 'Can I migrate from my existing tools?', a: 'Yes. Nexara includes data import utilities...' },
];

const STARTER_LIST_PRICE = 49; // PRICING.tiers.STARTER.listPriceMonthly

// From app/roi-calculator/page.tsx
const JOB_TITLES = [
  'Quality Manager',
  'EHS Manager',
  'Compliance Officer',
  'Operations Director',
  'IT Manager',
  'Managing Director / CEO',
  'Consultant',
  'Other',
];

const EMPLOYEE_RANGES = ['1-50', '51-250', '251-1000', '1000+'];

const ISO_COUNTS = ['1', '2', '3', '4', '5+'];

const INDUSTRIES = [
  'Manufacturing',
  'Construction',
  'Healthcare',
  'Technology',
  'Financial Services',
  'Food & Beverage',
  'Aerospace & Defence',
  'Automotive',
  'Energy & Utilities',
  'Professional Services',
  'Government & Public Sector',
  'Other',
];

// From app/partners/page.tsx
const ONBOARDING_STEPS = [
  { step: 1, title: 'Apply', description: 'Submit your partner application online. Takes less than 5 minutes.' },
  { step: 2, title: 'Approved in 5 days', description: 'Our channel team reviews your application and responds within 5 business days.' },
  { step: 3, title: 'Onboarding call', description: 'A 60-minute call with your dedicated channel manager to set up your partner portal, NFR licences, and co-sell strategy.' },
  { step: 4, title: 'Start selling', description: 'Go live with full access to demo environments, marketing materials, co-sell support, and deal registration.' },
];

// Simplified BENEFITS_TABLE (revenue/key rows)
const BENEFITS_TABLE_ROW_COUNT = 14;
const BENEFITS_REVENUE_ROW = {
  benefit: 'Revenue model',
  referral: '15% commission',
  reseller: '20% discount',
  strategic: '30% discount',
  whiteLabel: '35% discount',
};
const BENEFITS_COMMITMENT_ROW = {
  benefit: 'Annual commitment',
  referral: 'None',
  reseller: '2 deals/year',
  strategic: '10 deals/year',
  whiteLabel: '3 customers min',
};
const BENEFITS_PORTAL_ROW = {
  benefit: 'Portal access',
  referral: 'Basic',
  reseller: 'Full',
  strategic: 'Full',
  whiteLabel: 'Full',
};

// NFR licences per tier (from PRICING.partnerships.tiers)
const NFR_LICENCES = { REFERRAL: 0, RESELLER: 5, STRATEGIC: 15, WHITE_LABEL: 20 };
// Co-marketing funds
const CO_MARKETING_FUNDS = { STRATEGIC: 5000, WHITE_LABEL: 10000 };
// White label base licence fee
const WHITE_LABEL_BASE_LICENCE_FEE = 24000;

// From app/public-sector/page.tsx
const KEY_BENEFITS = [
  { heading: 'G-Cloud procurement', body: 'Nexara IMS is pursuing a G-Cloud listing on the Crown Commercial Service (CCS) Digital Marketplace.' },
  { heading: 'GDPR + UK Gov frameworks', body: 'All data stored in UK-based data centres.' },
  { heading: 'Accessibility — WCAG 2.1 AA', body: 'Nexara IMS is designed to meet WCAG 2.1 Level AA accessibility standards.' },
  { heading: 'Crown Commercial Service alignment', body: 'We are actively working towards CCS framework alignment.' },
];

// ─── Pure computation helpers (mirrored from pages) ──────────────────────────

function computeCompetitor(price: number, userCount: number) {
  const theirAnnual = price * userCount * 12;
  const nexaraAnnual = NEXARA_PRICE_MONTHLY * userCount * 12;
  const annualSaving = Math.max(0, theirAnnual - nexaraAnnual);
  const savingPct = theirAnnual > 0 ? Math.round(((theirAnnual - nexaraAnnual) / theirAnnual) * 100) : 0;
  return { theirAnnual, nexaraAnnual, annualSaving, savingPct };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('replace-[competitor] page — COMPETITORS constant', () => {
  it('has exactly 4 named competitors', () => {
    expect(Object.keys(COMPETITORS)).toHaveLength(4);
  });

  it('all 4 competitor keys are present', () => {
    expect(COMPETITORS).toHaveProperty('qualityone');
    expect(COMPETITORS).toHaveProperty('isopro');
    expect(COMPETITORS).toHaveProperty('simplysis');
    expect(COMPETITORS).toHaveProperty('qmsware');
  });

  const entries = [
    { slug: 'qualityone', displayName: 'QualityOne', theirPrice: 79 },
    { slug: 'isopro', displayName: 'ISOPro', theirPrice: 65 },
    { slug: 'simplysis', displayName: 'Simplysis', theirPrice: 55 },
    { slug: 'qmsware', displayName: 'QMSWare', theirPrice: 48 },
  ] as const;

  for (const { slug, displayName, theirPrice } of entries) {
    it(`${slug}: displayName is '${displayName}'`, () => {
      expect(COMPETITORS[slug].displayName).toBe(displayName);
    });
    it(`${slug}: theirPrice is ${theirPrice}`, () => {
      expect(COMPETITORS[slug].theirPrice).toBe(theirPrice);
    });
    it(`${slug}: theirPrice > nexaraPrice (${NEXARA_PRICE_MONTHLY})`, () => {
      expect(COMPETITORS[slug].theirPrice as number).toBeGreaterThan(NEXARA_PRICE_MONTHLY);
    });
    it(`${slug}: has exactly 3 weaknesses`, () => {
      expect(COMPETITORS[slug].weaknesses).toHaveLength(3);
    });
    it(`${slug}: ourAdvantage is a non-empty string`, () => {
      expect(COMPETITORS[slug].ourAdvantage.length).toBeGreaterThan(0);
    });
  }

  it('competitors are ordered by price descending (qualityone > isopro > simplysis > qmsware)', () => {
    const prices = entries.map((e) => e.theirPrice);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i + 1]);
    }
  });
});

describe('replace-[competitor] page — GENERIC_PROFILE', () => {
  it('theirPrice is null', () => {
    expect(GENERIC_PROFILE.theirPrice).toBeNull();
  });
  it('has exactly 3 weaknesses', () => {
    expect(GENERIC_PROFILE.weaknesses).toHaveLength(3);
  });
  it('displayName is non-empty', () => {
    expect(GENERIC_PROFILE.displayName.length).toBeGreaterThan(0);
  });
  it('ourAdvantage is non-empty', () => {
    expect(GENERIC_PROFILE.ourAdvantage.length).toBeGreaterThan(0);
  });
});

describe('replace-[competitor] page — FEATURE_ROWS', () => {
  it('has exactly 10 feature rows', () => {
    expect(FEATURE_ROWS).toHaveLength(10);
  });

  for (let i = 0; i < FEATURE_ROWS.length; i++) {
    it(`FEATURE_ROWS[${i}].feature is a non-empty string`, () => {
      expect(FEATURE_ROWS[i].feature.length).toBeGreaterThan(0);
    });
  }

  it('all feature strings are unique', () => {
    const features = FEATURE_ROWS.map((r) => r.feature);
    expect(new Set(features).size).toBe(features.length);
  });
});

describe('replace-[competitor] page — savings computations', () => {
  const UC = 25; // default userCount in page

  const cases = [
    { slug: 'qualityone', price: 79, expectedTheirAnnual: 79 * 25 * 12, expectedSavingPct: 51 },
    { slug: 'isopro',     price: 65, expectedTheirAnnual: 65 * 25 * 12, expectedSavingPct: 40 },
    { slug: 'simplysis',  price: 55, expectedTheirAnnual: 55 * 25 * 12, expectedSavingPct: 29 },
    { slug: 'qmsware',    price: 48, expectedTheirAnnual: 48 * 25 * 12, expectedSavingPct: 19 },
  ] as const;

  for (const { slug, price, expectedTheirAnnual, expectedSavingPct } of cases) {
    it(`${slug}: theirAnnual(${UC}) = ${expectedTheirAnnual}`, () => {
      const { theirAnnual } = computeCompetitor(price, UC);
      expect(theirAnnual).toBe(expectedTheirAnnual);
    });
    it(`${slug}: annualSaving(${UC}) > 0`, () => {
      const { annualSaving } = computeCompetitor(price, UC);
      expect(annualSaving).toBeGreaterThan(0);
    });
    it(`${slug}: savingPct(${UC}) = ${expectedSavingPct}`, () => {
      const { savingPct } = computeCompetitor(price, UC);
      expect(savingPct).toBe(expectedSavingPct);
    });
  }

  it('nexaraAnnual is same for all competitors at UC=25', () => {
    const expected = NEXARA_PRICE_MONTHLY * 25 * 12;
    for (const { price } of cases) {
      expect(computeCompetitor(price, 25).nexaraAnnual).toBe(expected);
    }
  });

  it('savings ordered: qualityone > isopro > simplysis > qmsware', () => {
    const savings = cases.map(({ price }) => computeCompetitor(price, UC).annualSaving);
    for (let i = 0; i < savings.length - 1; i++) {
      expect(savings[i]).toBeGreaterThan(savings[i + 1]);
    }
  });
});

// ─── Compliance software pricing LP ──────────────────────────────────────────

describe('compliance-software-pricing LP — STANDARDS', () => {
  it('has exactly 10 standards', () => {
    expect(STANDARDS).toHaveLength(10);
  });

  for (let i = 0; i < STANDARDS.length; i++) {
    it(`STANDARDS[${i}] (${STANDARDS[i].name}): name is non-empty`, () => {
      expect(STANDARDS[i].name.length).toBeGreaterThan(0);
    });
    it(`STANDARDS[${i}] (${STANDARDS[i].name}): description is non-empty`, () => {
      expect(STANDARDS[i].description.length).toBeGreaterThan(0);
    });
  }

  it('all standard names are unique', () => {
    const names = STANDARDS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('compliance-software-pricing LP — REPLACED_TOOLS', () => {
  it('has exactly 12 replaced tools', () => {
    expect(REPLACED_TOOLS).toHaveLength(12);
  });

  for (let i = 0; i < REPLACED_TOOLS.length; i++) {
    it(`REPLACED_TOOLS[${i}] is a non-empty string`, () => {
      expect(REPLACED_TOOLS[i].length).toBeGreaterThan(0);
    });
  }

  it('all replaced tool strings are unique', () => {
    expect(new Set(REPLACED_TOOLS).size).toBe(REPLACED_TOOLS.length);
  });
});

describe('compliance-software-pricing LP — FAQ_ITEMS', () => {
  it('has exactly 5 FAQ items', () => {
    expect(FAQ_ITEMS).toHaveLength(5);
  });

  for (let i = 0; i < FAQ_ITEMS.length; i++) {
    it(`FAQ_ITEMS[${i}]: q is non-empty`, () => {
      expect(FAQ_ITEMS[i].q.length).toBeGreaterThan(0);
    });
    it(`FAQ_ITEMS[${i}]: a is non-empty`, () => {
      expect(FAQ_ITEMS[i].a.length).toBeGreaterThan(0);
    });
  }

  it('all FAQ questions are unique', () => {
    const qs = FAQ_ITEMS.map((f) => f.q);
    expect(new Set(qs).size).toBe(qs.length);
  });
});

describe('compliance-software-pricing LP — per-standard cost', () => {
  const perStandardLow = STARTER_LIST_PRICE / 10;
  const perStandardHigh = STARTER_LIST_PRICE / 8;

  it('perStandardLow = STARTER_LIST_PRICE / 10 = 4.9', () => {
    expect(perStandardLow).toBeCloseTo(4.9, 5);
  });
  it('perStandardHigh = STARTER_LIST_PRICE / 8 = 6.125', () => {
    expect(perStandardHigh).toBeCloseTo(6.125, 5);
  });
  it('perStandardLow < perStandardHigh', () => {
    expect(perStandardLow).toBeLessThan(perStandardHigh);
  });
  it('both are positive', () => {
    expect(perStandardLow).toBeGreaterThan(0);
    expect(perStandardHigh).toBeGreaterThan(0);
  });
});

// ─── ROI Calculator page ──────────────────────────────────────────────────────

describe('roi-calculator page — JOB_TITLES', () => {
  it('has 8 job titles', () => {
    expect(JOB_TITLES).toHaveLength(8);
  });
  it('last entry is Other', () => {
    expect(JOB_TITLES[JOB_TITLES.length - 1]).toBe('Other');
  });
  for (let i = 0; i < JOB_TITLES.length; i++) {
    it(`JOB_TITLES[${i}] is non-empty`, () => {
      expect(JOB_TITLES[i].length).toBeGreaterThan(0);
    });
  }
  it('all job titles are unique', () => {
    expect(new Set(JOB_TITLES).size).toBe(JOB_TITLES.length);
  });
});

describe('roi-calculator page — EMPLOYEE_RANGES', () => {
  it('has 4 employee ranges', () => {
    expect(EMPLOYEE_RANGES).toHaveLength(4);
  });
  it('last range covers 1000+', () => {
    expect(EMPLOYEE_RANGES[EMPLOYEE_RANGES.length - 1]).toBe('1000+');
  });
  it('first range covers small orgs (1-50)', () => {
    expect(EMPLOYEE_RANGES[0]).toBe('1-50');
  });
  for (let i = 0; i < EMPLOYEE_RANGES.length; i++) {
    it(`EMPLOYEE_RANGES[${i}] matches n-m or n+ pattern`, () => {
      expect(EMPLOYEE_RANGES[i]).toMatch(/^\d+(-\d+|\+)$/);
    });
  }
});

describe('roi-calculator page — ISO_COUNTS', () => {
  it('has 5 ISO count options', () => {
    expect(ISO_COUNTS).toHaveLength(5);
  });
  it('first option is "1"', () => {
    expect(ISO_COUNTS[0]).toBe('1');
  });
  it('last option is "5+"', () => {
    expect(ISO_COUNTS[4]).toBe('5+');
  });
  for (let i = 0; i < ISO_COUNTS.length; i++) {
    it(`ISO_COUNTS[${i}] is a non-empty string`, () => {
      expect(ISO_COUNTS[i].length).toBeGreaterThan(0);
    });
  }
});

describe('roi-calculator page — INDUSTRIES', () => {
  it('has 12 industry options', () => {
    expect(INDUSTRIES).toHaveLength(12);
  });
  it('includes Manufacturing', () => {
    expect(INDUSTRIES).toContain('Manufacturing');
  });
  it('includes Healthcare', () => {
    expect(INDUSTRIES).toContain('Healthcare');
  });
  it('last entry is Other', () => {
    expect(INDUSTRIES[INDUSTRIES.length - 1]).toBe('Other');
  });
  for (let i = 0; i < INDUSTRIES.length; i++) {
    it(`INDUSTRIES[${i}] is non-empty`, () => {
      expect(INDUSTRIES[i].length).toBeGreaterThan(0);
    });
  }
  it('all industry names are unique', () => {
    expect(new Set(INDUSTRIES).size).toBe(INDUSTRIES.length);
  });
});

// ─── Partners page ────────────────────────────────────────────────────────────

describe('partners page — ONBOARDING_STEPS', () => {
  it('has exactly 4 onboarding steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(4);
  });

  it('steps are numbered 1 through 4', () => {
    for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
      expect(ONBOARDING_STEPS[i].step).toBe(i + 1);
    }
  });

  const expected = [
    { step: 1, title: 'Apply' },
    { step: 2, title: 'Approved in 5 days' },
    { step: 3, title: 'Onboarding call' },
    { step: 4, title: 'Start selling' },
  ] as const;

  for (const { step, title } of expected) {
    it(`step ${step} title is '${title}'`, () => {
      const s = ONBOARDING_STEPS.find((x) => x.step === step);
      expect(s?.title).toBe(title);
    });
    it(`step ${step} description is non-empty`, () => {
      const s = ONBOARDING_STEPS.find((x) => x.step === step);
      expect((s?.description ?? '').length).toBeGreaterThan(0);
    });
  }
});

describe('partners page — BENEFITS_TABLE key rows', () => {
  it('table has 14 rows', () => {
    expect(BENEFITS_TABLE_ROW_COUNT).toBe(14);
  });

  it('Revenue model row: referral = 15% commission', () => {
    expect(BENEFITS_REVENUE_ROW.referral).toBe('15% commission');
  });
  it('Revenue model row: reseller = 20% discount', () => {
    expect(BENEFITS_REVENUE_ROW.reseller).toBe('20% discount');
  });
  it('Revenue model row: strategic = 30% discount', () => {
    expect(BENEFITS_REVENUE_ROW.strategic).toBe('30% discount');
  });
  it('Revenue model row: whiteLabel = 35% discount', () => {
    expect(BENEFITS_REVENUE_ROW.whiteLabel).toBe('35% discount');
  });

  it('Annual commitment row: referral = None', () => {
    expect(BENEFITS_COMMITMENT_ROW.referral).toBe('None');
  });
  it('Annual commitment row: reseller = 2 deals/year', () => {
    expect(BENEFITS_COMMITMENT_ROW.reseller).toBe('2 deals/year');
  });
  it('Annual commitment row: strategic = 10 deals/year', () => {
    expect(BENEFITS_COMMITMENT_ROW.strategic).toBe('10 deals/year');
  });

  it('Portal access row: referral = Basic', () => {
    expect(BENEFITS_PORTAL_ROW.referral).toBe('Basic');
  });
  it('Portal access row: reseller/strategic/whiteLabel = Full', () => {
    expect(BENEFITS_PORTAL_ROW.reseller).toBe('Full');
    expect(BENEFITS_PORTAL_ROW.strategic).toBe('Full');
    expect(BENEFITS_PORTAL_ROW.whiteLabel).toBe('Full');
  });
});

describe('partners page — NFR licences per tier', () => {
  it('REFERRAL has 0 NFR licences', () => {
    expect(NFR_LICENCES.REFERRAL).toBe(0);
  });
  it('RESELLER has 5 NFR licences', () => {
    expect(NFR_LICENCES.RESELLER).toBe(5);
  });
  it('STRATEGIC has 15 NFR licences', () => {
    expect(NFR_LICENCES.STRATEGIC).toBe(15);
  });
  it('WHITE_LABEL has 20 NFR licences', () => {
    expect(NFR_LICENCES.WHITE_LABEL).toBe(20);
  });
  it('NFR licences increase by tier: REFERRAL < RESELLER < STRATEGIC < WHITE_LABEL', () => {
    expect(NFR_LICENCES.REFERRAL).toBeLessThan(NFR_LICENCES.RESELLER);
    expect(NFR_LICENCES.RESELLER).toBeLessThan(NFR_LICENCES.STRATEGIC);
    expect(NFR_LICENCES.STRATEGIC).toBeLessThan(NFR_LICENCES.WHITE_LABEL);
  });
});

describe('partners page — co-marketing funds', () => {
  it('STRATEGIC co-marketing fund = £5,000', () => {
    expect(CO_MARKETING_FUNDS.STRATEGIC).toBe(5000);
  });
  it('WHITE_LABEL co-marketing fund = £10,000', () => {
    expect(CO_MARKETING_FUNDS.WHITE_LABEL).toBe(10000);
  });
  it('WHITE_LABEL fund > STRATEGIC fund', () => {
    expect(CO_MARKETING_FUNDS.WHITE_LABEL).toBeGreaterThan(CO_MARKETING_FUNDS.STRATEGIC);
  });
});

describe('partners page — white label base licence fee', () => {
  it('WHITE_LABEL base annual licence fee = £24,000', () => {
    expect(WHITE_LABEL_BASE_LICENCE_FEE).toBe(24000);
  });
  it('licence fee is greater than any single year STRATEGIC co-marketing fund', () => {
    expect(WHITE_LABEL_BASE_LICENCE_FEE).toBeGreaterThan(CO_MARKETING_FUNDS.STRATEGIC);
  });
});

// ─── Public sector page ───────────────────────────────────────────────────────

describe('public-sector page — KEY_BENEFITS', () => {
  it('has exactly 4 key benefits', () => {
    expect(KEY_BENEFITS).toHaveLength(4);
  });

  for (let i = 0; i < KEY_BENEFITS.length; i++) {
    it(`KEY_BENEFITS[${i}] heading is non-empty`, () => {
      expect(KEY_BENEFITS[i].heading.length).toBeGreaterThan(0);
    });
    it(`KEY_BENEFITS[${i}] body is non-empty`, () => {
      expect(KEY_BENEFITS[i].body.length).toBeGreaterThan(0);
    });
  }

  it('first benefit is about G-Cloud procurement', () => {
    expect(KEY_BENEFITS[0].heading).toMatch(/G-Cloud/i);
  });
  it('includes WCAG 2.1 accessibility benefit', () => {
    const wcag = KEY_BENEFITS.find((b) => b.heading.includes('WCAG'));
    expect(wcag).toBeDefined();
  });
  it('all headings are unique', () => {
    const headings = KEY_BENEFITS.map((b) => b.heading);
    expect(new Set(headings).size).toBe(headings.length);
  });
});

// ─── Cross-constant invariants ────────────────────────────────────────────────

describe('cross-constant invariants', () => {
  it('all 4 competitor prices are above NEXARA_PRICE_MONTHLY (39)', () => {
    for (const profile of Object.values(COMPETITORS)) {
      expect(profile.theirPrice as number).toBeGreaterThan(NEXARA_PRICE_MONTHLY);
    }
  });

  it('STANDARDS count (10) matches "10+ standards" marketing claim', () => {
    expect(STANDARDS.length).toBeGreaterThanOrEqual(10);
  });

  it('REPLACED_TOOLS count (12) > STANDARDS count (10)', () => {
    expect(REPLACED_TOOLS.length).toBeGreaterThan(STANDARDS.length);
  });

  it('ONBOARDING_STEPS last step is "Start selling"', () => {
    expect(ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1].title).toBe('Start selling');
  });

  it('INDUSTRIES (12) > EMPLOYEE_RANGES (4)', () => {
    expect(INDUSTRIES.length).toBeGreaterThan(EMPLOYEE_RANGES.length);
  });

  it('WHITE_LABEL licence fee (24k) > co-marketing fund (10k)', () => {
    expect(WHITE_LABEL_BASE_LICENCE_FEE).toBeGreaterThan(CO_MARKETING_FUNDS.WHITE_LABEL);
  });

  it('GENERIC_PROFILE is not in COMPETITORS record', () => {
    expect(Object.values(COMPETITORS)).not.toContain(GENERIC_PROFILE);
  });

  it('all competitor weaknesses arrays have exactly 3 items', () => {
    for (const profile of Object.values(COMPETITORS)) {
      expect(profile.weaknesses).toHaveLength(3);
    }
  });

  it('computeCompetitor: saving is 0 when theirPrice = nexaraPrice', () => {
    const { annualSaving } = computeCompetitor(NEXARA_PRICE_MONTHLY, 10);
    expect(annualSaving).toBe(0);
  });

  it('computeCompetitor: saving is 0 when theirPrice < nexaraPrice', () => {
    const { annualSaving } = computeCompetitor(NEXARA_PRICE_MONTHLY - 5, 10);
    expect(annualSaving).toBe(0);
  });
});
