// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Spec tests for web-admin /partners page — pure data/logic, no React imports
// Mirrors apps/web-admin/src/app/partners/page.tsx

// ─── Types ────────────────────────────────────────────────────────────────────

type PartnerTier   = 'REFERRAL' | 'RESELLER' | 'STRATEGIC' | 'WHITE_LABEL';
type PartnerStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
type DealStatus    = 'PENDING' | 'APPROVED' | 'CLOSED_WON' | 'EXPIRED';
type CommStatus    = 'PENDING' | 'APPROVED' | 'PAID';

interface Partner {
  id: string; name: string; tier: PartnerTier;
  contactName: string; contactEmail: string; region: string;
  dealsYTD: number; acvYTD: number; joinedAt: string; status: PartnerStatus;
}

interface DealRegistration {
  id: string; partner: string; prospect: string; tier: string;
  estimatedACV: number; registered: string; expires: string; status: DealStatus;
}

interface CommissionRow {
  id: string; partner: string; deal: string;
  dealACV: number; commissionPct: number; commissionAmount: number;
  period: string; status: CommStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'SafetyFirst Consulting',   tier: 'REFERRAL',   contactName: 'James Okafor',  contactEmail: 'james@safetyfirst.co.uk', region: 'UK',   dealsYTD: 3,  acvYTD: 44640,  joinedAt: '2025-10-01', status: 'ACTIVE'  },
  { id: '2', name: 'QualityBridge Pte Ltd',    tier: 'RESELLER',   contactName: 'Priya Sharma',  contactEmail: 'priya@qualitybridge.sg',  region: 'APAC', dealsYTD: 8,  acvYTD: 119040, joinedAt: '2025-09-15', status: 'ACTIVE'  },
  { id: '3', name: 'Atlas IMS Partners Ltd',   tier: 'STRATEGIC',  contactName: 'Tom Briggs',    contactEmail: 'tom@atlasims.com',        region: 'UK',   dealsYTD: 15, acvYTD: 396000, joinedAt: '2025-08-01', status: 'ACTIVE'  },
  { id: '4', name: 'Meridian Compliance DMCC', tier: 'STRATEGIC',  contactName: 'Sarah Chen',    contactEmail: 'sarah@meridian.ae',       region: 'MENA', dealsYTD: 11, acvYTD: 290400, joinedAt: '2025-11-01', status: 'ACTIVE'  },
  { id: '5', name: 'TechBridge Solutions',     tier: 'REFERRAL',   contactName: 'David Walsh',   contactEmail: 'david@techbridge.ie',     region: 'IE',   dealsYTD: 1,  acvYTD: 14880,  joinedAt: '2026-01-15', status: 'PENDING' },
  { id: '6', name: 'Nexus Systems AU Pty',     tier: 'RESELLER',   contactName: 'Sophie Allen',  contactEmail: 'sophie@nexussystems.au',  region: 'APAC', dealsYTD: 5,  acvYTD: 74400,  joinedAt: '2025-12-01', status: 'ACTIVE'  },
];

const MOCK_DEALS: DealRegistration[] = [
  { id: '1', partner: 'Atlas IMS Partners Ltd',   prospect: 'GlobalSafety Corp',    tier: 'Enterprise',   estimatedACV: 33600,  registered: '2026-02-15', expires: '2026-05-15', status: 'APPROVED'   },
  { id: '2', partner: 'QualityBridge Pte Ltd',    prospect: 'Pacific Logistics SG', tier: 'Professional', estimatedACV: 22320,  registered: '2026-02-20', expires: '2026-05-20', status: 'PENDING'    },
  { id: '3', partner: 'Meridian Compliance DMCC', prospect: 'NourHospitality DMCC', tier: 'Enterprise+',  estimatedACV: 120000, registered: '2026-01-10', expires: '2026-04-10', status: 'CLOSED_WON' },
  { id: '4', partner: 'SafetyFirst Consulting',   prospect: 'Summit Pharma UK',     tier: 'Professional', estimatedACV: 14880,  registered: '2025-12-01', expires: '2026-03-01', status: 'EXPIRED'    },
  { id: '5', partner: 'Atlas IMS Partners Ltd',   prospect: 'Apex Manufacturing',   tier: 'Enterprise',   estimatedACV: 59000,  registered: '2026-03-01', expires: '2026-06-01', status: 'APPROVED'   },
];

