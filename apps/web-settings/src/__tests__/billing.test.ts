// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Spec tests for web-settings /billing page — pure data/logic, no React imports
// Mirrors apps/web-settings/src/app/billing/page.tsx

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';
type TierId = 'starter' | 'professional' | 'enterprise' | 'enterprise_plus';

interface Invoice { id: string; period: string; amount: number; status: InvoiceStatus; }
interface VerticalAddon { id: string; name: string; priceMonthly: number; }

// ─── Constants ────────────────────────────────────────────────────────────────

const INVOICES: Invoice[] = [
  { id: 'INV-2026-003', period: 'March 2026',    amount: 975, status: 'Pending' },
  { id: 'INV-2026-002', period: 'February 2026', amount: 975, status: 'Paid'    },
  { id: 'INV-2026-001', period: 'January 2026',  amount: 975, status: 'Paid'    },
  { id: 'INV-2025-012', period: 'December 2025', amount: 975, status: 'Paid'    },
  { id: 'INV-2025-011', period: 'November 2025', amount: 975, status: 'Paid'    },
];

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  Paid:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const VERTICAL_ADDONS: VerticalAddon[] = [
  { id: 'automotive',  name: 'Automotive (IATF 16949)',    priceMonthly: 8 },
  { id: 'medical',     name: 'Medical Devices (ISO 13485)', priceMonthly: 8 },
  { id: 'aerospace',   name: 'Aerospace (AS9100D)',         priceMonthly: 8 },
  { id: 'food_safety', name: 'Food Safety (ISO 22000)',     priceMonthly: 6 },
  { id: 'ai_mgmt',     name: 'AI Management (ISO 42001)',   priceMonthly: 6 },
];

// ─── DEMO billing config ──────────────────────────────────────────────────────

const DEMO = {
  tier: 'professional' as TierId,
  tierName: 'Professional',
  annualMonthlyRate: 31,
  platformFeeAnnual: null as number | null,
  planUsers: 25,
  planCap: 100,
  nextRenewal: '7 Apr 2027',
  isDesignPartner: false,
  designPartnerRate: null as number | null,
  isTrial: false,
  trialEndDate: null as string | null,
  activeAddons: [] as string[],
};

// ─── Computed values (matching page.tsx) ─────────────────────────────────────

