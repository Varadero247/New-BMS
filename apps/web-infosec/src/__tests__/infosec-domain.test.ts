// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inlined constants from web-infosec source files ──────────────────────────

// From risks/page.tsx
const riskLevelColors: Record<string, string> = {
  VERY_LOW: 'bg-green-100 text-green-700',
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const heatMapColors: Record<string, string> = {
  VERY_LOW: 'bg-green-200',
  LOW: 'bg-blue-200',
  MEDIUM: 'bg-yellow-200',
  HIGH: 'bg-orange-300',
  CRITICAL: 'bg-red-400',
};

const RISK_TREATMENTS = ['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID'];
const RISK_STATUSES = ['OPEN', 'IN_TREATMENT', 'MONITORING', 'CLOSED'];
const RISK_LEVELS = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// From assets/page.tsx
const classificationColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const ASSET_TYPES = ['HARDWARE', 'SOFTWARE', 'DATA', 'NETWORK', 'PERSONNEL', 'FACILITY', 'SERVICE'];
const ASSET_CLASSIFICATIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

// From controls/soa/client.tsx — Statement of Applicability
const SOA_IMPL_STATUSES = ['fully', 'partial', 'planned', 'n/a'] as const;
type SoAStatus = (typeof SOA_IMPL_STATUSES)[number];

const statusStyles: Record<SoAStatus, { label: string; color: string }> = {
  fully: { label: 'Fully Implemented', color: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partially Implemented', color: 'bg-amber-100 text-amber-700' },
  planned: { label: 'Planned', color: 'bg-blue-100 text-blue-700' },
  'n/a': { label: 'Not Applicable', color: 'bg-gray-100 text-gray-500' },
};

// From controls-dashboard/client.tsx — ISO 27001 control domains
const ISO27001_DOMAINS = [
  { id: 'A5', name: 'A.5 Organisational Controls', controlCount: 8 },
  { id: 'A6', name: 'A.6 People Controls', controlCount: 8 },
  { id: 'A7', name: 'A.7 Physical Controls', controlCount: 8 },
  { id: 'A8', name: 'A.8 Technological Controls', controlCount: 16 },
];

type ControlStatus = 'Implemented' | 'Partially Implemented' | 'Planned' | 'Not Applicable';

const CONTROL_STATUSES: ControlStatus[] = [
  'Implemented',
  'Partially Implemented',
  'Planned',
  'Not Applicable',
];

const controlStatusConfig: Record<ControlStatus, { bg: string; text: string }> = {
  Implemented: { bg: 'bg-green-100', text: 'text-green-700' },
  'Partially Implemented': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Planned: { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Not Applicable': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

// From scans/client.tsx — Vulnerability scans
type ScanStatus = 'completed' | 'running' | 'scheduled' | 'failed';
const SCAN_STATUSES: ScanStatus[] = ['completed', 'running', 'scheduled', 'failed'];

const scanStatusConfig: Record<ScanStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
  running: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Running' },
  scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Scheduled' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
};

type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
const VULN_SEVERITY_LEVELS: VulnSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

const vulnSeverityConfig: Record<VulnSeverity, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
  info: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const SCANNERS = ['Nessus', 'Qualys', 'OpenVAS'];

// SOA controls subset (inlined from controls/soa/client.tsx)
interface SoAControl {
  id: string;
  clause: string;
  title: string;
  applicable: boolean;
  implementationStatus: SoAStatus;
  owner: string;
}

const MOCK_SOA_CONTROLS: SoAControl[] = [
  { id: '1', clause: 'A.5.1', title: 'Policies for information security', applicable: true, implementationStatus: 'fully', owner: 'CISO' },
  { id: '2', clause: 'A.5.2', title: 'Information security roles and responsibilities', applicable: true, implementationStatus: 'fully', owner: 'CISO' },
  { id: '3', clause: 'A.5.3', title: 'Segregation of duties', applicable: true, implementationStatus: 'partial', owner: 'IT Manager' },
  { id: '4', clause: 'A.5.4', title: 'Management responsibilities', applicable: true, implementationStatus: 'fully', owner: 'CISO' },
  { id: '5', clause: 'A.5.5', title: 'Contact with authorities', applicable: true, implementationStatus: 'fully', owner: 'DPO' },
  { id: '6', clause: 'A.5.6', title: 'Contact with special interest groups', applicable: true, implementationStatus: 'partial', owner: 'CISO' },
  { id: '7', clause: 'A.5.7', title: 'Threat intelligence', applicable: true, implementationStatus: 'fully', owner: 'SOC Lead' },
  { id: '8', clause: 'A.5.8', title: 'Information security in project management', applicable: true, implementationStatus: 'partial', owner: 'PMO Lead' },
  { id: '24', clause: 'A.8.11', title: 'Data masking', applicable: false, implementationStatus: 'n/a', owner: 'N/A' },
];

// Vulnerability scan mock data (inlined from scans/client.tsx)
interface MockVulnScan {
  id: string;
  name: string;
  target: string;
  status: ScanStatus;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  scanner: string;
}

const MOCK_SCANS: MockVulnScan[] = [
  { id: '1', name: 'Production Web Server', target: '192.168.1.100', status: 'completed', criticalCount: 2, highCount: 5, mediumCount: 12, lowCount: 8, infoCount: 15, scanner: 'Nessus' },
  { id: '2', name: 'Database Server - Primary', target: 'db-primary.internal', status: 'completed', criticalCount: 0, highCount: 2, mediumCount: 7, lowCount: 14, infoCount: 22, scanner: 'Qualys' },
  { id: '3', name: 'Application Scan - Mobile API', target: 'api.mobile.internal', status: 'completed', criticalCount: 1, highCount: 3, mediumCount: 9, lowCount: 5, infoCount: 18, scanner: 'OpenVAS' },
  { id: '4', name: 'Network Infrastructure', target: '10.0.0.0/24', status: 'running', criticalCount: 0, highCount: 1, mediumCount: 4, lowCount: 3, infoCount: 8, scanner: 'Nessus' },
  { id: '5', name: 'Third-party Payment Gateway', target: 'payment.vendor.com', status: 'completed', criticalCount: 0, highCount: 0, mediumCount: 2, lowCount: 4, infoCount: 11, scanner: 'Qualys' },
  { id: '6', name: 'Scheduled Compliance Scan', target: 'compliance-net.internal', status: 'scheduled', criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0, scanner: 'OpenVAS' },
];

// Risk asset mock data
interface MockAsset {
  id: string;
  referenceNumber: string;
  name: string;
  type: string;
  classification: string;
  owner: string;
  encryptionRequired: boolean;
  status: string;
}

const MOCK_ASSETS: MockAsset[] = [
  { id: 'asset-001', referenceNumber: 'ISE-AST-2026-001', name: 'Core Production Database', type: 'DATA', classification: 'CRITICAL', owner: 'DPO', encryptionRequired: true, status: 'ACTIVE' },
  { id: 'asset-002', referenceNumber: 'ISE-AST-2026-002', name: 'Employee Laptops Fleet', type: 'HARDWARE', classification: 'HIGH', owner: 'IT Manager', encryptionRequired: true, status: 'ACTIVE' },
  { id: 'asset-003', referenceNumber: 'ISE-AST-2026-003', name: 'Office Wi-Fi Network', type: 'NETWORK', classification: 'MEDIUM', owner: 'Infra Lead', encryptionRequired: false, status: 'ACTIVE' },
];

// ─── Helpers (inlined from source) ─────────────────────────────────────────────

function calculateRiskLevel(score: number): string {
  if (score <= 4) return 'VERY_LOW';
  if (score <= 8) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'CRITICAL';
}

function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

function effectivenessColor(effectiveness: number): string {
  if (effectiveness >= 80) return 'bg-green-500';
  if (effectiveness >= 60) return 'bg-yellow-500';
  if (effectiveness > 0) return 'bg-red-500';
  return 'bg-gray-300';
}

function domainAvgEffectiveness(effectivenessValues: number[]): number {
  const active = effectivenessValues.filter((e) => e > 0);
  if (active.length === 0) return 0;
  return Math.round(active.reduce((s, e) => s + e, 0) / active.length);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suites
// ─────────────────────────────────────────────────────────────────────────────

describe('RISK_LEVELS array', () => {
  it('has 5 levels', () => {
    expect(RISK_LEVELS).toHaveLength(5);
  });

  it('first level is VERY_LOW', () => {
    expect(RISK_LEVELS[0]).toBe('VERY_LOW');
  });

  it('last level is CRITICAL', () => {
    expect(RISK_LEVELS[RISK_LEVELS.length - 1]).toBe('CRITICAL');
  });

  it('contains LOW, MEDIUM, HIGH', () => {
    expect(RISK_LEVELS).toContain('LOW');
    expect(RISK_LEVELS).toContain('MEDIUM');
    expect(RISK_LEVELS).toContain('HIGH');
  });

  for (const level of RISK_LEVELS) {
    it(`${level} has a color defined`, () => {
      expect(typeof riskLevelColors[level]).toBe('string');
    });

    it(`${level} color contains bg-`, () => {
      expect(riskLevelColors[level]).toContain('bg-');
    });

    it(`${level} has a heatmap color defined`, () => {
      expect(typeof heatMapColors[level]).toBe('string');
    });
  }
});

describe('riskLevelColors map', () => {
  it('VERY_LOW is green', () => {
    expect(riskLevelColors.VERY_LOW).toContain('green');
  });

  it('CRITICAL is red', () => {
    expect(riskLevelColors.CRITICAL).toContain('red');
  });

  it('HIGH is orange', () => {
    expect(riskLevelColors.HIGH).toContain('orange');
  });

  it('MEDIUM is yellow', () => {
    expect(riskLevelColors.MEDIUM).toContain('yellow');
  });

  it('LOW is blue', () => {
    expect(riskLevelColors.LOW).toContain('blue');
  });
});

describe('heatMapColors map', () => {
  it('VERY_LOW is green', () => {
    expect(heatMapColors.VERY_LOW).toContain('green');
  });

  it('CRITICAL is red', () => {
    expect(heatMapColors.CRITICAL).toContain('red');
  });

  it('all levels have heatmap colors with bg-', () => {
    for (const level of RISK_LEVELS) {
      expect(heatMapColors[level]).toContain('bg-');
    }
  });
});

describe('RISK_TREATMENTS / RISK_STATUSES arrays', () => {
  it('RISK_TREATMENTS has 4 entries', () => {
    expect(RISK_TREATMENTS).toHaveLength(4);
  });

  it('RISK_TREATMENTS contains ACCEPT, MITIGATE, TRANSFER, AVOID', () => {
    expect(RISK_TREATMENTS).toContain('ACCEPT');
    expect(RISK_TREATMENTS).toContain('MITIGATE');
    expect(RISK_TREATMENTS).toContain('TRANSFER');
    expect(RISK_TREATMENTS).toContain('AVOID');
  });

  it('RISK_STATUSES has 4 entries', () => {
    expect(RISK_STATUSES).toHaveLength(4);
  });

  it('RISK_STATUSES contains OPEN', () => {
    expect(RISK_STATUSES).toContain('OPEN');
  });

  it('RISK_STATUSES contains CLOSED', () => {
    expect(RISK_STATUSES).toContain('CLOSED');
  });

  it('RISK_STATUSES contains MONITORING', () => {
    expect(RISK_STATUSES).toContain('MONITORING');
  });
});

describe('calculateRiskLevel helper', () => {
  it('score 1 returns VERY_LOW', () => {
    expect(calculateRiskLevel(1)).toBe('VERY_LOW');
  });

  it('score 4 returns VERY_LOW', () => {
    expect(calculateRiskLevel(4)).toBe('VERY_LOW');
  });

  it('score 5 returns LOW', () => {
    expect(calculateRiskLevel(5)).toBe('LOW');
  });

  it('score 8 returns LOW', () => {
    expect(calculateRiskLevel(8)).toBe('LOW');
  });

  it('score 9 returns MEDIUM', () => {
    expect(calculateRiskLevel(9)).toBe('MEDIUM');
  });

  it('score 12 returns MEDIUM', () => {
    expect(calculateRiskLevel(12)).toBe('MEDIUM');
  });

  it('score 13 returns HIGH', () => {
    expect(calculateRiskLevel(13)).toBe('HIGH');
  });

  it('score 16 returns HIGH', () => {
    expect(calculateRiskLevel(16)).toBe('HIGH');
  });

  it('score 17 returns CRITICAL', () => {
    expect(calculateRiskLevel(17)).toBe('CRITICAL');
  });

  it('score 25 returns CRITICAL', () => {
    expect(calculateRiskLevel(25)).toBe('CRITICAL');
  });

  it('all results are in RISK_LEVELS', () => {
    for (let score = 1; score <= 25; score++) {
      expect(RISK_LEVELS).toContain(calculateRiskLevel(score));
    }
  });

  it('calculateRiskLevel(likelihood * impact) for 5x5 = CRITICAL', () => {
    const score = calculateRiskScore(5, 5);
    expect(calculateRiskLevel(score)).toBe('CRITICAL');
  });

  it('calculateRiskLevel(1 * 1) = VERY_LOW', () => {
    const score = calculateRiskScore(1, 1);
    expect(calculateRiskLevel(score)).toBe('VERY_LOW');
  });
});

describe('calculateRiskScore helper', () => {
  it('3 × 4 = 12', () => {
    expect(calculateRiskScore(3, 4)).toBe(12);
  });

  it('1 × 1 = 1', () => {
    expect(calculateRiskScore(1, 1)).toBe(1);
  });

  it('5 × 5 = 25', () => {
    expect(calculateRiskScore(5, 5)).toBe(25);
  });

  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      it(`score(${l}, ${i}) = ${l * i}`, () => {
        expect(calculateRiskScore(l, i)).toBe(l * i);
      });
    }
  }
});

describe('ASSET_TYPES / ASSET_CLASSIFICATIONS arrays', () => {
  it('ASSET_TYPES has 7 entries', () => {
    expect(ASSET_TYPES).toHaveLength(7);
  });

  it('ASSET_TYPES contains HARDWARE', () => {
    expect(ASSET_TYPES).toContain('HARDWARE');
  });

  it('ASSET_TYPES contains DATA', () => {
    expect(ASSET_TYPES).toContain('DATA');
  });

  it('ASSET_TYPES contains PERSONNEL', () => {
    expect(ASSET_TYPES).toContain('PERSONNEL');
  });

  it('ASSET_TYPES contains SERVICE', () => {
    expect(ASSET_TYPES).toContain('SERVICE');
  });

  it('ASSET_CLASSIFICATIONS has 4 levels', () => {
    expect(ASSET_CLASSIFICATIONS).toHaveLength(4);
  });

  it('ASSET_CLASSIFICATIONS contains CRITICAL, HIGH, MEDIUM, LOW', () => {
    expect(ASSET_CLASSIFICATIONS).toContain('CRITICAL');
    expect(ASSET_CLASSIFICATIONS).toContain('HIGH');
    expect(ASSET_CLASSIFICATIONS).toContain('MEDIUM');
    expect(ASSET_CLASSIFICATIONS).toContain('LOW');
  });

  it('all asset classifications have color defined', () => {
    for (const c of ASSET_CLASSIFICATIONS) {
      expect(typeof classificationColors[c]).toBe('string');
    }
  });

  it('CRITICAL classification is red', () => {
    expect(classificationColors.CRITICAL).toContain('red');
  });

  it('LOW classification is green', () => {
    expect(classificationColors.LOW).toContain('green');
  });

  it('MEDIUM classification is yellow', () => {
    expect(classificationColors.MEDIUM).toContain('yellow');
  });
});

describe('SOA_IMPL_STATUSES and statusStyles', () => {
  it('has 4 statuses', () => {
    expect(SOA_IMPL_STATUSES).toHaveLength(4);
  });

  it('contains fully, partial, planned, n/a', () => {
    expect(SOA_IMPL_STATUSES).toContain('fully');
    expect(SOA_IMPL_STATUSES).toContain('partial');
    expect(SOA_IMPL_STATUSES).toContain('planned');
    expect(SOA_IMPL_STATUSES).toContain('n/a');
  });

  it('fully status is emerald', () => {
    expect(statusStyles.fully.color).toContain('emerald');
  });

  it('partial status is amber', () => {
    expect(statusStyles.partial.color).toContain('amber');
  });

  it('planned status is blue', () => {
    expect(statusStyles.planned.color).toContain('blue');
  });

  it('n/a status is gray', () => {
    expect(statusStyles['n/a'].color).toContain('gray');
  });

  it('every status has label', () => {
    for (const s of SOA_IMPL_STATUSES) {
      expect(typeof statusStyles[s].label).toBe('string');
      expect(statusStyles[s].label.length).toBeGreaterThan(0);
    }
  });

  it('every status color contains bg-', () => {
    for (const s of SOA_IMPL_STATUSES) {
      expect(statusStyles[s].color).toContain('bg-');
    }
  });
});

describe('ISO27001_DOMAINS array', () => {
  it('has 4 domains', () => {
    expect(ISO27001_DOMAINS).toHaveLength(4);
  });

  it('first domain is A5', () => {
    expect(ISO27001_DOMAINS[0].id).toBe('A5');
  });

  it('last domain is A8', () => {
    expect(ISO27001_DOMAINS[ISO27001_DOMAINS.length - 1].id).toBe('A8');
  });

  it('all domain ids start with A', () => {
    for (const d of ISO27001_DOMAINS) {
      expect(d.id).toMatch(/^A\d+$/);
    }
  });

  it('A8 has 16 controls (largest domain)', () => {
    const a8 = ISO27001_DOMAINS.find((d) => d.id === 'A8');
    expect(a8?.controlCount).toBe(16);
  });

  it('total controls across all domains is 40', () => {
    const total = ISO27001_DOMAINS.reduce((s, d) => s + d.controlCount, 0);
    expect(total).toBe(40);
  });
});

describe('controlStatusConfig map', () => {
  it('has entry for all 4 control statuses', () => {
    for (const s of CONTROL_STATUSES) {
      expect(typeof controlStatusConfig[s]).toBe('object');
    }
  });

  it('Implemented has green bg', () => {
    expect(controlStatusConfig['Implemented'].bg).toContain('green');
  });

  it('Partially Implemented has yellow bg', () => {
    expect(controlStatusConfig['Partially Implemented'].bg).toContain('yellow');
  });

  it('Planned has blue bg', () => {
    expect(controlStatusConfig['Planned'].bg).toContain('blue');
  });

  it('Not Applicable has gray bg', () => {
    expect(controlStatusConfig['Not Applicable'].bg).toContain('gray');
  });

  it('every status has bg and text fields', () => {
    for (const s of CONTROL_STATUSES) {
      expect(typeof controlStatusConfig[s].bg).toBe('string');
      expect(typeof controlStatusConfig[s].text).toBe('string');
    }
  });
});

describe('effectivenessColor helper', () => {
  it('80 returns green', () => {
    expect(effectivenessColor(80)).toContain('green');
  });

  it('95 returns green', () => {
    expect(effectivenessColor(95)).toContain('green');
  });

  it('60 returns yellow', () => {
    expect(effectivenessColor(60)).toContain('yellow');
  });

  it('75 returns yellow', () => {
    expect(effectivenessColor(75)).toContain('yellow');
  });

  it('30 returns red', () => {
    expect(effectivenessColor(30)).toContain('red');
  });

  it('0 returns gray', () => {
    expect(effectivenessColor(0)).toContain('gray');
  });

  it('returns a string for all values 0-100', () => {
    for (let v = 0; v <= 100; v += 10) {
      expect(typeof effectivenessColor(v)).toBe('string');
    }
  });
});

describe('domainAvgEffectiveness helper', () => {
  it('empty array returns 0', () => {
    expect(domainAvgEffectiveness([])).toBe(0);
  });

  it('all zeros returns 0', () => {
    expect(domainAvgEffectiveness([0, 0, 0])).toBe(0);
  });

  it('single value returns that value', () => {
    expect(domainAvgEffectiveness([80])).toBe(80);
  });

  it('[80, 90] returns 85', () => {
    expect(domainAvgEffectiveness([80, 90])).toBe(85);
  });

  it('ignores zero values when computing average', () => {
    // [100, 0, 0] → only 100 is counted → avg = 100
    expect(domainAvgEffectiveness([100, 0, 0])).toBe(100);
  });

  it('returns a number', () => {
    expect(typeof domainAvgEffectiveness([70, 80, 90])).toBe('number');
  });
});

describe('SCAN_STATUSES and scanStatusConfig', () => {
  it('has 4 scan statuses', () => {
    expect(SCAN_STATUSES).toHaveLength(4);
  });

  it('contains completed, running, scheduled, failed', () => {
    expect(SCAN_STATUSES).toContain('completed');
    expect(SCAN_STATUSES).toContain('running');
    expect(SCAN_STATUSES).toContain('scheduled');
    expect(SCAN_STATUSES).toContain('failed');
  });

  it('every scan status has config', () => {
    for (const s of SCAN_STATUSES) {
      expect(typeof scanStatusConfig[s]).toBe('object');
    }
  });

  it('completed status is green', () => {
    expect(scanStatusConfig.completed.text).toContain('green');
  });

  it('running status is blue', () => {
    expect(scanStatusConfig.running.text).toContain('blue');
  });

  it('scheduled status is purple', () => {
    expect(scanStatusConfig.scheduled.text).toContain('purple');
  });

  it('failed status is red', () => {
    expect(scanStatusConfig.failed.text).toContain('red');
  });

  it('every status has a label', () => {
    for (const s of SCAN_STATUSES) {
      expect(typeof scanStatusConfig[s].label).toBe('string');
      expect(scanStatusConfig[s].label.length).toBeGreaterThan(0);
    }
  });
});

describe('VULN_SEVERITY_LEVELS and vulnSeverityConfig', () => {
  it('has 5 severity levels', () => {
    expect(VULN_SEVERITY_LEVELS).toHaveLength(5);
  });

  it('critical has red bg', () => {
    expect(vulnSeverityConfig.critical.bg).toContain('red');
  });

  it('high has orange bg', () => {
    expect(vulnSeverityConfig.high.bg).toContain('orange');
  });

  it('medium has yellow bg', () => {
    expect(vulnSeverityConfig.medium.bg).toContain('yellow');
  });

  it('low has blue bg', () => {
    expect(vulnSeverityConfig.low.bg).toContain('blue');
  });

  it('info has gray bg', () => {
    expect(vulnSeverityConfig.info.bg).toContain('gray');
  });

  it('all severity configs have bg and text', () => {
    for (const s of VULN_SEVERITY_LEVELS) {
      expect(typeof vulnSeverityConfig[s].bg).toBe('string');
      expect(typeof vulnSeverityConfig[s].text).toBe('string');
    }
  });

  it('SCANNERS has 3 entries', () => {
    expect(SCANNERS).toHaveLength(3);
  });

  it('SCANNERS contains Nessus, Qualys, OpenVAS', () => {
    expect(SCANNERS).toContain('Nessus');
    expect(SCANNERS).toContain('Qualys');
    expect(SCANNERS).toContain('OpenVAS');
  });
});

describe('MOCK_SOA_CONTROLS data shapes', () => {
  it('has 9 controls', () => {
    expect(MOCK_SOA_CONTROLS).toHaveLength(9);
  });

  it('every control has id, clause, title, owner', () => {
    for (const c of MOCK_SOA_CONTROLS) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.clause).toBe('string');
      expect(typeof c.title).toBe('string');
      expect(typeof c.owner).toBe('string');
    }
  });

  it('clauses match ISO 27001 Annex A pattern', () => {
    for (const c of MOCK_SOA_CONTROLS) {
      expect(c.clause).toMatch(/^A\.\d+\.\d+$/);
    }
  });

  it('applicable is a boolean', () => {
    for (const c of MOCK_SOA_CONTROLS) {
      expect(typeof c.applicable).toBe('boolean');
    }
  });

  it('implementationStatus is in SOA_IMPL_STATUSES', () => {
    for (const c of MOCK_SOA_CONTROLS) {
      expect(SOA_IMPL_STATUSES).toContain(c.implementationStatus);
    }
  });

  it('not-applicable control has n/a status', () => {
    const naControl = MOCK_SOA_CONTROLS.find((c) => !c.applicable);
    expect(naControl?.implementationStatus).toBe('n/a');
  });

  it('clause A.5.1 title matches', () => {
    const c = MOCK_SOA_CONTROLS.find((ctrl) => ctrl.clause === 'A.5.1');
    expect(c?.title).toBe('Policies for information security');
  });

  it('count of applicable controls is 8', () => {
    const applicable = MOCK_SOA_CONTROLS.filter((c) => c.applicable).length;
    expect(applicable).toBe(8);
  });
});

