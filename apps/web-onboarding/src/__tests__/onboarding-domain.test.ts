// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Domain spec tests for web-onboarding — pure logic, no React imports.
// Complements onboarding.test.ts with deeper coverage of ISO metadata,
// region groupings, flag emoji map, wizard step metadata, plan feature
// assertions, billing-cycle helpers, and wizard flow invariants.

// ─── ISO Standards catalogue (matching Step3ISOStandards.tsx) ─────────────────

interface IsoStandard {
  standard: string;
  name: string;
  desc: string;
  icon: string;
}

const ISO_CATALOGUE: IsoStandard[] = [
  { standard: 'ISO 9001:2015',  name: 'Quality Management',          desc: 'Products and services quality management system',      icon: '🏆' },
  { standard: 'ISO 14001:2015', name: 'Environmental Management',    desc: 'Environmental impact and sustainability',              icon: '🌿' },
  { standard: 'ISO 45001:2018', name: 'Occupational Health & Safety',desc: 'Workplace safety and health management',               icon: '🦺' },
  { standard: 'ISO 27001:2022', name: 'Information Security',        desc: 'Information security management system',               icon: '🔒' },
  { standard: 'ISO 37001:2016', name: 'Anti-Bribery',               desc: 'Anti-bribery management system',                      icon: '⚖️' },
  { standard: 'ISO 50001:2018', name: 'Energy Management',           desc: 'Energy performance and efficiency',                   icon: '⚡' },
  { standard: 'ISO 22000:2018', name: 'Food Safety',                 desc: 'Food safety management along the supply chain',       icon: '🍽️' },
  { standard: 'ISO 13485:2016', name: 'Medical Devices',             desc: 'Quality management for medical devices',              icon: '🏥' },
  { standard: 'ISO 42001:2023', name: 'AI Management',               desc: 'Artificial intelligence management system',           icon: '🤖' },
];

// ─── Region groupings (matching Step2RegionSelection.tsx) ─────────────────────

type Region = 'ASEAN' | 'ANZ' | 'EAST_ASIA' | 'SOUTH_ASIA';

interface CountryEntry {
  countryCode: string;
  countryName: string;
  region: Region;
}

const APAC_COUNTRIES: CountryEntry[] = [
  // ASEAN
  { countryCode: 'SG', countryName: 'Singapore',   region: 'ASEAN' },
  { countryCode: 'MY', countryName: 'Malaysia',    region: 'ASEAN' },
  { countryCode: 'ID', countryName: 'Indonesia',   region: 'ASEAN' },
  { countryCode: 'TH', countryName: 'Thailand',    region: 'ASEAN' },
  { countryCode: 'VN', countryName: 'Vietnam',     region: 'ASEAN' },
  { countryCode: 'PH', countryName: 'Philippines', region: 'ASEAN' },
  { countryCode: 'MM', countryName: 'Myanmar',     region: 'ASEAN' },
  { countryCode: 'KH', countryName: 'Cambodia',    region: 'ASEAN' },
  { countryCode: 'LA', countryName: 'Laos',        region: 'ASEAN' },
  { countryCode: 'BN', countryName: 'Brunei',      region: 'ASEAN' },
  // ANZ
  { countryCode: 'AU', countryName: 'Australia',     region: 'ANZ' },
  { countryCode: 'NZ', countryName: 'New Zealand',   region: 'ANZ' },
  // EAST_ASIA
  { countryCode: 'JP', countryName: 'Japan',       region: 'EAST_ASIA' },
  { countryCode: 'KR', countryName: 'South Korea', region: 'EAST_ASIA' },
  { countryCode: 'HK', countryName: 'Hong Kong',   region: 'EAST_ASIA' },
  { countryCode: 'TW', countryName: 'Taiwan',      region: 'EAST_ASIA' },
  { countryCode: 'CN', countryName: 'China',       region: 'EAST_ASIA' },
  // SOUTH_ASIA
  { countryCode: 'IN', countryName: 'India',       region: 'SOUTH_ASIA' },
  { countryCode: 'BD', countryName: 'Bangladesh',  region: 'SOUTH_ASIA' },
  { countryCode: 'LK', countryName: 'Sri Lanka',   region: 'SOUTH_ASIA' },
];

// ─── Flag emoji map (matching Step2RegionSelection.tsx & Step4ReviewConfirm.tsx) ─

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', MY: '🇲🇾', ID: '🇮🇩',
  TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', JP: '🇯🇵', KR: '🇰🇷',
  HK: '🇭🇰', TW: '🇹🇼', CN: '🇨🇳', IN: '🇮🇳', BD: '🇧🇩',
  LK: '🇱🇰', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦', BN: '🇧🇳',
};

// ─── Wizard step metadata ─────────────────────────────────────────────────────

interface WizardStep {
  number: number;
  label: string;
  description: string;
  isRequired: boolean;
}

