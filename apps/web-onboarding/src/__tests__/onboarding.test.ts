// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Spec tests for web-onboarding app — pure logic, no React imports
// Uses inline types/constants to avoid JSX transform requirements

// ─── Types (inline) ──────────────────────────────────────────────────────────
interface OnboardingState {
  orgName: string;
  primaryCountry: string;
  operatingCountries: string[];
  selectedISOs: string[];
  step: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
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

const TOTAL_STEPS = 4;

const DEFAULT_STATE: OnboardingState = {
  orgName: '',
  primaryCountry: 'SG',
  operatingCountries: [],
  selectedISOs: ['ISO 9001:2015'],
  step: 1,
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────
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
    case 4: return true;
    default: return false;
  }
}

function buildOnboardingPayload(state: OnboardingState) {
  return {
    orgName: state.orgName.trim(),
    primaryCountry: state.primaryCountry,
    operatingCountries: state.operatingCountries,
    selectedISOs: state.selectedISOs,
  };
}

function getStepLabel(step: number): string {
  const labels: Record<number, string> = { 1: 'Welcome', 2: 'Region', 3: 'Standards', 4: 'Confirm' };
  return labels[step] ?? 'Unknown';
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('OnboardingContext — state logic', () => {
  it('default state has sensible values', () => {
    expect(DEFAULT_STATE.primaryCountry).toBe('SG');
    expect(DEFAULT_STATE.selectedISOs).toContain('ISO 9001:2015');
    expect(DEFAULT_STATE.step).toBe(1);
    expect(DEFAULT_STATE.operatingCountries).toHaveLength(0);
  });

  it('toggleISO adds a standard that is not selected', () => {
    const result = toggleISO(['ISO 9001:2015'], 'ISO 14001:2015');
    expect(result).toContain('ISO 14001:2015');
    expect(result).toContain('ISO 9001:2015');
    expect(result).toHaveLength(2);
  });

  it('toggleISO removes a standard that is already selected', () => {
    const result = toggleISO(['ISO 9001:2015', 'ISO 14001:2015'], 'ISO 9001:2015');
    expect(result).not.toContain('ISO 9001:2015');
    expect(result).toContain('ISO 14001:2015');
  });

  it('toggleOperatingCountry adds a new country', () => {
    const result = toggleOperatingCountry(['SG'], 'AU');
    expect(result).toContain('AU');
    expect(result).toHaveLength(2);
  });

  it('toggleOperatingCountry removes an existing country', () => {
    const result = toggleOperatingCountry(['SG', 'AU', 'NZ'], 'AU');
    expect(result).not.toContain('AU');
    expect(result).toHaveLength(2);
  });
});

describe('Step validation', () => {
  it('step 1 is invalid when orgName is empty', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 1, orgName: '' })).toBe(false);
  });

  it('step 1 is invalid when orgName is only whitespace', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 1, orgName: '   ' })).toBe(false);
  });

  it('step 1 is valid when orgName is set', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 1, orgName: 'Acme Pte Ltd' })).toBe(true);
  });

  it('step 2 is valid when primaryCountry is a supported code', () => {
    for (const code of SUPPORTED_COUNTRIES) {
      expect(isStepValid({ ...DEFAULT_STATE, step: 2, primaryCountry: code })).toBe(true);
    }
  });

  it('step 2 is invalid when primaryCountry is unsupported', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 2, primaryCountry: 'ZZ' })).toBe(false);
  });

  it('step 3 is invalid when no ISOs selected', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 3, selectedISOs: [] })).toBe(false);
  });

  it('step 3 is valid when at least one ISO is selected', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 3, selectedISOs: ['ISO 9001:2015'] })).toBe(true);
  });

  it('step 4 is always valid', () => {
    expect(isStepValid({ ...DEFAULT_STATE, step: 4 })).toBe(true);
  });
});

describe('Supported countries', () => {
  it('has exactly 20 supported countries', () => {
    expect(SUPPORTED_COUNTRIES).toHaveLength(20);
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
  it('total steps is 4', () => {
    expect(TOTAL_STEPS).toBe(4);
  });

  const stepLabels: [number, string][] = [
    [1, 'Welcome'], [2, 'Region'], [3, 'Standards'], [4, 'Confirm'],
  ];
  for (const [step, label] of stepLabels) {
    it(`step ${step} label is "${label}"`, () => {
      expect(getStepLabel(step)).toBe(label);
    });
  }

  it('returns Unknown for invalid step', () => {
    expect(getStepLabel(99)).toBe('Unknown');
  });
});

describe('Onboarding payload builder', () => {
  it('trims orgName whitespace', () => {
    const state: OnboardingState = {
      orgName: '  Acme Corp  ',
      primaryCountry: 'SG',
      operatingCountries: ['MY', 'AU'],
      selectedISOs: ['ISO 9001:2015', 'ISO 45001:2018'],
      step: 4,
    };
    const payload = buildOnboardingPayload(state);
    expect(payload.orgName).toBe('Acme Corp');
  });

  it('includes all operating countries', () => {
    const state: OnboardingState = {
      ...DEFAULT_STATE,
      orgName: 'Test Org',
      operatingCountries: ['MY', 'AU', 'JP'],
    };
    const payload = buildOnboardingPayload(state);
    expect(payload.operatingCountries).toEqual(['MY', 'AU', 'JP']);
  });

  it('includes selected ISOs in payload', () => {
    const isos = ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 27001:2022'];
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', selectedISOs: isos };
    const payload = buildOnboardingPayload(state);
    expect(payload.selectedISOs).toEqual(isos);
  });

  it('builds payload with primary country', () => {
    const state: OnboardingState = { ...DEFAULT_STATE, orgName: 'Test', primaryCountry: 'AU' };
    const payload = buildOnboardingPayload(state);
    expect(payload.primaryCountry).toBe('AU');
  });
});
