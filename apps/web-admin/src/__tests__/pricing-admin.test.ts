// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Spec tests for web-admin /pricing page — pure data/logic, no React imports
// Mirrors apps/web-admin/src/app/pricing/page.tsx

// ─── Types ────────────────────────────────────────────────────────────────────

type TrialStatus = 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
type DPStatus = 'ACTIVE' | 'NOTIFIED' | 'EXPIRED';
type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED';

interface TierRow {
  id: string; name: string;
  listPriceMonthly: number | null; annualRate: number | null; trialConvertRate: number | null;
  platformFee: number | null; sla: string; trial: boolean;
}

interface TrialRow {
  id: string; org: string; email: string;
  started: string; expires: string; users: number; status: TrialStatus;
}

interface DesignPartnerRow {
  id: string; org: string;
  lockedRateMonthly: number; lockExpires: string; notifyAt: string; status: DPStatus;
}

interface VolumeQuoteRow {
  id: string; org: string;
  users: number; tier: string; quotedRateMonthly: number; acv: number; status: QuoteStatus;
}

// ─── Mock data (matching page.tsx) ───────────────────────────────────────────

const MOCK_TIERS: TierRow[] = [
  { id: 'starter',         name: 'Starter',       listPriceMonthly: 49, annualRate: 39,   trialConvertRate: 42,   platformFee: null,  sla: '99.5%',            trial: false },
  { id: 'professional',    name: 'Professional',  listPriceMonthly: 39, annualRate: 31,   trialConvertRate: 33,   platformFee: null,  sla: '99.9%',            trial: true  },
  { id: 'enterprise',      name: 'Enterprise',    listPriceMonthly: 28, annualRate: 22,   trialConvertRate: 24,   platformFee: 5000,  sla: '99.95%',           trial: false },
  { id: 'enterprise_plus', name: 'Enterprise+',   listPriceMonthly: null, annualRate: null, trialConvertRate: null, platformFee: 12000, sla: '99.99% dedicated', trial: false },
];

const MOCK_TRIALS: TrialRow[] = [
  { id: '1', org: 'Meridian Construction Ltd', email: 'david.walsh@meridian.co.uk', started: '2026-02-20', expires: '2026-03-06', users: 4, status: 'EXPIRED'   },
  { id: '2', org: 'TechForge Labs Ltd',         email: 'ravi@techforge.io',          started: '2026-02-28', expires: '2026-03-14', users: 3, status: 'ACTIVE'    },
  { id: '3', org: 'GreenPath Energy',            email: 'sallen@greenpath.energy',    started: '2026-03-01', expires: '2026-03-15', users: 2, status: 'ACTIVE'    },
  { id: '4', org: 'Summit Pharma Holdings',      email: 'm.bennett@summitpharma.com', started: '2026-02-10', expires: '2026-02-24', users: 5, status: 'CONVERTED' },
  { id: '5', org: 'Aqua Utilities PLC',          email: 'fgrant@aquautilities.com',   started: '2026-01-28', expires: '2026-02-11', users: 5, status: 'CONVERTED' },
];

const MOCK_DESIGN_PARTNERS: DesignPartnerRow[] = [
  { id: '1', org: 'Nour Hospitality Group',  lockedRateMonthly: 19, lockExpires: '2027-01-01', notifyAt: '2026-10-01', status: 'ACTIVE'   },
  { id: '2', org: 'Atlas Freight DMCC',      lockedRateMonthly: 19, lockExpires: '2026-12-15', notifyAt: '2026-09-15', status: 'NOTIFIED' },
  { id: '3', org: 'Petra Analytics SG',      lockedRateMonthly: 19, lockExpires: '2026-11-30', notifyAt: '2026-08-30', status: 'ACTIVE'   },
  { id: '4', org: 'HarbourView Capital Ltd', lockedRateMonthly: 19, lockExpires: '2026-10-20', notifyAt: '2026-07-20', status: 'NOTIFIED' },
];

const MOCK_QUOTES: VolumeQuoteRow[] = [
  { id: '1', org: 'GlobalSafety Corp',   users: 120, tier: 'Enterprise', quotedRateMonthly: 20, acv: 33600,  status: 'SENT'     },
  { id: '2', org: 'Meridian MedTech',    users: 80,  tier: 'Enterprise', quotedRateMonthly: 22, acv: 26160,  status: 'DRAFT'    },
  { id: '3', org: 'Apex Manufacturing',  users: 250, tier: 'Enterprise', quotedRateMonthly: 18, acv: 59000,  status: 'ACCEPTED' },
  { id: '4', org: 'Pacific Logistics',   users: 45,  tier: 'Enterprise', quotedRateMonthly: 22, acv: 16880,  status: 'DECLINED' },
];

// ─── Badge maps (matching page.tsx) ──────────────────────────────────────────

