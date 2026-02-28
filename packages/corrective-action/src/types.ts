export type CAPAType = 'CORRECTIVE' | 'PREVENTIVE' | 'IMPROVEMENT';
export type CAPAStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_IN_PROGRESS' | 'VERIFICATION' | 'CLOSED' | 'CANCELLED';
export type CAPAPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RootCauseCategory = 'HUMAN_ERROR' | 'PROCESS' | 'EQUIPMENT' | 'MATERIAL' | 'ENVIRONMENT' | 'MANAGEMENT' | 'UNKNOWN';
export type VerificationResult = 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'NOT_EFFECTIVE';
export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface CAPARecord {
  id: string;
  title: string;
  type: CAPAType;
  priority: CAPAPriority;
  status: CAPAStatus;
  description: string;
  source: string;
  raisedBy: string;
  raisedAt: string;
  assignedTo?: string;
  targetDate?: string;
  rootCause?: string;
  rootCauseCategory?: RootCauseCategory;
  closedAt?: string;
  closedBy?: string;
  verificationResult?: VerificationResult;
}

export interface CAPAAction {
  id: string;
  capaId: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: ActionStatus;
  completedDate?: string;
  notes?: string;
}
