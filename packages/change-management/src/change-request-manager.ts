import { ChangeRequest, ChangeType, ChangeStatus, ChangeRisk, ApprovalRecord, ApprovalDecision } from './types';

let _seq = 0;

export class ChangeRequestManager {
  private readonly requests = new Map<string, ChangeRequest>();
  private readonly approvals = new Map<string, ApprovalRecord[]>();

  create(title: string, description: string, type: ChangeType, risk: ChangeRisk, requestedBy: string, rollbackPlan: string, affectedSystems: string[]): ChangeRequest {
    const id = `cr-${++_seq}`;
    const req: ChangeRequest = {
      id, title, description, type, risk, requestedBy, rollbackPlan, affectedSystems,
      status: 'DRAFT', createdAt: new Date(),
    };
    this.requests.set(id, req);
    this.approvals.set(id, []);
    return req;
  }

  submit(id: string): ChangeRequest {
    const r = this.requests.get(id);
    if (!r) throw new Error(`Change request not found: ${id}`);
    const updated = { ...r, status: 'SUBMITTED' as ChangeStatus };
    this.requests.set(id, updated);
    return updated;
  }

  approve(id: string, approver: string, comments?: string): ChangeRequest {
    const r = this.requests.get(id);
    if (!r) throw new Error(`Change request not found: ${id}`);
    const approval: ApprovalRecord = { changeId: id, approver, decision: 'APPROVED', decidedAt: new Date(), comments };
    this.approvals.get(id)!.push(approval);
    const updated = { ...r, status: 'APPROVED' as ChangeStatus };
    this.requests.set(id, updated);
    return updated;
  }

  reject(id: string, approver: string, comments?: string): ChangeRequest {
    const r = this.requests.get(id);
    if (!r) throw new Error(`Change request not found: ${id}`);
    const approval: ApprovalRecord = { changeId: id, approver, decision: 'REJECTED', decidedAt: new Date(), comments };
    this.approvals.get(id)!.push(approval);
    const updated = { ...r, status: 'REJECTED' as ChangeStatus };
    this.requests.set(id, updated);
    return updated;
  }

  implement(id: string, assignedTo: string, scheduledDate?: Date): ChangeRequest {
    const r = this.requests.get(id);
    if (!r) throw new Error(`Change request not found: ${id}`);
    const updated = { ...r, status: 'IMPLEMENTING' as ChangeStatus, assignedTo, scheduledDate };
    this.requests.set(id, updated);
    return updated;
  }

  complete(id: string): ChangeRequest {
    const r = this.requests.get(id);
    if (!r) throw new Error(`Change request not found: ${id}`);
    const updated = { ...r, status: 'COMPLETED' as ChangeStatus, completedAt: new Date() };
    this.requests.set(id, updated);
    return updated;
  }

  cancel(id: string): ChangeRequest {
    const r = this.requests.get(id);
    if (!r) throw new Error(`Change request not found: ${id}`);
    const updated = { ...r, status: 'CANCELLED' as ChangeStatus };
    this.requests.set(id, updated);
    return updated;
  }

  get(id: string): ChangeRequest | undefined { return this.requests.get(id); }
  getAll(): ChangeRequest[] { return Array.from(this.requests.values()); }
  getByStatus(status: ChangeStatus): ChangeRequest[] { return Array.from(this.requests.values()).filter(r => r.status === status); }
  getByType(type: ChangeType): ChangeRequest[] { return Array.from(this.requests.values()).filter(r => r.type === type); }
  getByRisk(risk: ChangeRisk): ChangeRequest[] { return Array.from(this.requests.values()).filter(r => r.risk === risk); }
  getByRequester(requestedBy: string): ChangeRequest[] { return Array.from(this.requests.values()).filter(r => r.requestedBy === requestedBy); }
  getApprovals(id: string): ApprovalRecord[] { return this.approvals.get(id) ?? []; }
  getCount(): number { return this.requests.size; }
  getEmergency(): ChangeRequest[] { return this.getByType('EMERGENCY'); }
  getHighRisk(): ChangeRequest[] { return Array.from(this.requests.values()).filter(r => r.risk === 'HIGH' || r.risk === 'CRITICAL'); }
}
