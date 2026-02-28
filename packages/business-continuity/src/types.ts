export type BCPStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'UNDER_REVIEW' | 'RETIRED';
export type RecoveryPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TestType = 'TABLETOP' | 'WALKTHROUGH' | 'SIMULATION' | 'FULL_INTERRUPTION';
export type TestResult = 'PASS' | 'FAIL' | 'PARTIAL';

export interface BCPlan {
  id: string;
  name: string;
  version: string;
  status: BCPStatus;
  owner: string;
  rtoMinutes: number;      // Recovery Time Objective
  rpoMinutes: number;      // Recovery Point Objective
  createdAt: Date;
  approvedAt?: Date;
  lastTestedAt?: Date;
  recoverySteps: RecoveryStep[];
}

export interface RecoveryStep {
  order: number;
  action: string;
  owner: string;
  estimatedMinutes: number;
  completed?: boolean;
}

export interface BCPTest {
  id: string;
  planId: string;
  testType: TestType;
  scheduledDate: Date;
  conductedDate?: Date;
  result?: TestResult;
  rtoActualMinutes?: number;
  rpoActualMinutes?: number;
  notes?: string;
  gaps: string[];
}
