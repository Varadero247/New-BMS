import { Checklist, ChecklistItem, ChecklistProgress, ChecklistSection, ChecklistStatus, ItemStatus, ItemType, Priority } from './types';

export function createItem(
  id: string, text: string, type: ItemType, order: number,
  required = true, priority: Priority = 'medium',
  overrides: Partial<ChecklistItem> = {}
): ChecklistItem {
  return { id, text, type, status: 'pending', required, priority, order, ...overrides };
}

export function createSection(id: string, title: string, items: ChecklistItem[], order: number): ChecklistSection {
  return { id, title, items, order };
}

export function createChecklist(id: string, title: string, sections: ChecklistSection[] = []): Checklist {
  return { id, title, sections, status: 'not_started', createdAt: Date.now() };
}

export function flattenItems(checklist: Checklist): ChecklistItem[] {
  return checklist.sections.flatMap(s => s.items);
}

export function getProgress(checklist: Checklist): ChecklistProgress {
  const items = flattenItems(checklist);
  const total = items.length;
  const answered = items.filter(i => i.status !== 'pending').length;
  const passed = items.filter(i => i.status === 'pass').length;
  const failed = items.filter(i => i.status === 'fail').length;
  const naItems = items.filter(i => i.status === 'na').length;
  const skipped = items.filter(i => !i.required && i.status === 'pending').length;
  const completionPct = total > 0 ? (answered / total) * 100 : 0;
  const applicable = total - naItems;
  const passPct = applicable > 0 ? (passed / applicable) * 100 : 0;
  const hasCriticalFailures = items.some(i => i.priority === 'critical' && i.status === 'fail');
  return { total, answered, passed, failed, naItems, skipped, completionPct, passPct, hasCriticalFailures };
}

export function respondToItem(checklist: Checklist, itemId: string, status: ItemStatus, response?: unknown, notes?: string): Checklist {
  const sections = checklist.sections.map(section => ({
    ...section,
    items: section.items.map(item =>
      item.id === itemId
        ? { ...item, status, ...(response !== undefined ? { response } : {}), ...(notes ? { notes } : {}) }
        : item
    ),
  }));
  return { ...checklist, sections };
}

export function computeStatus(checklist: Checklist): ChecklistStatus {
  const items = flattenItems(checklist);
  if (items.length === 0) return 'not_started';
  const hasFail = items.some(i => i.required && i.status === 'fail');
  if (hasFail) return 'failed';
  const allAnswered = items.filter(i => i.required).every(i => i.status !== 'pending');
  if (allAnswered) return 'completed';
  const anyAnswered = items.some(i => i.status !== 'pending');
  return anyAnswered ? 'in_progress' : 'not_started';
}

export function isComplete(checklist: Checklist): boolean {
  return computeStatus(checklist) === 'completed';
}

export function hasCriticalFailures(checklist: Checklist): boolean {
  return flattenItems(checklist).some(i => i.priority === 'critical' && i.status === 'fail');
}

export function getItemById(checklist: Checklist, itemId: string): ChecklistItem | undefined {
  return flattenItems(checklist).find(i => i.id === itemId);
}

export function filterItemsByStatus(checklist: Checklist, status: ItemStatus): ChecklistItem[] {
  return flattenItems(checklist).filter(i => i.status === status);
}

export function filterItemsByPriority(checklist: Checklist, priority: Priority): ChecklistItem[] {
  return flattenItems(checklist).filter(i => i.priority === priority);
}

export function sortSectionsByOrder(checklist: Checklist): Checklist {
  return { ...checklist, sections: [...checklist.sections].sort((a, b) => a.order - b.order) };
}

export function isValidItemStatus(s: string): s is ItemStatus {
  return ['pending', 'pass', 'fail', 'na', 'partial'].includes(s);
}

export function isValidItemType(t: string): t is ItemType {
  return ['boolean', 'text', 'number', 'date', 'select', 'multiselect', 'signature', 'photo'].includes(t);
}

export function isValidPriority(p: string): p is Priority {
  return ['low', 'medium', 'high', 'critical'].includes(p);
}

export function countItemsByStatus(checklist: Checklist): Record<ItemStatus, number> {
  const result: Record<ItemStatus, number> = { pending: 0, pass: 0, fail: 0, na: 0, partial: 0 };
  for (const item of flattenItems(checklist)) result[item.status]++;
  return result;
}

export function getRequiredItems(checklist: Checklist): ChecklistItem[] {
  return flattenItems(checklist).filter(i => i.required);
}

export function getFailedItems(checklist: Checklist): ChecklistItem[] {
  return flattenItems(checklist).filter(i => i.status === 'fail');
}
