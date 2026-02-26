// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { CLAUSE_STANDARD_MAP } from './clause-map';
import {
  ISOStandard,
  AnnexSLClause,
  RecordType,
  ConvergentRecord,
  ConvergenceScore,
} from './types';

export function getStandardsForClause(clause: AnnexSLClause): ISOStandard[] {
  const mapping = CLAUSE_STANDARD_MAP.find((m) => m.clause === clause);
  return mapping?.standards || [];
}

export function getClausesForStandard(standard: ISOStandard): AnnexSLClause[] {
  return CLAUSE_STANDARD_MAP.filter((m) => m.standards.includes(standard)).map((m) => m.clause);
}

export function getSharedClauses(standards: ISOStandard[]): AnnexSLClause[] {
  return CLAUSE_STANDARD_MAP.filter((m) => standards.every((s) => m.standards.includes(s))).map(
    (m) => m.clause
  );
}

export function createConvergentRecord(
  id: string,
  recordType: RecordType,
  clauses: AnnexSLClause[]
): ConvergentRecord {
  const satisfiesStandards = new Set<ISOStandard>();
  const clauseRefs: Partial<Record<ISOStandard, AnnexSLClause[]>> = {};

  for (const clause of clauses) {
    const standards = getStandardsForClause(clause);
    for (const std of standards) {
      satisfiesStandards.add(std);
      if (!clauseRefs[std]) clauseRefs[std] = [];
      clauseRefs[std]!.push(clause);
    }
  }

  return {
    id,
    recordType,
    satisfiesStandards: Array.from(satisfiesStandards),
    clauseRefs,
  };
}

export function calculateConvergenceScore(
  records: ConvergentRecord[],
  standard: ISOStandard
): ConvergenceScore {
  const totalClauses = getClausesForStandard(standard).length;
  const satisfiedClauses = new Set<AnnexSLClause>();

  for (const record of records) {
    const refs = record.clauseRefs[standard] || [];
    refs.forEach((c) => satisfiedClauses.add(c));
  }

  return {
    standard,
    totalClauses,
    satisfiedClauses: satisfiedClauses.size,
    percentage: totalClauses > 0 ? Math.round((satisfiedClauses.size / totalClauses) * 100) : 0,
  };
}

export function getConvergenceBenefit(standards: ISOStandard[]): {
  sharedClauses: number;
  totalClausesIfSeparate: number;
  reductionPercent: number;
} {
  const sharedClauses = getSharedClauses(standards).length;
  const totalClausesIfSeparate = standards.reduce(
    (sum, std) => sum + getClausesForStandard(std).length,
    0
  );
  const totalWithConvergence = new Set(standards.flatMap((std) => getClausesForStandard(std))).size;
  const reductionPercent =
    totalClausesIfSeparate > 0
      ? Math.round(((totalClausesIfSeparate - totalWithConvergence) / totalClausesIfSeparate) * 100)
      : 0;

  return { sharedClauses, totalClausesIfSeparate, reductionPercent };
}
