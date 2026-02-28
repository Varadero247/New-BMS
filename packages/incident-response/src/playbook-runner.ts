export type PlaybookStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PAUSED';
export type StepStatus = 'PENDING' | 'DONE' | 'SKIPPED' | 'FAILED';

export interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: StepStatus;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface Playbook {
  id: string;
  name: string;
  incidentType: string;
  steps: PlaybookStep[];
  status: PlaybookStatus;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
}

let _seq = 0;

export class PlaybookRunner {
  private readonly playbooks = new Map<string, Playbook>();

  create(name: string, incidentType: string, stepDefs: Array<{ name: string; description: string; required?: boolean }>): Playbook {
    const id = `pb-${++_seq}`;
    const steps: PlaybookStep[] = stepDefs.map((s, i) => ({
      id: `step-${id}-${i}`, name: s.name, description: s.description,
      required: s.required ?? true, status: 'PENDING',
    }));
    const pb: Playbook = { id, name, incidentType, steps, status: 'NOT_STARTED' };
    this.playbooks.set(id, pb);
    return pb;
  }

  start(id: string, assignee?: string): Playbook {
    const pb = this.playbooks.get(id);
    if (!pb) throw new Error(`Playbook not found: ${id}`);
    const updated: Playbook = { ...pb, status: 'IN_PROGRESS', startedAt: new Date(), assignedTo: assignee };
    this.playbooks.set(id, updated);
    return updated;
  }

  completeStep(playbookId: string, stepId: string, completedBy: string, notes?: string): Playbook {
    const pb = this.playbooks.get(playbookId);
    if (!pb) throw new Error(`Playbook not found: ${playbookId}`);
    const updatedSteps = pb.steps.map(s =>
      s.id === stepId ? { ...s, status: 'DONE' as StepStatus, completedAt: new Date(), completedBy, notes } : s
    );
    const allRequired = updatedSteps.filter(s => s.required);
    const allDone = allRequired.every(s => s.status === 'DONE');
    const updated: Playbook = {
      ...pb, steps: updatedSteps,
      status: allDone ? 'COMPLETED' : pb.status,
      completedAt: allDone ? new Date() : undefined,
    };
    this.playbooks.set(playbookId, updated);
    return updated;
  }

  skipStep(playbookId: string, stepId: string): Playbook {
    const pb = this.playbooks.get(playbookId);
    if (!pb) throw new Error(`Playbook not found: ${playbookId}`);
    const updated: Playbook = {
      ...pb, steps: pb.steps.map(s => s.id === stepId ? { ...s, status: 'SKIPPED' as StepStatus } : s),
    };
    this.playbooks.set(playbookId, updated);
    return updated;
  }

  get(id: string): Playbook | undefined { return this.playbooks.get(id); }
  getAll(): Playbook[] { return Array.from(this.playbooks.values()); }
  getByStatus(status: PlaybookStatus): Playbook[] { return Array.from(this.playbooks.values()).filter(p => p.status === status); }
  getByType(incidentType: string): Playbook[] { return Array.from(this.playbooks.values()).filter(p => p.incidentType === incidentType); }

  getCompletionPct(id: string): number {
    const pb = this.playbooks.get(id);
    if (!pb || pb.steps.length === 0) return 0;
    const done = pb.steps.filter(s => s.status === 'DONE' || s.status === 'SKIPPED').length;
    return Math.round((done / pb.steps.length) * 100);
  }

  getCount(): number { return this.playbooks.size; }
}