describe('MOCK_SCANS data shapes', () => {
  it('has 6 scans', () => {
    expect(MOCK_SCANS).toHaveLength(6);
  });

  it('every scan has id, name, target, status, scanner', () => {
    for (const s of MOCK_SCANS) {
      expect(typeof s.id).toBe('string');
      expect(typeof s.name).toBe('string');
      expect(typeof s.target).toBe('string');
      expect(SCAN_STATUSES).toContain(s.status);
      expect(SCANNERS).toContain(s.scanner);
    }
  });

  it('count fields are non-negative integers', () => {
    for (const s of MOCK_SCANS) {
      expect(s.criticalCount).toBeGreaterThanOrEqual(0);
      expect(s.highCount).toBeGreaterThanOrEqual(0);
      expect(s.mediumCount).toBeGreaterThanOrEqual(0);
      expect(s.lowCount).toBeGreaterThanOrEqual(0);
      expect(s.infoCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('first scan has 2 critical vulnerabilities', () => {
    expect(MOCK_SCANS[0].criticalCount).toBe(2);
  });

  it('scheduled scan has all counts at 0', () => {
    const scheduled = MOCK_SCANS.find((s) => s.status === 'scheduled');
    expect(scheduled?.criticalCount).toBe(0);
    expect(scheduled?.highCount).toBe(0);
    expect(scheduled?.mediumCount).toBe(0);
  });

  it('total critical findings across completed scans >= 3', () => {
    const totalCritical = MOCK_SCANS
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.criticalCount, 0);
    expect(totalCritical).toBeGreaterThanOrEqual(3);
  });
});

describe('MOCK_ASSETS data shapes', () => {
  it('has 3 assets', () => {
    expect(MOCK_ASSETS).toHaveLength(3);
  });

  it('every asset has id, name, type, classification', () => {
    for (const a of MOCK_ASSETS) {
      expect(typeof a.id).toBe('string');
      expect(typeof a.name).toBe('string');
      expect(ASSET_TYPES).toContain(a.type);
      expect(ASSET_CLASSIFICATIONS).toContain(a.classification);
    }
  });

  it('encryptionRequired is a boolean', () => {
    for (const a of MOCK_ASSETS) {
      expect(typeof a.encryptionRequired).toBe('boolean');
    }
  });

  it('CRITICAL asset has encryptionRequired = true', () => {
    const critical = MOCK_ASSETS.find((a) => a.classification === 'CRITICAL');
    expect(critical?.encryptionRequired).toBe(true);
  });

  it('first asset is DATA type', () => {
    expect(MOCK_ASSETS[0].type).toBe('DATA');
  });

  it('all assets are ACTIVE', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.status).toBe('ACTIVE');
    }
  });
});