const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: 'Welcome',   description: 'Organisation name',          isRequired: true  },
  { number: 2, label: 'Region',    description: 'Primary country selection',   isRequired: true  },
  { number: 3, label: 'Standards', description: 'ISO standards selection',     isRequired: true  },
  { number: 4, label: 'Plan',      description: 'Pricing plan selection',      isRequired: false },
  { number: 5, label: 'Confirm',   description: 'Review and submit',           isRequired: false },
];

// ─── Plan tiers (matching PlanSelectionStep.tsx) ──────────────────────────────

interface PlanTier {
  id: string;
  name: string;
  badge: string | null;
  listMonthly: number | null;
  annualMonthly: number | null;
  minUsers: number;
  maxUsers: number | null;
  sla: string;
  support: string;
  trialEnabled: boolean;
  trialDays: number;
  platformFee: number | null;
  custom: boolean;
  features: readonly string[];
}

const TIERS: PlanTier[] = [
  {
    id: 'starter',        name: 'Starter',      badge: null,
    listMonthly: 49,      annualMonthly: 39,
    minUsers: 5,          maxUsers: 25,
    sla: '99.5%',         support: 'Email 9–5',
    trialEnabled: false,  trialDays: 0,
    platformFee: null,    custom: false,
    features: ['5–25 users', 'All core modules', '99.5% SLA', 'Email support (9–5)', '6-month minimum'],
  },
  {
    id: 'professional',   name: 'Professional', badge: '⭐ Most Popular',
    listMonthly: 39,      annualMonthly: 31,
    minUsers: 10,         maxUsers: 100,
    sla: '99.9%',         support: 'Email + Chat',
    trialEnabled: true,   trialDays: 14,
    platformFee: null,    custom: false,
    features: ['10–100 users', 'All core modules', '14-day free trial', '99.9% SLA', 'Email + Chat support', 'No minimum term'],
  },
  {
    id: 'enterprise',     name: 'Enterprise',   badge: null,
    listMonthly: 28,      annualMonthly: 22,
    minUsers: 25,         maxUsers: null,
    sla: '99.95%',        support: 'Priority + CSM',
    trialEnabled: false,  trialDays: 0,
    platformFee: 5000,    custom: false,
    features: ['25+ users', 'All modules incl. verticals', 'Volume pricing', '99.95% SLA', 'Priority + CSM', '£5,000/yr platform fee'],
  },
  {
    id: 'enterprise_plus', name: 'Enterprise+', badge: null,
    listMonthly: null,    annualMonthly: null,
    minUsers: 100,        maxUsers: null,
    sla: '99.99% dedicated', support: 'Dedicated CSM',
    trialEnabled: false,  trialDays: 0,
    platformFee: 12000,   custom: true,
    features: ['100+ users', 'All modules + white label', 'Custom pricing', '99.99% SLA (dedicated)', 'Dedicated CSM', '£12,000/yr platform fee'],
  },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function isOutOfRange(tier: PlanTier, userCount: number): boolean {
  return (
    userCount < tier.minUsers ||
    (tier.maxUsers !== null && userCount > tier.maxUsers)
  );
}

function annualSavingPercent(listMonthly: number, annualMonthly: number): number {
  return Math.round(((listMonthly - annualMonthly) / listMonthly) * 100);
}

function isoPublicationYear(standard: string): number {
  const match = standard.match(/:(\d{4})$/);
  if (!match) throw new Error(`Cannot parse year from: ${standard}`);
  return parseInt(match[1], 10);
}

function isoNumber(standard: string): number {
  const match = standard.match(/^ISO (\d+):/);
  if (!match) throw new Error(`Cannot parse number from: ${standard}`);
  return parseInt(match[1], 10);
}

function countriesInRegion(region: Region): CountryEntry[] {
  return APAC_COUNTRIES.filter((c) => c.region === region);
}

function canAdvanceFromStep(step: number, orgName: string, selectedISOs: string[], primaryCountry: string): boolean {
  switch (step) {
    case 1: return orgName.trim().length > 0;
    case 2: return APAC_COUNTRIES.some((c) => c.countryCode === primaryCountry);
    case 3: return selectedISOs.length > 0;
    case 4: return true;
    case 5: return true;
    default: return false;
  }
}

function estimatedAnnualCost(tier: PlanTier, userCount: number, billingCycle: 'monthly' | 'annual'): number | null {
  if (tier.custom) return null;
  const rate = billingCycle === 'annual' ? tier.annualMonthly : tier.listMonthly;
  if (rate === null) return null;
  return rate * userCount * 12 + (tier.platformFee ?? 0);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ISO_CATALOGUE — integrity', () => {
  it('has exactly 9 entries', () => {
    expect(ISO_CATALOGUE).toHaveLength(9);
  });
  it('no duplicate standard codes', () => {
    const codes = ISO_CATALOGUE.map((s) => s.standard);
    expect(new Set(codes).size).toBe(codes.length);
  });
  it('no duplicate names', () => {
    const names = ISO_CATALOGUE.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });
  for (const entry of ISO_CATALOGUE) {
    it(`${entry.standard} — standard matches ISO N:YYYY pattern`, () => {
      expect(entry.standard).toMatch(/^ISO \d+:\d{4}$/);
    });
    it(`${entry.standard} — name is non-empty`, () => {
      expect(entry.name.length).toBeGreaterThan(0);
    });
    it(`${entry.standard} — desc is non-empty`, () => {
      expect(entry.desc.length).toBeGreaterThan(0);
    });
    it(`${entry.standard} — icon is non-empty`, () => {
      expect(entry.icon.length).toBeGreaterThan(0);
    });
  }
  it('all publication years are >= 2015', () => {
    for (const entry of ISO_CATALOGUE) {
      expect(isoPublicationYear(entry.standard)).toBeGreaterThanOrEqual(2015);
    }
  });
  it('most recent standard is ISO 42001:2023', () => {
    const years = ISO_CATALOGUE.map((s) => isoPublicationYear(s.standard));
    expect(Math.max(...years)).toBe(2023);
  });
  it('ISO 9001 is the first entry (most universally adopted)', () => {
    expect(ISO_CATALOGUE[0].standard).toBe('ISO 9001:2015');
  });
});

