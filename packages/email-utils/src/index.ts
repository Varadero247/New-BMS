// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type { ParsedEmail, EmailValidationResult, EmailParts } from './types';

export {
  // Validation
  isValidEmail,
  validateEmail,
  isDisposable,
  isFreeProvider,
  isCorporate,
  isRole,
  // Parsing
  parseEmail,
  extractEmails,
  parseEmailList,
  getLocal,
  getDomain,
  getDomainFromEmail,
  getTLD,
  // Normalization
  normalizeEmail,
  normalizeEmailLoose,
  stripAlias,
  areEquivalent,
  formatEmail,
  // Generation
  generateEmail,
  generateEmailList,
  // Domain utilities
  FREE_PROVIDERS,
  getProviderType,
  // Obfuscation
  obfuscateEmail,
  maskEmail,
} from './email-utils';
