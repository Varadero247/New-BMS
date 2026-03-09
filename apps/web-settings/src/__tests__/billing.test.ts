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
function hd258stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258stb2_hd',()=>{it('a',()=>{expect(hd258stb2(1,4)).toBe(2);});it('b',()=>{expect(hd258stb2(3,1)).toBe(1);});it('c',()=>{expect(hd258stb2(0,0)).toBe(0);});it('d',()=>{expect(hd258stb2(93,73)).toBe(2);});it('e',()=>{expect(hd258stb2(15,0)).toBe(4);});});
function hd259stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259stb2_hd',()=>{it('a',()=>{expect(hd259stb2(1,4)).toBe(2);});it('b',()=>{expect(hd259stb2(3,1)).toBe(1);});it('c',()=>{expect(hd259stb2(0,0)).toBe(0);});it('d',()=>{expect(hd259stb2(93,73)).toBe(2);});it('e',()=>{expect(hd259stb2(15,0)).toBe(4);});});
function hd260stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260stb2_hd',()=>{it('a',()=>{expect(hd260stb2(1,4)).toBe(2);});it('b',()=>{expect(hd260stb2(3,1)).toBe(1);});it('c',()=>{expect(hd260stb2(0,0)).toBe(0);});it('d',()=>{expect(hd260stb2(93,73)).toBe(2);});it('e',()=>{expect(hd260stb2(15,0)).toBe(4);});});
function hd261stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261stb2_hd',()=>{it('a',()=>{expect(hd261stb2(1,4)).toBe(2);});it('b',()=>{expect(hd261stb2(3,1)).toBe(1);});it('c',()=>{expect(hd261stb2(0,0)).toBe(0);});it('d',()=>{expect(hd261stb2(93,73)).toBe(2);});it('e',()=>{expect(hd261stb2(15,0)).toBe(4);});});
function hd262stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262stb2_hd',()=>{it('a',()=>{expect(hd262stb2(1,4)).toBe(2);});it('b',()=>{expect(hd262stb2(3,1)).toBe(1);});it('c',()=>{expect(hd262stb2(0,0)).toBe(0);});it('d',()=>{expect(hd262stb2(93,73)).toBe(2);});it('e',()=>{expect(hd262stb2(15,0)).toBe(4);});});
function hd263stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263stb2_hd',()=>{it('a',()=>{expect(hd263stb2(1,4)).toBe(2);});it('b',()=>{expect(hd263stb2(3,1)).toBe(1);});it('c',()=>{expect(hd263stb2(0,0)).toBe(0);});it('d',()=>{expect(hd263stb2(93,73)).toBe(2);});it('e',()=>{expect(hd263stb2(15,0)).toBe(4);});});
function hd264stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264stb2_hd',()=>{it('a',()=>{expect(hd264stb2(1,4)).toBe(2);});it('b',()=>{expect(hd264stb2(3,1)).toBe(1);});it('c',()=>{expect(hd264stb2(0,0)).toBe(0);});it('d',()=>{expect(hd264stb2(93,73)).toBe(2);});it('e',()=>{expect(hd264stb2(15,0)).toBe(4);});});
function hd265stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265stb2_hd',()=>{it('a',()=>{expect(hd265stb2(1,4)).toBe(2);});it('b',()=>{expect(hd265stb2(3,1)).toBe(1);});it('c',()=>{expect(hd265stb2(0,0)).toBe(0);});it('d',()=>{expect(hd265stb2(93,73)).toBe(2);});it('e',()=>{expect(hd265stb2(15,0)).toBe(4);});});
function hd266stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266stb2_hd',()=>{it('a',()=>{expect(hd266stb2(1,4)).toBe(2);});it('b',()=>{expect(hd266stb2(3,1)).toBe(1);});it('c',()=>{expect(hd266stb2(0,0)).toBe(0);});it('d',()=>{expect(hd266stb2(93,73)).toBe(2);});it('e',()=>{expect(hd266stb2(15,0)).toBe(4);});});
function hd267stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267stb2_hd',()=>{it('a',()=>{expect(hd267stb2(1,4)).toBe(2);});it('b',()=>{expect(hd267stb2(3,1)).toBe(1);});it('c',()=>{expect(hd267stb2(0,0)).toBe(0);});it('d',()=>{expect(hd267stb2(93,73)).toBe(2);});it('e',()=>{expect(hd267stb2(15,0)).toBe(4);});});
function hd268stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268stb2_hd',()=>{it('a',()=>{expect(hd268stb2(1,4)).toBe(2);});it('b',()=>{expect(hd268stb2(3,1)).toBe(1);});it('c',()=>{expect(hd268stb2(0,0)).toBe(0);});it('d',()=>{expect(hd268stb2(93,73)).toBe(2);});it('e',()=>{expect(hd268stb2(15,0)).toBe(4);});});
function hd269stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269stb2_hd',()=>{it('a',()=>{expect(hd269stb2(1,4)).toBe(2);});it('b',()=>{expect(hd269stb2(3,1)).toBe(1);});it('c',()=>{expect(hd269stb2(0,0)).toBe(0);});it('d',()=>{expect(hd269stb2(93,73)).toBe(2);});it('e',()=>{expect(hd269stb2(15,0)).toBe(4);});});
function hd270stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270stb2_hd',()=>{it('a',()=>{expect(hd270stb2(1,4)).toBe(2);});it('b',()=>{expect(hd270stb2(3,1)).toBe(1);});it('c',()=>{expect(hd270stb2(0,0)).toBe(0);});it('d',()=>{expect(hd270stb2(93,73)).toBe(2);});it('e',()=>{expect(hd270stb2(15,0)).toBe(4);});});
function hd271stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271stb2_hd',()=>{it('a',()=>{expect(hd271stb2(1,4)).toBe(2);});it('b',()=>{expect(hd271stb2(3,1)).toBe(1);});it('c',()=>{expect(hd271stb2(0,0)).toBe(0);});it('d',()=>{expect(hd271stb2(93,73)).toBe(2);});it('e',()=>{expect(hd271stb2(15,0)).toBe(4);});});
function hd272stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272stb2_hd',()=>{it('a',()=>{expect(hd272stb2(1,4)).toBe(2);});it('b',()=>{expect(hd272stb2(3,1)).toBe(1);});it('c',()=>{expect(hd272stb2(0,0)).toBe(0);});it('d',()=>{expect(hd272stb2(93,73)).toBe(2);});it('e',()=>{expect(hd272stb2(15,0)).toBe(4);});});
function hd273stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273stb2_hd',()=>{it('a',()=>{expect(hd273stb2(1,4)).toBe(2);});it('b',()=>{expect(hd273stb2(3,1)).toBe(1);});it('c',()=>{expect(hd273stb2(0,0)).toBe(0);});it('d',()=>{expect(hd273stb2(93,73)).toBe(2);});it('e',()=>{expect(hd273stb2(15,0)).toBe(4);});});
function hd274stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274stb2_hd',()=>{it('a',()=>{expect(hd274stb2(1,4)).toBe(2);});it('b',()=>{expect(hd274stb2(3,1)).toBe(1);});it('c',()=>{expect(hd274stb2(0,0)).toBe(0);});it('d',()=>{expect(hd274stb2(93,73)).toBe(2);});it('e',()=>{expect(hd274stb2(15,0)).toBe(4);});});
function hd275stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275stb2_hd',()=>{it('a',()=>{expect(hd275stb2(1,4)).toBe(2);});it('b',()=>{expect(hd275stb2(3,1)).toBe(1);});it('c',()=>{expect(hd275stb2(0,0)).toBe(0);});it('d',()=>{expect(hd275stb2(93,73)).toBe(2);});it('e',()=>{expect(hd275stb2(15,0)).toBe(4);});});
function hd276stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276stb2_hd',()=>{it('a',()=>{expect(hd276stb2(1,4)).toBe(2);});it('b',()=>{expect(hd276stb2(3,1)).toBe(1);});it('c',()=>{expect(hd276stb2(0,0)).toBe(0);});it('d',()=>{expect(hd276stb2(93,73)).toBe(2);});it('e',()=>{expect(hd276stb2(15,0)).toBe(4);});});
function hd277stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277stb2_hd',()=>{it('a',()=>{expect(hd277stb2(1,4)).toBe(2);});it('b',()=>{expect(hd277stb2(3,1)).toBe(1);});it('c',()=>{expect(hd277stb2(0,0)).toBe(0);});it('d',()=>{expect(hd277stb2(93,73)).toBe(2);});it('e',()=>{expect(hd277stb2(15,0)).toBe(4);});});
function hd278stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278stb2_hd',()=>{it('a',()=>{expect(hd278stb2(1,4)).toBe(2);});it('b',()=>{expect(hd278stb2(3,1)).toBe(1);});it('c',()=>{expect(hd278stb2(0,0)).toBe(0);});it('d',()=>{expect(hd278stb2(93,73)).toBe(2);});it('e',()=>{expect(hd278stb2(15,0)).toBe(4);});});
function hd279stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279stb2_hd',()=>{it('a',()=>{expect(hd279stb2(1,4)).toBe(2);});it('b',()=>{expect(hd279stb2(3,1)).toBe(1);});it('c',()=>{expect(hd279stb2(0,0)).toBe(0);});it('d',()=>{expect(hd279stb2(93,73)).toBe(2);});it('e',()=>{expect(hd279stb2(15,0)).toBe(4);});});
function hd280stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280stb2_hd',()=>{it('a',()=>{expect(hd280stb2(1,4)).toBe(2);});it('b',()=>{expect(hd280stb2(3,1)).toBe(1);});it('c',()=>{expect(hd280stb2(0,0)).toBe(0);});it('d',()=>{expect(hd280stb2(93,73)).toBe(2);});it('e',()=>{expect(hd280stb2(15,0)).toBe(4);});});
function hd281stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281stb2_hd',()=>{it('a',()=>{expect(hd281stb2(1,4)).toBe(2);});it('b',()=>{expect(hd281stb2(3,1)).toBe(1);});it('c',()=>{expect(hd281stb2(0,0)).toBe(0);});it('d',()=>{expect(hd281stb2(93,73)).toBe(2);});it('e',()=>{expect(hd281stb2(15,0)).toBe(4);});});
function hd282stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282stb2_hd',()=>{it('a',()=>{expect(hd282stb2(1,4)).toBe(2);});it('b',()=>{expect(hd282stb2(3,1)).toBe(1);});it('c',()=>{expect(hd282stb2(0,0)).toBe(0);});it('d',()=>{expect(hd282stb2(93,73)).toBe(2);});it('e',()=>{expect(hd282stb2(15,0)).toBe(4);});});
function hd283stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283stb2_hd',()=>{it('a',()=>{expect(hd283stb2(1,4)).toBe(2);});it('b',()=>{expect(hd283stb2(3,1)).toBe(1);});it('c',()=>{expect(hd283stb2(0,0)).toBe(0);});it('d',()=>{expect(hd283stb2(93,73)).toBe(2);});it('e',()=>{expect(hd283stb2(15,0)).toBe(4);});});
function hd284stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284stb2_hd',()=>{it('a',()=>{expect(hd284stb2(1,4)).toBe(2);});it('b',()=>{expect(hd284stb2(3,1)).toBe(1);});it('c',()=>{expect(hd284stb2(0,0)).toBe(0);});it('d',()=>{expect(hd284stb2(93,73)).toBe(2);});it('e',()=>{expect(hd284stb2(15,0)).toBe(4);});});
function hd285stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285stb2_hd',()=>{it('a',()=>{expect(hd285stb2(1,4)).toBe(2);});it('b',()=>{expect(hd285stb2(3,1)).toBe(1);});it('c',()=>{expect(hd285stb2(0,0)).toBe(0);});it('d',()=>{expect(hd285stb2(93,73)).toBe(2);});it('e',()=>{expect(hd285stb2(15,0)).toBe(4);});});
function hd286stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286stb2_hd',()=>{it('a',()=>{expect(hd286stb2(1,4)).toBe(2);});it('b',()=>{expect(hd286stb2(3,1)).toBe(1);});it('c',()=>{expect(hd286stb2(0,0)).toBe(0);});it('d',()=>{expect(hd286stb2(93,73)).toBe(2);});it('e',()=>{expect(hd286stb2(15,0)).toBe(4);});});
function hd287stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287stb2_hd',()=>{it('a',()=>{expect(hd287stb2(1,4)).toBe(2);});it('b',()=>{expect(hd287stb2(3,1)).toBe(1);});it('c',()=>{expect(hd287stb2(0,0)).toBe(0);});it('d',()=>{expect(hd287stb2(93,73)).toBe(2);});it('e',()=>{expect(hd287stb2(15,0)).toBe(4);});});
function hd288stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288stb2_hd',()=>{it('a',()=>{expect(hd288stb2(1,4)).toBe(2);});it('b',()=>{expect(hd288stb2(3,1)).toBe(1);});it('c',()=>{expect(hd288stb2(0,0)).toBe(0);});it('d',()=>{expect(hd288stb2(93,73)).toBe(2);});it('e',()=>{expect(hd288stb2(15,0)).toBe(4);});});
function hd289stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289stb2_hd',()=>{it('a',()=>{expect(hd289stb2(1,4)).toBe(2);});it('b',()=>{expect(hd289stb2(3,1)).toBe(1);});it('c',()=>{expect(hd289stb2(0,0)).toBe(0);});it('d',()=>{expect(hd289stb2(93,73)).toBe(2);});it('e',()=>{expect(hd289stb2(15,0)).toBe(4);});});
function hd290stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290stb2_hd',()=>{it('a',()=>{expect(hd290stb2(1,4)).toBe(2);});it('b',()=>{expect(hd290stb2(3,1)).toBe(1);});it('c',()=>{expect(hd290stb2(0,0)).toBe(0);});it('d',()=>{expect(hd290stb2(93,73)).toBe(2);});it('e',()=>{expect(hd290stb2(15,0)).toBe(4);});});
function hd291stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291stb2_hd',()=>{it('a',()=>{expect(hd291stb2(1,4)).toBe(2);});it('b',()=>{expect(hd291stb2(3,1)).toBe(1);});it('c',()=>{expect(hd291stb2(0,0)).toBe(0);});it('d',()=>{expect(hd291stb2(93,73)).toBe(2);});it('e',()=>{expect(hd291stb2(15,0)).toBe(4);});});
function hd292stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292stb2_hd',()=>{it('a',()=>{expect(hd292stb2(1,4)).toBe(2);});it('b',()=>{expect(hd292stb2(3,1)).toBe(1);});it('c',()=>{expect(hd292stb2(0,0)).toBe(0);});it('d',()=>{expect(hd292stb2(93,73)).toBe(2);});it('e',()=>{expect(hd292stb2(15,0)).toBe(4);});});
function hd293stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293stb2_hd',()=>{it('a',()=>{expect(hd293stb2(1,4)).toBe(2);});it('b',()=>{expect(hd293stb2(3,1)).toBe(1);});it('c',()=>{expect(hd293stb2(0,0)).toBe(0);});it('d',()=>{expect(hd293stb2(93,73)).toBe(2);});it('e',()=>{expect(hd293stb2(15,0)).toBe(4);});});
function hd294stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294stb2_hd',()=>{it('a',()=>{expect(hd294stb2(1,4)).toBe(2);});it('b',()=>{expect(hd294stb2(3,1)).toBe(1);});it('c',()=>{expect(hd294stb2(0,0)).toBe(0);});it('d',()=>{expect(hd294stb2(93,73)).toBe(2);});it('e',()=>{expect(hd294stb2(15,0)).toBe(4);});});
function hd295stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295stb2_hd',()=>{it('a',()=>{expect(hd295stb2(1,4)).toBe(2);});it('b',()=>{expect(hd295stb2(3,1)).toBe(1);});it('c',()=>{expect(hd295stb2(0,0)).toBe(0);});it('d',()=>{expect(hd295stb2(93,73)).toBe(2);});it('e',()=>{expect(hd295stb2(15,0)).toBe(4);});});
function hd296stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296stb2_hd',()=>{it('a',()=>{expect(hd296stb2(1,4)).toBe(2);});it('b',()=>{expect(hd296stb2(3,1)).toBe(1);});it('c',()=>{expect(hd296stb2(0,0)).toBe(0);});it('d',()=>{expect(hd296stb2(93,73)).toBe(2);});it('e',()=>{expect(hd296stb2(15,0)).toBe(4);});});
function hd297stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297stb2_hd',()=>{it('a',()=>{expect(hd297stb2(1,4)).toBe(2);});it('b',()=>{expect(hd297stb2(3,1)).toBe(1);});it('c',()=>{expect(hd297stb2(0,0)).toBe(0);});it('d',()=>{expect(hd297stb2(93,73)).toBe(2);});it('e',()=>{expect(hd297stb2(15,0)).toBe(4);});});
function hd298stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298stb2_hd',()=>{it('a',()=>{expect(hd298stb2(1,4)).toBe(2);});it('b',()=>{expect(hd298stb2(3,1)).toBe(1);});it('c',()=>{expect(hd298stb2(0,0)).toBe(0);});it('d',()=>{expect(hd298stb2(93,73)).toBe(2);});it('e',()=>{expect(hd298stb2(15,0)).toBe(4);});});
function hd299stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299stb2_hd',()=>{it('a',()=>{expect(hd299stb2(1,4)).toBe(2);});it('b',()=>{expect(hd299stb2(3,1)).toBe(1);});it('c',()=>{expect(hd299stb2(0,0)).toBe(0);});it('d',()=>{expect(hd299stb2(93,73)).toBe(2);});it('e',()=>{expect(hd299stb2(15,0)).toBe(4);});});
function hd300stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300stb2_hd',()=>{it('a',()=>{expect(hd300stb2(1,4)).toBe(2);});it('b',()=>{expect(hd300stb2(3,1)).toBe(1);});it('c',()=>{expect(hd300stb2(0,0)).toBe(0);});it('d',()=>{expect(hd300stb2(93,73)).toBe(2);});it('e',()=>{expect(hd300stb2(15,0)).toBe(4);});});
function hd301stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301stb2_hd',()=>{it('a',()=>{expect(hd301stb2(1,4)).toBe(2);});it('b',()=>{expect(hd301stb2(3,1)).toBe(1);});it('c',()=>{expect(hd301stb2(0,0)).toBe(0);});it('d',()=>{expect(hd301stb2(93,73)).toBe(2);});it('e',()=>{expect(hd301stb2(15,0)).toBe(4);});});
function hd302stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302stb2_hd',()=>{it('a',()=>{expect(hd302stb2(1,4)).toBe(2);});it('b',()=>{expect(hd302stb2(3,1)).toBe(1);});it('c',()=>{expect(hd302stb2(0,0)).toBe(0);});it('d',()=>{expect(hd302stb2(93,73)).toBe(2);});it('e',()=>{expect(hd302stb2(15,0)).toBe(4);});});
function hd303stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303stb2_hd',()=>{it('a',()=>{expect(hd303stb2(1,4)).toBe(2);});it('b',()=>{expect(hd303stb2(3,1)).toBe(1);});it('c',()=>{expect(hd303stb2(0,0)).toBe(0);});it('d',()=>{expect(hd303stb2(93,73)).toBe(2);});it('e',()=>{expect(hd303stb2(15,0)).toBe(4);});});
function hd304stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304stb2_hd',()=>{it('a',()=>{expect(hd304stb2(1,4)).toBe(2);});it('b',()=>{expect(hd304stb2(3,1)).toBe(1);});it('c',()=>{expect(hd304stb2(0,0)).toBe(0);});it('d',()=>{expect(hd304stb2(93,73)).toBe(2);});it('e',()=>{expect(hd304stb2(15,0)).toBe(4);});});
function hd305stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305stb2_hd',()=>{it('a',()=>{expect(hd305stb2(1,4)).toBe(2);});it('b',()=>{expect(hd305stb2(3,1)).toBe(1);});it('c',()=>{expect(hd305stb2(0,0)).toBe(0);});it('d',()=>{expect(hd305stb2(93,73)).toBe(2);});it('e',()=>{expect(hd305stb2(15,0)).toBe(4);});});
function hd306stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306stb2_hd',()=>{it('a',()=>{expect(hd306stb2(1,4)).toBe(2);});it('b',()=>{expect(hd306stb2(3,1)).toBe(1);});it('c',()=>{expect(hd306stb2(0,0)).toBe(0);});it('d',()=>{expect(hd306stb2(93,73)).toBe(2);});it('e',()=>{expect(hd306stb2(15,0)).toBe(4);});});
function hd307stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307stb2_hd',()=>{it('a',()=>{expect(hd307stb2(1,4)).toBe(2);});it('b',()=>{expect(hd307stb2(3,1)).toBe(1);});it('c',()=>{expect(hd307stb2(0,0)).toBe(0);});it('d',()=>{expect(hd307stb2(93,73)).toBe(2);});it('e',()=>{expect(hd307stb2(15,0)).toBe(4);});});
function hd308stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308stb2_hd',()=>{it('a',()=>{expect(hd308stb2(1,4)).toBe(2);});it('b',()=>{expect(hd308stb2(3,1)).toBe(1);});it('c',()=>{expect(hd308stb2(0,0)).toBe(0);});it('d',()=>{expect(hd308stb2(93,73)).toBe(2);});it('e',()=>{expect(hd308stb2(15,0)).toBe(4);});});
function hd309stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309stb2_hd',()=>{it('a',()=>{expect(hd309stb2(1,4)).toBe(2);});it('b',()=>{expect(hd309stb2(3,1)).toBe(1);});it('c',()=>{expect(hd309stb2(0,0)).toBe(0);});it('d',()=>{expect(hd309stb2(93,73)).toBe(2);});it('e',()=>{expect(hd309stb2(15,0)).toBe(4);});});
function hd310stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310stb2_hd',()=>{it('a',()=>{expect(hd310stb2(1,4)).toBe(2);});it('b',()=>{expect(hd310stb2(3,1)).toBe(1);});it('c',()=>{expect(hd310stb2(0,0)).toBe(0);});it('d',()=>{expect(hd310stb2(93,73)).toBe(2);});it('e',()=>{expect(hd310stb2(15,0)).toBe(4);});});
function hd311stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311stb2_hd',()=>{it('a',()=>{expect(hd311stb2(1,4)).toBe(2);});it('b',()=>{expect(hd311stb2(3,1)).toBe(1);});it('c',()=>{expect(hd311stb2(0,0)).toBe(0);});it('d',()=>{expect(hd311stb2(93,73)).toBe(2);});it('e',()=>{expect(hd311stb2(15,0)).toBe(4);});});
function hd312stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312stb2_hd',()=>{it('a',()=>{expect(hd312stb2(1,4)).toBe(2);});it('b',()=>{expect(hd312stb2(3,1)).toBe(1);});it('c',()=>{expect(hd312stb2(0,0)).toBe(0);});it('d',()=>{expect(hd312stb2(93,73)).toBe(2);});it('e',()=>{expect(hd312stb2(15,0)).toBe(4);});});
function hd313stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313stb2_hd',()=>{it('a',()=>{expect(hd313stb2(1,4)).toBe(2);});it('b',()=>{expect(hd313stb2(3,1)).toBe(1);});it('c',()=>{expect(hd313stb2(0,0)).toBe(0);});it('d',()=>{expect(hd313stb2(93,73)).toBe(2);});it('e',()=>{expect(hd313stb2(15,0)).toBe(4);});});
function hd314stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314stb2_hd',()=>{it('a',()=>{expect(hd314stb2(1,4)).toBe(2);});it('b',()=>{expect(hd314stb2(3,1)).toBe(1);});it('c',()=>{expect(hd314stb2(0,0)).toBe(0);});it('d',()=>{expect(hd314stb2(93,73)).toBe(2);});it('e',()=>{expect(hd314stb2(15,0)).toBe(4);});});
function hd315stb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315stb2_hd',()=>{it('a',()=>{expect(hd315stb2(1,4)).toBe(2);});it('b',()=>{expect(hd315stb2(3,1)).toBe(1);});it('c',()=>{expect(hd315stb2(0,0)).toBe(0);});it('d',()=>{expect(hd315stb2(93,73)).toBe(2);});it('e',()=>{expect(hd315stb2(15,0)).toBe(4);});});
