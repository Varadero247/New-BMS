// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type ISOStandard =
  | 'ISO_9001'
  | 'ISO_14001'
  | 'ISO_45001'
  | 'ISO_27001'
  | 'ISO_42001'
  | 'ISO_50001'
  | 'ISO_22000'
  | 'ISO_13485'
  | 'ISO_37001'
  | 'ISO_55001'
  | 'IATF_16949'
  | 'AS9100D';

export type AnnexSLClause =
  | '4.1'
  | '4.2'
  | '4.3'
  | '4.4'
  | '5.1'
  | '5.2'
  | '5.3'
  | '6.1'
  | '6.2'
  | '7.1'
  | '7.2'
  | '7.3'
  | '7.4'
  | '7.5'
  | '8.1'
  | '9.1'
  | '9.2'
  | '9.3'
  | '10.1'
  | '10.2';

export type RecordType =
  | 'INTERNAL_AUDIT'
  | 'MANAGEMENT_REVIEW'
  | 'RISK_REGISTER'
  | 'OBJECTIVE'
  | 'DOCUMENT'
  | 'CAPA'
  | 'TRAINING'
  | 'LEGAL_REGISTER';

export interface ClauseMapping {
  clause: AnnexSLClause;
  title: string;
  standards: ISOStandard[];
  description: string;
}

export interface ConvergentRecord {
  id: string;
  recordType: RecordType;
  satisfiesStandards: ISOStandard[];
  clauseRefs: Partial<Record<ISOStandard, AnnexSLClause[]>>;
}

export interface ConvergenceScore {
  standard: ISOStandard;
  totalClauses: number;
  satisfiedClauses: number;
  percentage: number;
}
