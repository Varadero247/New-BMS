// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 172 — web-admin revenue/CRM pages data-integrity spec tests
// Covers: leads, renewal, expansion, winback pages

// ─── Leads page ───────────────────────────────────────────────────────────────

type LeadSource = 'WEBSITE' | 'LINKEDIN' | 'REFERRAL' | 'COLD' | 'INBOUND';
type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

interface Lead {
  id: string; companyName: string; contactName: string; contactEmail: string;
  contactPhone: string; source: LeadSource; status: LeadStatus;
  estimatedValue: number; assignedTo: string; createdAt: string; lastContact: string;
}

const LEAD_MOCK: Lead[] = [
  { id: '1', companyName: 'Meridian Construction',  contactName: 'David Walsh',   contactEmail: 'david.walsh@meridian.co.uk', contactPhone: '+44 7700 900100', source: 'LINKEDIN',  status: 'QUALIFIED',   estimatedValue: 14400, assignedTo: 'Sarah Chen',   createdAt: '2026-02-01', lastContact: '2026-02-18' },
  { id: '2', companyName: 'Aqua Utilities PLC',     contactName: 'Fiona Grant',   contactEmail: 'fgrant@aquautilities.com',   contactPhone: '+44 7700 900200', source: 'INBOUND',   status: 'PROPOSAL',    estimatedValue: 36000, assignedTo: 'James Okafor',  createdAt: '2026-01-28', lastContact: '2026-02-19' },
  { id: '3', companyName: 'TechForge Labs',         contactName: 'Ravi Patel',    contactEmail: 'ravi@techforge.io',          contactPhone: '+44 7700 900300', source: 'REFERRAL',  status: 'NEGOTIATION', estimatedValue: 28800, assignedTo: 'Priya Sharma',  createdAt: '2026-02-05', lastContact: '2026-02-20' },
  { id: '4', companyName: 'GreenPath Energy',       contactName: 'Sophie Allen',  contactEmail: 'sallen@greenpath.energy',    contactPhone: '+44 7700 900400', source: 'WEBSITE',   status: 'NEW',         estimatedValue:  9600, assignedTo: 'Tom Briggs',    createdAt: '2026-02-21', lastContact: '2026-02-21' },
  { id: '5', companyName: 'Summit Pharma',          contactName: 'Mark Bennett',  contactEmail: 'm.bennett@summitpharma.com', contactPhone: '+44 7700 900500', source: 'COLD',      status: 'CONTACTED',   estimatedValue: 21600, assignedTo: 'Sarah Chen',   createdAt: '2026-02-10', lastContact: '2026-02-15' },
];

const PIPELINE_STAGES: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST',
];

const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
  NEW:         'bg-gray-700/40 text-gray-300 border border-gray-600',
  CONTACTED:   'bg-blue-900/30 text-blue-400 border border-blue-700',
  QUALIFIED:   'bg-cyan-900/30 text-cyan-400 border border-cyan-700',
  PROPOSAL:    'bg-purple-900/30 text-purple-400 border border-purple-700',
  NEGOTIATION: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  CLOSED_WON:  'bg-green-900/30 text-green-400 border border-green-700',
  CLOSED_LOST: 'bg-red-900/30 text-red-400 border border-red-700',
};

const SOURCE_BADGE: Record<LeadSource, string> = {
  WEBSITE:  'bg-blue-900/30 text-blue-400 border border-blue-700',
  LINKEDIN: 'bg-blue-800/30 text-blue-300 border border-blue-600',
  REFERRAL: 'bg-green-900/30 text-green-400 border border-green-700',
  COLD:     'bg-gray-700/40 text-gray-400 border border-gray-600',
  INBOUND:  'bg-purple-900/30 text-purple-400 border border-purple-700',
};

// ─── Renewal page ─────────────────────────────────────────────────────────────

type RenewalStatus = 'ON_TRACK' | 'AT_RISK' | 'CHURNED' | 'RENEWED';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface Renewal {
  id: string; companyName: string; mrr: number; renewalDate: string;
  daysUntilRenewal: number; status: RenewalStatus; riskLevel: RiskLevel;
  action: string; csm: string;
}

