// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Compliance Checker Screen — APAC regulatory compliance gap analysis for mobile
 * Offline-capable: uses cached country compliance profiles
 */

export type ComplianceDimension =
  | 'data_protection'
  | 'anti_corruption'
  | 'aml'
  | 'modern_slavery'
  | 'whistleblower'
  | 'esg_reporting'
  | 'due_diligence';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ComplianceProfile {
  countryCode: string;
  countryName: string;
  hasDataProtectionLaw: boolean;
  dataProtectionAuthority: string | null;
  hasAntiCorruptionLaw: boolean;
  hasAmlRegulations: boolean;
  hasModernSlaveryAct: boolean;
  hasWhistleblowerProtection: boolean;
  esgReportingRequired: boolean;
  esgScope: 'MANDATORY_LISTED' | 'VOLUNTARY' | 'NONE';
  dueDiligenceLaw: 'MANDATORY' | 'RECOMMENDED' | 'NONE';
  penaltyRegime: 'STRICT' | 'MODERATE' | 'LIGHT';
  enforcementRecord: 'ACTIVE' | 'MODERATE' | 'INACTIVE';
}

export interface ComplianceGap {
  dimension: ComplianceDimension;
  label: string;
  required: boolean;
  countryRequires: boolean;
  gap: boolean;
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface ComplianceGapReport {
  countryCode: string;
  countryName: string;
  gaps: ComplianceGap[];
  totalGaps: number;
  criticalGaps: number;
  overallRisk: RiskLevel;
  score: number; // 0–100, higher = more compliant
}

// ─── Organisation compliance posture (what the org currently does) ──────────

export interface OrgCompliance {
  hasDataProtectionPolicy: boolean;
  hasAntiCorruptionPolicy: boolean;
  hasAmlProgram: boolean;
  hasModernSlaveryStatement: boolean;
  hasWhistleblowerChannel: boolean;
  publishesEsgReport: boolean;
  conductsDueDiligence: boolean;
}

// ─── Dimension metadata ────────────────────────────────────────────────────────

const DIMENSION_META: Record<
  ComplianceDimension,
  { label: string; riskLevel: RiskLevel; recommendation: string }
> = {
  data_protection: {
    label: 'Data Protection',
    riskLevel: 'HIGH',
    recommendation: 'Implement data protection policy aligned to local authority requirements',
  },
  anti_corruption: {
    label: 'Anti-Corruption',
    riskLevel: 'CRITICAL',
    recommendation: 'Establish written anti-bribery / anti-corruption policy with training',
  },
  aml: {
    label: 'AML / Financial Crime',
    riskLevel: 'CRITICAL',
    recommendation: 'Implement AML programme including customer due diligence and suspicious activity reporting',
  },
  modern_slavery: {
    label: 'Modern Slavery',
    riskLevel: 'HIGH',
    recommendation: 'Publish annual Modern Slavery statement; conduct supply chain audits',
  },
  whistleblower: {
    label: 'Whistleblower Protection',
    riskLevel: 'MEDIUM',
    recommendation: 'Establish anonymous reporting channel and non-retaliation policy',
  },
  esg_reporting: {
    label: 'ESG Reporting',
    riskLevel: 'MEDIUM',
    recommendation: 'Prepare ESG disclosure aligned to GRI / IFRS S1 S2 frameworks',
  },
  due_diligence: {
    label: 'Due Diligence',
    riskLevel: 'HIGH',
    recommendation: 'Document supply chain and third-party due diligence procedures',
  },
};

// ─── Gap analysis ─────────────────────────────────────────────────────────────

export function assessComplianceGaps(
  org: OrgCompliance,
  country: ComplianceProfile
): ComplianceGap[] {
  const checks: Array<{
    dimension: ComplianceDimension;
    countryRequires: boolean;
    orgHas: boolean;
  }> = [
    { dimension: 'data_protection', countryRequires: country.hasDataProtectionLaw, orgHas: org.hasDataProtectionPolicy },
    { dimension: 'anti_corruption', countryRequires: country.hasAntiCorruptionLaw, orgHas: org.hasAntiCorruptionPolicy },
    { dimension: 'aml', countryRequires: country.hasAmlRegulations, orgHas: org.hasAmlProgram },
    { dimension: 'modern_slavery', countryRequires: country.hasModernSlaveryAct, orgHas: org.hasModernSlaveryStatement },
    { dimension: 'whistleblower', countryRequires: country.hasWhistleblowerProtection, orgHas: org.hasWhistleblowerChannel },
    { dimension: 'esg_reporting', countryRequires: country.esgScope === 'MANDATORY_LISTED', orgHas: org.publishesEsgReport },
    { dimension: 'due_diligence', countryRequires: country.dueDiligenceLaw === 'MANDATORY', orgHas: org.conductsDueDiligence },
  ];

  return checks.map(({ dimension, countryRequires, orgHas }) => {
    const meta = DIMENSION_META[dimension];
    const gap = countryRequires && !orgHas;
    return {
      dimension,
      label: meta.label,
      required: countryRequires,
      countryRequires,
      gap,
      riskLevel: gap ? meta.riskLevel : 'LOW',
      recommendation: gap ? meta.recommendation : 'Currently met',
    };
  });
}

export function buildGapReport(
  org: OrgCompliance,
  country: ComplianceProfile
): ComplianceGapReport {
  const gaps = assessComplianceGaps(org, country);
  const actualGaps = gaps.filter((g) => g.gap);
  const criticalGaps = actualGaps.filter((g) => g.riskLevel === 'CRITICAL').length;

  // Score: start at 100, deduct per gap by severity
  const deductions: Record<RiskLevel, number> = { CRITICAL: 25, HIGH: 15, MEDIUM: 10, LOW: 0 };
  const score = Math.max(
    0,
    100 - actualGaps.reduce((s, g) => s + deductions[g.riskLevel], 0)
  );

  const overallRisk: RiskLevel =
    criticalGaps > 0 ? 'CRITICAL'
    : actualGaps.some((g) => g.riskLevel === 'HIGH') ? 'HIGH'
    : actualGaps.some((g) => g.riskLevel === 'MEDIUM') ? 'MEDIUM'
    : 'LOW';

  return {
    countryCode: country.countryCode,
    countryName: country.countryName,
    gaps,
    totalGaps: actualGaps.length,
    criticalGaps,
    overallRisk,
    score,
  };
}

// ─── Multi-country comparison ─────────────────────────────────────────────────

export function compareCompliance(
  org: OrgCompliance,
  countries: ComplianceProfile[]
): ComplianceGapReport[] {
  return countries
    .map((c) => buildGapReport(org, c))
    .sort((a, b) => b.score - a.score); // highest compliance first
}

// ─── Risk level utilities ──────────────────────────────────────────────────────

export function riskLevelRank(level: RiskLevel): number {
  const ranks: Record<RiskLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return ranks[level];
}

export function highestRisk(gaps: ComplianceGap[]): RiskLevel {
  if (gaps.length === 0) return 'LOW';
  return gaps.reduce<RiskLevel>(
    (max, g) => (riskLevelRank(g.riskLevel) > riskLevelRank(max) ? g.riskLevel : max),
    'LOW'
  );
}

// ─── Penalty risk score ────────────────────────────────────────────────────────

export function penaltyRiskScore(profile: ComplianceProfile): number {
  const penaltyScore = { STRICT: 3, MODERATE: 2, LIGHT: 1 }[profile.penaltyRegime];
  const enforcementScore = { ACTIVE: 3, MODERATE: 2, INACTIVE: 1 }[profile.enforcementRecord];
  return penaltyScore * enforcementScore; // 1–9
}
