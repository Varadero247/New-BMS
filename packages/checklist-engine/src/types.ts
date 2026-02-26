export type ItemStatus = 'pending' | 'pass' | 'fail' | 'na' | 'partial';
export type ChecklistStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
export type ItemType = 'boolean' | 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'signature' | 'photo';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface ChecklistItem {
  id: string;
  text: string;
  type: ItemType;
  status: ItemStatus;
  required: boolean;
  priority: Priority;
  response?: unknown;
  notes?: string;
  order: number;
  section?: string;
  hint?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
  order: number;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  sections: ChecklistSection[];
  status: ChecklistStatus;
  assignee?: string;
  dueDate?: number;
  completedAt?: number;
  createdAt: number;
  reference?: string;
}

export interface ChecklistProgress {
  total: number;
  answered: number;
  passed: number;
  failed: number;
  naItems: number;
  skipped: number;
  completionPct: number;
  passPct: number;
  hasCriticalFailures: boolean;
}