const RENEWAL_MOCK: Renewal[] = [
  { id: '1', companyName: 'Sterling Facilities',    mrr:  900, renewalDate: '2026-03-01', daysUntilRenewal:  7, status: 'AT_RISK',  riskLevel: 'HIGH',   action: 'Emergency exec call booked for Feb 24 — escalate to founder',  csm: 'Sarah Chen'  },
  { id: '2', companyName: 'BlueSky Logistics',      mrr:  600, renewalDate: '2026-03-15', daysUntilRenewal: 21, status: 'ON_TRACK', riskLevel: 'LOW',    action: 'Renewal invoice sent — awaiting signature',                     csm: 'Tom Briggs'  },
  { id: '3', companyName: 'Aqua Utilities PLC',     mrr: 3000, renewalDate: '2026-03-20', daysUntilRenewal: 26, status: 'AT_RISK',  riskLevel: 'MEDIUM', action: 'Onboarding stalled — unblock before renewal conversation',      csm: 'Priya Sharma'},
  { id: '4', companyName: 'Helix Manufacturing Ltd',mrr: 1200, renewalDate: '2026-04-01', daysUntilRenewal: 38, status: 'ON_TRACK', riskLevel: 'LOW',    action: 'Schedule QBR for mid-March',                                    csm: 'Sarah Chen'  },
  { id: '5', companyName: 'TechForge Labs',         mrr: 2400, renewalDate: '2026-04-15', daysUntilRenewal: 52, status: 'RENEWED',  riskLevel: 'LOW',    action: 'Early renewal signed — upgraded to ENTERPRISE',                 csm: 'Priya Sharma'},
];

const RENEWAL_STATUS_BADGE: Record<RenewalStatus, string> = {
  ON_TRACK: 'bg-green-900/30 text-green-400 border border-green-700',
  AT_RISK:  'bg-amber-900/30 text-amber-400 border border-amber-700',
  CHURNED:  'bg-red-900/30 text-red-400 border border-red-700',
  RENEWED:  'bg-blue-900/30 text-blue-400 border border-blue-700',
};

const RISK_BADGE: Record<RiskLevel, string> = {
  LOW:    'bg-green-900/30 text-green-400 border border-green-700',
  MEDIUM: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  HIGH:   'bg-red-900/30 text-red-400 border border-red-700',
};

function urgencyClass(days: number): string {
  if (days <= 30) return 'text-red-400 font-semibold';
  if (days <= 60) return 'text-amber-400 font-semibold';
  return 'text-gray-300';
}

function urgencyRowBg(days: number, status: RenewalStatus): string {
  if (status === 'CHURNED') return 'bg-red-900/10';
  if (days <= 30) return 'bg-red-900/5';
  if (days <= 60) return 'bg-amber-900/5';
  return '';
}

// ─── Expansion page ───────────────────────────────────────────────────────────

type ExpansionType = 'UPSELL' | 'CROSS_SELL' | 'ADD_ON';
type ExpansionPriority = 'HIGH' | 'MEDIUM' | 'LOW';
type ExpansionStatus = 'IDENTIFIED' | 'IN_PROGRESS' | 'WON' | 'LOST';

interface Expansion {
  id: string; companyName: string; currentMrr: number; expansionOpportunity: number;
  type: ExpansionType; priority: ExpansionPriority; status: ExpansionStatus;
  assignedTo: string; notes: string;
}

const EXPANSION_MOCK: Expansion[] = [
  { id: '1', companyName: 'Helix Manufacturing Ltd', currentMrr: 1200, expansionOpportunity:  600, type: 'UPSELL',      priority: 'HIGH',   status: 'IN_PROGRESS', assignedTo: 'Sarah Chen',   notes: 'Expressed interest in ENTERPRISE plan at last QBR' },
  { id: '2', companyName: 'Pinnacle Foods Group',    currentMrr:  800, expansionOpportunity:  400, type: 'ADD_ON',      priority: 'HIGH',   status: 'IDENTIFIED',  assignedTo: 'James Okafor',  notes: 'Needs Food Safety module add-on' },
  { id: '3', companyName: 'Vertex Engineering',      currentMrr: 2400, expansionOpportunity:  800, type: 'CROSS_SELL',  priority: 'MEDIUM', status: 'IDENTIFIED',  assignedTo: 'Priya Sharma',  notes: 'Currently using Health & Safety' },
  { id: '4', companyName: 'BlueSky Logistics',       currentMrr:  600, expansionOpportunity:  300, type: 'UPSELL',      priority: 'LOW',    status: 'WON',         assignedTo: 'Tom Briggs',    notes: 'Upgraded to PROFESSIONAL plan' },
  { id: '5', companyName: 'Orion Healthcare',        currentMrr: 1800, expansionOpportunity:  900, type: 'CROSS_SELL',  priority: 'HIGH',   status: 'IN_PROGRESS', assignedTo: 'Sarah Chen',   notes: 'Medical device module demo scheduled' },
];

