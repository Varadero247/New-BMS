// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export { ANNEX_SL_COMMON_CLAUSES, CLAUSE_STANDARD_MAP } from './clause-map';
export {
  getStandardsForClause,
  getClausesForStandard,
  getSharedClauses,
  createConvergentRecord,
  calculateConvergenceScore,
  getConvergenceBenefit,
} from './convergence';
export type {
  ISOStandard,
  AnnexSLClause,
  RecordType,
  ClauseMapping,
  ConvergentRecord,
  ConvergenceScore,
} from './types';
