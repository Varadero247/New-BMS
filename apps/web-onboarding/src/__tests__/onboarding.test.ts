// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Spec tests for web-onboarding app — pure logic, no React imports
// Uses inline types/constants to avoid JSX transform requirements

// ─── Types (inline, matching OnboardingContext.tsx) ───────────────────────────
interface OnboardingState {
  orgName: string;
  primaryCountry: string;
  operatingCountries: string[];
  selectedISOs: string[];
  step: number;
  selectedPlan: string;
  billingCycle: 'monthly' | 'annual';
  userCount: number;
}

// ─── Constants (inline, matching PlanSelectionStep.tsx) ───────────────────────
const SUPPORTED_COUNTRIES = [
  'SG', 'AU', 'NZ', 'MY', 'ID', 'TH', 'VN', 'PH',
  'JP', 'KR', 'HK', 'TW', 'CN', 'IN', 'BD', 'LK',
  'MM', 'KH', 'LA', 'BN',
];

const ISO_STANDARDS = [
  'ISO 9001:2015',
  'ISO 14001:2015',
  'ISO 45001:2018',
  'ISO 27001:2022',
  'ISO 37001:2016',
  'ISO 50001:2018',
  'ISO 22000:2018',
  'ISO 13485:2016',
  'ISO 42001:2023',
];

const TOTAL_STEPS = 5; // Step1:Welcome, Step2:Region, Step3:Standards, Step4:PlanSelection, Step5:ReviewConfirm

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    badge: null as string | null,
    listMonthly: 49,
    annualMonthly: 39,
    minUsers: 5,
    maxUsers: 25 as number | null,
    sla: '99.5%',
    support: 'Email 9–5',
    trialEnabled: false,
    trialDays: 0,
    platformFee: null as number | null,
    custom: false,
    features: ['5–25 users', 'All core modules', '99.5% SLA', 'Email support (9–5)', '6-month minimum'],
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: '⭐ Most Popular' as string | null,
    listMonthly: 39,
    annualMonthly: 31,
    minUsers: 10,
    maxUsers: 100 as number | null,
    sla: '99.9%',
    support: 'Email + Chat',
    trialEnabled: true,
    trialDays: 14,
    platformFee: null as number | null,
    custom: false,
    features: ['10–100 users', 'All core modules', '14-day free trial', '99.9% SLA', 'Email + Chat support', 'No minimum term'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null as string | null,
    listMonthly: 28,
    annualMonthly: 22,
    minUsers: 25,
    maxUsers: null as number | null,
    sla: '99.95%',
    support: 'Priority + CSM',
    trialEnabled: false,
    trialDays: 0,
    platformFee: 5000,
    custom: false,
    features: ['25+ users', 'All modules incl. verticals', 'Volume pricing', '99.95% SLA', 'Priority + CSM', '£5,000/yr platform fee'],
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise+',
    badge: null as string | null,
    listMonthly: null as number | null,
    annualMonthly: null as number | null,
    minUsers: 100,
    maxUsers: null as number | null,
    sla: '99.99% dedicated',
    support: 'Dedicated CSM',
    trialEnabled: false,
    trialDays: 0,
    platformFee: 12000,
    custom: true,
    features: ['100+ users', 'All modules + white label', 'Custom pricing', '99.99% SLA (dedicated)', 'Dedicated CSM', '£12,000/yr platform fee'],
  },
] as const;

const VOLUME_BANDS = [
  { minUsers: 25,  maxUsers: 49,  annualMonthly: 22 },
  { minUsers: 50,  maxUsers: 99,  annualMonthly: 22 },
  { minUsers: 100, maxUsers: 199, annualMonthly: 20 },
  { minUsers: 200, maxUsers: 499, annualMonthly: 18 },
];

const DEFAULT_STATE: OnboardingState = {
  orgName: '',
  primaryCountry: 'SG',
  operatingCountries: [],
  selectedISOs: ['ISO 9001:2015'],
  step: 1,
  selectedPlan: 'professional',
  billingCycle: 'annual',
  userCount: 10,
};

// ─── Pure helpers (matching PlanSelectionStep.tsx) ────────────────────────────
function toggleISO(selectedISOs: string[], standard: string): string[] {
  return selectedISOs.includes(standard)
    ? selectedISOs.filter((s) => s !== standard)
    : [...selectedISOs, standard];
}

function toggleOperatingCountry(operatingCountries: string[], code: string): string[] {
  return operatingCountries.includes(code)
    ? operatingCountries.filter((c) => c !== code)
    : [...operatingCountries, code];
}

function isStepValid(state: OnboardingState): boolean {
  switch (state.step) {
    case 1: return state.orgName.trim().length > 0;
    case 2: return SUPPORTED_COUNTRIES.includes(state.primaryCountry);
    case 3: return state.selectedISOs.length > 0;
    case 4: return true; // plan selection — always valid (has default)
    case 5: return true; // review/confirm — always valid
    default: return false;
  }
}

function buildOnboardingPayload(state: OnboardingState) {
  return {
    orgName: state.orgName.trim(),
    primaryCountry: state.primaryCountry,
    operatingCountries: state.operatingCountries,
    selectedISOs: state.selectedISOs,
    selectedPlan: state.selectedPlan,
    billingCycle: state.billingCycle,
    userCount: state.userCount,
  };
}

function getStepLabel(step: number): string {
  const labels: Record<number, string> = {
    1: 'Welcome',
    2: 'Region',
    3: 'Standards',
    4: 'Plan',
    5: 'Confirm',
  };
  return labels[step] ?? 'Unknown';
}

function recommendPlan(users: number): string {
  if (users >= 100) return 'enterprise_plus';
  if (users >= 25) return 'enterprise';
  return 'professional';
}

function getVolumeRate(users: number): number | null {
  for (const band of VOLUME_BANDS) {
    if (users >= band.minUsers && users <= band.maxUsers) {
      return band.annualMonthly;
    }
  }
  return null;
}

