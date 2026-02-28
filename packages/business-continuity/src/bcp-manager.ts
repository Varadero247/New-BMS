import { BCPlan, BCPStatus, RecoveryStep } from './types';

let _seq = 0;

export class BCPManager {
  private readonly plans = new Map<string, BCPlan>();

  create(name: string, owner: string, rtoMinutes: number, rpoMinutes: number, version = '1.0'): BCPlan {
    const id = `bcp-${++_seq}`;
    const plan: BCPlan = {
      id, name, version, owner, rtoMinutes, rpoMinutes,
      status: 'DRAFT', createdAt: new Date(), recoverySteps: [],
    };
    this.plans.set(id, plan);
    return plan;
  }

  approve(id: string): BCPlan {
    const p = this.plans.get(id);
    if (!p) throw new Error(`Plan not found: ${id}`);
    const updated = { ...p, status: 'APPROVED' as BCPStatus, approvedAt: new Date() };
    this.plans.set(id, updated);
    return updated;
  }

  activate(id: string): BCPlan {
    const p = this.plans.get(id);
    if (!p) throw new Error(`Plan not found: ${id}`);
    const updated = { ...p, status: 'ACTIVE' as BCPStatus };
    this.plans.set(id, updated);
    return updated;
  }

  retire(id: string): BCPlan {
    const p = this.plans.get(id);
    if (!p) throw new Error(`Plan not found: ${id}`);
    const updated = { ...p, status: 'RETIRED' as BCPStatus };
    this.plans.set(id, updated);
    return updated;
  }

  addStep(id: string, step: Omit<RecoveryStep, 'completed'>): BCPlan {
    const p = this.plans.get(id);
    if (!p) throw new Error(`Plan not found: ${id}`);
    const updated = { ...p, recoverySteps: [...p.recoverySteps, { ...step, completed: false }] };
    this.plans.set(id, updated);
    return updated;
  }

  completeStep(id: string, stepOrder: number): BCPlan {
    const p = this.plans.get(id);
    if (!p) throw new Error(`Plan not found: ${id}`);
    const updatedSteps = p.recoverySteps.map(s => s.order === stepOrder ? { ...s, completed: true } : s);
    const updated = { ...p, recoverySteps: updatedSteps };
    this.plans.set(id, updated);
    return updated;
  }

  get(id: string): BCPlan | undefined { return this.plans.get(id); }
  getAll(): BCPlan[] { return Array.from(this.plans.values()); }
  getByStatus(status: BCPStatus): BCPlan[] { return Array.from(this.plans.values()).filter(p => p.status === status); }
  getByOwner(owner: string): BCPlan[] { return Array.from(this.plans.values()).filter(p => p.owner === owner); }
  getCount(): number { return this.plans.size; }

  getCompletionPct(id: string): number {
    const p = this.plans.get(id);
    if (!p || p.recoverySteps.length === 0) return 0;
    const done = p.recoverySteps.filter(s => s.completed).length;
    return Math.round((done / p.recoverySteps.length) * 100);
  }

  getTotalEstimatedTime(id: string): number {
    const p = this.plans.get(id);
    if (!p) return 0;
    return p.recoverySteps.reduce((s, step) => s + step.estimatedMinutes, 0);
  }
}
