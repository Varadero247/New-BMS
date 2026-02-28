import { CAPAAction, ActionStatus } from './types';

export class ActionTracker {
  private _store: Map<string, CAPAAction> = new Map();
  private _seq: number = 0;

  addAction(capaId: string, description: string, assignedTo: string, dueDate: string): CAPAAction {
    const id = `act-${++this._seq}`;
    const action: CAPAAction = {
      id,
      capaId,
      description,
      assignedTo,
      dueDate,
      status: 'PENDING',
    };
    this._store.set(id, action);
    return { ...action };
  }

  start(id: string): CAPAAction {
    const action = this._store.get(id);
    if (!action) throw new Error(`Action not found: ${id}`);
    action.status = 'IN_PROGRESS';
    return { ...action };
  }

  complete(id: string, completedDate: string, notes?: string): CAPAAction {
    const action = this._store.get(id);
    if (!action) throw new Error(`Action not found: ${id}`);
    action.status = 'COMPLETED';
    action.completedDate = completedDate;
    if (notes !== undefined) action.notes = notes;
    return { ...action };
  }

  markOverdue(id: string): CAPAAction {
    const action = this._store.get(id);
    if (!action) throw new Error(`Action not found: ${id}`);
    action.status = 'OVERDUE';
    return { ...action };
  }

  getByCAPA(capaId: string): CAPAAction[] {
    return Array.from(this._store.values())
      .filter(a => a.capaId === capaId)
      .map(a => ({ ...a }));
  }

  getByAssignee(assignedTo: string): CAPAAction[] {
    return Array.from(this._store.values())
      .filter(a => a.assignedTo === assignedTo)
      .map(a => ({ ...a }));
  }

  getByStatus(status: ActionStatus): CAPAAction[] {
    return Array.from(this._store.values())
      .filter(a => a.status === status)
      .map(a => ({ ...a }));
  }

  getPending(): CAPAAction[] {
    return this.getByStatus('PENDING');
  }

  getOverdue(): CAPAAction[] {
    return this.getByStatus('OVERDUE');
  }

  getCompletionRate(capaId: string): number {
    const actions = this.getByCAPA(capaId);
    if (actions.length === 0) return 0;
    const completed = actions.filter(a => a.status === 'COMPLETED').length;
    return (completed / actions.length) * 100;
  }

  getCount(): number {
    return this._store.size;
  }
}