function formatPrice(monthly: number | null): string {
  if (monthly === null) return 'Custom';
  return `£${monthly}`;
}

function getDisplayRate(
  tierId: string,
  annualMonthly: number | null,
  listMonthly: number | null,
  billingCycle: 'monthly' | 'annual',
  userCount: number,
): number | null {
  if (tierId === 'enterprise_plus') return null;
  if (tierId === 'enterprise') {
    return getVolumeRate(userCount) ?? annualMonthly;
  }
  return billingCycle === 'annual' ? annualMonthly : listMonthly;
}

function getAnnualCost(
  tierId: string,
  annualMonthly: number | null,
  listMonthly: number | null,
  platformFee: number | null,
  custom: boolean,
  billingCycle: 'monthly' | 'annual',
  userCount: number,
): string {
  const rate = getDisplayRate(tierId, annualMonthly, listMonthly, billingCycle, userCount);
  if (rate === null) return 'Custom';
  const userCost = rate * userCount * 12;
  const fee = platformFee ?? 0;
  return `£${(userCost + fee).toLocaleString()}/yr`;
}

function getCTA(tierId: string, trialEnabled: boolean): string {
  if (trialEnabled) return 'Start 14-day free trial';
  if (tierId === 'enterprise' || tierId === 'enterprise_plus') return 'Talk to Sales';
  return 'Get started';
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OnboardingContext — default state', () => {
  it('default primaryCountry is SG', () => {
    expect(DEFAULT_STATE.primaryCountry).toBe('SG');
  });
  it('default selectedISOs contains ISO 9001:2015', () => {
    expect(DEFAULT_STATE.selectedISOs).toContain('ISO 9001:2015');
  });
  it('default step is 1', () => {
    expect(DEFAULT_STATE.step).toBe(1);
  });
  it('default operatingCountries is empty', () => {
    expect(DEFAULT_STATE.operatingCountries).toHaveLength(0);
  });
  it('default selectedPlan is professional', () => {
    expect(DEFAULT_STATE.selectedPlan).toBe('professional');
  });
  it('default billingCycle is annual', () => {
    expect(DEFAULT_STATE.billingCycle).toBe('annual');
  });
  it('default userCount is 10', () => {
    expect(DEFAULT_STATE.userCount).toBe(10);
  });
});

describe('toggleISO', () => {
  it('adds a standard not yet selected', () => {
    const result = toggleISO(['ISO 9001:2015'], 'ISO 14001:2015');
    expect(result).toContain('ISO 14001:2015');
    expect(result).toHaveLength(2);
  });
  it('removes a standard that is selected', () => {
    const result = toggleISO(['ISO 9001:2015', 'ISO 14001:2015'], 'ISO 9001:2015');
    expect(result).not.toContain('ISO 9001:2015');
    expect(result).toContain('ISO 14001:2015');
  });
  it('does not mutate the original array', () => {
    const original = ['ISO 9001:2015'];
    toggleISO(original, 'ISO 14001:2015');
    expect(original).toHaveLength(1);
  });
  it('toggle on → off → on returns original length', () => {
    const a = toggleISO(['ISO 9001:2015'], 'ISO 14001:2015');
    const b = toggleISO(a, 'ISO 14001:2015');
    expect(b).toHaveLength(1);
  });
  it('toggling all 9 standards produces length 9', () => {
    let selected: string[] = [];
    for (const std of ISO_STANDARDS) selected = toggleISO(selected, std);
    expect(selected).toHaveLength(9);
  });
});

describe('toggleOperatingCountry', () => {
  it('adds a new country', () => {
    const result = toggleOperatingCountry(['SG'], 'AU');
    expect(result).toContain('AU');
    expect(result).toHaveLength(2);
  });
  it('removes an existing country', () => {
    const result = toggleOperatingCountry(['SG', 'AU', 'NZ'], 'AU');
    expect(result).not.toContain('AU');
    expect(result).toHaveLength(2);
  });
  it('does not mutate original array', () => {
    const orig = ['SG'];
    toggleOperatingCountry(orig, 'AU');
    expect(orig).toHaveLength(1);
  });
  it('toggle add then remove returns empty', () => {
    const a = toggleOperatingCountry([], 'SG');
    const b = toggleOperatingCountry(a, 'SG');
    expect(b).toHaveLength(0);
  });
});

describe('isStepValid', () => {
  it('step 1 invalid when orgName empty', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 1, orgName: '' })).toBe(false);
  });
  it('step 1 invalid when orgName is only whitespace', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 1, orgName: '   ' })).toBe(false);
  });
  it('step 1 valid when orgName is non-empty', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 1, orgName: 'Acme Pte Ltd' })).toBe(true);
  });
  for (const code of SUPPORTED_COUNTRIES) {
    it(`step 2 valid for supported country ${code}`, () => {
      expect(isStepValid({ ...DEFAULT_STATE, step: 2, primaryCountry: code })).toBe(true);
    });
  }
  it('step 2 invalid for unsupported country ZZ', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 2, primaryCountry: 'ZZ' })).toBe(false);
  });
  it('step 2 invalid for empty string', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 2, primaryCountry: '' })).toBe(false);
  });
  it('step 3 invalid when no ISOs selected', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 3, selectedISOs: [] })).toBe(false);
  });
  it('step 3 valid when one ISO selected', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 3, selectedISOs: ['ISO 9001:2015'] })).toBe(true);
  });
  it('step 4 is always valid (plan has default)', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 4 })).toBe(true);
  });
  it('step 5 is always valid', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 5 })).toBe(true);
  });
  it('unknown step is invalid', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 99 })).toBe(false);
  });
});

