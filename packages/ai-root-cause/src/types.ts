// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.

export type RcaMethod = 'five-whys' | 'fishbone' | 'fault-tree' | 'bow-tie' | 'scat';
export type CauseCategory = 'human' | 'process' | 'equipment' | 'environment' | 'material' | 'management';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface RcaInput {
  incidentId: string;
  title: string;
  description: string;
  severity: Severity;
  module: string;
  occurredAt: Date;
  tags?: string[];
}

export interface WhyChain {
  level: number;
  statement: string;
  cause: string;
}

export interface FishboneCategory {
  category: CauseCategory;
  causes: string[];
}

export interface RcaResult {
  incidentId: string;
  method: RcaMethod;
  rootCause: string;
  contributingFactors: string[];
  correctiveActions: string[];
  preventiveActions: string[];
  confidence: number; // 0–1
  generatedAt: Date;
}

export interface RcaTemplate {
  method: RcaMethod;
  prompts: string[];
  categories?: CauseCategory[];
}