describe('MOCK_SCANS — per-scan scanner parametric', () => {
  const cases: [string, string][] = [
    ['1', 'Nessus'],
    ['2', 'Qualys'],
    ['3', 'OpenVAS'],
    ['4', 'Nessus'],
    ['5', 'Qualys'],
    ['6', 'OpenVAS'],
  ];
  for (const [id, scanner] of cases) {
    it(`scan id="${id}": scanner = "${scanner}"`, () => {
      const scan = MOCK_SCANS.find((s) => s.id === id)!;
      expect(scan.scanner).toBe(scanner);
    });
  }
});

describe('MOCK_SCANS — per-scan status parametric', () => {
  const cases: [string, ScanStatus][] = [
    ['1', 'completed'],
    ['2', 'completed'],
    ['3', 'completed'],
    ['4', 'running'],
    ['5', 'completed'],
    ['6', 'scheduled'],
  ];
  for (const [id, status] of cases) {
    it(`scan id="${id}": status = "${status}"`, () => {
      const scan = MOCK_SCANS.find((s) => s.id === id)!;
      expect(scan.status).toBe(status);
    });
  }
});

describe('ISO27001_DOMAINS — per-domain controlCount parametric', () => {
  const cases: [string, number][] = [
    ['A5', 8],
    ['A6', 8],
    ['A7', 8],
    ['A8', 16],
  ];
  for (const [id, count] of cases) {
    it(`${id}: controlCount = ${count}`, () => {
      const domain = ISO27001_DOMAINS.find((d) => d.id === id)!;
      expect(domain.controlCount).toBe(count);
    });
  }
});