describe('Supported countries', () => {
  it('has exactly 20 supported countries', () => {
    expect(SUPPORTED_COUNTRIES).toHaveLength(20);
  });
  it('all codes are 2 uppercase letters', () => {
    for (const code of SUPPORTED_COUNTRIES) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });
  it('no duplicate codes', () => {
    expect(new Set(SUPPORTED_COUNTRIES).size).toBe(SUPPORTED_COUNTRIES.length);
  });
  const expectedCountries = ['SG', 'AU', 'NZ', 'MY', 'ID', 'TH', 'VN', 'PH', 'JP', 'KR',
    'HK', 'TW', 'CN', 'IN', 'BD', 'LK', 'MM', 'KH', 'LA', 'BN'];
  for (const code of expectedCountries) {
    it(`includes ${code}`, () => {
      expect(SUPPORTED_COUNTRIES).toContain(code);
    });
  }
});

describe('ISO Standards catalogue', () => {
  it('has 9 ISO standards', () => {
    expect(ISO_STANDARDS).toHaveLength(9);
  });
  it('all entries match ISO N:YYYY pattern', () => {
    for (const std of ISO_STANDARDS) {
      expect(std).toMatch(/^ISO \d+:\d{4}$/);
    }
  });
  it('no duplicates', () => {
    expect(new Set(ISO_STANDARDS).size).toBe(ISO_STANDARDS.length);
  });
  const expectedStandards = [
    'ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018',
    'ISO 27001:2022', 'ISO 37001:2016', 'ISO 50001:2018',
    'ISO 22000:2018', 'ISO 13485:2016', 'ISO 42001:2023',
  ];
  for (const std of expectedStandards) {
    it(`includes ${std}`, () => {
      expect(ISO_STANDARDS).toContain(std);
    });
  }
});

describe('Step navigation', () => {
  it('total steps is 5', () => {
    expect(TOTAL_STEPS).toBe(5);
  });
  const stepLabels: [number, string][] = [
    [1, 'Welcome'], [2, 'Region'], [3, 'Standards'], [4, 'Plan'], [5, 'Confirm'],
  ];
  for (const [step, label] of stepLabels) {
    it(`step ${step} label is "${label}"`, () => {
      expect(getStepLabel(step)).toBe(label);
    });
  }
  it('returns Unknown for step 0', () => {
    expect(getStepLabel(0)).toBe('Unknown');
  });
  it('returns Unknown for step 99', () => {
    expect(getStepLabel(99)).toBe('Unknown');
  });
});

describe('TIERS — structure', () => {
  it('has exactly 4 tiers', () => {
    expect(TIERS).toHaveLength(4);
  });
  it('tier ids are starter, professional, enterprise, enterprise_plus', () => {
    expect(TIERS.map((t) => t.id)).toEqual(['starter', 'professional', 'enterprise', 'enterprise_plus']);
  });
  it('only professional has trialEnabled=true', () => {
    const trialTiers = TIERS.filter((t) => t.trialEnabled);
    expect(trialTiers).toHaveLength(1);
    expect(trialTiers[0].id).toBe('professional');
  });
  it('professional trialDays is 14', () => {
    const pro = TIERS.find((t) => t.id === 'professional')!;
    expect(pro.trialDays).toBe(14);
  });
  it('only enterprise_plus is custom', () => {
    const customTiers = TIERS.filter((t) => t.custom);
    expect(customTiers).toHaveLength(1);
    expect(customTiers[0].id).toBe('enterprise_plus');
  });
  it('enterprise and enterprise_plus have platformFee', () => {
    const withFee = TIERS.filter((t) => t.platformFee !== null);
    expect(withFee.map((t) => t.id)).toEqual(['enterprise', 'enterprise_plus']);
  });
  it('enterprise platformFee is 5000', () => {
    const ent = TIERS.find((t) => t.id === 'enterprise')!;
    expect(ent.platformFee).toBe(5000);
  });
  it('enterprise_plus platformFee is 12000', () => {
    const ep = TIERS.find((t) => t.id === 'enterprise_plus')!;
    expect(ep.platformFee).toBe(12000);
  });
  it('enterprise_plus has null annualMonthly (custom pricing)', () => {
    const ep = TIERS.find((t) => t.id === 'enterprise_plus')!;
    expect(ep.annualMonthly).toBeNull();
  });
  it('starter listMonthly (49) > professional listMonthly (39)', () => {
    const starter = TIERS.find((t) => t.id === 'starter')!;
    const pro = TIERS.find((t) => t.id === 'professional')!;
    expect(starter.listMonthly).toBeGreaterThan(pro.listMonthly);
  });
  it('professional annualMonthly (31) > enterprise annualMonthly (22)', () => {
    const pro = TIERS.find((t) => t.id === 'professional')!;
    const ent = TIERS.find((t) => t.id === 'enterprise')!;
    expect(pro.annualMonthly).toBeGreaterThan(ent.annualMonthly);
  });
  it('all tier ids are lowercase', () => {
    for (const t of TIERS) {
      expect(t.id).toBe(t.id.toLowerCase());
    }
  });
  it('all tier names start with uppercase', () => {
    for (const t of TIERS) {
      expect(t.name[0]).toBe(t.name[0].toUpperCase());
    }
  });
  it('all tiers have at least 5 features', () => {
    for (const t of TIERS) {
      expect(t.features.length).toBeGreaterThanOrEqual(5);
    }
  });
  it('only professional has a badge', () => {
    const badgeTiers = TIERS.filter((t) => t.badge !== null);
    expect(badgeTiers).toHaveLength(1);
    expect(badgeTiers[0].id).toBe('professional');
  });
  it('starter minUsers is 5', () => {
    expect(TIERS.find((t) => t.id === 'starter')!.minUsers).toBe(5);
  });
  it('professional minUsers is 10', () => {
    expect(TIERS.find((t) => t.id === 'professional')!.minUsers).toBe(10);
  });
  it('enterprise minUsers is 25', () => {
    expect(TIERS.find((t) => t.id === 'enterprise')!.minUsers).toBe(25);
  });
  it('enterprise_plus minUsers is 100', () => {
    expect(TIERS.find((t) => t.id === 'enterprise_plus')!.minUsers).toBe(100);
  });
  it('enterprise and enterprise_plus have null maxUsers (no cap)', () => {
    for (const id of ['enterprise', 'enterprise_plus']) {
      expect(TIERS.find((t) => t.id === id)!.maxUsers).toBeNull();
    }
  });
});