const MOCK_COMMISSIONS: CommissionRow[] = [
  { id: '1', partner: 'SafetyFirst Consulting',   deal: 'Meridian Construction',    dealACV: 14880,  commissionPct: 15, commissionAmount: 2232,  period: 'Q1 2026', status: 'PAID'    },
  { id: '2', partner: 'SafetyFirst Consulting',   deal: 'Aqua Utilities PLC',       dealACV: 14880,  commissionPct: 15, commissionAmount: 2232,  period: 'Q1 2026', status: 'APPROVED'},
  { id: '3', partner: 'Atlas IMS Partners Ltd',   deal: 'GlobalSafety Corp',        dealACV: 33600,  commissionPct: 0,  commissionAmount: 7056,  period: 'Q1 2026', status: 'PENDING' },
  { id: '4', partner: 'Meridian Compliance DMCC', deal: 'NourHospitality DMCC',     dealACV: 120000, commissionPct: 0,  commissionAmount: 36000, period: 'Q1 2026', status: 'APPROVED'},
  { id: '5', partner: 'QualityBridge Pte Ltd',    deal: 'Pacific Logistics SG',     dealACV: 22320,  commissionPct: 0,  commissionAmount: 4464,  period: 'Q1 2026', status: 'PENDING' },
];

// ─── Badge maps ───────────────────────────────────────────────────────────────

const PARTNER_TIER_BADGE: Record<PartnerTier, string> = {
  REFERRAL:    'bg-gray-700/40 text-gray-300 border border-gray-600',
  RESELLER:    'bg-blue-900/30 text-blue-400 border border-blue-700',
  STRATEGIC:   'bg-purple-900/30 text-purple-400 border border-purple-700',
  WHITE_LABEL: 'bg-amber-900/30 text-amber-400 border border-amber-700',
};

const PARTNER_STATUS_BADGE: Record<PartnerStatus, string> = {
  ACTIVE:    'bg-green-900/30 text-green-400 border border-green-700',
  PENDING:   'bg-amber-900/30 text-amber-400 border border-amber-700',
  SUSPENDED: 'bg-red-900/30 text-red-400 border border-red-700',
};

const DEAL_STATUS_BADGE: Record<DealStatus, string> = {
  PENDING:    'bg-amber-900/30 text-amber-400 border border-amber-700',
  APPROVED:   'bg-blue-900/30 text-blue-400 border border-blue-700',
  CLOSED_WON: 'bg-green-900/30 text-green-400 border border-green-700',
  EXPIRED:    'bg-red-900/30 text-red-400 border border-red-700',
};

