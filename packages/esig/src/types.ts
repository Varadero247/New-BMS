export interface ElectronicSignature {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  meaning: SignatureMeaning;
  reason: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  resourceType: string;
  resourceId: string;
  resourceRef: string;
  auditEntryId?: string;
  checksum: string;
  valid: boolean;
}

export type SignatureMeaning =
  | 'APPROVED'
  | 'REVIEWED'
  | 'RELEASED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'WITNESSED'
  | 'AUTHORED'
  | 'ACKNOWLEDGED';

export interface SignatureRequest {
  userId: string;
  userEmail: string;
  userFullName: string;
  password: string;
  meaning: SignatureMeaning;
  reason: string;
  resourceType: string;
  resourceId: string;
  resourceRef: string;
  ipAddress: string;
  userAgent: string;
}

export interface SignatureVerification {
  signatureId: string;
  valid: boolean;
  checksumMatch: boolean;
  userId: string;
  userEmail: string;
  meaning: string;
  timestamp: Date;
  resourceType: string;
  resourceId: string;
}

export interface ChangeDetail {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface EnhancedAuditEntry {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceRef: string;
  changes: ChangeDetail[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: Date;
  esignatureId?: string;
  systemVersion: string;
  checksum: string;
}
