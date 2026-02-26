export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'withdrawn' | 'expired';
export type StepType = 'sequential' | 'parallel' | 'any_one';
export type EscalationType = 'time_based' | 'manual' | 'auto';

export interface Approver {
  id: string;
  name: string;
  email: string;
  role?: string;
  delegateTo?: string;   // delegate approver id
}

export interface ApprovalStep {
  id: string;
  name: string;
  order: number;
  type: StepType;
  approvers: Approver[];
  dueDate?: number;
  escalationAfterHours?: number;
  status: ApprovalStatus;
  decisions: ApprovalDecision[];
}

export interface ApprovalDecision {
  approverId: string;
  approverName: string;
  status: 'approved' | 'rejected';
  comment?: string;
  decidedAt: number;
}

export interface ApprovalFlow {
  id: string;
  name: string;
  entityId: string;
  entityType: string;
  steps: ApprovalStep[];
  currentStepIndex: number;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: number;
  completedAt?: number;
  subject?: string;
}

export interface FlowSummary {
  totalSteps: number;
  completedSteps: number;
  pendingSteps: number;
  currentStep?: ApprovalStep;
  isComplete: boolean;
  isFinallyApproved: boolean;
  isFinallyRejected: boolean;
}
