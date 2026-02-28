export type DataSensitivity = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET';
export type LegalBasis = 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS';
export type ConsentStatus = 'GIVEN' | 'WITHDRAWN' | 'PENDING' | 'EXPIRED';
export type PIICategory = 'NAME' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'DOB' | 'SSN' | 'FINANCIAL' | 'HEALTH' | 'BIOMETRIC' | 'LOCATION';

export interface ConsentRecord {
  id: string;
  subjectId: string;
  purpose: string;
  legalBasis: LegalBasis;
  status: ConsentStatus;
  givenAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  version: string;
}

export interface DataAsset {
  id: string;
  name: string;
  sensitivity: DataSensitivity;
  piiCategories: PIICategory[];
  retentionDays: number;
  encryptionRequired: boolean;
  owner: string;
  createdAt: Date;
}

export interface PIIField {
  field: string;
  category: PIICategory;
  masked: boolean;
  pattern: RegExp;
}