describe('effectivenessColor — boundary matrix parametric', () => {
  const cases: [number, string][] = [
    [100, 'green'],
    [95,  'green'],
    [80,  'green'],  // boundary: >= 80
    [79,  'yellow'], // just below green threshold
    [60,  'yellow'], // boundary: >= 60
    [59,  'red'],    // just below yellow threshold
    [1,   'red'],    // > 0
    [0,   'gray'],   // exactly 0
  ];
  for (const [value, color] of cases) {
    it(`effectivenessColor(${value}) contains "${color}"`, () => {
      expect(effectivenessColor(value)).toContain(color);
    });
  }
});

describe('domainAvgEffectiveness — parametric', () => {
  const cases: [number[], number][] = [
    [[],             0],
    [[0, 0, 0],      0],
    [[80],           80],
    [[80, 90],       85],
    [[100, 0, 0],    100], // zeros excluded
  ];
  for (const [values, expected] of cases) {
    it(`domainAvgEffectiveness([${values.join(', ')}]) = ${expected}`, () => {
      expect(domainAvgEffectiveness(values)).toBe(expected);
    });
  }
});

describe('scanStatusConfig — per-status label exact parametric', () => {
  const cases: [ScanStatus, string][] = [
    ['completed', 'Completed'],
    ['running',   'Running'],
    ['scheduled', 'Scheduled'],
    ['failed',    'Failed'],
  ];
  for (const [status, label] of cases) {
    it(`${status}: label = "${label}"`, () => {
      expect(scanStatusConfig[status].label).toBe(label);
    });
  }
});

