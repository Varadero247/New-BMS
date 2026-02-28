export type VendorTier = 'CRITICAL' | 'PRIMARY' | 'SECONDARY' | 'SPOT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type VendorStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'UNDER_REVIEW';
export type IncidentType = 'DELIVERY_DELAY' | 'QUALITY_FAILURE' | 'FINANCIAL_RISK' | 'COMPLIANCE_BREACH' | 'CYBER_INCIDENT';

export interface VendorRecord {
  id: string;
  name: string;
  tier: VendorTier;
  status: VendorStatus;
  riskScore: number; // 0-100, higher = riskier
  riskLevel: RiskLevel;
  country: string;
  categories: string[];
  onboardedAt: Date;
  lastAssessedAt?: Date;
}

export interface SupplyChainIncident {
  id: string;
  vendorId: string;
  type: IncidentType;
  severity: RiskLevel;
  description: string;
  reportedAt: Date;
  resolvedAt?: Date;
  impactScore: number; // 0-10
}

export interface RiskAssessment {
  vendorId: string;
  assessedAt: Date;
  assessedBy: string;
  scores: {
    financial: number;    // 0-100
    operational: number;
    compliance: number;
    cyber: number;
    geographic: number;
  };
  overallScore: number;
  riskLevel: RiskLevel;
  findings: string[];
}