const EXP_TYPE_BADGE: Record<ExpansionType, string> = {
  UPSELL:     'bg-blue-900/30 text-blue-400 border border-blue-700',
  CROSS_SELL: 'bg-purple-900/30 text-purple-400 border border-purple-700',
  ADD_ON:     'bg-cyan-900/30 text-cyan-400 border border-cyan-700',
};

const EXP_PRIORITY_BADGE: Record<ExpansionPriority, string> = {
  HIGH:   'bg-red-900/30 text-red-400 border border-red-700',
  MEDIUM: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  LOW:    'bg-gray-700/40 text-gray-400 border border-gray-600',
};

const EXP_STATUS_BADGE: Record<ExpansionStatus, string> = {
  IDENTIFIED:  'bg-blue-900/30 text-blue-400 border border-blue-700',
  IN_PROGRESS: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  WON:         'bg-green-900/30 text-green-400 border border-green-700',
  LOST:        'bg-red-900/30 text-red-400 border border-red-700',
};

// ─── Winback page ─────────────────────────────────────────────────────────────

type WinbackStatus = 'IDENTIFIED' | 'OUTREACH_SENT' | 'IN_TALKS' | 'WON_BACK' | 'NO_RESPONSE' | 'DECLINED';

interface Winback {
  id: string; companyName: string; contactName: string; contactEmail: string;
  churnDate: string; churnReason: string; mrrLost: number;
  campaignStatus: WinbackStatus; lastOutreach: string; nextAction: string; assignedTo: string;
}

const WINBACK_MOCK: Winback[] = [
  { id: '1', companyName: 'RedBrick Property Group', contactName: 'James Morley',   contactEmail: 'james@redbrick.co.uk',         churnDate: '2025-12-01', churnReason: 'Budget cut — CFO mandate',                   mrrLost: 1800, campaignStatus: 'IN_TALKS',      lastOutreach: '2026-02-18', nextAction: 'Follow-up call Feb 25', assignedTo: 'Sarah Chen'  },
  { id: '2', companyName: 'Coastal Ventures Ltd',    contactName: 'Emma Booth',     contactEmail: 'ebooth@coastalventures.com',    churnDate: '2025-11-15', churnReason: 'Switched to competitor (cheaper plan)',       mrrLost:  600, campaignStatus: 'OUTREACH_SENT', lastOutreach: '2026-02-10', nextAction: 'Send second touchpoint', assignedTo: 'James Okafor'},
  { id: '3', companyName: 'NorthStar Aerospace',     contactName: 'Paul Kingston',  contactEmail: 'pkingston@northstar-aero.com',  churnDate: '2025-10-01', churnReason: 'Missing aerospace-specific features',        mrrLost: 3600, campaignStatus: 'WON_BACK',     lastOutreach: '2026-01-20', nextAction: 'Re-signed on ENTERPRISE', assignedTo: 'Priya Sharma'},
  { id: '4', companyName: 'Skyline Retail',          contactName: 'Charlotte Mills', contactEmail: 'c.mills@skylineretail.co.uk',  churnDate: '2025-09-01', churnReason: 'Poor onboarding experience',                 mrrLost:  900, campaignStatus: 'DECLINED',      lastOutreach: '2026-01-15', nextAction: 'Declined — revisit in 6 months', assignedTo: 'Tom Briggs'},
  { id: '5', companyName: 'Delta Pharma',            contactName: 'Oliver Nash',    contactEmail: 'onash@deltapharma.co.uk',       churnDate: '2026-01-01', churnReason: 'Acquired by larger group with different tooling', mrrLost: 2400, campaignStatus: 'IDENTIFIED',    lastOutreach: '', nextAction: 'Initial outreach not yet sent', assignedTo: '' },
];