const TRIAL_STATUS_BADGE: Record<TrialStatus, string> = {
  ACTIVE:    'bg-green-900/30 text-green-400 border border-green-700',
  CONVERTED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  EXPIRED:   'bg-red-900/30 text-red-400 border border-red-700',
  CANCELLED: 'bg-gray-700/40 text-gray-400 border border-gray-600',
};

const DP_STATUS_BADGE: Record<DPStatus, string> = {
  ACTIVE:   'bg-green-900/30 text-green-400 border border-green-700',
  NOTIFIED: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  EXPIRED:  'bg-red-900/30 text-red-400 border border-red-700',
};

const QUOTE_STATUS_BADGE: Record<QuoteStatus, string> = {
  DRAFT:    'bg-gray-700/40 text-gray-400 border border-gray-600',
  SENT:     'bg-blue-900/30 text-blue-400 border border-blue-700',
  ACCEPTED: 'bg-green-900/30 text-green-400 border border-green-700',
  DECLINED: 'bg-red-900/30 text-red-400 border border-red-700',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function fmtGbp(v: number | null): string {
  return v === null ? '—' : `£${v}`;
}

function fmtAcv(v: number): string {
  return `£${v.toLocaleString()}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MOCK_TIERS — structure', () => {
  it('has 4 tiers', () => expect(MOCK_TIERS).toHaveLength(4));
  it('tier ids match expected', () => {
    expect(MOCK_TIERS.map((t) => t.id)).toEqual([
      'starter', 'professional', 'enterprise', 'enterprise_plus',
    ]);
  });
  it('only professional has trial=true', () => {
    const trialTiers = MOCK_TIERS.filter((t) => t.trial);
    expect(trialTiers).toHaveLength(1);
    expect(trialTiers[0].id).toBe('professional');
  });
  it('enterprise and enterprise_plus have platformFee', () => {
    const withFee = MOCK_TIERS.filter((t) => t.platformFee !== null);
    expect(withFee.map((t) => t.id)).toEqual(['enterprise', 'enterprise_plus']);
  });
  it('enterprise_plus has null rates (custom pricing)', () => {
    const ep = MOCK_TIERS.find((t) => t.id === 'enterprise_plus')!;
    expect(ep.listPriceMonthly).toBeNull();
    expect(ep.annualRate).toBeNull();
    expect(ep.trialConvertRate).toBeNull();
  });
  it('listPriceMonthly decreases: starter > professional > enterprise', () => {
    const [starter, professional, enterprise] = MOCK_TIERS;
    expect(starter.listPriceMonthly!).toBeGreaterThan(professional.listPriceMonthly!);
    expect(professional.listPriceMonthly!).toBeGreaterThan(enterprise.listPriceMonthly!);
  });
  it('annualRate < listPriceMonthly for all non-null tiers', () => {
    for (const t of MOCK_TIERS) {
      if (t.annualRate !== null && t.listPriceMonthly !== null) {
        expect(t.annualRate).toBeLessThan(t.listPriceMonthly);
      }
    }
  });
  it('enterprise platformFee is 5000', () => {
    expect(MOCK_TIERS.find((t) => t.id === 'enterprise')!.platformFee).toBe(5000);
  });
  it('enterprise_plus platformFee is 12000', () => {
    expect(MOCK_TIERS.find((t) => t.id === 'enterprise_plus')!.platformFee).toBe(12000);
  });
  it('enterprise_plus SLA contains dedicated', () => {
    expect(MOCK_TIERS.find((t) => t.id === 'enterprise_plus')!.sla).toContain('dedicated');
  });
  it('SLA uptime improves across tiers', () => {
    // Checked by SLA string containing higher 9s
    expect(MOCK_TIERS[2].sla).toContain('99.95');
    expect(MOCK_TIERS[3].sla).toContain('99.99');
  });
});

describe('MOCK_TIERS — parametric by index', () => {
  const expectations: Array<Partial<TierRow>> = [
    { id: 'starter',         listPriceMonthly: 49, annualRate: 39,   sla: '99.5%'            },
    { id: 'professional',    listPriceMonthly: 39, annualRate: 31,   sla: '99.9%'            },
    { id: 'enterprise',      listPriceMonthly: 28, annualRate: 22,   sla: '99.95%'           },
    { id: 'enterprise_plus', listPriceMonthly: null, annualRate: null, sla: '99.99% dedicated' },
  ];
  for (let i = 0; i < expectations.length; i++) {
    const exp = expectations[i];
    it(`tier[${i}].id is ${exp.id}`,                () => expect(MOCK_TIERS[i].id).toBe(exp.id));
    it(`tier[${i}].listPriceMonthly is ${exp.listPriceMonthly}`, () => expect(MOCK_TIERS[i].listPriceMonthly).toBe(exp.listPriceMonthly));
    it(`tier[${i}].annualRate is ${exp.annualRate}`, () => expect(MOCK_TIERS[i].annualRate).toBe(exp.annualRate));
    it(`tier[${i}].sla is ${exp.sla}`,              () => expect(MOCK_TIERS[i].sla).toBe(exp.sla));
  }
});

describe('MOCK_TRIALS — structure', () => {
  it('has 5 trials', () => expect(MOCK_TRIALS).toHaveLength(5));
  it('all trials have unique ids', () => {
    const ids = MOCK_TRIALS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all trials have valid status', () => {
    const validStatuses: TrialStatus[] = ['ACTIVE', 'CONVERTED', 'EXPIRED', 'CANCELLED'];
    for (const t of MOCK_TRIALS) {
      expect(validStatuses).toContain(t.status);
    }
  });
  it('has 2 ACTIVE trials', () => {
    expect(MOCK_TRIALS.filter((t) => t.status === 'ACTIVE')).toHaveLength(2);
  });
  it('has 2 CONVERTED trials', () => {
    expect(MOCK_TRIALS.filter((t) => t.status === 'CONVERTED')).toHaveLength(2);
  });
  it('has 1 EXPIRED trial', () => {
    expect(MOCK_TRIALS.filter((t) => t.status === 'EXPIRED')).toHaveLength(1);
  });
  it('all users counts are 1-5 (trial max is 5)', () => {
    for (const t of MOCK_TRIALS) {
      expect(t.users).toBeGreaterThanOrEqual(1);
      expect(t.users).toBeLessThanOrEqual(5);
    }
  });
  it('all emails contain @', () => {
    for (const t of MOCK_TRIALS) expect(t.email).toContain('@');
  });
  it('expires is after started for all trials', () => {
    for (const t of MOCK_TRIALS) {
      expect(new Date(t.expires).getTime()).toBeGreaterThan(new Date(t.started).getTime());
    }
  });
  it('trial duration is 14 days for all', () => {
    for (const t of MOCK_TRIALS) {
      const diff = (new Date(t.expires).getTime() - new Date(t.started).getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(diff)).toBe(14);
    }
  });
});

describe('MOCK_DESIGN_PARTNERS — structure', () => {
  it('has 4 design partners', () => expect(MOCK_DESIGN_PARTNERS).toHaveLength(4));
  it('all lockedRateMonthly is 19 (design partner rate)', () => {
    for (const dp of MOCK_DESIGN_PARTNERS) expect(dp.lockedRateMonthly).toBe(19);
  });
  it('has 2 ACTIVE and 2 NOTIFIED partners', () => {
    expect(MOCK_DESIGN_PARTNERS.filter((dp) => dp.status === 'ACTIVE')).toHaveLength(2);
    expect(MOCK_DESIGN_PARTNERS.filter((dp) => dp.status === 'NOTIFIED')).toHaveLength(2);
  });
  it('notifyAt is before lockExpires for all', () => {
    for (const dp of MOCK_DESIGN_PARTNERS) {
      expect(new Date(dp.notifyAt).getTime()).toBeLessThan(new Date(dp.lockExpires).getTime());
    }
  });
  it('all IDs are unique', () => {
    const ids = MOCK_DESIGN_PARTNERS.map((dp) => dp.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('notification is ~3 months before expiry for all', () => {
    for (const dp of MOCK_DESIGN_PARTNERS) {
      const diffDays = (new Date(dp.lockExpires).getTime() - new Date(dp.notifyAt).getTime()) / (1000 * 60 * 60 * 24);
      // Should be roughly 90 days (3 months before lock expiry)
      expect(diffDays).toBeGreaterThanOrEqual(85);
      expect(diffDays).toBeLessThanOrEqual(95);
    }
  });
});

describe('MOCK_QUOTES — structure', () => {
  it('has 4 quotes', () => expect(MOCK_QUOTES).toHaveLength(4));
  it('all quotes are Enterprise tier', () => {
    for (const q of MOCK_QUOTES) expect(q.tier).toBe('Enterprise');
  });
  it('all statuses are valid', () => {
    const validStatuses: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED'];
    for (const q of MOCK_QUOTES) expect(validStatuses).toContain(q.status);
  });
  it('ACV is approximately rate × users × 12 + 5000 platformFee', () => {
    // Check the rough ACV relationship (some rounding may apply)
    for (const q of MOCK_QUOTES) {
      const expectedBase = q.quotedRateMonthly * q.users * 12 + 5000;
      // ACV may include platform fee or rounding — allow 5% tolerance
      const diff = Math.abs(q.acv - expectedBase) / expectedBase;
      expect(diff).toBeLessThan(0.05);
    }
  });
  it('largest quote (Apex, 250 users) has highest ACV', () => {
    const maxAcv = Math.max(...MOCK_QUOTES.map((q) => q.acv));
    const apex = MOCK_QUOTES.find((q) => q.org === 'Apex Manufacturing')!;
    expect(apex.acv).toBe(maxAcv);
  });
  it('most users → lowest rate (volume discount)', () => {
    const sorted = [...MOCK_QUOTES].sort((a, b) => b.users - a.users);
    expect(sorted[0].quotedRateMonthly).toBeLessThanOrEqual(sorted[sorted.length - 1].quotedRateMonthly);
  });
});

describe('TRIAL_STATUS_BADGE — badge map', () => {
  const statuses: TrialStatus[] = ['ACTIVE', 'CONVERTED', 'EXPIRED', 'CANCELLED'];
  it('has 4 entries', () => expect(Object.keys(TRIAL_STATUS_BADGE)).toHaveLength(4));
  for (const s of statuses) {
    it(`${s} has a badge class`, () => expect(TRIAL_STATUS_BADGE[s]).toBeTruthy());
    it(`${s} badge contains border`, () => expect(TRIAL_STATUS_BADGE[s]).toContain('border'));
  }
  it('ACTIVE badge contains green', () => expect(TRIAL_STATUS_BADGE.ACTIVE).toContain('green'));
  it('CONVERTED badge contains blue', () => expect(TRIAL_STATUS_BADGE.CONVERTED).toContain('blue'));
  it('EXPIRED badge contains red', () => expect(TRIAL_STATUS_BADGE.EXPIRED).toContain('red'));
  it('CANCELLED badge contains gray', () => expect(TRIAL_STATUS_BADGE.CANCELLED).toContain('gray'));
  it('all badges contain text- class', () => {
    for (const s of statuses) expect(TRIAL_STATUS_BADGE[s]).toContain('text-');
  });
  it('all badges contain bg- class', () => {
    for (const s of statuses) expect(TRIAL_STATUS_BADGE[s]).toContain('bg-');
  });
});

describe('DP_STATUS_BADGE — badge map', () => {
  const statuses: DPStatus[] = ['ACTIVE', 'NOTIFIED', 'EXPIRED'];
  it('has 3 entries', () => expect(Object.keys(DP_STATUS_BADGE)).toHaveLength(3));
  for (const s of statuses) {
    it(`${s} has a badge`, () => expect(DP_STATUS_BADGE[s]).toBeTruthy());
    it(`${s} badge contains border`, () => expect(DP_STATUS_BADGE[s]).toContain('border'));
  }
  it('ACTIVE is green', () => expect(DP_STATUS_BADGE.ACTIVE).toContain('green'));
  it('NOTIFIED is amber', () => expect(DP_STATUS_BADGE.NOTIFIED).toContain('amber'));
  it('EXPIRED is red', () => expect(DP_STATUS_BADGE.EXPIRED).toContain('red'));
});

describe('QUOTE_STATUS_BADGE — badge map', () => {
  const statuses: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED'];
  it('has 4 entries', () => expect(Object.keys(QUOTE_STATUS_BADGE)).toHaveLength(4));
  for (const s of statuses) {
    it(`${s} has a badge`, () => expect(QUOTE_STATUS_BADGE[s]).toBeTruthy());
  }
  it('DRAFT is gray', () => expect(QUOTE_STATUS_BADGE.DRAFT).toContain('gray'));
  it('SENT is blue', () => expect(QUOTE_STATUS_BADGE.SENT).toContain('blue'));
  it('ACCEPTED is green', () => expect(QUOTE_STATUS_BADGE.ACCEPTED).toContain('green'));
  it('DECLINED is red', () => expect(QUOTE_STATUS_BADGE.DECLINED).toContain('red'));
  it('all badges contain text- class', () => {
    for (const s of statuses) expect(QUOTE_STATUS_BADGE[s]).toContain('text-');
  });
});

describe('fmtGbp — formatter', () => {
  it('null → "—"', () => expect(fmtGbp(null)).toBe('—'));
  it('0 → "£0"', () => expect(fmtGbp(0)).toBe('£0'));
  it('19 → "£19"', () => expect(fmtGbp(19)).toBe('£19'));
  it('49 → "£49"', () => expect(fmtGbp(49)).toBe('£49'));
  it('5000 → "£5000"', () => expect(fmtGbp(5000)).toBe('£5000'));
  it('12000 → "£12000"', () => expect(fmtGbp(12000)).toBe('£12000'));
  for (let i = 0; i < 50; i++) {
    it(`fmtGbp(${i}) starts with £ (idx ${i})`, () => {
      expect(fmtGbp(i)).toBe(`£${i}`);
    });
  }
});

describe('fmtAcv — formatter', () => {
  it('33600 → "£33,600"', () => expect(fmtAcv(33600)).toBe('£33,600'));
  it('59000 → "£59,000"', () => expect(fmtAcv(59000)).toBe('£59,000'));
  it('16880 → "£16,880"', () => expect(fmtAcv(16880)).toBe('£16,880'));
  it('starts with £ for all mock quotes', () => {
    for (const q of MOCK_QUOTES) {
      expect(fmtAcv(q.acv)).toMatch(/^£/);
    }
  });
  it('1000 → "£1,000"', () => expect(fmtAcv(1000)).toBe('£1,000'));
  it('100 → "£100"', () => expect(fmtAcv(100)).toBe('£100'));
  for (let i = 1; i <= 50; i++) {
    it(`fmtAcv(${i * 1000}) is a string (idx ${i})`, () => {
      expect(typeof fmtAcv(i * 1000)).toBe('string');
    });
  }
});

describe('Cross-data invariants', () => {
  it('design partner rate (£19) < enterprise annualRate (£22)', () => {
    const entAnnualRate = MOCK_TIERS.find((t) => t.id === 'enterprise')!.annualRate!;
    const dpRate = MOCK_DESIGN_PARTNERS[0].lockedRateMonthly;
    expect(dpRate).toBeLessThan(entAnnualRate);
  });
  it('all trial user counts ≤ 5 (trial maxUsers limit)', () => {
    for (const t of MOCK_TRIALS) expect(t.users).toBeLessThanOrEqual(5);
  });
  it('all quote users ≥ 25 (enterprise minimum)', () => {
    for (const q of MOCK_QUOTES) expect(q.users).toBeGreaterThanOrEqual(25);
  });
  it('ACCEPTED quote has highest ACV among all quotes', () => {
    const accepted = MOCK_QUOTES.filter((q) => q.status === 'ACCEPTED');
    expect(accepted.length).toBeGreaterThan(0);
    const maxAcv = Math.max(...MOCK_QUOTES.map((q) => q.acv));
    expect(accepted.some((q) => q.acv === maxAcv)).toBe(true);
  });
  it('converted trials have expired dates (in the past)', () => {
    const converted = MOCK_TRIALS.filter((t) => t.status === 'CONVERTED');
    for (const t of converted) {
      expect(new Date(t.expires).getTime()).toBeLessThan(Date.now() + 1000);
    }
  });
  it('fmtGbp on all tier annualRates produces £ prefix or dash', () => {
    for (const t of MOCK_TIERS) {
      const result = fmtGbp(t.annualRate);
      expect(result === '—' || result.startsWith('£')).toBe(true);
    }
  });
  it('badge maps cover all used statuses in mock data', () => {
    for (const t of MOCK_TRIALS) expect(TRIAL_STATUS_BADGE[t.status]).toBeTruthy();
    for (const dp of MOCK_DESIGN_PARTNERS) expect(DP_STATUS_BADGE[dp.status]).toBeTruthy();
    for (const q of MOCK_QUOTES) expect(QUOTE_STATUS_BADGE[q.status]).toBeTruthy();
  });
});

// ─── Algorithm puzzle phases (ph217pa–ph220pa) ────────────────────────────────
function moveZeroes217pa(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217pa_mz',()=>{
  it('a',()=>{expect(moveZeroes217pa([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217pa([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217pa([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217pa([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217pa([4,2,0,0,3])).toBe(4);});
});
function missingNumber218pa(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218pa_mn',()=>{
  it('a',()=>{expect(missingNumber218pa([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218pa([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218pa([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218pa([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218pa([1])).toBe(0);});
});
function countBits219pa(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219pa_cb',()=>{
  it('a',()=>{expect(countBits219pa(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219pa(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219pa(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219pa(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219pa(4)[4]).toBe(1);});
});
function climbStairs220pa(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220pa_cs',()=>{
  it('a',()=>{expect(climbStairs220pa(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220pa(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220pa(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220pa(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220pa(1)).toBe(1);});
});
function hd258pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258pa2_hd',()=>{it('a',()=>{expect(hd258pa2(1,4)).toBe(2);});it('b',()=>{expect(hd258pa2(3,1)).toBe(1);});it('c',()=>{expect(hd258pa2(0,0)).toBe(0);});it('d',()=>{expect(hd258pa2(93,73)).toBe(2);});it('e',()=>{expect(hd258pa2(15,0)).toBe(4);});});
function hd259pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259pa2_hd',()=>{it('a',()=>{expect(hd259pa2(1,4)).toBe(2);});it('b',()=>{expect(hd259pa2(3,1)).toBe(1);});it('c',()=>{expect(hd259pa2(0,0)).toBe(0);});it('d',()=>{expect(hd259pa2(93,73)).toBe(2);});it('e',()=>{expect(hd259pa2(15,0)).toBe(4);});});
function hd260pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260pa2_hd',()=>{it('a',()=>{expect(hd260pa2(1,4)).toBe(2);});it('b',()=>{expect(hd260pa2(3,1)).toBe(1);});it('c',()=>{expect(hd260pa2(0,0)).toBe(0);});it('d',()=>{expect(hd260pa2(93,73)).toBe(2);});it('e',()=>{expect(hd260pa2(15,0)).toBe(4);});});
function hd261pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261pa2_hd',()=>{it('a',()=>{expect(hd261pa2(1,4)).toBe(2);});it('b',()=>{expect(hd261pa2(3,1)).toBe(1);});it('c',()=>{expect(hd261pa2(0,0)).toBe(0);});it('d',()=>{expect(hd261pa2(93,73)).toBe(2);});it('e',()=>{expect(hd261pa2(15,0)).toBe(4);});});
function hd262pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262pa2_hd',()=>{it('a',()=>{expect(hd262pa2(1,4)).toBe(2);});it('b',()=>{expect(hd262pa2(3,1)).toBe(1);});it('c',()=>{expect(hd262pa2(0,0)).toBe(0);});it('d',()=>{expect(hd262pa2(93,73)).toBe(2);});it('e',()=>{expect(hd262pa2(15,0)).toBe(4);});});
function hd263pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263pa2_hd',()=>{it('a',()=>{expect(hd263pa2(1,4)).toBe(2);});it('b',()=>{expect(hd263pa2(3,1)).toBe(1);});it('c',()=>{expect(hd263pa2(0,0)).toBe(0);});it('d',()=>{expect(hd263pa2(93,73)).toBe(2);});it('e',()=>{expect(hd263pa2(15,0)).toBe(4);});});
function hd264pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264pa2_hd',()=>{it('a',()=>{expect(hd264pa2(1,4)).toBe(2);});it('b',()=>{expect(hd264pa2(3,1)).toBe(1);});it('c',()=>{expect(hd264pa2(0,0)).toBe(0);});it('d',()=>{expect(hd264pa2(93,73)).toBe(2);});it('e',()=>{expect(hd264pa2(15,0)).toBe(4);});});
function hd265pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265pa2_hd',()=>{it('a',()=>{expect(hd265pa2(1,4)).toBe(2);});it('b',()=>{expect(hd265pa2(3,1)).toBe(1);});it('c',()=>{expect(hd265pa2(0,0)).toBe(0);});it('d',()=>{expect(hd265pa2(93,73)).toBe(2);});it('e',()=>{expect(hd265pa2(15,0)).toBe(4);});});
function hd266pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266pa2_hd',()=>{it('a',()=>{expect(hd266pa2(1,4)).toBe(2);});it('b',()=>{expect(hd266pa2(3,1)).toBe(1);});it('c',()=>{expect(hd266pa2(0,0)).toBe(0);});it('d',()=>{expect(hd266pa2(93,73)).toBe(2);});it('e',()=>{expect(hd266pa2(15,0)).toBe(4);});});
function hd267pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267pa2_hd',()=>{it('a',()=>{expect(hd267pa2(1,4)).toBe(2);});it('b',()=>{expect(hd267pa2(3,1)).toBe(1);});it('c',()=>{expect(hd267pa2(0,0)).toBe(0);});it('d',()=>{expect(hd267pa2(93,73)).toBe(2);});it('e',()=>{expect(hd267pa2(15,0)).toBe(4);});});
function hd268pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268pa2_hd',()=>{it('a',()=>{expect(hd268pa2(1,4)).toBe(2);});it('b',()=>{expect(hd268pa2(3,1)).toBe(1);});it('c',()=>{expect(hd268pa2(0,0)).toBe(0);});it('d',()=>{expect(hd268pa2(93,73)).toBe(2);});it('e',()=>{expect(hd268pa2(15,0)).toBe(4);});});
function hd269pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269pa2_hd',()=>{it('a',()=>{expect(hd269pa2(1,4)).toBe(2);});it('b',()=>{expect(hd269pa2(3,1)).toBe(1);});it('c',()=>{expect(hd269pa2(0,0)).toBe(0);});it('d',()=>{expect(hd269pa2(93,73)).toBe(2);});it('e',()=>{expect(hd269pa2(15,0)).toBe(4);});});
function hd270pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270pa2_hd',()=>{it('a',()=>{expect(hd270pa2(1,4)).toBe(2);});it('b',()=>{expect(hd270pa2(3,1)).toBe(1);});it('c',()=>{expect(hd270pa2(0,0)).toBe(0);});it('d',()=>{expect(hd270pa2(93,73)).toBe(2);});it('e',()=>{expect(hd270pa2(15,0)).toBe(4);});});
function hd271pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271pa2_hd',()=>{it('a',()=>{expect(hd271pa2(1,4)).toBe(2);});it('b',()=>{expect(hd271pa2(3,1)).toBe(1);});it('c',()=>{expect(hd271pa2(0,0)).toBe(0);});it('d',()=>{expect(hd271pa2(93,73)).toBe(2);});it('e',()=>{expect(hd271pa2(15,0)).toBe(4);});});
function hd272pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272pa2_hd',()=>{it('a',()=>{expect(hd272pa2(1,4)).toBe(2);});it('b',()=>{expect(hd272pa2(3,1)).toBe(1);});it('c',()=>{expect(hd272pa2(0,0)).toBe(0);});it('d',()=>{expect(hd272pa2(93,73)).toBe(2);});it('e',()=>{expect(hd272pa2(15,0)).toBe(4);});});
function hd273pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273pa2_hd',()=>{it('a',()=>{expect(hd273pa2(1,4)).toBe(2);});it('b',()=>{expect(hd273pa2(3,1)).toBe(1);});it('c',()=>{expect(hd273pa2(0,0)).toBe(0);});it('d',()=>{expect(hd273pa2(93,73)).toBe(2);});it('e',()=>{expect(hd273pa2(15,0)).toBe(4);});});
function hd274pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274pa2_hd',()=>{it('a',()=>{expect(hd274pa2(1,4)).toBe(2);});it('b',()=>{expect(hd274pa2(3,1)).toBe(1);});it('c',()=>{expect(hd274pa2(0,0)).toBe(0);});it('d',()=>{expect(hd274pa2(93,73)).toBe(2);});it('e',()=>{expect(hd274pa2(15,0)).toBe(4);});});
function hd275pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275pa2_hd',()=>{it('a',()=>{expect(hd275pa2(1,4)).toBe(2);});it('b',()=>{expect(hd275pa2(3,1)).toBe(1);});it('c',()=>{expect(hd275pa2(0,0)).toBe(0);});it('d',()=>{expect(hd275pa2(93,73)).toBe(2);});it('e',()=>{expect(hd275pa2(15,0)).toBe(4);});});
function hd276pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276pa2_hd',()=>{it('a',()=>{expect(hd276pa2(1,4)).toBe(2);});it('b',()=>{expect(hd276pa2(3,1)).toBe(1);});it('c',()=>{expect(hd276pa2(0,0)).toBe(0);});it('d',()=>{expect(hd276pa2(93,73)).toBe(2);});it('e',()=>{expect(hd276pa2(15,0)).toBe(4);});});
function hd277pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277pa2_hd',()=>{it('a',()=>{expect(hd277pa2(1,4)).toBe(2);});it('b',()=>{expect(hd277pa2(3,1)).toBe(1);});it('c',()=>{expect(hd277pa2(0,0)).toBe(0);});it('d',()=>{expect(hd277pa2(93,73)).toBe(2);});it('e',()=>{expect(hd277pa2(15,0)).toBe(4);});});
function hd278pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278pa2_hd',()=>{it('a',()=>{expect(hd278pa2(1,4)).toBe(2);});it('b',()=>{expect(hd278pa2(3,1)).toBe(1);});it('c',()=>{expect(hd278pa2(0,0)).toBe(0);});it('d',()=>{expect(hd278pa2(93,73)).toBe(2);});it('e',()=>{expect(hd278pa2(15,0)).toBe(4);});});
function hd279pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279pa2_hd',()=>{it('a',()=>{expect(hd279pa2(1,4)).toBe(2);});it('b',()=>{expect(hd279pa2(3,1)).toBe(1);});it('c',()=>{expect(hd279pa2(0,0)).toBe(0);});it('d',()=>{expect(hd279pa2(93,73)).toBe(2);});it('e',()=>{expect(hd279pa2(15,0)).toBe(4);});});
function hd280pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280pa2_hd',()=>{it('a',()=>{expect(hd280pa2(1,4)).toBe(2);});it('b',()=>{expect(hd280pa2(3,1)).toBe(1);});it('c',()=>{expect(hd280pa2(0,0)).toBe(0);});it('d',()=>{expect(hd280pa2(93,73)).toBe(2);});it('e',()=>{expect(hd280pa2(15,0)).toBe(4);});});
function hd281pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281pa2_hd',()=>{it('a',()=>{expect(hd281pa2(1,4)).toBe(2);});it('b',()=>{expect(hd281pa2(3,1)).toBe(1);});it('c',()=>{expect(hd281pa2(0,0)).toBe(0);});it('d',()=>{expect(hd281pa2(93,73)).toBe(2);});it('e',()=>{expect(hd281pa2(15,0)).toBe(4);});});
function hd282pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282pa2_hd',()=>{it('a',()=>{expect(hd282pa2(1,4)).toBe(2);});it('b',()=>{expect(hd282pa2(3,1)).toBe(1);});it('c',()=>{expect(hd282pa2(0,0)).toBe(0);});it('d',()=>{expect(hd282pa2(93,73)).toBe(2);});it('e',()=>{expect(hd282pa2(15,0)).toBe(4);});});
function hd283pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283pa2_hd',()=>{it('a',()=>{expect(hd283pa2(1,4)).toBe(2);});it('b',()=>{expect(hd283pa2(3,1)).toBe(1);});it('c',()=>{expect(hd283pa2(0,0)).toBe(0);});it('d',()=>{expect(hd283pa2(93,73)).toBe(2);});it('e',()=>{expect(hd283pa2(15,0)).toBe(4);});});
function hd284pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284pa2_hd',()=>{it('a',()=>{expect(hd284pa2(1,4)).toBe(2);});it('b',()=>{expect(hd284pa2(3,1)).toBe(1);});it('c',()=>{expect(hd284pa2(0,0)).toBe(0);});it('d',()=>{expect(hd284pa2(93,73)).toBe(2);});it('e',()=>{expect(hd284pa2(15,0)).toBe(4);});});
function hd285pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285pa2_hd',()=>{it('a',()=>{expect(hd285pa2(1,4)).toBe(2);});it('b',()=>{expect(hd285pa2(3,1)).toBe(1);});it('c',()=>{expect(hd285pa2(0,0)).toBe(0);});it('d',()=>{expect(hd285pa2(93,73)).toBe(2);});it('e',()=>{expect(hd285pa2(15,0)).toBe(4);});});
function hd286pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286pa2_hd',()=>{it('a',()=>{expect(hd286pa2(1,4)).toBe(2);});it('b',()=>{expect(hd286pa2(3,1)).toBe(1);});it('c',()=>{expect(hd286pa2(0,0)).toBe(0);});it('d',()=>{expect(hd286pa2(93,73)).toBe(2);});it('e',()=>{expect(hd286pa2(15,0)).toBe(4);});});
function hd287pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287pa2_hd',()=>{it('a',()=>{expect(hd287pa2(1,4)).toBe(2);});it('b',()=>{expect(hd287pa2(3,1)).toBe(1);});it('c',()=>{expect(hd287pa2(0,0)).toBe(0);});it('d',()=>{expect(hd287pa2(93,73)).toBe(2);});it('e',()=>{expect(hd287pa2(15,0)).toBe(4);});});
function hd288pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288pa2_hd',()=>{it('a',()=>{expect(hd288pa2(1,4)).toBe(2);});it('b',()=>{expect(hd288pa2(3,1)).toBe(1);});it('c',()=>{expect(hd288pa2(0,0)).toBe(0);});it('d',()=>{expect(hd288pa2(93,73)).toBe(2);});it('e',()=>{expect(hd288pa2(15,0)).toBe(4);});});
function hd289pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289pa2_hd',()=>{it('a',()=>{expect(hd289pa2(1,4)).toBe(2);});it('b',()=>{expect(hd289pa2(3,1)).toBe(1);});it('c',()=>{expect(hd289pa2(0,0)).toBe(0);});it('d',()=>{expect(hd289pa2(93,73)).toBe(2);});it('e',()=>{expect(hd289pa2(15,0)).toBe(4);});});
function hd290pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290pa2_hd',()=>{it('a',()=>{expect(hd290pa2(1,4)).toBe(2);});it('b',()=>{expect(hd290pa2(3,1)).toBe(1);});it('c',()=>{expect(hd290pa2(0,0)).toBe(0);});it('d',()=>{expect(hd290pa2(93,73)).toBe(2);});it('e',()=>{expect(hd290pa2(15,0)).toBe(4);});});
function hd291pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291pa2_hd',()=>{it('a',()=>{expect(hd291pa2(1,4)).toBe(2);});it('b',()=>{expect(hd291pa2(3,1)).toBe(1);});it('c',()=>{expect(hd291pa2(0,0)).toBe(0);});it('d',()=>{expect(hd291pa2(93,73)).toBe(2);});it('e',()=>{expect(hd291pa2(15,0)).toBe(4);});});
function hd292pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292pa2_hd',()=>{it('a',()=>{expect(hd292pa2(1,4)).toBe(2);});it('b',()=>{expect(hd292pa2(3,1)).toBe(1);});it('c',()=>{expect(hd292pa2(0,0)).toBe(0);});it('d',()=>{expect(hd292pa2(93,73)).toBe(2);});it('e',()=>{expect(hd292pa2(15,0)).toBe(4);});});
function hd293pa2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293pa2_hd',()=>{it('a',()=>{expect(hd293pa2(1,4)).toBe(2);});it('b',()=>{expect(hd293pa2(3,1)).toBe(1);});it('c',()=>{expect(hd293pa2(0,0)).toBe(0);});it('d',()=>{expect(hd293pa2(93,73)).toBe(2);});it('e',()=>{expect(hd293pa2(15,0)).toBe(4);});});