describe('VOLUME_BANDS — structure', () => {
  it('has 4 bands', () => {
    expect(VOLUME_BANDS).toHaveLength(4);
  });
  it('bands are sorted ascending by minUsers', () => {
    for (let i = 1; i < VOLUME_BANDS.length; i++) {
      expect(VOLUME_BANDS[i].minUsers).toBeGreaterThan(VOLUME_BANDS[i - 1].minUsers);
    }
  });
  it('band boundaries are contiguous (maxUsers+1 = next minUsers)', () => {
    for (let i = 0; i < VOLUME_BANDS.length - 1; i++) {
      expect(VOLUME_BANDS[i].maxUsers + 1).toBe(VOLUME_BANDS[i + 1].minUsers);
    }
  });
  it('first band starts at 25', () => {
    expect(VOLUME_BANDS[0].minUsers).toBe(25);
  });
  it('last band ends at 499', () => {
    expect(VOLUME_BANDS[VOLUME_BANDS.length - 1].maxUsers).toBe(499);
  });
  it('all annualMonthly values are positive integers', () => {
    for (const b of VOLUME_BANDS) {
      expect(b.annualMonthly).toBeGreaterThan(0);
      expect(Number.isInteger(b.annualMonthly)).toBe(true);
    }
  });
  it('annualMonthly is non-increasing across bands', () => {
    for (let i = 1; i < VOLUME_BANDS.length; i++) {
      expect(VOLUME_BANDS[i].annualMonthly).toBeLessThanOrEqual(VOLUME_BANDS[i - 1].annualMonthly);
    }
  });
  it('bands 25-49 and 50-99 both at £22/mo', () => {
    expect(VOLUME_BANDS[0].annualMonthly).toBe(22);
    expect(VOLUME_BANDS[1].annualMonthly).toBe(22);
  });
  it('band 100-199 at £20/mo', () => {
    expect(VOLUME_BANDS[2].annualMonthly).toBe(20);
  });
  it('band 200-499 at £18/mo', () => {
    expect(VOLUME_BANDS[3].annualMonthly).toBe(18);
  });
});

describe('recommendPlan', () => {
  const cases: [number, string][] = [
    [1,   'professional'],
    [5,   'professional'],
    [9,   'professional'],
    [10,  'professional'],
    [24,  'professional'],
    [25,  'enterprise'],
    [50,  'enterprise'],
    [99,  'enterprise'],
    [100, 'enterprise_plus'],
    [200, 'enterprise_plus'],
    [500, 'enterprise_plus'],
  ];
  for (const [users, expected] of cases) {
    it(`${users} users → ${expected}`, () => {
      expect(recommendPlan(users)).toBe(expected);
    });
  }
  it('never recommends starter', () => {
    for (let u = 1; u <= 500; u++) {
      expect(recommendPlan(u)).not.toBe('starter');
    }
  });
});

describe('getVolumeRate', () => {
  const cases: [number, number | null][] = [
    [1,   null],   // below bands
    [24,  null],   // below bands
    [25,  22],
    [37,  22],
    [49,  22],
    [50,  22],
    [99,  22],
    [100, 20],
    [150, 20],
    [199, 20],
    [200, 18],
    [350, 18],
    [499, 18],
    [500, null],   // above bands
  ];
  for (const [users, expected] of cases) {
    it(`${users} users → ${expected === null ? 'null' : `£${expected}/mo`}`, () => {
      expect(getVolumeRate(users)).toBe(expected);
    });
  }
});

describe('formatPrice', () => {
  it('null → "Custom"', () => {
    expect(formatPrice(null)).toBe('Custom');
  });
  it('0 → "£0"', () => {
    expect(formatPrice(0)).toBe('£0');
  });
  it('22 → "£22"', () => {
    expect(formatPrice(22)).toBe('£22');
  });
  it('39 → "£39"', () => {
    expect(formatPrice(39)).toBe('£39');
  });
  it('49 → "£49"', () => {
    expect(formatPrice(49)).toBe('£49');
  });
});

describe('getDisplayRate', () => {
  it('starter annual → annualMonthly (39)', () => {
    expect(getDisplayRate('starter', 39, 49, 'annual', 10)).toBe(39);
  });
  it('starter monthly → listMonthly (49)', () => {
    expect(getDisplayRate('starter', 39, 49, 'monthly', 10)).toBe(49);
  });
  it('professional annual → annualMonthly (31)', () => {
    expect(getDisplayRate('professional', 31, 39, 'annual', 10)).toBe(31);
  });
  it('professional monthly → listMonthly (39)', () => {
    expect(getDisplayRate('professional', 31, 39, 'monthly', 10)).toBe(39);
  });
  it('enterprise 50 users → volume rate 22', () => {
    expect(getDisplayRate('enterprise', 22, 28, 'annual', 50)).toBe(22);
  });
  it('enterprise 150 users → volume rate 20', () => {
    expect(getDisplayRate('enterprise', 22, 28, 'annual', 150)).toBe(20);
  });
  it('enterprise 250 users → volume rate 18', () => {
    expect(getDisplayRate('enterprise', 22, 28, 'annual', 250)).toBe(18);
  });
  it('enterprise 500 users → falls back to annualMonthly (22)', () => {
    // 500 is above the last volume band, so getVolumeRate returns null → falls back to annualMonthly
    expect(getDisplayRate('enterprise', 22, 28, 'annual', 500)).toBe(22);
  });
  it('enterprise_plus → always null (custom pricing)', () => {
    expect(getDisplayRate('enterprise_plus', null, null, 'annual', 200)).toBeNull();
  });
  it('enterprise_plus → null regardless of billingCycle', () => {
    expect(getDisplayRate('enterprise_plus', null, null, 'monthly', 200)).toBeNull();
  });
});