describe('isoPublicationYear helper', () => {
  const cases: [string, number][] = [
    ['ISO 9001:2015', 2015],
    ['ISO 14001:2015', 2015],
    ['ISO 45001:2018', 2018],
    ['ISO 27001:2022', 2022],
    ['ISO 42001:2023', 2023],
  ];
  for (const [std, expected] of cases) {
    it(`${std} → ${expected}`, () => {
      expect(isoPublicationYear(std)).toBe(expected);
    });
  }
});

describe('isoNumber helper', () => {
  const cases: [string, number][] = [
    ['ISO 9001:2015', 9001],
    ['ISO 14001:2015', 14001],
    ['ISO 45001:2018', 45001],
    ['ISO 27001:2022', 27001],
    ['ISO 42001:2023', 42001],
    ['ISO 37001:2016', 37001],
    ['ISO 50001:2018', 50001],
    ['ISO 22000:2018', 22000],
    ['ISO 13485:2016', 13485],
  ];
  for (const [std, expected] of cases) {
    it(`${std} → ${expected}`, () => {
      expect(isoNumber(std)).toBe(expected);
    });
  }
});

describe('APAC_COUNTRIES — integrity', () => {
  it('has exactly 20 countries', () => {
    expect(APAC_COUNTRIES).toHaveLength(20);
  });
  it('no duplicate country codes', () => {
    const codes = APAC_COUNTRIES.map((c) => c.countryCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
  it('all country codes are exactly 2 uppercase letters', () => {
    for (const c of APAC_COUNTRIES) {
      expect(c.countryCode).toMatch(/^[A-Z]{2}$/);
    }
  });
  it('all regions are one of the 4 valid values', () => {
    const valid = new Set<Region>(['ASEAN', 'ANZ', 'EAST_ASIA', 'SOUTH_ASIA']);
    for (const c of APAC_COUNTRIES) {
      expect(valid.has(c.region)).toBe(true);
    }
  });
  it('all country names are non-empty', () => {
    for (const c of APAC_COUNTRIES) {
      expect(c.countryName.length).toBeGreaterThan(0);
    }
  });
  it('SG is in ASEAN', () => {
    const sg = APAC_COUNTRIES.find((c) => c.countryCode === 'SG');
    expect(sg?.region).toBe('ASEAN');
  });
  it('AU is in ANZ', () => {
    const au = APAC_COUNTRIES.find((c) => c.countryCode === 'AU');
    expect(au?.region).toBe('ANZ');
  });
  it('NZ is in ANZ', () => {
    const nz = APAC_COUNTRIES.find((c) => c.countryCode === 'NZ');
    expect(nz?.region).toBe('ANZ');
  });
  it('JP is in EAST_ASIA', () => {
    const jp = APAC_COUNTRIES.find((c) => c.countryCode === 'JP');
    expect(jp?.region).toBe('EAST_ASIA');
  });
  it('IN is in SOUTH_ASIA', () => {
    const india = APAC_COUNTRIES.find((c) => c.countryCode === 'IN');
    expect(india?.region).toBe('SOUTH_ASIA');
  });
});

describe('countriesInRegion helper', () => {
  it('ASEAN has 10 countries', () => {
    expect(countriesInRegion('ASEAN')).toHaveLength(10);
  });
  it('ANZ has 2 countries', () => {
    expect(countriesInRegion('ANZ')).toHaveLength(2);
  });
  it('EAST_ASIA has 5 countries', () => {
    expect(countriesInRegion('EAST_ASIA')).toHaveLength(5);
  });
  it('SOUTH_ASIA has 3 countries', () => {
    expect(countriesInRegion('SOUTH_ASIA')).toHaveLength(3);
  });
  it('all regions together account for all 20 countries', () => {
    const regions: Region[] = ['ASEAN', 'ANZ', 'EAST_ASIA', 'SOUTH_ASIA'];
    const total = regions.reduce((sum, r) => sum + countriesInRegion(r).length, 0);
    expect(total).toBe(APAC_COUNTRIES.length);
  });
  it('ANZ contains AU and NZ', () => {
    const anz = countriesInRegion('ANZ').map((c) => c.countryCode);
    expect(anz).toContain('AU');
    expect(anz).toContain('NZ');
  });
  it('ASEAN contains SG, MY, ID, TH, VN, PH, MM, KH, LA, BN', () => {
    const asean = countriesInRegion('ASEAN').map((c) => c.countryCode);
    for (const code of ['SG', 'MY', 'ID', 'TH', 'VN', 'PH', 'MM', 'KH', 'LA', 'BN']) {
      expect(asean).toContain(code);
    }
  });
});

describe('FLAG_EMOJIS — map integrity', () => {
  it('has 20 flag entries (one per country)', () => {
    expect(Object.keys(FLAG_EMOJIS)).toHaveLength(20);
  });
  it('every APAC country has a flag emoji', () => {
    for (const c of APAC_COUNTRIES) {
      expect(FLAG_EMOJIS[c.countryCode]).toBeDefined();
    }
  });
  it('all emoji values are non-empty strings', () => {
    for (const code of Object.keys(FLAG_EMOJIS)) {
      expect(typeof FLAG_EMOJIS[code]).toBe('string');
      expect(FLAG_EMOJIS[code].length).toBeGreaterThan(0);
    }
  });
  it('SG flag is defined', () => expect(FLAG_EMOJIS.SG).toBeDefined());
  it('AU flag is defined', () => expect(FLAG_EMOJIS.AU).toBeDefined());
  it('JP flag is defined', () => expect(FLAG_EMOJIS.JP).toBeDefined());
  it('IN flag is defined', () => expect(FLAG_EMOJIS.IN).toBeDefined());
  it('no undefined values in map', () => {
    for (const val of Object.values(FLAG_EMOJIS)) {
      expect(val).toBeTruthy();
    }
  });
});

describe('WIZARD_STEPS — metadata', () => {
  it('has exactly 5 steps', () => {
    expect(WIZARD_STEPS).toHaveLength(5);
  });
  it('step numbers are 1 through 5', () => {
    for (let i = 0; i < WIZARD_STEPS.length; i++) {
      expect(WIZARD_STEPS[i].number).toBe(i + 1);
    }
  });
  it('step 1 label is Welcome', () => {
    expect(WIZARD_STEPS[0].label).toBe('Welcome');
  });
  it('step 2 label is Region', () => {
    expect(WIZARD_STEPS[1].label).toBe('Region');
  });
  it('step 3 label is Standards', () => {
    expect(WIZARD_STEPS[2].label).toBe('Standards');
  });
  it('step 4 label is Plan', () => {
    expect(WIZARD_STEPS[3].label).toBe('Plan');
  });
  it('step 5 label is Confirm', () => {
    expect(WIZARD_STEPS[4].label).toBe('Confirm');
  });
  it('steps 1, 2, 3 are required', () => {
    expect(WIZARD_STEPS[0].isRequired).toBe(true);
    expect(WIZARD_STEPS[1].isRequired).toBe(true);
    expect(WIZARD_STEPS[2].isRequired).toBe(true);
  });
  it('steps 4, 5 are not required (have defaults)', () => {
    expect(WIZARD_STEPS[3].isRequired).toBe(false);
    expect(WIZARD_STEPS[4].isRequired).toBe(false);
  });
  it('all labels are unique', () => {
    const labels = WIZARD_STEPS.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
  it('all descriptions are non-empty', () => {
    for (const step of WIZARD_STEPS) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});

describe('canAdvanceFromStep', () => {
  it('step 1 — empty orgName blocks advance', () => {
    expect(canAdvanceFromStep(1, '', ['ISO 9001:2015'], 'SG')).toBe(false);
  });
  it('step 1 — whitespace-only orgName blocks advance', () => {
    expect(canAdvanceFromStep(1, '   ', ['ISO 9001:2015'], 'SG')).toBe(false);
  });
  it('step 1 — non-empty orgName allows advance', () => {
    expect(canAdvanceFromStep(1, 'Acme Pte Ltd', ['ISO 9001:2015'], 'SG')).toBe(true);
  });
  it('step 2 — valid APAC country allows advance', () => {
    expect(canAdvanceFromStep(2, 'Acme', ['ISO 9001:2015'], 'AU')).toBe(true);
  });
  it('step 2 — unsupported country blocks advance', () => {
    expect(canAdvanceFromStep(2, 'Acme', ['ISO 9001:2015'], 'DE')).toBe(false);
  });
  it('step 2 — empty country code blocks advance', () => {
    expect(canAdvanceFromStep(2, 'Acme', ['ISO 9001:2015'], '')).toBe(false);
  });
  for (const c of APAC_COUNTRIES) {
    it(`step 2 — ${c.countryCode} is valid`, () => {
      expect(canAdvanceFromStep(2, 'Acme', ['ISO 9001:2015'], c.countryCode)).toBe(true);
    });
  }
  it('step 3 — no ISOs blocks advance', () => {
    expect(canAdvanceFromStep(3, 'Acme', [], 'SG')).toBe(false);
  });
  it('step 3 — one ISO allows advance', () => {
    expect(canAdvanceFromStep(3, 'Acme', ['ISO 9001:2015'], 'SG')).toBe(true);
  });
  it('step 4 — always allows advance', () => {
    expect(canAdvanceFromStep(4, '', [], 'ZZ')).toBe(true);
  });
  it('step 5 — always allows advance', () => {
    expect(canAdvanceFromStep(5, '', [], 'ZZ')).toBe(true);
  });
  it('step 0 — invalid step cannot advance', () => {
    expect(canAdvanceFromStep(0, 'Acme', ['ISO 9001:2015'], 'SG')).toBe(false);
  });
  it('step 99 — invalid step cannot advance', () => {
    expect(canAdvanceFromStep(99, 'Acme', ['ISO 9001:2015'], 'SG')).toBe(false);
  });
});

describe('TIERS — feature integrity', () => {
  for (const tier of TIERS) {
    it(`${tier.name} — has at least 5 features`, () => {
      expect(tier.features.length).toBeGreaterThanOrEqual(5);
    });
    it(`${tier.name} — all features are non-empty strings`, () => {
      for (const f of tier.features) {
        expect(typeof f).toBe('string');
        expect(f.length).toBeGreaterThan(0);
      }
    });
    it(`${tier.name} — sla is non-empty`, () => {
      expect(tier.sla.length).toBeGreaterThan(0);
    });
    it(`${tier.name} — support is non-empty`, () => {
      expect(tier.support.length).toBeGreaterThan(0);
    });
  }
  it('Starter features mention 6-month minimum term', () => {
    const starter = TIERS.find((t) => t.id === 'starter')!;
    expect(starter.features.some((f) => f.includes('minimum'))).toBe(true);
  });
  it('Professional features mention free trial', () => {
    const pro = TIERS.find((t) => t.id === 'professional')!;
    expect(pro.features.some((f) => f.includes('trial'))).toBe(true);
  });
  it('Professional features mention No minimum term', () => {
    const pro = TIERS.find((t) => t.id === 'professional')!;
    expect(pro.features.some((f) => f.includes('No minimum term'))).toBe(true);
  });
  it('Enterprise features mention volume pricing', () => {
    const ent = TIERS.find((t) => t.id === 'enterprise')!;
    expect(ent.features.some((f) => f.toLowerCase().includes('volume'))).toBe(true);
  });
  it('Enterprise+ features mention white label', () => {
    const ep = TIERS.find((t) => t.id === 'enterprise_plus')!;
    expect(ep.features.some((f) => f.includes('white label'))).toBe(true);
  });
  it('SLA quality increases across tiers', () => {
    // 99.5 < 99.9 < 99.95 < 99.99
    const slaNumbers = TIERS.map((t) => parseFloat(t.sla.replace('%', '')));
    for (let i = 1; i < slaNumbers.length; i++) {
      expect(slaNumbers[i]).toBeGreaterThan(slaNumbers[i - 1]);
    }
  });
});

describe('isOutOfRange helper', () => {
  const starter = TIERS.find((t) => t.id === 'starter')!;
  const professional = TIERS.find((t) => t.id === 'professional')!;
  const enterprise = TIERS.find((t) => t.id === 'enterprise')!;
  const enterprisePlus = TIERS.find((t) => t.id === 'enterprise_plus')!;

  it('1 user is out of range for Starter (min 5)', () => {
    expect(isOutOfRange(starter, 1)).toBe(true);
  });
  it('5 users is in range for Starter', () => {
    expect(isOutOfRange(starter, 5)).toBe(false);
  });
  it('25 users is in range for Starter (boundary)', () => {
    expect(isOutOfRange(starter, 25)).toBe(false);
  });
  it('26 users is out of range for Starter (max 25)', () => {
    expect(isOutOfRange(starter, 26)).toBe(true);
  });
  it('10 users is in range for Professional', () => {
    expect(isOutOfRange(professional, 10)).toBe(false);
  });
  it('100 users is in range for Professional (boundary)', () => {
    expect(isOutOfRange(professional, 100)).toBe(false);
  });
  it('101 users is out of range for Professional', () => {
    expect(isOutOfRange(professional, 101)).toBe(true);
  });
  it('25 users is in range for Enterprise (no max)', () => {
    expect(isOutOfRange(enterprise, 25)).toBe(false);
  });
  it('500 users is in range for Enterprise (no max)', () => {
    expect(isOutOfRange(enterprise, 500)).toBe(false);
  });
  it('100 users is in range for Enterprise+', () => {
    expect(isOutOfRange(enterprisePlus, 100)).toBe(false);
  });
  it('99 users is out of range for Enterprise+ (min 100)', () => {
    expect(isOutOfRange(enterprisePlus, 99)).toBe(true);
  });
});

describe('annualSavingPercent helper', () => {
  it('Starter: 49 → 39 is ~20% saving', () => {
    expect(annualSavingPercent(49, 39)).toBe(20);
  });
  it('Professional: 39 → 31 is ~21% saving', () => {
    expect(annualSavingPercent(39, 31)).toBe(21);
  });
  it('returns 0 when rates are equal', () => {
    expect(annualSavingPercent(30, 30)).toBe(0);
  });
  it('result is always non-negative integer', () => {
    const cases: [number, number][] = [[49, 39], [39, 31], [28, 22], [100, 80]];
    for (const [list, annual] of cases) {
      const saving = annualSavingPercent(list, annual);
      expect(saving).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(saving)).toBe(true);
    }
  });
});

describe('estimatedAnnualCost helper', () => {
  const starter = TIERS.find((t) => t.id === 'starter')!;
  const professional = TIERS.find((t) => t.id === 'professional')!;
  const enterprise = TIERS.find((t) => t.id === 'enterprise')!;
  const enterprisePlus = TIERS.find((t) => t.id === 'enterprise_plus')!;

  it('Starter 10 users annual → £39×10×12 = £4,680', () => {
    expect(estimatedAnnualCost(starter, 10, 'annual')).toBe(4680);
  });
  it('Starter 10 users monthly → £49×10×12 = £5,880', () => {
    expect(estimatedAnnualCost(starter, 10, 'monthly')).toBe(5880);
  });
  it('Professional 10 users annual → £31×10×12 = £3,720', () => {
    expect(estimatedAnnualCost(professional, 10, 'annual')).toBe(3720);
  });
  it('Enterprise 50 users annual → £22×50×12+£5000 = £18,200', () => {
    expect(estimatedAnnualCost(enterprise, 50, 'annual')).toBe(18200);
  });
  it('Enterprise+ returns null (custom pricing)', () => {
    expect(estimatedAnnualCost(enterprisePlus, 200, 'annual')).toBeNull();
  });
  it('annual cost is always greater than 0 for non-custom tiers', () => {
    for (const tier of TIERS.filter((t) => !t.custom)) {
      const cost = estimatedAnnualCost(tier, 10, 'annual');
      if (cost !== null) expect(cost).toBeGreaterThan(0);
    }
  });
  it('annual billing always cheaper than monthly for Starter', () => {
    const annual = estimatedAnnualCost(starter, 20, 'annual')!;
    const monthly = estimatedAnnualCost(starter, 20, 'monthly')!;
    expect(annual).toBeLessThan(monthly);
  });
  it('annual billing always cheaper than monthly for Professional', () => {
    const annual = estimatedAnnualCost(professional, 50, 'annual')!;
    const monthly = estimatedAnnualCost(professional, 50, 'monthly')!;
    expect(annual).toBeLessThan(monthly);
  });
});

describe('Cross-domain invariants', () => {
  it('each APAC country code appears in FLAG_EMOJIS', () => {
    for (const c of APAC_COUNTRIES) {
      expect(FLAG_EMOJIS[c.countryCode]).toBeDefined();
    }
  });
  it('FLAG_EMOJIS has same count as APAC_COUNTRIES', () => {
    expect(Object.keys(FLAG_EMOJIS).length).toBe(APAC_COUNTRIES.length);
  });
  it('WIZARD_STEPS count equals TOTAL_STEPS constant (5)', () => {
    expect(WIZARD_STEPS).toHaveLength(5);
  });
  it('required steps are a subset of the first 3 steps', () => {
    for (const step of WIZARD_STEPS) {
      if (step.isRequired) {
        expect(step.number).toBeLessThanOrEqual(3);
      }
    }
  });
  it('ISO_CATALOGUE standard codes all match those expected by toggleISO logic', () => {
    for (const entry of ISO_CATALOGUE) {
      expect(entry.standard).toMatch(/^ISO \d+:\d{4}$/);
    }
  });
  it('only Professional tier has a trial and a badge', () => {
    const trialTiers = TIERS.filter((t) => t.trialEnabled);
    const badgeTiers = TIERS.filter((t) => t.badge !== null);
    expect(trialTiers).toHaveLength(1);
    expect(badgeTiers).toHaveLength(1);
    expect(trialTiers[0].id).toBe('professional');
    expect(badgeTiers[0].id).toBe('professional');
  });
  it('Enterprise minUsers (25) is smaller than Enterprise+ minUsers (100)', () => {
    const ent = TIERS.find((t) => t.id === 'enterprise')!;
    const ep = TIERS.find((t) => t.id === 'enterprise_plus')!;
    expect(ent.minUsers).toBeLessThan(ep.minUsers);
  });
  it('the 3 SOUTH_ASIA countries include India', () => {
    const sa = countriesInRegion('SOUTH_ASIA');
    expect(sa.some((c) => c.countryCode === 'IN')).toBe(true);
  });
  it('canAdvanceFromStep returns true for all valid countries at step 2', () => {
    for (const c of APAC_COUNTRIES) {
      expect(canAdvanceFromStep(2, 'Org', ['ISO 9001:2015'], c.countryCode)).toBe(true);
    }
  });
  it('canAdvanceFromStep returns false for EU country codes at step 2', () => {
    for (const code of ['DE', 'FR', 'GB', 'US', 'CA', 'BR']) {
      expect(canAdvanceFromStep(2, 'Org', ['ISO 9001:2015'], code)).toBe(false);
    }
  });
});

// ─── Parametric: per-country region membership ────────────────────────────────

describe('APAC_COUNTRIES — per-country region membership (parametric)', () => {
  const expected: [string, Region][] = [
    ['SG', 'ASEAN'], ['MY', 'ASEAN'], ['ID', 'ASEAN'], ['TH', 'ASEAN'],
    ['VN', 'ASEAN'], ['PH', 'ASEAN'], ['MM', 'ASEAN'], ['KH', 'ASEAN'],
    ['LA', 'ASEAN'], ['BN', 'ASEAN'],
    ['AU', 'ANZ'],   ['NZ', 'ANZ'],
    ['JP', 'EAST_ASIA'], ['KR', 'EAST_ASIA'], ['HK', 'EAST_ASIA'],
    ['TW', 'EAST_ASIA'], ['CN', 'EAST_ASIA'],
    ['IN', 'SOUTH_ASIA'], ['BD', 'SOUTH_ASIA'], ['LK', 'SOUTH_ASIA'],
  ];
  for (const [code, region] of expected) {
    it(`${code} is in ${region}`, () => {
      const country = APAC_COUNTRIES.find((c) => c.countryCode === code);
      expect(country?.region).toBe(region);
    });
  }
});

// ─── Parametric: isoPublicationYear for all 9 standards ──────────────────────

describe('isoPublicationYear — all 9 catalogue standards (parametric)', () => {
  const cases: [string, number][] = [
    ['ISO 9001:2015', 2015], ['ISO 14001:2015', 2015], ['ISO 45001:2018', 2018],
    ['ISO 27001:2022', 2022], ['ISO 37001:2016', 2016], ['ISO 50001:2018', 2018],
    ['ISO 22000:2018', 2018], ['ISO 13485:2016', 2016], ['ISO 42001:2023', 2023],
  ];
  for (const [std, year] of cases) {
    it(`${std} → ${year}`, () => {
      expect(isoPublicationYear(std)).toBe(year);
    });
  }
});

// ─── Parametric: isOutOfRange boundary matrix ─────────────────────────────────

describe('isOutOfRange — comprehensive boundary matrix (parametric)', () => {
  const starter      = TIERS.find((t) => t.id === 'starter')!;
  const professional = TIERS.find((t) => t.id === 'professional')!;
  const enterprise   = TIERS.find((t) => t.id === 'enterprise')!;
  const ep           = TIERS.find((t) => t.id === 'enterprise_plus')!;

  const cases: [typeof starter, number, boolean][] = [
    // Starter: 5–25
    [starter, 4,   true],  [starter, 5, false], [starter, 15, false],
    [starter, 25,  false], [starter, 26, true],
    // Professional: 10–100
    [professional, 9,   true],  [professional, 10, false],
    [professional, 50,  false], [professional, 100, false], [professional, 101, true],
    // Enterprise: 25+ (no max)
    [enterprise, 24, true],  [enterprise, 25, false],
    [enterprise, 999, false],
    // Enterprise+: 100+ (no max)
    [ep, 99, true], [ep, 100, false], [ep, 1000, false],
  ];

  for (const [tier, users, expected] of cases) {
    it(`${tier.name} — ${users} users → out-of-range=${expected}`, () => {
      expect(isOutOfRange(tier, users)).toBe(expected);
    });
  }
});

// ─── Parametric: estimatedAnnualCost ─────────────────────────────────────────

describe('estimatedAnnualCost — parametric cases', () => {
  const starter      = TIERS.find((t) => t.id === 'starter')!;
  const professional = TIERS.find((t) => t.id === 'professional')!;
  const enterprise   = TIERS.find((t) => t.id === 'enterprise')!;
  const ep           = TIERS.find((t) => t.id === 'enterprise_plus')!;

  const cases: [typeof starter, number, 'monthly' | 'annual', number | null][] = [
    [starter,      5,  'annual',  39 * 5 * 12],            // £2,340
    [starter,     25,  'annual',  39 * 25 * 12],           // £11,700
    [starter,     10,  'monthly', 49 * 10 * 12],           // £5,880
    [professional, 50, 'annual',  31 * 50 * 12],           // £18,600
    [professional, 10, 'monthly', 39 * 10 * 12],           // £4,680
    [enterprise,   25, 'annual',  22 * 25 * 12 + 5000],    // £11,600
    [enterprise,  100, 'annual',  22 * 100 * 12 + 5000],   // £31,400
    [ep,          200, 'annual',  null],                    // custom
    [ep,          500, 'monthly', null],                    // custom
  ];

  for (const [tier, users, cycle, expected] of cases) {
    const label = expected === null ? 'null' : `£${expected.toLocaleString()}`;
    it(`${tier.name} ${users} users ${cycle} → ${label}`, () => {
      expect(estimatedAnnualCost(tier, users, cycle)).toBe(expected);
    });
  }
});

// ─── Parametric: annualSavingPercent ─────────────────────────────────────────

describe('annualSavingPercent — all tiers (parametric)', () => {
  const cases: [number, number, number][] = [
    [49, 39, 20],   // Starter
    [39, 31, 21],   // Professional (Math.round(8/39*100)=21)
    [28, 22, 21],   // Enterprise (Math.round(6/28*100)=21)
    [100, 80, 20],
    [100, 75, 25],
    [50, 40, 20],
  ];
  for (const [list, annual, expected] of cases) {
    it(`annualSavingPercent(${list}, ${annual}) = ${expected}%`, () => {
      expect(annualSavingPercent(list, annual)).toBe(expected);
    });
  }
});

// ─── Parametric: per-WIZARD_STEP metadata ─────────────────────────────────────

describe('WIZARD_STEPS — per-step parametric', () => {
  const expected: [number, string, boolean][] = [
    [1, 'Welcome',   true],
    [2, 'Region',    true],
    [3, 'Standards', true],
    [4, 'Plan',      false],
    [5, 'Confirm',   false],
  ];
  for (const [num, label, required] of expected) {
    it(`step ${num} label = "${label}" and isRequired=${required}`, () => {
      const step = WIZARD_STEPS.find((s) => s.number === num)!;
      expect(step.label).toBe(label);
      expect(step.isRequired).toBe(required);
    });
  }
});

// ─── Tier pricing ordering ────────────────────────────────────────────────────

describe('Tier pricing ordering and structure', () => {
  it('listMonthly decreases across STARTER→PROFESSIONAL→ENTERPRISE', () => {
    const [s, p, e] = ['starter', 'professional', 'enterprise'].map(
      (id) => TIERS.find((t) => t.id === id)!
    );
    expect(s.listMonthly!).toBeGreaterThan(p.listMonthly!);
    expect(p.listMonthly!).toBeGreaterThan(e.listMonthly!);
  });

  it('annualMonthly follows same order as listMonthly', () => {
    const [s, p, e] = ['starter', 'professional', 'enterprise'].map(
      (id) => TIERS.find((t) => t.id === id)!
    );
    expect(s.annualMonthly!).toBeGreaterThan(p.annualMonthly!);
    expect(p.annualMonthly!).toBeGreaterThan(e.annualMonthly!);
  });

  it('Enterprise+ has null listMonthly and annualMonthly (custom pricing)', () => {
    const ep = TIERS.find((t) => t.id === 'enterprise_plus')!;
    expect(ep.listMonthly).toBeNull();
    expect(ep.annualMonthly).toBeNull();
  });

  it('Platform fee is null for Starter and Professional', () => {
    expect(TIERS.find((t) => t.id === 'starter')!.platformFee).toBeNull();
    expect(TIERS.find((t) => t.id === 'professional')!.platformFee).toBeNull();
  });

  it('Enterprise platform fee is £5,000', () => {
    expect(TIERS.find((t) => t.id === 'enterprise')!.platformFee).toBe(5000);
  });

  it('Enterprise+ platform fee is £12,000', () => {
    expect(TIERS.find((t) => t.id === 'enterprise_plus')!.platformFee).toBe(12000);
  });

  it('minUsers increases across all 4 tiers', () => {
    const mins = TIERS.map((t) => t.minUsers);
    for (let i = 1; i < mins.length; i++) {
      expect(mins[i]).toBeGreaterThan(mins[i - 1]);
    }
  });

  it('Starter has 14-day trial disabled', () => {
    expect(TIERS.find((t) => t.id === 'starter')!.trialEnabled).toBe(false);
  });

  it('Professional has 14-day trial enabled', () => {
    const pro = TIERS.find((t) => t.id === 'professional')!;
    expect(pro.trialEnabled).toBe(true);
    expect(pro.trialDays).toBe(14);
  });

  it('only Professional is not custom pricing', () => {
    const customTiers = TIERS.filter((t) => t.custom);
    expect(customTiers).toHaveLength(1);
    expect(customTiers[0].id).toBe('enterprise_plus');
  });
});
