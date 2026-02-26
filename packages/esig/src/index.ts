// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Types
export type {
  ElectronicSignature,
  SignatureMeaning,
  SignatureRequest,
  SignatureVerification,
  ChangeDetail,
  EnhancedAuditEntry,
} from './types';

// Signature operations
export { createSignature, verifySignature, isValidMeaning, getValidMeanings } from './signature';

// Checksum utilities
export {
  computeAuditChecksum,
  verifyAuditChecksum,
  computeSignatureChecksum,
  verifySignatureChecksum,
  computeChanges,
} from './checksum';
