export type ControlStatus = 'EFFECTIVE' | 'PARTIAL' | 'INEFFECTIVE' | 'NOT_TESTED';
export type EvidenceType = 'DOCUMENT' | 'LOG' | 'SCREENSHOT' | 'INTERVIEW' | 'OBSERVATION' | 'CONFIGURATION';
export type AuditStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface ControlDefinition {
  id: string;
  name: string;
  framework: string;
  description: string;
  testProcedure: string;
}

export interface ControlTestResult {
  controlId: string;
  testedAt: Date;
  testedBy: string;
  status: ControlStatus;
  findings: string[];
  score: number; // 0-100
}

export interface EvidenceItem {
  id: string;
  controlId: string;
  type: EvidenceType;
  filename: string;
  description: string;
  collectedAt: Date;
  collectedBy: string;
  hash: string;
  tags: string[];
}

export interface AuditSchedule {
  id: string;
  name: string;
  framework: string;
  scheduledDate: Date;
  assignedTo: string;
  status: AuditStatus;
  controlIds: string[];
  completedAt?: Date;
  notes?: string;
}

export interface ComplianceSummary {
  framework: string;
  totalControls: number;
  effective: number;
  partial: number;
  ineffective: number;
  notTested: number;
  overallScore: number;
}
