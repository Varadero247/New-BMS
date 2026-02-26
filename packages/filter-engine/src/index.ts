// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type {
  FilterCondition,
  FilterGroup,
  FilterOperator,
  FilterQuery,
  FilterResult,
  LogicalOperator,
  SortDirection,
  SortSpec,
} from './types';

export {
  applyFilter,
  applyPagination,
  applySort,
  countMatches,
  evaluateCondition,
  evaluateGroup,
  isValidLogic,
  isValidOperator,
  isValidSortDirection,
  makeCondition,
  makeGroup,
  query,
} from './engine';