// ─── Phase 209 parametric additions ──────────────────────────────────────────

describe('RISK_TREATMENTS — positional index parametric', () => {
  const expected = [
    [0, 'ACCEPT'],
    [1, 'MITIGATE'],
    [2, 'TRANSFER'],
    [3, 'AVOID'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RISK_TREATMENTS[${idx}] === '${val}'`, () => {
      expect(RISK_TREATMENTS[idx]).toBe(val);
    });
  }
});

describe('RISK_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'OPEN'],
    [1, 'IN_TREATMENT'],
    [2, 'MONITORING'],
    [3, 'CLOSED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RISK_STATUSES[${idx}] === '${val}'`, () => {
      expect(RISK_STATUSES[idx]).toBe(val);
    });
  }
});

describe('RISK_LEVELS — mid-value positional parametric', () => {
  const expected = [
    [1, 'LOW'],
    [2, 'MEDIUM'],
    [3, 'HIGH'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RISK_LEVELS[${idx}] === '${val}'`, () => {
      expect(RISK_LEVELS[idx]).toBe(val);
    });
  }
});

describe('ASSET_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'HARDWARE'],
    [1, 'SOFTWARE'],
    [2, 'DATA'],
    [3, 'NETWORK'],
    [4, 'PERSONNEL'],
    [5, 'FACILITY'],
    [6, 'SERVICE'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`ASSET_TYPES[${idx}] === '${val}'`, () => {
      expect(ASSET_TYPES[idx]).toBe(val);
    });
  }
});

describe('ASSET_CLASSIFICATIONS — positional index parametric', () => {
  const expected = [
    [0, 'CRITICAL'],
    [1, 'HIGH'],
    [2, 'MEDIUM'],
    [3, 'LOW'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`ASSET_CLASSIFICATIONS[${idx}] === '${val}'`, () => {
      expect(ASSET_CLASSIFICATIONS[idx]).toBe(val);
    });
  }
});

describe('SOA_IMPL_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'fully'],
    [1, 'partial'],
    [2, 'planned'],
    [3, 'n/a'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SOA_IMPL_STATUSES[${idx}] === '${val}'`, () => {
      expect(SOA_IMPL_STATUSES[idx]).toBe(val);
    });
  }
});

