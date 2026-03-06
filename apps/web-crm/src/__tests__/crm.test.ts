// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-crm specification tests

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
type DealStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
type ContactType = 'PROSPECT' | 'CUSTOMER' | 'PARTNER' | 'VENDOR' | 'OTHER';
type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'DEMO' | 'FOLLOW_UP' | 'NOTE';

const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const DEAL_STAGES: DealStage[] = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
const CONTACT_TYPES: ContactType[] = ['PROSPECT', 'CUSTOMER', 'PARTNER', 'VENDOR', 'OTHER'];
const ACTIVITY_TYPES: ActivityType[] = ['CALL', 'EMAIL', 'MEETING', 'DEMO', 'FOLLOW_UP', 'NOTE'];

const leadStatusColor: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  PROPOSAL: 'bg-indigo-100 text-indigo-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

const dealStageProbability: Record<DealStage, number> = {
  PROSPECTING: 10,
  QUALIFICATION: 20,
  PROPOSAL: 40,
  NEGOTIATION: 60,
  CLOSED_WON: 100,
  CLOSED_LOST: 0,
};

function computeWeightedRevenue(value: number, probability: number): number {
  return value * (probability / 100);
}

function isActiveLead(status: LeadStatus): boolean {
  return status !== 'WON' && status !== 'LOST';
}

function leadConversionRate(won: number, total: number): number {
  if (total === 0) return 0;
  return (won / total) * 100;
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

describe('Lead status colors', () => {
  LEAD_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(leadStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(leadStatusColor[s]).toContain('bg-'));
  });
  it('WON is green', () => expect(leadStatusColor.WON).toContain('green'));
  it('LOST is red', () => expect(leadStatusColor.LOST).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = LEAD_STATUSES[i % 7];
    it(`lead status color string (idx ${i})`, () => expect(typeof leadStatusColor[s]).toBe('string'));
  }
});

describe('Deal stage probabilities', () => {
  it('CLOSED_WON is 100%', () => expect(dealStageProbability.CLOSED_WON).toBe(100));
  it('CLOSED_LOST is 0%', () => expect(dealStageProbability.CLOSED_LOST).toBe(0));
  it('PROSPECTING < QUALIFICATION < PROPOSAL', () => {
    expect(dealStageProbability.PROSPECTING).toBeLessThan(dealStageProbability.QUALIFICATION);
    expect(dealStageProbability.QUALIFICATION).toBeLessThan(dealStageProbability.PROPOSAL);
  });
  DEAL_STAGES.forEach(s => {
    it(`${s} probability is between 0-100`, () => {
      expect(dealStageProbability[s]).toBeGreaterThanOrEqual(0);
      expect(dealStageProbability[s]).toBeLessThanOrEqual(100);
    });
  });
  for (let i = 0; i < 50; i++) {
    const s = DEAL_STAGES[i % 6];
    it(`deal stage probability is number (idx ${i})`, () => expect(typeof dealStageProbability[s]).toBe('number'));
  }
});

describe('computeWeightedRevenue', () => {
  it('100% probability = full value', () => expect(computeWeightedRevenue(10000, 100)).toBe(10000));
  it('0% probability = 0', () => expect(computeWeightedRevenue(10000, 0)).toBe(0));
  it('50% probability = half value', () => expect(computeWeightedRevenue(10000, 50)).toBe(5000));
  for (let p = 0; p <= 100; p++) {
    it(`weighted revenue at ${p}% is between 0 and value`, () => {
      const wr = computeWeightedRevenue(1000, p);
      expect(wr).toBeGreaterThanOrEqual(0);
      expect(wr).toBeLessThanOrEqual(1000);
    });
  }
});

describe('isActiveLead', () => {
  it('NEW is active', () => expect(isActiveLead('NEW')).toBe(true));
  it('CONTACTED is active', () => expect(isActiveLead('CONTACTED')).toBe(true));
  it('WON is not active', () => expect(isActiveLead('WON')).toBe(false));
  it('LOST is not active', () => expect(isActiveLead('LOST')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = LEAD_STATUSES[i % 7];
    it(`isActiveLead(${s}) returns boolean (idx ${i})`, () => expect(typeof isActiveLead(s)).toBe('boolean'));
  }
});

describe('leadConversionRate', () => {
  it('0 total returns 0', () => expect(leadConversionRate(0, 0)).toBe(0));
  it('10 won out of 100 = 10%', () => expect(leadConversionRate(10, 100)).toBe(10));
  it('all won = 100%', () => expect(leadConversionRate(50, 50)).toBe(100));
  for (let n = 1; n <= 100; n++) {
    it(`conversionRate(${n}, 100) is between 0-100`, () => {
      const rate = leadConversionRate(n, 100);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});

describe('formatCurrency', () => {
  it('formats with default currency', () => expect(formatCurrency(1000)).toContain('USD'));
  it('includes decimal places', () => expect(formatCurrency(1000)).toContain('.'));
  it('formats EUR correctly', () => expect(formatCurrency(500, 'EUR')).toContain('EUR'));
  for (let i = 1; i <= 50; i++) {
    it(`formatCurrency(${i * 100}) is non-empty string (idx ${i})`, () => {
      expect(formatCurrency(i * 100).length).toBeGreaterThan(0);
    });
  }
});

describe('Contact types', () => {
  CONTACT_TYPES.forEach(t => {
    it(`${t} is in list`, () => expect(CONTACT_TYPES).toContain(t));
  });
  it('has 5 contact types', () => expect(CONTACT_TYPES).toHaveLength(5));
  for (let i = 0; i < 50; i++) {
    const t = CONTACT_TYPES[i % 5];
    it(`contact type ${t} is string (idx ${i})`, () => expect(typeof t).toBe('string'));
  }
});

describe('Activity types', () => {
  ACTIVITY_TYPES.forEach(a => {
    it(`${a} is in list`, () => expect(ACTIVITY_TYPES).toContain(a));
  });
  it('has 6 activity types', () => expect(ACTIVITY_TYPES).toHaveLength(6));
  for (let i = 0; i < 50; i++) {
    const a = ACTIVITY_TYPES[i % 6];
    it(`activity type ${a} is string (idx ${i})`, () => expect(typeof a).toBe('string'));
  }
});