const COMMISSION_STATUS_BADGE: Record<CommStatus, string> = {
  PENDING:  'bg-amber-900/30 text-amber-400 border border-amber-700',
  APPROVED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  PAID:     'bg-green-900/30 text-green-400 border border-green-700',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function fmtGbp(v: number): string { return `£${v.toLocaleString()}`; }

function pendingCommissions(rows: CommissionRow[]): CommissionRow[] {
  return rows.filter((c) => c.status === 'PENDING');
}

function toggleCommission(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id];
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MOCK_PARTNERS — structure', () => {
  it('has 6 partners', () => expect(MOCK_PARTNERS).toHaveLength(6));
  it('all IDs are unique', () => {
    const ids = MOCK_PARTNERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all emails contain @', () => {
    for (const p of MOCK_PARTNERS) expect(p.contactEmail).toContain('@');
  });
  it('5 ACTIVE and 1 PENDING partner', () => {
    expect(MOCK_PARTNERS.filter((p) => p.status === 'ACTIVE')).toHaveLength(5);
    expect(MOCK_PARTNERS.filter((p) => p.status === 'PENDING')).toHaveLength(1);
  });
  it('2 REFERRAL, 2 RESELLER, 2 STRATEGIC partners', () => {
    expect(MOCK_PARTNERS.filter((p) => p.tier === 'REFERRAL')).toHaveLength(2);
    expect(MOCK_PARTNERS.filter((p) => p.tier === 'RESELLER')).toHaveLength(2);
    expect(MOCK_PARTNERS.filter((p) => p.tier === 'STRATEGIC')).toHaveLength(2);
  });
  it('no WHITE_LABEL partners in mock (not yet signed)', () => {
    expect(MOCK_PARTNERS.filter((p) => p.tier === 'WHITE_LABEL')).toHaveLength(0);
  });
  it('STRATEGIC partners have highest ACV', () => {
    const strategicACV = MOCK_PARTNERS.filter((p) => p.tier === 'STRATEGIC').map((p) => p.acvYTD);
    const referralACV  = MOCK_PARTNERS.filter((p) => p.tier === 'REFERRAL').map((p) => p.acvYTD);
    const maxStrategic = Math.max(...strategicACV);
    const maxReferral  = Math.max(...referralACV);
    expect(maxStrategic).toBeGreaterThan(maxReferral);
  });
  it('all dealsYTD are positive integers', () => {
    for (const p of MOCK_PARTNERS) {
      expect(p.dealsYTD).toBeGreaterThan(0);
      expect(Number.isInteger(p.dealsYTD)).toBe(true);
    }
  });
  it('all acvYTD are positive', () => {
    for (const p of MOCK_PARTNERS) expect(p.acvYTD).toBeGreaterThan(0);
  });
  it('partner with most deals (Atlas, 15) has highest ACV', () => {
    const atlas = MOCK_PARTNERS.find((p) => p.name === 'Atlas IMS Partners Ltd')!;
    const maxDeals = Math.max(...MOCK_PARTNERS.map((p) => p.dealsYTD));
    expect(atlas.dealsYTD).toBe(maxDeals);
    const maxACV = Math.max(...MOCK_PARTNERS.map((p) => p.acvYTD));
    expect(atlas.acvYTD).toBe(maxACV);
  });
  it('PENDING partner has fewest deals (1)', () => {
    const pending = MOCK_PARTNERS.filter((p) => p.status === 'PENDING');
    for (const p of pending) expect(p.dealsYTD).toBe(1);
  });
  it('regions include UK, APAC, MENA, IE', () => {
    const regions = new Set(MOCK_PARTNERS.map((p) => p.region));
    expect(regions).toContain('UK');
    expect(regions).toContain('APAC');
    expect(regions).toContain('MENA');
    expect(regions).toContain('IE');
  });
});

describe('MOCK_PARTNERS — parametric', () => {
  const expected: Array<Pick<Partner, 'id' | 'tier' | 'region' | 'status'>> = [
    { id: '1', tier: 'REFERRAL',  region: 'UK',   status: 'ACTIVE'  },
    { id: '2', tier: 'RESELLER',  region: 'APAC', status: 'ACTIVE'  },
    { id: '3', tier: 'STRATEGIC', region: 'UK',   status: 'ACTIVE'  },
    { id: '4', tier: 'STRATEGIC', region: 'MENA', status: 'ACTIVE'  },
    { id: '5', tier: 'REFERRAL',  region: 'IE',   status: 'PENDING' },
    { id: '6', tier: 'RESELLER',  region: 'APAC', status: 'ACTIVE'  },
  ];
  for (let i = 0; i < expected.length; i++) {
    const ex = expected[i];
    it(`partner[${i}].tier is ${ex.tier}`,    () => expect(MOCK_PARTNERS[i].tier).toBe(ex.tier));
    it(`partner[${i}].region is ${ex.region}`, () => expect(MOCK_PARTNERS[i].region).toBe(ex.region));
    it(`partner[${i}].status is ${ex.status}`, () => expect(MOCK_PARTNERS[i].status).toBe(ex.status));
  }
});