describe('SCAN_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'completed'],
    [1, 'running'],
    [2, 'scheduled'],
    [3, 'failed'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SCAN_STATUSES[${idx}] === '${val}'`, () => {
      expect(SCAN_STATUSES[idx]).toBe(val);
    });
  }
});

describe('VULN_SEVERITY_LEVELS — positional index parametric', () => {
  const expected = [
    [0, 'critical'],
    [1, 'high'],
    [2, 'medium'],
    [3, 'low'],
    [4, 'info'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`VULN_SEVERITY_LEVELS[${idx}] === '${val}'`, () => {
      expect(VULN_SEVERITY_LEVELS[idx]).toBe(val);
    });
  }
});

describe('ISO27001_DOMAINS — per-domain controlCount parametric', () => {
  const expected: [string, number][] = [
    ['A5', 8],
    ['A6', 8],
    ['A7', 8],
    ['A8', 16],
  ];
  for (const [id, count] of expected) {
    it(`domain ${id} controlCount = ${count}`, () => {
      const d = ISO27001_DOMAINS.find((x) => x.id === id);
      expect(d?.controlCount).toBe(count);
    });
  }
});

describe('MOCK_SCANS — per-scan status+criticalCount parametric', () => {
  const expected: [string, ScanStatus, number][] = [
    ['1', 'completed', 2],
    ['2', 'completed', 0],
    ['3', 'completed', 1],
    ['4', 'running',   0],
    ['5', 'completed', 0],
    ['6', 'scheduled', 0],
  ];
  for (const [id, status, criticalCount] of expected) {
    it(`scan ${id}: status=${status}, criticalCount=${criticalCount}`, () => {
      const s = MOCK_SCANS.find((x) => x.id === id);
      expect(s?.status).toBe(status);
      expect(s?.criticalCount).toBe(criticalCount);
    });
  }
});

describe('MOCK_ASSETS — per-asset type+classification parametric', () => {
  const expected: [string, string, string][] = [
    ['asset-001', 'DATA',     'CRITICAL'],
    ['asset-002', 'HARDWARE', 'HIGH'],
    ['asset-003', 'NETWORK',  'MEDIUM'],
  ];
  for (const [id, type, classification] of expected) {
    it(`${id}: type=${type}, classification=${classification}`, () => {
      const a = MOCK_ASSETS.find((x) => x.id === id);
      expect(a?.type).toBe(type);
      expect(a?.classification).toBe(classification);
    });
  }
});
