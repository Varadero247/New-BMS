export type FilterOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'in' | 'not_in' | 'is_null' | 'is_not_null'
  | 'between' | 'regex';

export type LogicalOperator = 'AND' | 'OR' | 'NOT';
export type SortDirection = 'asc' | 'desc';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: unknown;
  value2?: unknown;  // for 'between'
  caseSensitive?: boolean;
}

export interface FilterGroup {
  logic: LogicalOperator;
  conditions?: FilterCondition[];
  groups?: FilterGroup[];
}

export interface SortSpec {
  field: string;
  direction: SortDirection;
}

export interface FilterQuery {
  filter?: FilterGroup;
  sort?: SortSpec[];
  limit?: number;
  offset?: number;
}

export interface FilterResult<T> {
  data: T[];
  total: number;
  filtered: number;
  hasMore: boolean;
}