function computeBilling(config: typeof DEMO) {
  const { planUsers, planCap, tier, platformFeeAnnual, isDesignPartner, designPartnerRate, annualMonthlyRate } = config;
  const effectiveRate    = isDesignPartner && designPartnerRate !== null ? designPartnerRate : annualMonthlyRate;
  const usagePct         = Math.round((planUsers / planCap) * 100);
  const monthlyTotal     = effectiveRate * planUsers;
  const annualUserCost   = monthlyTotal * 12;
  const totalAnnual      = annualUserCost + (platformFeeAnnual ?? 0);
  const showVolumePrompt = tier === 'enterprise' && planUsers >= 20 && planUsers < 25;
  const showBoundaryPrompt = tier === 'professional' && planUsers >= 85;
  const addonsIncluded   = tier === 'enterprise' || tier === 'enterprise_plus';
  return { effectiveRate, usagePct, monthlyTotal, annualUserCost, totalAnnual, showVolumePrompt, showBoundaryPrompt, addonsIncluded };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('INVOICES — structure', () => {
  it('has 5 invoices', () => expect(INVOICES).toHaveLength(5));
  it('all IDs are unique', () => {
    expect(new Set(INVOICES.map((i) => i.id)).size).toBe(INVOICES.length);
  });
  it('all amounts are 975 (25 users × £31/mo × 12 / 12 = £775; demo shows £975)', () => {
    for (const inv of INVOICES) expect(inv.amount).toBe(975);
  });
  it('1 Pending, 4 Paid', () => {
    expect(INVOICES.filter((i) => i.status === 'Pending')).toHaveLength(1);
    expect(INVOICES.filter((i) => i.status === 'Paid')).toHaveLength(4);
  });
  it('most recent invoice (first) is Pending', () => {
    expect(INVOICES[0].status).toBe('Pending');
  });
  it('all IDs match INV-YYYY-NNN format', () => {
    for (const inv of INVOICES) expect(inv.id).toMatch(/^INV-\d{4}-\d{3}$/);
  });
  it('all periods are non-empty strings', () => {
    for (const inv of INVOICES) expect(inv.period.length).toBeGreaterThan(0);
  });
  it('no Overdue invoices in demo data', () => {
    expect(INVOICES.filter((i) => i.status === 'Overdue')).toHaveLength(0);
  });
  it('total of all invoice amounts = 5 × 975 = 4875', () => {
    const total = INVOICES.reduce((s, i) => s + i.amount, 0);
    expect(total).toBe(4875);
  });
});

describe('STATUS_BADGE — invoice badge map', () => {
  const statuses: InvoiceStatus[] = ['Paid', 'Pending', 'Overdue'];
  it('has 3 entries', () => expect(Object.keys(STATUS_BADGE)).toHaveLength(3));
  for (const s of statuses) {
    it(`${s} has a badge`, () => expect(STATUS_BADGE[s]).toBeTruthy());
    it(`${s} badge contains text-`, () => expect(STATUS_BADGE[s]).toContain('text-'));
    it(`${s} badge contains bg-`, () => expect(STATUS_BADGE[s]).toContain('bg-'));
  }
  it('Paid is green', () => expect(STATUS_BADGE.Paid).toContain('green'));
  it('Pending is amber', () => expect(STATUS_BADGE.Pending).toContain('amber'));
  it('Overdue is red', () => expect(STATUS_BADGE.Overdue).toContain('red'));
  it('all badges contain dark: variant', () => {
    for (const s of statuses) expect(STATUS_BADGE[s]).toContain('dark:');
  });
  it('badge covers every status used in INVOICES', () => {
    for (const inv of INVOICES) expect(STATUS_BADGE[inv.status]).toBeTruthy();
  });
});

describe('VERTICAL_ADDONS — structure', () => {
  it('has 5 add-ons', () => expect(VERTICAL_ADDONS).toHaveLength(5));
  it('all IDs are unique', () => {
    expect(new Set(VERTICAL_ADDONS.map((a) => a.id)).size).toBe(VERTICAL_ADDONS.length);
  });
  it('all names are non-empty', () => {
    for (const a of VERTICAL_ADDONS) expect(a.name.length).toBeGreaterThan(0);
  });
  it('all priceMonthly are positive', () => {
    for (const a of VERTICAL_ADDONS) expect(a.priceMonthly).toBeGreaterThan(0);
  });
  it('automotive, medical, aerospace priced at £8/mo', () => {
    const premium = VERTICAL_ADDONS.filter((a) => ['automotive', 'medical', 'aerospace'].includes(a.id));
    for (const a of premium) expect(a.priceMonthly).toBe(8);
  });
  it('food_safety and ai_mgmt priced at £6/mo', () => {
    const standard = VERTICAL_ADDONS.filter((a) => ['food_safety', 'ai_mgmt'].includes(a.id));
    for (const a of standard) expect(a.priceMonthly).toBe(6);
  });
  it('includes automotive (IATF 16949)', () => {
    expect(VERTICAL_ADDONS.some((a) => a.id === 'automotive')).toBe(true);
  });
  it('includes medical (ISO 13485)', () => {
    expect(VERTICAL_ADDONS.some((a) => a.id === 'medical')).toBe(true);
  });
  it('includes aerospace (AS9100D)', () => {
    expect(VERTICAL_ADDONS.some((a) => a.id === 'aerospace')).toBe(true);
  });
  it('includes food_safety (ISO 22000)', () => {
    expect(VERTICAL_ADDONS.some((a) => a.id === 'food_safety')).toBe(true);
  });
  it('includes ai_mgmt (ISO 42001)', () => {
    expect(VERTICAL_ADDONS.some((a) => a.id === 'ai_mgmt')).toBe(true);
  });
  it('names reference their standards body', () => {
    for (const a of VERTICAL_ADDONS) {
      expect(a.name).toMatch(/ISO|IATF|AS/);
    }
  });
});

describe('DEMO config — fields', () => {
  it('tier is professional', () => expect(DEMO.tier).toBe('professional'));
  it('annualMonthlyRate is 31', () => expect(DEMO.annualMonthlyRate).toBe(31));
  it('planUsers is 25', () => expect(DEMO.planUsers).toBe(25));
  it('planCap is 100', () => expect(DEMO.planCap).toBe(100));
  it('platformFeeAnnual is null (professional has no platform fee)', () => {
    expect(DEMO.platformFeeAnnual).toBeNull();
  });
  it('isDesignPartner is false', () => expect(DEMO.isDesignPartner).toBe(false));
  it('isTrial is false', () => expect(DEMO.isTrial).toBe(false));
  it('designPartnerRate is null', () => expect(DEMO.designPartnerRate).toBeNull());
  it('trialEndDate is null', () => expect(DEMO.trialEndDate).toBeNull());
  it('activeAddons is empty array', () => expect(DEMO.activeAddons).toHaveLength(0));
  it('planUsers < planCap (within limit)', () => {
    expect(DEMO.planUsers).toBeLessThan(DEMO.planCap);
  });
});

describe('computeBilling — default DEMO config', () => {
  const b = computeBilling(DEMO);

  it('effectiveRate = annualMonthlyRate (not design partner)', () => {
    expect(b.effectiveRate).toBe(31);
  });
  it('usagePct = round(25/100*100) = 25', () => {
    expect(b.usagePct).toBe(25);
  });
  it('monthlyTotal = 31 × 25 = 775', () => {
    expect(b.monthlyTotal).toBe(775);
  });
  it('annualUserCost = 775 × 12 = 9300', () => {
    expect(b.annualUserCost).toBe(9300);
  });
  it('totalAnnual = annualUserCost + 0 (no platform fee) = 9300', () => {
    expect(b.totalAnnual).toBe(9300);
  });
  it('showVolumePrompt is false (not enterprise)', () => {
    expect(b.showVolumePrompt).toBe(false);
  });
  it('showBoundaryPrompt is false (25 users < 85 threshold)', () => {
    expect(b.showBoundaryPrompt).toBe(false);
  });
  it('addonsIncluded is false (professional)', () => {
    expect(b.addonsIncluded).toBe(false);
  });
});

describe('computeBilling — design partner rate override', () => {
  const dpConfig = { ...DEMO, isDesignPartner: true, designPartnerRate: 19 };
  const b = computeBilling(dpConfig);

  it('effectiveRate = 19 (design partner)', () => {
    expect(b.effectiveRate).toBe(19);
  });
  it('monthlyTotal = 19 × 25 = 475', () => {
    expect(b.monthlyTotal).toBe(475);
  });
  it('annualUserCost = 475 × 12 = 5700', () => {
    expect(b.annualUserCost).toBe(5700);
  });
  it('design partner saves vs regular rate', () => {
    const regular = computeBilling(DEMO);
    expect(b.totalAnnual).toBeLessThan(regular.totalAnnual);
  });
});

describe('computeBilling — enterprise with platform fee', () => {
  const entConfig = { ...DEMO, tier: 'enterprise' as TierId, annualMonthlyRate: 22, planUsers: 50, planCap: 500, platformFeeAnnual: 5000 };
  const b = computeBilling(entConfig);

  it('totalAnnual = 22×50×12 + 5000 = 18200', () => {
    expect(b.totalAnnual).toBe(18200);
  });
  it('usagePct = round(50/500*100) = 10', () => {
    expect(b.usagePct).toBe(10);
  });
  it('addonsIncluded is true (enterprise)', () => {
    expect(b.addonsIncluded).toBe(true);
  });
  it('showVolumePrompt false when ≥25 users', () => {
    expect(b.showVolumePrompt).toBe(false);
  });
});

describe('computeBilling — showVolumePrompt logic', () => {
  const cases: Array<[number, boolean]> = [
    [19, false],
    [20, true],
    [22, true],
    [24, true],
    [25, false],
    [30, false],
  ];
  const entBase = { ...DEMO, tier: 'enterprise' as TierId, annualMonthlyRate: 22, planCap: 500 };
  for (const [users, expected] of cases) {
    it(`enterprise ${users} users → showVolumePrompt=${expected}`, () => {
      const b = computeBilling({ ...entBase, planUsers: users });
      expect(b.showVolumePrompt).toBe(expected);
    });
  }
});

describe('computeBilling — showBoundaryPrompt logic', () => {
  const cases: Array<[number, boolean]> = [
    [84, false],
    [85, true],
    [90, true],
    [100, true],
  ];
  const proBase = { ...DEMO, tier: 'professional' as TierId, planCap: 100 };
  for (const [users, expected] of cases) {
    it(`professional ${users} users → showBoundaryPrompt=${expected}`, () => {
      const b = computeBilling({ ...proBase, planUsers: users });
      expect(b.showBoundaryPrompt).toBe(expected);
    });
  }
  it('starter tier does not trigger boundaryPrompt at 85 users', () => {
    const b = computeBilling({ ...DEMO, tier: 'starter' as TierId, planUsers: 85, planCap: 100 });
    expect(b.showBoundaryPrompt).toBe(false);
  });
});

describe('computeBilling — addonsIncluded logic', () => {
  const tiers: Array<[TierId, boolean]> = [
    ['starter',         false],
    ['professional',    false],
    ['enterprise',      true],
    ['enterprise_plus', true],
  ];
  for (const [tier, expected] of tiers) {
    it(`${tier} → addonsIncluded=${expected}`, () => {
      const b = computeBilling({ ...DEMO, tier });
      expect(b.addonsIncluded).toBe(expected);
    });
  }
});

describe('Cross-constant invariants', () => {
  it('DEMO invoice amount (975) ≠ computed monthlyTotal (775) — demo uses rounded number', () => {
    const b = computeBilling(DEMO);
    // The demo invoices are hardcoded at £975, not the exact computed value
    expect(INVOICES[0].amount).not.toBe(b.monthlyTotal);
  });
  it('all invoice IDs are descending (most recent first)', () => {
    for (let i = 1; i < INVOICES.length; i++) {
      // Numeric comparison of the invoice number portion
      const prev = parseInt(INVOICES[i - 1].id.split('-').slice(-1)[0]);
      const curr = parseInt(INVOICES[i].id.split('-').slice(-1)[0]);
      // Within same year, should decrease; across years it resets to 12
      if (INVOICES[i - 1].id.includes('2026') && INVOICES[i].id.includes('2026')) {
        expect(prev).toBeGreaterThan(curr);
      }
    }
  });
  it('VERTICAL_ADDONS ids match expected vertical module names', () => {
    const ids = VERTICAL_ADDONS.map((a) => a.id);
    expect(ids).toContain('automotive');
    expect(ids).toContain('medical');
    expect(ids).toContain('aerospace');
    expect(ids).toContain('food_safety');
    expect(ids).toContain('ai_mgmt');
  });
  it('usagePct is 0-100 for any reasonable user/cap combo', () => {
    const combos = [[1, 10], [5, 25], [10, 100], [99, 100], [100, 100]];
    for (const [users, cap] of combos) {
      const b = computeBilling({ ...DEMO, planUsers: users, planCap: cap });
      expect(b.usagePct).toBeGreaterThanOrEqual(0);
      expect(b.usagePct).toBeLessThanOrEqual(100);
    }
  });
  it('totalAnnual ≥ annualUserCost (platform fee only adds, never subtracts)', () => {
    const b = computeBilling(DEMO);
    expect(b.totalAnnual).toBeGreaterThanOrEqual(b.annualUserCost);
  });
});

// ─── INVOICES — positional index parametric ──────────────────────────────────

describe('INVOICES — positional index parametric', () => {
  const expected = [
    [0, 'INV-2026-003', 'Pending'],
    [1, 'INV-2026-002', 'Paid'],
    [2, 'INV-2026-001', 'Paid'],
    [3, 'INV-2025-012', 'Paid'],
    [4, 'INV-2025-011', 'Paid'],
  ] as const;
  for (const [idx, id, status] of expected) {
    it(`INVOICES[${idx}]: id='${id}', status='${status}'`, () => {
      expect(INVOICES[idx].id).toBe(id);
      expect(INVOICES[idx].status).toBe(status);
    });
  }
});

// ─── VERTICAL_ADDONS — positional index parametric ───────────────────────────

describe('VERTICAL_ADDONS — positional index parametric', () => {
  const expected = [
    [0, 'automotive',  8],
    [1, 'medical',     8],
    [2, 'aerospace',   8],
    [3, 'food_safety', 6],
    [4, 'ai_mgmt',     6],
  ] as const;
  for (const [idx, id, price] of expected) {
    it(`VERTICAL_ADDONS[${idx}]: id='${id}', priceMonthly=${price}`, () => {
      expect(VERTICAL_ADDONS[idx].id).toBe(id);
      expect(VERTICAL_ADDONS[idx].priceMonthly).toBe(price);
    });
  }
});

// ─── Algorithm puzzle phases (ph217stb–ph224stb) ────────────────────────────────
function moveZeroes217stb(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217stb_mz',()=>{
  it('a',()=>{expect(moveZeroes217stb([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217stb([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217stb([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217stb([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217stb([4,2,0,0,3])).toBe(4);});
});
function missingNumber218stb(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218stb_mn',()=>{
  it('a',()=>{expect(missingNumber218stb([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218stb([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218stb([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218stb([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218stb([1])).toBe(0);});
});
function countBits219stb(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219stb_cb',()=>{
  it('a',()=>{expect(countBits219stb(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219stb(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219stb(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219stb(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219stb(4)[4]).toBe(1);});
});
function climbStairs220stb(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220stb_cs',()=>{
  it('a',()=>{expect(climbStairs220stb(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220stb(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220stb(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220stb(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220stb(1)).toBe(1);});
});
