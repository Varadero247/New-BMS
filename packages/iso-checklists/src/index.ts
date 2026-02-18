// ISO Standard Audit Checklists
export { iso9001Checklist } from './iso9001';
export { iso14001Checklist } from './iso14001';
export { iso45001Checklist } from './iso45001';
export { iatf16949Checklist } from './iatf16949';
export { as9100Checklist } from './as9100';
export { iso13485Checklist } from './iso13485';

// Types
export type { StandardChecklist, ChecklistClause } from './types';

// Convenience map for looking up checklists by standard code
import { iso9001Checklist } from './iso9001';
import { iso14001Checklist } from './iso14001';
import { iso45001Checklist } from './iso45001';
import { iatf16949Checklist } from './iatf16949';
import { as9100Checklist } from './as9100';
import { iso13485Checklist } from './iso13485';
import type { StandardChecklist } from './types';

export const checklists: Record<string, StandardChecklist> = {
  ISO_9001: iso9001Checklist,
  ISO_14001: iso14001Checklist,
  ISO_45001: iso45001Checklist,
  IATF_16949: iatf16949Checklist,
  AS9100D: as9100Checklist,
  ISO_13485: iso13485Checklist,
};

export function getChecklist(standard: string): StandardChecklist | undefined {
  return checklists[standard];
}

export function getAvailableStandards(): string[] {
  return Object.keys(checklists);
}

// Audit Engine
export {
  createAuditPlan,
  calculateAuditScore,
  getClausesByStatus,
  getMandatoryGaps,
} from './audit-engine';
export type { AuditPlan, AuditClauseStatus } from './audit-engine';