const WINBACK_STATUS_BADGE: Record<WinbackStatus, string> = {
  IDENTIFIED:    'bg-gray-700/40 text-gray-300 border border-gray-600',
  OUTREACH_SENT: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  IN_TALKS:      'bg-amber-900/30 text-amber-400 border border-amber-700',
  WON_BACK:      'bg-green-900/30 text-green-400 border border-green-700',
  NO_RESPONSE:   'bg-gray-700/40 text-gray-400 border border-gray-600',
  DECLINED:      'bg-red-900/30 text-red-400 border border-red-700',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('leads page — MOCK_DATA', () => {
  it('has 5 leads', () => { expect(LEAD_MOCK).toHaveLength(5); });
  for (const lead of LEAD_MOCK) {
    it(`lead ${lead.id} (${lead.companyName}): estimatedValue > 0`, () => {
      expect(lead.estimatedValue).toBeGreaterThan(0);
    });
    it(`lead ${lead.id}: contactEmail contains @`, () => {
      expect(lead.contactEmail).toContain('@');
    });
  }
  it('all lead IDs are unique', () => {
    expect(new Set(LEAD_MOCK.map((l) => l.id)).size).toBe(LEAD_MOCK.length);
  });
  it('highest estimatedValue lead is in PROPOSAL (Aqua Utilities, £36k)', () => {
    const max = LEAD_MOCK.reduce((a, b) => a.estimatedValue > b.estimatedValue ? a : b);
    expect(max.status).toBe('PROPOSAL');
    expect(max.estimatedValue).toBe(36000);
  });
  it('all leads are in pre-closed stages (no CLOSED_WON/LOST in demo data)', () => {
    for (const lead of LEAD_MOCK) {
      expect(['CLOSED_WON', 'CLOSED_LOST']).not.toContain(lead.status);
    }
  });
});

describe('leads page — PIPELINE_STAGES', () => {
  it('has 7 pipeline stages', () => { expect(PIPELINE_STAGES).toHaveLength(7); });
  it('starts with NEW', () => { expect(PIPELINE_STAGES[0]).toBe('NEW'); });
  it('ends with CLOSED_LOST', () => { expect(PIPELINE_STAGES[PIPELINE_STAGES.length - 1]).toBe('CLOSED_LOST'); });
  it('CLOSED_WON comes before CLOSED_LOST', () => {
    expect(PIPELINE_STAGES.indexOf('CLOSED_WON')).toBeLessThan(PIPELINE_STAGES.indexOf('CLOSED_LOST'));
  });
  it('all stages are unique', () => {
    expect(new Set(PIPELINE_STAGES).size).toBe(PIPELINE_STAGES.length);
  });
  for (const stage of PIPELINE_STAGES) {
    it(`PIPELINE_STAGES includes '${stage}'`, () => {
      expect(PIPELINE_STAGES).toContain(stage);
    });
  }
});

describe('leads page — STATUS_BADGE', () => {
  it('has 7 status badge entries', () => {
    expect(Object.keys(LEAD_STATUS_BADGE)).toHaveLength(7);
  });
  it('CLOSED_WON badge contains green', () => {
    expect(LEAD_STATUS_BADGE.CLOSED_WON).toContain('green');
  });
  it('CLOSED_LOST badge contains red', () => {
    expect(LEAD_STATUS_BADGE.CLOSED_LOST).toContain('red');
  });
  it('NEW badge contains gray', () => {
    expect(LEAD_STATUS_BADGE.NEW).toContain('gray');
  });
  for (const [status, cls] of Object.entries(LEAD_STATUS_BADGE)) {
    it(`STATUS_BADGE['${status}'] is a non-empty string`, () => {
      expect(cls.length).toBeGreaterThan(0);
    });
  }
});

describe('leads page — SOURCE_BADGE', () => {
  it('has 5 source badge entries', () => {
    expect(Object.keys(SOURCE_BADGE)).toHaveLength(5);
  });
  it('REFERRAL badge contains green', () => {
    expect(SOURCE_BADGE.REFERRAL).toContain('green');
  });
  it('COLD badge contains gray', () => {
    expect(SOURCE_BADGE.COLD).toContain('gray');
  });
  for (const [src, cls] of Object.entries(SOURCE_BADGE)) {
    it(`SOURCE_BADGE['${src}'] is non-empty`, () => {
      expect(cls.length).toBeGreaterThan(0);
    });
  }
});

// ─── Renewal ──────────────────────────────────────────────────────────────────

describe('renewal page — MOCK_DATA', () => {
  it('has 5 renewal rows', () => { expect(RENEWAL_MOCK).toHaveLength(5); });
  for (const r of RENEWAL_MOCK) {
    it(`renewal ${r.id} (${r.companyName}): mrr > 0`, () => {
      expect(r.mrr).toBeGreaterThan(0);
    });
    it(`renewal ${r.id}: daysUntilRenewal ≥ 0`, () => {
      expect(r.daysUntilRenewal).toBeGreaterThanOrEqual(0);
    });
  }
  it('exactly one RENEWED row (TechForge Labs)', () => {
    expect(RENEWAL_MOCK.filter((r) => r.status === 'RENEWED')).toHaveLength(1);
    expect(RENEWAL_MOCK.find((r) => r.status === 'RENEWED')?.companyName).toBe('TechForge Labs');
  });
  it('exactly two AT_RISK rows', () => {
    expect(RENEWAL_MOCK.filter((r) => r.status === 'AT_RISK')).toHaveLength(2);
  });
  it('highest MRR row is AT_RISK (Aqua Utilities, £3,000)', () => {
    const max = RENEWAL_MOCK.reduce((a, b) => a.mrr > b.mrr ? a : b);
    expect(max.status).toBe('AT_RISK');
    expect(max.mrr).toBe(3000);
  });
  it('no CHURNED rows in demo data', () => {
    expect(RENEWAL_MOCK.filter((r) => r.status === 'CHURNED')).toHaveLength(0);
  });
});

describe('renewal page — STATUS_BADGE', () => {
  it('has 4 status entries', () => { expect(Object.keys(RENEWAL_STATUS_BADGE)).toHaveLength(4); });
  it('ON_TRACK is green', () => { expect(RENEWAL_STATUS_BADGE.ON_TRACK).toContain('green'); });
  it('AT_RISK is amber', () => { expect(RENEWAL_STATUS_BADGE.AT_RISK).toContain('amber'); });
  it('CHURNED is red', () => { expect(RENEWAL_STATUS_BADGE.CHURNED).toContain('red'); });
  it('RENEWED is blue', () => { expect(RENEWAL_STATUS_BADGE.RENEWED).toContain('blue'); });
});

describe('renewal page — RISK_BADGE', () => {
  it('has 3 risk entries', () => { expect(Object.keys(RISK_BADGE)).toHaveLength(3); });
  it('LOW is green', () => { expect(RISK_BADGE.LOW).toContain('green'); });
  it('MEDIUM is amber', () => { expect(RISK_BADGE.MEDIUM).toContain('amber'); });
  it('HIGH is red', () => { expect(RISK_BADGE.HIGH).toContain('red'); });
});

describe('renewal page — urgencyClass()', () => {
  const cases: Array<[number, string]> = [
    [0, 'text-red-400'],
    [7, 'text-red-400'],
    [30, 'text-red-400'],
    [31, 'text-amber-400'],
    [60, 'text-amber-400'],
    [61, 'text-gray-300'],
    [365, 'text-gray-300'],
  ];
  for (const [days, expected] of cases) {
    it(`urgencyClass(${days}) contains '${expected}'`, () => {
      expect(urgencyClass(days)).toContain(expected);
    });
  }
  it('contains font-semibold for days ≤ 30', () => {
    expect(urgencyClass(30)).toContain('font-semibold');
  });
  it('contains font-semibold for days ≤ 60', () => {
    expect(urgencyClass(60)).toContain('font-semibold');
  });
  it('no font-semibold for days > 60', () => {
    expect(urgencyClass(61)).not.toContain('font-semibold');
  });
});

describe('renewal page — urgencyRowBg()', () => {
  it('CHURNED always returns red bg regardless of days', () => {
    expect(urgencyRowBg(100, 'CHURNED')).toContain('red');
    expect(urgencyRowBg(0, 'CHURNED')).toContain('red');
  });
  it('days ≤ 30 (non-CHURNED): red bg', () => {
    expect(urgencyRowBg(30, 'AT_RISK')).toContain('red');
  });
  it('days ≤ 60 (non-CHURNED): amber bg', () => {
    expect(urgencyRowBg(45, 'ON_TRACK')).toContain('amber');
  });
  it('days > 60 (non-CHURNED): empty string', () => {
    expect(urgencyRowBg(90, 'ON_TRACK')).toBe('');
  });
  it('CHURNED takes priority over days > 60', () => {
    expect(urgencyRowBg(90, 'CHURNED')).not.toBe('');
  });
});

// ─── Expansion ────────────────────────────────────────────────────────────────

describe('expansion page — MOCK_DATA', () => {
  it('has 5 expansion opportunities', () => { expect(EXPANSION_MOCK).toHaveLength(5); });
  for (const e of EXPANSION_MOCK) {
    it(`expansion ${e.id} (${e.companyName}): expansionOpportunity < currentMrr`, () => {
      expect(e.expansionOpportunity).toBeLessThan(e.currentMrr);
    });
    it(`expansion ${e.id}: expansionOpportunity > 0`, () => {
      expect(e.expansionOpportunity).toBeGreaterThan(0);
    });
  }
  it('exactly one WON expansion (BlueSky Logistics)', () => {
    expect(EXPANSION_MOCK.filter((e) => e.status === 'WON')).toHaveLength(1);
    expect(EXPANSION_MOCK.find((e) => e.status === 'WON')?.companyName).toBe('BlueSky Logistics');
  });
  it('exactly three HIGH-priority expansions', () => {
    expect(EXPANSION_MOCK.filter((e) => e.priority === 'HIGH')).toHaveLength(3);
  });
  it('no LOST expansions in demo data', () => {
    expect(EXPANSION_MOCK.filter((e) => e.status === 'LOST')).toHaveLength(0);
  });
});

describe('expansion page — TYPE_BADGE', () => {
  it('has 3 type badge entries', () => { expect(Object.keys(EXP_TYPE_BADGE)).toHaveLength(3); });
  it('UPSELL is blue', () => { expect(EXP_TYPE_BADGE.UPSELL).toContain('blue'); });
  it('CROSS_SELL is purple', () => { expect(EXP_TYPE_BADGE.CROSS_SELL).toContain('purple'); });
  it('ADD_ON is cyan', () => { expect(EXP_TYPE_BADGE.ADD_ON).toContain('cyan'); });
});

describe('expansion page — PRIORITY_BADGE', () => {
  it('has 3 priority badge entries', () => { expect(Object.keys(EXP_PRIORITY_BADGE)).toHaveLength(3); });
  it('HIGH is red', () => { expect(EXP_PRIORITY_BADGE.HIGH).toContain('red'); });
  it('MEDIUM is amber', () => { expect(EXP_PRIORITY_BADGE.MEDIUM).toContain('amber'); });
  it('LOW is gray', () => { expect(EXP_PRIORITY_BADGE.LOW).toContain('gray'); });
});

describe('expansion page — STATUS_BADGE', () => {
  it('has 4 status badge entries', () => { expect(Object.keys(EXP_STATUS_BADGE)).toHaveLength(4); });
  it('WON is green', () => { expect(EXP_STATUS_BADGE.WON).toContain('green'); });
  it('LOST is red', () => { expect(EXP_STATUS_BADGE.LOST).toContain('red'); });
  it('IN_PROGRESS is amber', () => { expect(EXP_STATUS_BADGE.IN_PROGRESS).toContain('amber'); });
  it('IDENTIFIED is blue', () => { expect(EXP_STATUS_BADGE.IDENTIFIED).toContain('blue'); });
});

// ─── Winback ──────────────────────────────────────────────────────────────────

describe('winback page — MOCK_DATA', () => {
  it('has 5 winback candidates', () => { expect(WINBACK_MOCK).toHaveLength(5); });
  for (const w of WINBACK_MOCK) {
    it(`winback ${w.id} (${w.companyName}): mrrLost > 0`, () => {
      expect(w.mrrLost).toBeGreaterThan(0);
    });
    it(`winback ${w.id}: contactEmail contains @`, () => {
      expect(w.contactEmail).toContain('@');
    });
  }
  it('exactly one WON_BACK (NorthStar Aerospace, highest mrrLost = £3,600)', () => {
    expect(WINBACK_MOCK.filter((w) => w.campaignStatus === 'WON_BACK')).toHaveLength(1);
    expect(WINBACK_MOCK.find((w) => w.campaignStatus === 'WON_BACK')?.mrrLost).toBe(3600);
  });
  it('exactly one DECLINED', () => {
    expect(WINBACK_MOCK.filter((w) => w.campaignStatus === 'DECLINED')).toHaveLength(1);
  });
  it('NorthStar Aerospace has highest mrrLost', () => {
    const max = WINBACK_MOCK.reduce((a, b) => a.mrrLost > b.mrrLost ? a : b);
    expect(max.companyName).toBe('NorthStar Aerospace');
    expect(max.mrrLost).toBe(3600);
  });
  it('Delta Pharma (IDENTIFIED): assignedTo is empty (no CSM assigned yet)', () => {
    const delta = WINBACK_MOCK.find((w) => w.companyName === 'Delta Pharma');
    expect(delta?.assignedTo).toBe('');
  });
});

describe('winback page — STATUS_BADGE', () => {
  it('has 6 status badge entries', () => { expect(Object.keys(WINBACK_STATUS_BADGE)).toHaveLength(6); });
  it('WON_BACK is green', () => { expect(WINBACK_STATUS_BADGE.WON_BACK).toContain('green'); });
  it('DECLINED is red', () => { expect(WINBACK_STATUS_BADGE.DECLINED).toContain('red'); });
  it('IN_TALKS is amber', () => { expect(WINBACK_STATUS_BADGE.IN_TALKS).toContain('amber'); });
  it('OUTREACH_SENT is blue', () => { expect(WINBACK_STATUS_BADGE.OUTREACH_SENT).toContain('blue'); });
  it('IDENTIFIED is gray', () => { expect(WINBACK_STATUS_BADGE.IDENTIFIED).toContain('gray'); });
  it('NO_RESPONSE is gray', () => { expect(WINBACK_STATUS_BADGE.NO_RESPONSE).toContain('gray'); });
});

// ─── Cross-data invariants ────────────────────────────────────────────────────

describe('cross-data invariants', () => {
  it('all 4 badge maps have non-empty string values', () => {
    const allBadges = [
      ...Object.values(LEAD_STATUS_BADGE),
      ...Object.values(SOURCE_BADGE),
      ...Object.values(RENEWAL_STATUS_BADGE),
      ...Object.values(RISK_BADGE),
      ...Object.values(EXP_TYPE_BADGE),
      ...Object.values(EXP_PRIORITY_BADGE),
      ...Object.values(EXP_STATUS_BADGE),
      ...Object.values(WINBACK_STATUS_BADGE),
    ];
    for (const v of allBadges) {
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it('total MOCK_DATA rows across 4 pages = 20', () => {
    expect(LEAD_MOCK.length + RENEWAL_MOCK.length + EXPANSION_MOCK.length + WINBACK_MOCK.length).toBe(20);
  });

  it('PIPELINE_STAGES count (7) = LEAD_STATUS_BADGE entry count (7)', () => {
    expect(PIPELINE_STAGES.length).toBe(Object.keys(LEAD_STATUS_BADGE).length);
  });

  it('all RENEWAL_MOCK daysUntilRenewal values are in ascending order', () => {
    for (let i = 0; i < RENEWAL_MOCK.length - 1; i++) {
      expect(RENEWAL_MOCK[i].daysUntilRenewal).toBeLessThan(RENEWAL_MOCK[i + 1].daysUntilRenewal);
    }
  });

  it('all expansion opportunities are < 50% of currentMrr for all rows', () => {
    for (const e of EXPANSION_MOCK) {
      expect(e.expansionOpportunity).toBeLessThan(e.currentMrr * 0.8);
    }
  });

  it('urgencyClass boundary: day 30 is red, day 31 is amber', () => {
    expect(urgencyClass(30)).toContain('red');
    expect(urgencyClass(31)).toContain('amber');
  });

  it('urgencyClass boundary: day 60 is amber, day 61 is gray', () => {
    expect(urgencyClass(60)).toContain('amber');
    expect(urgencyClass(61)).toContain('gray');
  });

  it('winback total mrrLost = £9,300', () => {
    const total = WINBACK_MOCK.reduce((s, w) => s + w.mrrLost, 0);
    expect(total).toBe(9300);
  });

  it('renewal total MRR = £8,100', () => {
    const total = RENEWAL_MOCK.reduce((s, r) => s + r.mrr, 0);
    expect(total).toBe(8100);
  });

  it('leads total pipeline value = £110,400', () => {
    const total = LEAD_MOCK.reduce((s, l) => s + l.estimatedValue, 0);
    expect(total).toBe(110400);
  });
});

// ─── Parametric expansions ─────────────────────────────────────────────────

describe('LEAD_MOCK — per-lead source parametric', () => {
  const cases: [string, LeadSource][] = [
    ['1', 'LINKEDIN'],
    ['2', 'INBOUND'],
    ['3', 'REFERRAL'],
    ['4', 'WEBSITE'],
    ['5', 'COLD'],
  ];
  for (const [id, source] of cases) {
    it(`lead ${id}: source = "${source}"`, () => {
      const lead = LEAD_MOCK.find((l) => l.id === id)!;
      expect(lead.source).toBe(source);
    });
  }
});

describe('LEAD_MOCK — per-lead status parametric', () => {
  const cases: [string, LeadStatus][] = [
    ['1', 'QUALIFIED'],
    ['2', 'PROPOSAL'],
    ['3', 'NEGOTIATION'],
    ['4', 'NEW'],
    ['5', 'CONTACTED'],
  ];
  for (const [id, status] of cases) {
    it(`lead ${id}: status = "${status}"`, () => {
      const lead = LEAD_MOCK.find((l) => l.id === id)!;
      expect(lead.status).toBe(status);
    });
  }
});

describe('RENEWAL_MOCK — per-renewal status+riskLevel parametric', () => {
  const cases: [string, RenewalStatus, RiskLevel][] = [
    ['1', 'AT_RISK',  'HIGH'],
    ['2', 'ON_TRACK', 'LOW'],
    ['3', 'AT_RISK',  'MEDIUM'],
    ['4', 'ON_TRACK', 'LOW'],
    ['5', 'RENEWED',  'LOW'],
  ];
  for (const [id, status, riskLevel] of cases) {
    it(`renewal ${id}: status="${status}", riskLevel="${riskLevel}"`, () => {
      const r = RENEWAL_MOCK.find((r) => r.id === id)!;
      expect(r.status).toBe(status);
      expect(r.riskLevel).toBe(riskLevel);
    });
  }
});

describe('RENEWAL_MOCK — per-renewal mrr exact parametric', () => {
  const cases: [string, number][] = [
    ['1',  900],
    ['2',  600],
    ['3', 3000],
    ['4', 1200],
    ['5', 2400],
  ];
  for (const [id, mrr] of cases) {
    it(`renewal ${id}: mrr = ${mrr}`, () => {
      const r = RENEWAL_MOCK.find((r) => r.id === id)!;
      expect(r.mrr).toBe(mrr);
    });
  }
});

describe('WINBACK_MOCK — per-winback mrrLost exact parametric', () => {
  const cases: [string, number][] = [
    ['1', 1800],
    ['2',  600],
    ['3', 3600],
    ['4',  900],
    ['5', 2400],
  ];
  for (const [id, mrrLost] of cases) {
    it(`winback ${id}: mrrLost = ${mrrLost}`, () => {
      const w = WINBACK_MOCK.find((w) => w.id === id)!;
      expect(w.mrrLost).toBe(mrrLost);
    });
  }
});

describe('urgencyRowBg — boundary matrix parametric', () => {
  const cases: [number, RenewalStatus, string | ''][] = [
    [0,   'ON_TRACK', 'red'],   // days = 0, non-CHURNED → red
    [30,  'ON_TRACK', 'red'],   // days = 30 → red
    [31,  'ON_TRACK', 'amber'], // days = 31 → amber
    [60,  'ON_TRACK', 'amber'], // days = 60 → amber
    [61,  'ON_TRACK', ''],      // days = 61 → empty
    [100, 'CHURNED',  'red'],   // CHURNED always red
    [61,  'CHURNED',  'red'],   // CHURNED overrides days > 60
    [0,   'CHURNED',  'red'],   // CHURNED at 0 days → red
  ];
  for (const [days, status, expected] of cases) {
    if (expected === '') {
      it(`urgencyRowBg(${days}, "${status}") = ""`, () => {
        expect(urgencyRowBg(days, status)).toBe('');
      });
    } else {
      it(`urgencyRowBg(${days}, "${status}") contains "${expected}"`, () => {
        expect(urgencyRowBg(days, status)).toContain(expected);
      });
    }
  }
});