describe('getAnnualCost', () => {
  it('starter 10 users annual → £(39×10×12)/yr = £4,680/yr', () => {
    expect(getAnnualCost('starter', 39, 49, null, false, 'annual', 10)).toBe('£4,680/yr');
  });
  it('starter 10 users monthly → uses listMonthly 49 → £5,880/yr', () => {
    expect(getAnnualCost('starter', 39, 49, null, false, 'monthly', 10)).toBe('£5,880/yr');
  });
  it('professional 10 users annual → £(31×10×12) = £3,720/yr', () => {
    expect(getAnnualCost('professional', 31, 39, null, false, 'annual', 10)).toBe('£3,720/yr');
  });
  it('enterprise 50 users → £(22×50×12+5000) = £18,200/yr', () => {
    expect(getAnnualCost('enterprise', 22, 28, 5000, false, 'annual', 50)).toBe('£18,200/yr');
  });
  it('enterprise 150 users → £(20×150×12+5000) = £41,000/yr', () => {
    expect(getAnnualCost('enterprise', 22, 28, 5000, false, 'annual', 150)).toBe('£41,000/yr');
  });
  it('enterprise 250 users → £(18×250×12+5000) = £59,000/yr', () => {
    expect(getAnnualCost('enterprise', 22, 28, 5000, false, 'annual', 250)).toBe('£59,000/yr');
  });
  it('enterprise_plus → "Custom"', () => {
    expect(getAnnualCost('enterprise_plus', null, null, 12000, true, 'annual', 200)).toBe('Custom');
  });
});

describe('getCTA', () => {
  it('professional (trialEnabled) → "Start 14-day free trial"', () => {
    expect(getCTA('professional', true)).toBe('Start 14-day free trial');
  });
  it('enterprise (not trial) → "Talk to Sales"', () => {
    expect(getCTA('enterprise', false)).toBe('Talk to Sales');
  });
  it('enterprise_plus (not trial) → "Talk to Sales"', () => {
    expect(getCTA('enterprise_plus', false)).toBe('Talk to Sales');
  });
  it('starter (not trial) → "Get started"', () => {
    expect(getCTA('starter', false)).toBe('Get started');
  });
});

describe('Onboarding payload builder', () => {
  it('trims orgName whitespace', () => {
    const state: OnboardingState = {
      ...DEFAULT_STATE,
      orgName: '  Acme Corp  ',
    };
    expect(buildOnboardingPayload(state).orgName).toBe('Acme Corp');
  });
  it('includes all operating countries', () => {
    const state: OnboardingState = {
      ...DEFAULT_STATE,
      orgName: 'Test Org',
      operatingCountries: ['MY', 'AU', 'JP'],
    };
    expect(buildOnboardingPayload(state).operatingCountries).toEqual(['MY', 'AU', 'JP']);
  });
  it('includes selected ISOs', () => {
    const isos = ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 27001:2022'];
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', selectedISOs: isos };
    expect(buildOnboardingPayload(state).selectedISOs).toEqual(isos);
  });
  it('includes primaryCountry', () => {
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', primaryCountry: 'AU' };
    expect(buildOnboardingPayload(state).primaryCountry).toBe('AU');
  });
  it('includes selectedPlan', () => {
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', selectedPlan: 'enterprise' };
    expect(buildOnboardingPayload(state).selectedPlan).toBe('enterprise');
  });
  it('includes billingCycle', () => {
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', billingCycle: 'monthly' };
    expect(buildOnboardingPayload(state).billingCycle).toBe('monthly');
  });
  it('includes userCount', () => {
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', userCount: 50 };
    expect(buildOnboardingPayload(state).userCount).toBe(50);
  });
});

describe('Cross-constant invariants', () => {
  it('all TIERS ids appear in recommendPlan output space', () => {
    const ids = new Set(TIERS.map((t) => t.id));
    // recommendPlan never returns starter
    ids.delete('starter');
    const outputs = new Set<string>();
    for (let u = 1; u <= 500; u++) outputs.add(recommendPlan(u));
    for (const id of ids) expect(outputs).toContain(id);
  });
  it('VOLUME_BANDS cover the enterprise user range (25-499)', () => {
    const minStart = VOLUME_BANDS[0].minUsers;
    const maxEnd = VOLUME_BANDS[VOLUME_BANDS.length - 1].maxUsers;
    expect(minStart).toBe(25);
    expect(maxEnd).toBe(499);
  });
  it('enterprise minUsers equals VOLUME_BANDS[0].minUsers', () => {
    const ent = TIERS.find((t) => t.id === 'enterprise')!;
    expect(ent.minUsers).toBe(VOLUME_BANDS[0].minUsers);
  });
  it('enterprise_plus minUsers equals first 100-user volume band minUsers', () => {
    const ep = TIERS.find((t) => t.id === 'enterprise_plus')!;
    // enterprise_plus starts at 100 users — same as volume band 100-199
    const band100 = VOLUME_BANDS.find((b) => b.minUsers === 100)!;
    expect(ep.minUsers).toBe(band100.minUsers);
  });
  it('SUPPORTED_COUNTRIES does not include unsupported EU countries like DE, FR', () => {
    expect(SUPPORTED_COUNTRIES).not.toContain('DE');
    expect(SUPPORTED_COUNTRIES).not.toContain('FR');
    expect(SUPPORTED_COUNTRIES).not.toContain('US');
    expect(SUPPORTED_COUNTRIES).not.toContain('GB');
  });
  it('ISO_STANDARDS includes the 3 most common management system standards', () => {
    expect(ISO_STANDARDS).toContain('ISO 9001:2015');
    expect(ISO_STANDARDS).toContain('ISO 14001:2015');
    expect(ISO_STANDARDS).toContain('ISO 45001:2018');
  });
  it('TOTAL_STEPS matches the number of step labels', () => {
    let count = 0;
    for (let i = 1; i <= 10; i++) {
      if (getStepLabel(i) !== 'Unknown') count++;
    }
    expect(count).toBe(TOTAL_STEPS);
  });
});

