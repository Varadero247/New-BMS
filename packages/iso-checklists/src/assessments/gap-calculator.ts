// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  StandardAssessment,
  GapAssessment,
  ClauseResponse,
  GapReport,
  ClauseGap,
  ComplianceStatus,
} from './types';

const WEEKS_PER_MINOR_GAP = 1;
const WEEKS_PER_MAJOR_GAP = 3;

function prioritiseGap(status: ComplianceStatus, mandatory: boolean): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (status === 'MAJOR_GAP' && mandatory) return 'HIGH';
  if (status === 'MAJOR_GAP') return 'MEDIUM';
  if (status === 'MINOR_GAP' && mandatory) return 'MEDIUM';
  return 'LOW';
}

function scoreClause(status: ComplianceStatus): number {
  switch (status) {
    case 'CONFORMANT': return 100;
    case 'MINOR_GAP': return 50;
    case 'MAJOR_GAP': return 0;
    case 'NOT_APPLICABLE': return 100; // excluded from denominator implicitly
    case 'NOT_ASSESSED': return 0;
  }
}

export function calculateGapReport(
  assessment: StandardAssessment,
  gapAssessment: GapAssessment,
): GapReport {
  const responseMap = new Map<string, ClauseResponse>(
    gapAssessment.responses.map(r => [r.clauseId, r]),
  );

  const gaps: ClauseGap[] = [];
  let totalApplicable = 0;
  let totalScore = 0;
  let conformant = 0;
  let minorGaps = 0;
  let majorGaps = 0;
  let notApplicable = 0;
  let notAssessed = 0;
  let estimatedWeeks = 0;

  for (const clause of assessment.clauses) {
    const response = responseMap.get(clause.id);
    const status: ComplianceStatus = response?.status ?? 'NOT_ASSESSED';

    if (status === 'NOT_APPLICABLE') {
      notApplicable++;
      continue;
    }

    totalApplicable++;
    const score = scoreClause(status);
    totalScore += score;

    switch (status) {
      case 'CONFORMANT': conformant++; break;
      case 'MINOR_GAP': minorGaps++; estimatedWeeks += WEEKS_PER_MINOR_GAP; break;
      case 'MAJOR_GAP': majorGaps++; estimatedWeeks += WEEKS_PER_MAJOR_GAP; break;
      case 'NOT_ASSESSED': notAssessed++; estimatedWeeks += WEEKS_PER_MAJOR_GAP; break;
    }

    if (status !== 'CONFORMANT') {
      gaps.push({
        clause,
        status,
        evidence: response?.evidence,
        notes: response?.notes,
        priority: prioritiseGap(status, clause.mandatory),
      });
    }
  }

  // Sort gaps: HIGH first, then MEDIUM, then LOW
  gaps.sort((a, b) => {
    const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priority[a.priority] - priority[b.priority];
  });

  const overallScore = totalApplicable > 0 ? Math.round(totalScore / totalApplicable) : 0;

  const recommendedActions = generateRecommendations(gaps, assessment.standardId);

  return {
    assessmentId: gapAssessment.id,
    standardId: assessment.standardId,
    standardName: assessment.standardName,
    orgId: gapAssessment.orgId,
    conductedAt: gapAssessment.conductedAt,
    summary: {
      total: totalApplicable + notApplicable,
      conformant,
      minorGaps,
      majorGaps,
      notApplicable,
      notAssessed,
      overallScore,
      estimatedWeeksToClose: estimatedWeeks,
    },
    gaps,
    recommendedActions,
  };
}

function generateRecommendations(gaps: ClauseGap[], standardId: string): string[] {
  const actions: string[] = [];

  const highPriorityGaps = gaps.filter(g => g.priority === 'HIGH');
  const notAssessedGaps = gaps.filter(g => g.status === 'NOT_ASSESSED');

  if (highPriorityGaps.length > 0) {
    actions.push(
      `Address ${highPriorityGaps.length} high-priority mandatory gap(s) immediately: ${highPriorityGaps.slice(0, 3).map(g => `Clause ${g.clause.id}`).join(', ')}${highPriorityGaps.length > 3 ? '...' : ''}`,
    );
  }

  if (notAssessedGaps.length > 0) {
    actions.push(
      `Complete assessment for ${notAssessedGaps.length} unevaluated clause(s) to get an accurate gap score`,
    );
  }

  if (standardId.includes('9001') || standardId.includes('iatf')) {
    actions.push('Schedule an internal audit against all clauses to validate assessment findings');
    actions.push('Review customer-specific requirements (CSRs) and ensure they are incorporated into your QMS');
  }

  if (standardId.includes('27001')) {
    actions.push('Conduct a full ISO 27002:2022 controls review to complete Annex A mapping');
    actions.push('Update Statement of Applicability (SoA) to reflect current control implementation status');
  }

  if (standardId.includes('45001')) {
    actions.push('Ensure worker consultation records are documented and accessible for audit review');
    actions.push('Review and update emergency response plans, including drill frequency and records');
  }

  actions.push('Create corrective action plans with target dates for all identified gaps');
  actions.push('Assign an internal champion (management representative) for each clause with identified gaps');

  return actions;
}

export function getAssessmentByStandardId(standardId: string): StandardAssessment | undefined {
  // Lazy imports to avoid circular dependencies
  const assessments: Record<string, () => Promise<{ default?: StandardAssessment } & Record<string, StandardAssessment>>> = {
    'iso-9001-2015': () => import('./iso-9001-2015') as Promise<{ iso9001Assessment: StandardAssessment }>,
    'iso-45001-2018': () => import('./iso-45001-2018') as Promise<{ iso45001Assessment: StandardAssessment }>,
    'iso-14001-2015': () => import('./iso-14001-2015') as Promise<{ iso14001Assessment: StandardAssessment }>,
    'iso-27001-2022': () => import('./iso-27001-2022') as Promise<{ iso27001Assessment: StandardAssessment }>,
    'iatf-16949-2016': () => import('./iatf-16949-2016') as Promise<{ iatf16949Assessment: StandardAssessment }>,
  };
  void assessments; // used for documentation only — actual lookup happens in route
  return undefined;
}

export const SUPPORTED_STANDARDS = [
  { id: 'iso-9001-2015', name: 'ISO 9001:2015', clauseCount: 28 },
  { id: 'iso-45001-2018', name: 'ISO 45001:2018', clauseCount: 26 },
  { id: 'iso-14001-2015', name: 'ISO 14001:2015', clauseCount: 24 },
  { id: 'iso-27001-2022', name: 'ISO 27001:2022', clauseCount: 27 },
  { id: 'iatf-16949-2016', name: 'IATF 16949:2016', clauseCount: 24 },
  { id: 'as9100d-2016', name: 'AS9100D:2016', clauseCount: 36 },
  { id: 'iso-13485-2016', name: 'ISO 13485:2016', clauseCount: 29 },
  { id: 'iso-50001-2018', name: 'ISO 50001:2018', clauseCount: 29 },
  { id: 'iso-22000-2018', name: 'ISO 22000:2018', clauseCount: 32 },
  { id: 'iso-31000-2018', name: 'ISO 31000:2018', clauseCount: 19 },
  { id: 'iso-22301-2019', name: 'ISO 22301:2019', clauseCount: 28 },
  { id: 'iso-42001-2023', name: 'ISO 42001:2023', clauseCount: 28 },
  { id: 'iso-37001-2016', name: 'ISO 37001:2016', clauseCount: 28 },
];
