export type AuditAction =
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT'
  | 'APPROVE' | 'REJECT' | 'SIGN' | 'ARCHIVE';

export type AuditCategory =
  | 'auth' | 'data' | 'document' | 'user' | 'system' | 'compliance' | 'financial';

export interface AuditEntry {
  id: string;
  sequence: number;
  action: AuditAction;
  category: AuditCategory;
  userId: string;
  resourceType: string;
  resourceId: string;
  previousHash: string;
  hash: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AuditChain {
  entries: AuditEntry[];
  headHash: string;
  length: number;
  createdAt: string;
}

export interface ChainVerificationResult {
  valid: boolean;
  checkedEntries: number;
  firstInvalidIndex: number | null;
  errors: string[];
}

export interface AuditFilter {
  userId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  resourceType?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
}