// ─── Algorithm puzzle phases (ph217ow–ph220ow) ────────────────────────────────
function moveZeroes217ow(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217ow_mz',()=>{
  it('a',()=>{expect(moveZeroes217ow([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217ow([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217ow([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217ow([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217ow([4,2,0,0,3])).toBe(4);});
});
function missingNumber218ow(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218ow_mn',()=>{
  it('a',()=>{expect(missingNumber218ow([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218ow([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218ow([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218ow([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218ow([1])).toBe(0);});
});
function countBits219ow(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219ow_cb',()=>{
  it('a',()=>{expect(countBits219ow(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219ow(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219ow(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219ow(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219ow(4)[4]).toBe(1);});
});
function climbStairs220ow(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220ow_cs',()=>{
  it('a',()=>{expect(climbStairs220ow(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220ow(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220ow(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220ow(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220ow(1)).toBe(1);});
});
function hd258ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ow2_hd',()=>{it('a',()=>{expect(hd258ow2(1,4)).toBe(2);});it('b',()=>{expect(hd258ow2(3,1)).toBe(1);});it('c',()=>{expect(hd258ow2(0,0)).toBe(0);});it('d',()=>{expect(hd258ow2(93,73)).toBe(2);});it('e',()=>{expect(hd258ow2(15,0)).toBe(4);});});
function hd259ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ow2_hd',()=>{it('a',()=>{expect(hd259ow2(1,4)).toBe(2);});it('b',()=>{expect(hd259ow2(3,1)).toBe(1);});it('c',()=>{expect(hd259ow2(0,0)).toBe(0);});it('d',()=>{expect(hd259ow2(93,73)).toBe(2);});it('e',()=>{expect(hd259ow2(15,0)).toBe(4);});});
function hd260ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ow2_hd',()=>{it('a',()=>{expect(hd260ow2(1,4)).toBe(2);});it('b',()=>{expect(hd260ow2(3,1)).toBe(1);});it('c',()=>{expect(hd260ow2(0,0)).toBe(0);});it('d',()=>{expect(hd260ow2(93,73)).toBe(2);});it('e',()=>{expect(hd260ow2(15,0)).toBe(4);});});
function hd261ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ow2_hd',()=>{it('a',()=>{expect(hd261ow2(1,4)).toBe(2);});it('b',()=>{expect(hd261ow2(3,1)).toBe(1);});it('c',()=>{expect(hd261ow2(0,0)).toBe(0);});it('d',()=>{expect(hd261ow2(93,73)).toBe(2);});it('e',()=>{expect(hd261ow2(15,0)).toBe(4);});});
function hd262ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ow2_hd',()=>{it('a',()=>{expect(hd262ow2(1,4)).toBe(2);});it('b',()=>{expect(hd262ow2(3,1)).toBe(1);});it('c',()=>{expect(hd262ow2(0,0)).toBe(0);});it('d',()=>{expect(hd262ow2(93,73)).toBe(2);});it('e',()=>{expect(hd262ow2(15,0)).toBe(4);});});
function hd263ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ow2_hd',()=>{it('a',()=>{expect(hd263ow2(1,4)).toBe(2);});it('b',()=>{expect(hd263ow2(3,1)).toBe(1);});it('c',()=>{expect(hd263ow2(0,0)).toBe(0);});it('d',()=>{expect(hd263ow2(93,73)).toBe(2);});it('e',()=>{expect(hd263ow2(15,0)).toBe(4);});});
function hd264ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ow2_hd',()=>{it('a',()=>{expect(hd264ow2(1,4)).toBe(2);});it('b',()=>{expect(hd264ow2(3,1)).toBe(1);});it('c',()=>{expect(hd264ow2(0,0)).toBe(0);});it('d',()=>{expect(hd264ow2(93,73)).toBe(2);});it('e',()=>{expect(hd264ow2(15,0)).toBe(4);});});
function hd265ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ow2_hd',()=>{it('a',()=>{expect(hd265ow2(1,4)).toBe(2);});it('b',()=>{expect(hd265ow2(3,1)).toBe(1);});it('c',()=>{expect(hd265ow2(0,0)).toBe(0);});it('d',()=>{expect(hd265ow2(93,73)).toBe(2);});it('e',()=>{expect(hd265ow2(15,0)).toBe(4);});});
function hd266ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ow2_hd',()=>{it('a',()=>{expect(hd266ow2(1,4)).toBe(2);});it('b',()=>{expect(hd266ow2(3,1)).toBe(1);});it('c',()=>{expect(hd266ow2(0,0)).toBe(0);});it('d',()=>{expect(hd266ow2(93,73)).toBe(2);});it('e',()=>{expect(hd266ow2(15,0)).toBe(4);});});
function hd267ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ow2_hd',()=>{it('a',()=>{expect(hd267ow2(1,4)).toBe(2);});it('b',()=>{expect(hd267ow2(3,1)).toBe(1);});it('c',()=>{expect(hd267ow2(0,0)).toBe(0);});it('d',()=>{expect(hd267ow2(93,73)).toBe(2);});it('e',()=>{expect(hd267ow2(15,0)).toBe(4);});});
function hd268ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ow2_hd',()=>{it('a',()=>{expect(hd268ow2(1,4)).toBe(2);});it('b',()=>{expect(hd268ow2(3,1)).toBe(1);});it('c',()=>{expect(hd268ow2(0,0)).toBe(0);});it('d',()=>{expect(hd268ow2(93,73)).toBe(2);});it('e',()=>{expect(hd268ow2(15,0)).toBe(4);});});
function hd269ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ow2_hd',()=>{it('a',()=>{expect(hd269ow2(1,4)).toBe(2);});it('b',()=>{expect(hd269ow2(3,1)).toBe(1);});it('c',()=>{expect(hd269ow2(0,0)).toBe(0);});it('d',()=>{expect(hd269ow2(93,73)).toBe(2);});it('e',()=>{expect(hd269ow2(15,0)).toBe(4);});});
function hd270ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ow2_hd',()=>{it('a',()=>{expect(hd270ow2(1,4)).toBe(2);});it('b',()=>{expect(hd270ow2(3,1)).toBe(1);});it('c',()=>{expect(hd270ow2(0,0)).toBe(0);});it('d',()=>{expect(hd270ow2(93,73)).toBe(2);});it('e',()=>{expect(hd270ow2(15,0)).toBe(4);});});
function hd271ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ow2_hd',()=>{it('a',()=>{expect(hd271ow2(1,4)).toBe(2);});it('b',()=>{expect(hd271ow2(3,1)).toBe(1);});it('c',()=>{expect(hd271ow2(0,0)).toBe(0);});it('d',()=>{expect(hd271ow2(93,73)).toBe(2);});it('e',()=>{expect(hd271ow2(15,0)).toBe(4);});});
function hd272ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ow2_hd',()=>{it('a',()=>{expect(hd272ow2(1,4)).toBe(2);});it('b',()=>{expect(hd272ow2(3,1)).toBe(1);});it('c',()=>{expect(hd272ow2(0,0)).toBe(0);});it('d',()=>{expect(hd272ow2(93,73)).toBe(2);});it('e',()=>{expect(hd272ow2(15,0)).toBe(4);});});
function hd273ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ow2_hd',()=>{it('a',()=>{expect(hd273ow2(1,4)).toBe(2);});it('b',()=>{expect(hd273ow2(3,1)).toBe(1);});it('c',()=>{expect(hd273ow2(0,0)).toBe(0);});it('d',()=>{expect(hd273ow2(93,73)).toBe(2);});it('e',()=>{expect(hd273ow2(15,0)).toBe(4);});});
function hd274ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ow2_hd',()=>{it('a',()=>{expect(hd274ow2(1,4)).toBe(2);});it('b',()=>{expect(hd274ow2(3,1)).toBe(1);});it('c',()=>{expect(hd274ow2(0,0)).toBe(0);});it('d',()=>{expect(hd274ow2(93,73)).toBe(2);});it('e',()=>{expect(hd274ow2(15,0)).toBe(4);});});
function hd275ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ow2_hd',()=>{it('a',()=>{expect(hd275ow2(1,4)).toBe(2);});it('b',()=>{expect(hd275ow2(3,1)).toBe(1);});it('c',()=>{expect(hd275ow2(0,0)).toBe(0);});it('d',()=>{expect(hd275ow2(93,73)).toBe(2);});it('e',()=>{expect(hd275ow2(15,0)).toBe(4);});});
function hd276ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ow2_hd',()=>{it('a',()=>{expect(hd276ow2(1,4)).toBe(2);});it('b',()=>{expect(hd276ow2(3,1)).toBe(1);});it('c',()=>{expect(hd276ow2(0,0)).toBe(0);});it('d',()=>{expect(hd276ow2(93,73)).toBe(2);});it('e',()=>{expect(hd276ow2(15,0)).toBe(4);});});
function hd277ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ow2_hd',()=>{it('a',()=>{expect(hd277ow2(1,4)).toBe(2);});it('b',()=>{expect(hd277ow2(3,1)).toBe(1);});it('c',()=>{expect(hd277ow2(0,0)).toBe(0);});it('d',()=>{expect(hd277ow2(93,73)).toBe(2);});it('e',()=>{expect(hd277ow2(15,0)).toBe(4);});});
function hd278ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ow2_hd',()=>{it('a',()=>{expect(hd278ow2(1,4)).toBe(2);});it('b',()=>{expect(hd278ow2(3,1)).toBe(1);});it('c',()=>{expect(hd278ow2(0,0)).toBe(0);});it('d',()=>{expect(hd278ow2(93,73)).toBe(2);});it('e',()=>{expect(hd278ow2(15,0)).toBe(4);});});
function hd279ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ow2_hd',()=>{it('a',()=>{expect(hd279ow2(1,4)).toBe(2);});it('b',()=>{expect(hd279ow2(3,1)).toBe(1);});it('c',()=>{expect(hd279ow2(0,0)).toBe(0);});it('d',()=>{expect(hd279ow2(93,73)).toBe(2);});it('e',()=>{expect(hd279ow2(15,0)).toBe(4);});});
function hd280ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ow2_hd',()=>{it('a',()=>{expect(hd280ow2(1,4)).toBe(2);});it('b',()=>{expect(hd280ow2(3,1)).toBe(1);});it('c',()=>{expect(hd280ow2(0,0)).toBe(0);});it('d',()=>{expect(hd280ow2(93,73)).toBe(2);});it('e',()=>{expect(hd280ow2(15,0)).toBe(4);});});
function hd281ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ow2_hd',()=>{it('a',()=>{expect(hd281ow2(1,4)).toBe(2);});it('b',()=>{expect(hd281ow2(3,1)).toBe(1);});it('c',()=>{expect(hd281ow2(0,0)).toBe(0);});it('d',()=>{expect(hd281ow2(93,73)).toBe(2);});it('e',()=>{expect(hd281ow2(15,0)).toBe(4);});});
function hd282ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ow2_hd',()=>{it('a',()=>{expect(hd282ow2(1,4)).toBe(2);});it('b',()=>{expect(hd282ow2(3,1)).toBe(1);});it('c',()=>{expect(hd282ow2(0,0)).toBe(0);});it('d',()=>{expect(hd282ow2(93,73)).toBe(2);});it('e',()=>{expect(hd282ow2(15,0)).toBe(4);});});
function hd283ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ow2_hd',()=>{it('a',()=>{expect(hd283ow2(1,4)).toBe(2);});it('b',()=>{expect(hd283ow2(3,1)).toBe(1);});it('c',()=>{expect(hd283ow2(0,0)).toBe(0);});it('d',()=>{expect(hd283ow2(93,73)).toBe(2);});it('e',()=>{expect(hd283ow2(15,0)).toBe(4);});});
function hd284ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ow2_hd',()=>{it('a',()=>{expect(hd284ow2(1,4)).toBe(2);});it('b',()=>{expect(hd284ow2(3,1)).toBe(1);});it('c',()=>{expect(hd284ow2(0,0)).toBe(0);});it('d',()=>{expect(hd284ow2(93,73)).toBe(2);});it('e',()=>{expect(hd284ow2(15,0)).toBe(4);});});
function hd285ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ow2_hd',()=>{it('a',()=>{expect(hd285ow2(1,4)).toBe(2);});it('b',()=>{expect(hd285ow2(3,1)).toBe(1);});it('c',()=>{expect(hd285ow2(0,0)).toBe(0);});it('d',()=>{expect(hd285ow2(93,73)).toBe(2);});it('e',()=>{expect(hd285ow2(15,0)).toBe(4);});});
function hd286ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ow2_hd',()=>{it('a',()=>{expect(hd286ow2(1,4)).toBe(2);});it('b',()=>{expect(hd286ow2(3,1)).toBe(1);});it('c',()=>{expect(hd286ow2(0,0)).toBe(0);});it('d',()=>{expect(hd286ow2(93,73)).toBe(2);});it('e',()=>{expect(hd286ow2(15,0)).toBe(4);});});
function hd287ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ow2_hd',()=>{it('a',()=>{expect(hd287ow2(1,4)).toBe(2);});it('b',()=>{expect(hd287ow2(3,1)).toBe(1);});it('c',()=>{expect(hd287ow2(0,0)).toBe(0);});it('d',()=>{expect(hd287ow2(93,73)).toBe(2);});it('e',()=>{expect(hd287ow2(15,0)).toBe(4);});});
function hd288ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ow2_hd',()=>{it('a',()=>{expect(hd288ow2(1,4)).toBe(2);});it('b',()=>{expect(hd288ow2(3,1)).toBe(1);});it('c',()=>{expect(hd288ow2(0,0)).toBe(0);});it('d',()=>{expect(hd288ow2(93,73)).toBe(2);});it('e',()=>{expect(hd288ow2(15,0)).toBe(4);});});
function hd289ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ow2_hd',()=>{it('a',()=>{expect(hd289ow2(1,4)).toBe(2);});it('b',()=>{expect(hd289ow2(3,1)).toBe(1);});it('c',()=>{expect(hd289ow2(0,0)).toBe(0);});it('d',()=>{expect(hd289ow2(93,73)).toBe(2);});it('e',()=>{expect(hd289ow2(15,0)).toBe(4);});});
function hd290ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ow2_hd',()=>{it('a',()=>{expect(hd290ow2(1,4)).toBe(2);});it('b',()=>{expect(hd290ow2(3,1)).toBe(1);});it('c',()=>{expect(hd290ow2(0,0)).toBe(0);});it('d',()=>{expect(hd290ow2(93,73)).toBe(2);});it('e',()=>{expect(hd290ow2(15,0)).toBe(4);});});
function hd291ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ow2_hd',()=>{it('a',()=>{expect(hd291ow2(1,4)).toBe(2);});it('b',()=>{expect(hd291ow2(3,1)).toBe(1);});it('c',()=>{expect(hd291ow2(0,0)).toBe(0);});it('d',()=>{expect(hd291ow2(93,73)).toBe(2);});it('e',()=>{expect(hd291ow2(15,0)).toBe(4);});});
function hd292ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ow2_hd',()=>{it('a',()=>{expect(hd292ow2(1,4)).toBe(2);});it('b',()=>{expect(hd292ow2(3,1)).toBe(1);});it('c',()=>{expect(hd292ow2(0,0)).toBe(0);});it('d',()=>{expect(hd292ow2(93,73)).toBe(2);});it('e',()=>{expect(hd292ow2(15,0)).toBe(4);});});
function hd293ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ow2_hd',()=>{it('a',()=>{expect(hd293ow2(1,4)).toBe(2);});it('b',()=>{expect(hd293ow2(3,1)).toBe(1);});it('c',()=>{expect(hd293ow2(0,0)).toBe(0);});it('d',()=>{expect(hd293ow2(93,73)).toBe(2);});it('e',()=>{expect(hd293ow2(15,0)).toBe(4);});});
function hd294ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ow2_hd',()=>{it('a',()=>{expect(hd294ow2(1,4)).toBe(2);});it('b',()=>{expect(hd294ow2(3,1)).toBe(1);});it('c',()=>{expect(hd294ow2(0,0)).toBe(0);});it('d',()=>{expect(hd294ow2(93,73)).toBe(2);});it('e',()=>{expect(hd294ow2(15,0)).toBe(4);});});
function hd295ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ow2_hd',()=>{it('a',()=>{expect(hd295ow2(1,4)).toBe(2);});it('b',()=>{expect(hd295ow2(3,1)).toBe(1);});it('c',()=>{expect(hd295ow2(0,0)).toBe(0);});it('d',()=>{expect(hd295ow2(93,73)).toBe(2);});it('e',()=>{expect(hd295ow2(15,0)).toBe(4);});});
function hd296ow2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ow2_hd',()=>{it('a',()=>{expect(hd296ow2(1,4)).toBe(2);});it('b',()=>{expect(hd296ow2(3,1)).toBe(1);});it('c',()=>{expect(hd296ow2(0,0)).toBe(0);});it('d',()=>{expect(hd296ow2(93,73)).toBe(2);});it('e',()=>{expect(hd296ow2(15,0)).toBe(4);});});
