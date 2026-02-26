// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
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

// Gap Assessment Engine
export { calculateGapReport, SUPPORTED_STANDARDS } from './assessments/gap-calculator';
export { iso9001Assessment } from './assessments/iso-9001-2015';
export { iso45001Assessment } from './assessments/iso-45001-2018';
export { iso14001Assessment } from './assessments/iso-14001-2015';
export { iso27001Assessment } from './assessments/iso-27001-2022';
export { iatf16949Assessment } from './assessments/iatf-16949-2016';
export { as9100dAssessment } from './assessments/as9100d-2016';
export { iso13485Assessment } from './assessments/iso-13485-2016';
export { iso50001Assessment } from './assessments/iso-50001-2018';
export { iso22000Assessment } from './assessments/iso-22000-2018';
export { iso31000Assessment } from './assessments/iso-31000-2018';
export { iso22301Assessment } from './assessments/iso-22301-2019';
export { iso42001Assessment } from './assessments/iso-42001-2023';
export { iso37001Assessment } from './assessments/iso-37001-2016';
export type {
  ComplianceStatus,
  ClauseRequirement,
  StandardAssessment,
  ClauseResponse,
  GapAssessment,
  ClauseGap,
  GapReport,
} from './assessments/types';
