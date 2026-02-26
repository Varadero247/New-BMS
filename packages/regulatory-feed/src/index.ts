// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export { REGULATORY_SOURCES, getSourcesByJurisdiction, getSourcesByCategory } from './sources';
export { calculateRelevance, filterRelevant } from './relevance';
export { RegulatoryFeedService } from './feed';
export type {
  Regulation,
  RegulatorySource,
  RelevanceScore,
  Jurisdiction,
  OrgProfile,
  ImportResult,
} from './types';
