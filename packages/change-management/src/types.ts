export type ChangeType = 'STANDARD' | 'NORMAL' | 'EMERGENCY' | 'MAJOR';
export type ChangeStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTING' | 'COMPLETED' | 'CANCELLED';
export type ChangeRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'DEFERRED';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  type: ChangeType;
  status: ChangeStatus;
  risk: ChangeRisk;
  requestedBy: string;
  assignedTo?: string;
  createdAt: Date;
  scheduledDate?: Date;
  completedAt?: Date;
  rollbackPlan: string;
  affectedSystems: string[];
}

export interface ApprovalRecord {
  changeId: string;
  approver: string;
  decision: ApprovalDecision;
  decidedAt: Date;
  comments?: string;
}