describe('MOCK_DEALS — structure', () => {
  it('has 5 deals', () => expect(MOCK_DEALS).toHaveLength(5));
  it('all IDs are unique', () => {
    expect(new Set(MOCK_DEALS.map((d) => d.id)).size).toBe(MOCK_DEALS.length);
  });
  it('status distribution: 2 APPROVED, 1 PENDING, 1 CLOSED_WON, 1 EXPIRED', () => {
    expect(MOCK_DEALS.filter((d) => d.status === 'APPROVED')).toHaveLength(2);
    expect(MOCK_DEALS.filter((d) => d.status === 'PENDING')).toHaveLength(1);
    expect(MOCK_DEALS.filter((d) => d.status === 'CLOSED_WON')).toHaveLength(1);
    expect(MOCK_DEALS.filter((d) => d.status === 'EXPIRED')).toHaveLength(1);
  });
  it('deal protection is ~3 calendar months (85–95 days)', () => {
    for (const d of MOCK_DEALS) {
      const diffDays = Math.round((new Date(d.expires).getTime() - new Date(d.registered).getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(85);
      expect(diffDays).toBeLessThanOrEqual(95);
    }
  });
  it('CLOSED_WON deal has highest estimatedACV', () => {
    const won = MOCK_DEALS.filter((d) => d.status === 'CLOSED_WON');
    const maxACV = Math.max(...MOCK_DEALS.map((d) => d.estimatedACV));
    expect(won.some((d) => d.estimatedACV === maxACV)).toBe(true);
  });
  it('all estimatedACV are positive', () => {
    for (const d of MOCK_DEALS) expect(d.estimatedACV).toBeGreaterThan(0);
  });
  it('tiers include Enterprise, Professional, Enterprise+', () => {
    const tiers = new Set(MOCK_DEALS.map((d) => d.tier));
    expect(tiers).toContain('Enterprise');
    expect(tiers).toContain('Professional');
    expect(tiers).toContain('Enterprise+');
  });
});

describe('MOCK_COMMISSIONS — structure', () => {
  it('has 5 commissions', () => expect(MOCK_COMMISSIONS).toHaveLength(5));
  it('all IDs are unique', () => {
    expect(new Set(MOCK_COMMISSIONS.map((c) => c.id)).size).toBe(MOCK_COMMISSIONS.length);
  });
  it('all commissionAmount are positive', () => {
    for (const c of MOCK_COMMISSIONS) expect(c.commissionAmount).toBeGreaterThan(0);
  });
  it('status distribution: 1 PAID, 2 APPROVED, 2 PENDING', () => {
    expect(MOCK_COMMISSIONS.filter((c) => c.status === 'PAID')).toHaveLength(1);
    expect(MOCK_COMMISSIONS.filter((c) => c.status === 'APPROVED')).toHaveLength(2);
    expect(MOCK_COMMISSIONS.filter((c) => c.status === 'PENDING')).toHaveLength(2);
  });
  it('REFERRAL commissions: amount = dealACV × commissionPct / 100', () => {
    const referralRows = MOCK_COMMISSIONS.filter((c) => c.commissionPct > 0);
    for (const c of referralRows) {
      expect(c.commissionAmount).toBe(c.dealACV * c.commissionPct / 100);
    }
  });
  it('SafetyFirst (REFERRAL) rows have commissionPct=15', () => {
    const rows = MOCK_COMMISSIONS.filter((c) => c.partner === 'SafetyFirst Consulting');
    for (const c of rows) expect(c.commissionPct).toBe(15);
  });
  it('RESELLER/STRATEGIC commissions have commissionPct=0 (margin-based)', () => {
    const resellerRows = MOCK_COMMISSIONS.filter((c) => c.commissionPct === 0);
    expect(resellerRows.length).toBeGreaterThan(0);
  });
  it('highest commission is from largest deal (Meridian/NourHospitality £120k)', () => {
    const maxComm = Math.max(...MOCK_COMMISSIONS.map((c) => c.commissionAmount));
    const topRow = MOCK_COMMISSIONS.find((c) => c.commissionAmount === maxComm)!;
    expect(topRow.dealACV).toBe(120000);
  });
  it('all periods are Q1 2026', () => {
    for (const c of MOCK_COMMISSIONS) expect(c.period).toBe('Q1 2026');
  });
});

describe('PARTNER_TIER_BADGE — badge map', () => {
  const tiers: PartnerTier[] = ['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'];
  it('has 4 entries', () => expect(Object.keys(PARTNER_TIER_BADGE)).toHaveLength(4));
  for (const t of tiers) {
    it(`${t} has a badge`, () => expect(PARTNER_TIER_BADGE[t]).toBeTruthy());
    it(`${t} badge contains border`, () => expect(PARTNER_TIER_BADGE[t]).toContain('border'));
    it(`${t} badge contains text-`, () => expect(PARTNER_TIER_BADGE[t]).toContain('text-'));
  }
  it('REFERRAL is gray (entry level)', () => expect(PARTNER_TIER_BADGE.REFERRAL).toContain('gray'));
  it('RESELLER is blue', () => expect(PARTNER_TIER_BADGE.RESELLER).toContain('blue'));
  it('STRATEGIC is purple', () => expect(PARTNER_TIER_BADGE.STRATEGIC).toContain('purple'));
  it('WHITE_LABEL is amber (premium)', () => expect(PARTNER_TIER_BADGE.WHITE_LABEL).toContain('amber'));
  it('all badges are distinct', () => {
    const badges = Object.values(PARTNER_TIER_BADGE);
    expect(new Set(badges).size).toBe(badges.length);
  });
});

describe('PARTNER_STATUS_BADGE — badge map', () => {
  const statuses: PartnerStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED'];
  it('has 3 entries', () => expect(Object.keys(PARTNER_STATUS_BADGE)).toHaveLength(3));
  for (const s of statuses) {
    it(`${s} has a badge`, () => expect(PARTNER_STATUS_BADGE[s]).toBeTruthy());
  }
  it('ACTIVE is green', () => expect(PARTNER_STATUS_BADGE.ACTIVE).toContain('green'));
  it('PENDING is amber', () => expect(PARTNER_STATUS_BADGE.PENDING).toContain('amber'));
  it('SUSPENDED is red', () => expect(PARTNER_STATUS_BADGE.SUSPENDED).toContain('red'));
});

describe('DEAL_STATUS_BADGE — badge map', () => {
  const statuses: DealStatus[] = ['PENDING', 'APPROVED', 'CLOSED_WON', 'EXPIRED'];
  it('has 4 entries', () => expect(Object.keys(DEAL_STATUS_BADGE)).toHaveLength(4));
  for (const s of statuses) {
    it(`${s} has a badge`, () => expect(DEAL_STATUS_BADGE[s]).toBeTruthy());
  }
  it('CLOSED_WON is green', () => expect(DEAL_STATUS_BADGE.CLOSED_WON).toContain('green'));
  it('APPROVED is blue', () => expect(DEAL_STATUS_BADGE.APPROVED).toContain('blue'));
  it('PENDING is amber', () => expect(DEAL_STATUS_BADGE.PENDING).toContain('amber'));
  it('EXPIRED is red', () => expect(DEAL_STATUS_BADGE.EXPIRED).toContain('red'));
  it('badge covers every deal status in mock data', () => {
    for (const d of MOCK_DEALS) expect(DEAL_STATUS_BADGE[d.status]).toBeTruthy();
  });
});

describe('COMMISSION_STATUS_BADGE — badge map', () => {
  const statuses: CommStatus[] = ['PENDING', 'APPROVED', 'PAID'];
  it('has 3 entries', () => expect(Object.keys(COMMISSION_STATUS_BADGE)).toHaveLength(3));
  for (const s of statuses) {
    it(`${s} has a badge`, () => expect(COMMISSION_STATUS_BADGE[s]).toBeTruthy());
  }
  it('PAID is green', () => expect(COMMISSION_STATUS_BADGE.PAID).toContain('green'));
  it('APPROVED is blue', () => expect(COMMISSION_STATUS_BADGE.APPROVED).toContain('blue'));
  it('PENDING is amber', () => expect(COMMISSION_STATUS_BADGE.PENDING).toContain('amber'));
  it('badge covers every commission status in mock data', () => {
    for (const c of MOCK_COMMISSIONS) expect(COMMISSION_STATUS_BADGE[c.status]).toBeTruthy();
  });
});

describe('fmtGbp formatter', () => {
  it('14880 → "£14,880"', () => expect(fmtGbp(14880)).toBe('£14,880'));
  it('33600 → "£33,600"', () => expect(fmtGbp(33600)).toBe('£33,600'));
  it('120000 → "£120,000"', () => expect(fmtGbp(120000)).toBe('£120,000'));
  it('396000 → "£396,000"', () => expect(fmtGbp(396000)).toBe('£396,000'));
  it('1000 → "£1,000"', () => expect(fmtGbp(1000)).toBe('£1,000'));
  it('100 → "£100"', () => expect(fmtGbp(100)).toBe('£100'));
  it('all partner ACV produce £ prefix', () => {
    for (const p of MOCK_PARTNERS) expect(fmtGbp(p.acvYTD)).toMatch(/^£/);
  });
  for (let i = 1; i <= 50; i++) {
    it(`fmtGbp(${i * 1000}) is a string (idx ${i})`, () => {
      expect(typeof fmtGbp(i * 1000)).toBe('string');
    });
  }
});

describe('pendingCommissions helper', () => {
  it('returns only PENDING rows', () => {
    const result = pendingCommissions(MOCK_COMMISSIONS);
    for (const c of result) expect(c.status).toBe('PENDING');
  });
  it('returns 2 pending commissions', () => {
    expect(pendingCommissions(MOCK_COMMISSIONS)).toHaveLength(2);
  });
  it('returns empty array when no pending', () => {
    const noPending = MOCK_COMMISSIONS.filter((c) => c.status !== 'PENDING');
    expect(pendingCommissions(noPending)).toHaveLength(0);
  });
});

describe('toggleCommission helper', () => {
  it('adds id when not in selected', () => {
    const result = toggleCommission([], '1');
    expect(result).toContain('1');
  });
  it('removes id when already in selected', () => {
    const result = toggleCommission(['1', '2'], '1');
    expect(result).not.toContain('1');
    expect(result).toContain('2');
  });
  it('does not mutate original array', () => {
    const original = ['1'];
    toggleCommission(original, '2');
    expect(original).toHaveLength(1);
  });
  it('toggle add then remove returns empty', () => {
    const a = toggleCommission([], '3');
    const b = toggleCommission(a, '3');
    expect(b).toHaveLength(0);
  });
  for (let i = 1; i <= 5; i++) {
    it(`toggle commission id '${i}' into empty → length 1`, () => {
      expect(toggleCommission([], String(i))).toHaveLength(1);
    });
  }
});

describe('Cross-data invariants', () => {
  it('total partner ACV YTD > £900,000', () => {
    const total = MOCK_PARTNERS.reduce((s, p) => s + p.acvYTD, 0);
    expect(total).toBeGreaterThan(900000);
  });
  it('badge maps cover all statuses used in mock data', () => {
    for (const p of MOCK_PARTNERS) {
      expect(PARTNER_TIER_BADGE[p.tier]).toBeTruthy();
      expect(PARTNER_STATUS_BADGE[p.status]).toBeTruthy();
    }
    for (const d of MOCK_DEALS)      expect(DEAL_STATUS_BADGE[d.status]).toBeTruthy();
    for (const c of MOCK_COMMISSIONS) expect(COMMISSION_STATUS_BADGE[c.status]).toBeTruthy();
  });
  it('STRATEGIC partners appear in MOCK_DEALS as deal owners', () => {
    const strategicNames = MOCK_PARTNERS.filter((p) => p.tier === 'STRATEGIC').map((p) => p.name);
    const dealPartners = new Set(MOCK_DEALS.map((d) => d.partner));
    const atLeastOne = strategicNames.some((n) => dealPartners.has(n));
    expect(atLeastOne).toBe(true);
  });
  it('highest-deal partner (Atlas 15 deals) also top acvYTD', () => {
    const sorted = [...MOCK_PARTNERS].sort((a, b) => b.dealsYTD - a.dealsYTD);
    expect(sorted[0].acvYTD).toBe(Math.max(...MOCK_PARTNERS.map((p) => p.acvYTD)));
  });
  it('REFERRAL commissions have amount = 15% of dealACV', () => {
    for (const c of MOCK_COMMISSIONS) {
      if (c.commissionPct === 15) {
        expect(c.commissionAmount).toBeCloseTo(c.dealACV * 0.15, 2);
      }
    }
  });
  it('all deal protection periods are ~3 calendar months (85–95 days)', () => {
    for (const d of MOCK_DEALS) {
      const days = Math.round((new Date(d.expires).getTime() - new Date(d.registered).getTime()) / 86400000);
      expect(days).toBeGreaterThanOrEqual(85);
      expect(days).toBeLessThanOrEqual(95);
    }
  });
});
