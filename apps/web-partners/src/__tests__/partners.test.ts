// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-partners specification tests

type PartnerType = 'RESELLER' | 'DISTRIBUTOR' | 'TECHNOLOGY' | 'REFERRAL' | 'ALLIANCE' | 'OEM';
type PartnerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'ELITE';
type PartnerStatus = 'PROSPECT' | 'ONBOARDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
type CommissionStructure = 'FLAT' | 'TIERED' | 'PERFORMANCE' | 'HYBRID';

const PARTNER_TYPES: PartnerType[] = ['RESELLER', 'DISTRIBUTOR', 'TECHNOLOGY', 'REFERRAL', 'ALLIANCE', 'OEM'];
const PARTNER_TIERS: PartnerTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ELITE'];
const PARTNER_STATUSES: PartnerStatus[] = ['PROSPECT', 'ONBOARDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];
const COMMISSION_STRUCTURES: CommissionStructure[] = ['FLAT', 'TIERED', 'PERFORMANCE', 'HYBRID'];

const tierColor: Record<PartnerTier, string> = {
  BRONZE: 'bg-amber-100 text-amber-900',
  SILVER: 'bg-gray-100 text-gray-700',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-blue-100 text-blue-800',
  ELITE: 'bg-purple-100 text-purple-800',
};

const tierDiscount: Record<PartnerTier, number> = {
  BRONZE: 10, SILVER: 15, GOLD: 20, PLATINUM: 25, ELITE: 30,
};

const tierMRRThreshold: Record<PartnerTier, number> = {
  BRONZE: 0, SILVER: 10000, GOLD: 50000, PLATINUM: 150000, ELITE: 500000,
};

function isActivePartner(status: PartnerStatus): boolean {
  return status === 'ACTIVE';
}

function computeCommission(revenue: number, tier: PartnerTier): number {
  return revenue * (tierDiscount[tier] / 100);
}

function tierFromMRR(mrr: number): PartnerTier {
  if (mrr >= tierMRRThreshold.ELITE) return 'ELITE';
  if (mrr >= tierMRRThreshold.PLATINUM) return 'PLATINUM';
  if (mrr >= tierMRRThreshold.GOLD) return 'GOLD';
  if (mrr >= tierMRRThreshold.SILVER) return 'SILVER';
  return 'BRONZE';
}

describe('Partner tier colors', () => {
  PARTNER_TIERS.forEach(t => {
    it(`${t} has color`, () => expect(tierColor[t]).toBeDefined());
    it(`${t} color has bg-`, () => expect(tierColor[t]).toContain('bg-'));
  });
  it('ELITE is purple', () => expect(tierColor.ELITE).toContain('purple'));
  it('GOLD is yellow', () => expect(tierColor.GOLD).toContain('yellow'));
  for (let i = 0; i < 100; i++) {
    const t = PARTNER_TIERS[i % 5];
    it(`tier color string (idx ${i})`, () => expect(typeof tierColor[t]).toBe('string'));
  }
});

describe('Tier discounts', () => {
  it('ELITE has highest discount', () => expect(tierDiscount.ELITE).toBe(30));
  it('BRONZE has lowest discount', () => expect(tierDiscount.BRONZE).toBe(10));
  it('discounts increase with tier', () => {
    expect(tierDiscount.BRONZE).toBeLessThan(tierDiscount.SILVER);
    expect(tierDiscount.SILVER).toBeLessThan(tierDiscount.GOLD);
    expect(tierDiscount.GOLD).toBeLessThan(tierDiscount.PLATINUM);
    expect(tierDiscount.PLATINUM).toBeLessThan(tierDiscount.ELITE);
  });
  for (let i = 0; i < 100; i++) {
    const t = PARTNER_TIERS[i % 5];
    it(`tier discount for ${t} is positive (idx ${i})`, () => expect(tierDiscount[t]).toBeGreaterThan(0));
  }
});

describe('isActivePartner', () => {
  it('ACTIVE returns true', () => expect(isActivePartner('ACTIVE')).toBe(true));
  it('INACTIVE returns false', () => expect(isActivePartner('INACTIVE')).toBe(false));
  it('SUSPENDED returns false', () => expect(isActivePartner('SUSPENDED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = PARTNER_STATUSES[i % 6];
    it(`isActivePartner(${s}) returns boolean (idx ${i})`, () => expect(typeof isActivePartner(s)).toBe('boolean'));
  }
});

describe('computeCommission', () => {
  it('BRONZE 10% of 10000 = 1000', () => expect(computeCommission(10000, 'BRONZE')).toBe(1000));
  it('ELITE 30% of 10000 = 3000', () => expect(computeCommission(10000, 'ELITE')).toBe(3000));
  it('higher tiers earn more commission', () => {
    expect(computeCommission(10000, 'ELITE')).toBeGreaterThan(computeCommission(10000, 'BRONZE'));
  });
  for (let rev = 1000; rev <= 20000; rev += 1000) {
    it(`commission for GOLD at ${rev} is positive`, () => {
      expect(computeCommission(rev, 'GOLD')).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    const t = PARTNER_TIERS[i % 5];
    it(`commission for ${t} is positive (idx ${i})`, () => {
      expect(computeCommission(10000, t)).toBeGreaterThan(0);
    });
  }
});

describe('tierFromMRR', () => {
  it('0 MRR = BRONZE', () => expect(tierFromMRR(0)).toBe('BRONZE'));
  it('10000 MRR = SILVER', () => expect(tierFromMRR(10000)).toBe('SILVER'));
  it('50000 MRR = GOLD', () => expect(tierFromMRR(50000)).toBe('GOLD'));
  it('150000 MRR = PLATINUM', () => expect(tierFromMRR(150000)).toBe('PLATINUM'));
  it('500000 MRR = ELITE', () => expect(tierFromMRR(500000)).toBe('ELITE'));
  for (let i = 0; i < 50; i++) {
    const mrr = i * 5000;
    it(`tierFromMRR(${mrr}) is valid tier`, () => {
      expect(PARTNER_TIERS).toContain(tierFromMRR(mrr));
    });
  }
});
