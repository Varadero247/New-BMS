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
