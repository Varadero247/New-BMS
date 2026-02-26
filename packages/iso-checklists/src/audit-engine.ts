// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { StandardChecklist, ChecklistClause } from './types';
import { checklists } from './index';

export interface AuditPlan {
  id: string;
  standard: string;
  title: string;
  scope: string;
  auditType: 'INTERNAL' | 'EXTERNAL' | 'SURVEILLANCE' | 'CERTIFICATION';
  clauses: AuditClauseStatus[];
  createdAt: Date;
}

export interface AuditClauseStatus {
  clause: string;
  title: string;
  questions: string[];
  evidence: string[];
  mandatory: boolean;
  status:
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'CONFORMING'
    | 'MINOR_NC'
    | 'MAJOR_NC'
    | 'OBSERVATION'
    | 'NOT_APPLICABLE';
  findings: string[];
  objectiveEvidence: string[];
  auditorNotes: string;
}

export function createAuditPlan(
  standard: string,
  auditType: AuditPlan['auditType'],
  title: string,
  scope: string
): AuditPlan | null {
  const checklist = checklists[standard];
  if (!checklist) return null;

  return {
    id: `AUD-${Date.now()}`,
    standard,
    title,
    scope,
    auditType,
    clauses: checklist.clauses.map((c) => ({
      clause: c.clause,
      title: c.title,
      questions: c.questions,
      evidence: c.evidence,
      mandatory: c.mandatory,
      status: 'NOT_STARTED',
      findings: [],
      objectiveEvidence: [],
      auditorNotes: '',
    })),
    createdAt: new Date(),
  };
}

export function calculateAuditScore(plan: AuditPlan): {
  total: number;
  assessed: number;
  conforming: number;
  minorNCs: number;
  majorNCs: number;
  observations: number;
  notApplicable: number;
  conformanceRate: number;
} {
  const total = plan.clauses.length;
  const assessed = plan.clauses.filter((c) => c.status !== 'NOT_STARTED').length;
  const conforming = plan.clauses.filter((c) => c.status === 'CONFORMING').length;
  const minorNCs = plan.clauses.filter((c) => c.status === 'MINOR_NC').length;
  const majorNCs = plan.clauses.filter((c) => c.status === 'MAJOR_NC').length;
  const observations = plan.clauses.filter((c) => c.status === 'OBSERVATION').length;
  const notApplicable = plan.clauses.filter((c) => c.status === 'NOT_APPLICABLE').length;
  const applicable = total - notApplicable;
  const conformanceRate = applicable > 0 ? (conforming / applicable) * 100 : 0;

  return {
    total,
    assessed,
    conforming,
    minorNCs,
    majorNCs,
    observations,
    notApplicable,
    conformanceRate,
  };
}

export function getClausesByStatus(
  plan: AuditPlan,
  status: AuditClauseStatus['status']
): AuditClauseStatus[] {
  return plan.clauses.filter((c) => c.status === status);
}

export function getMandatoryGaps(plan: AuditPlan): AuditClauseStatus[] {
  return plan.clauses.filter(
    (c) => c.mandatory && c.status !== 'CONFORMING' && c.status !== 'NOT_APPLICABLE'
  );
}
