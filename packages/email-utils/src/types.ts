// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface ParsedEmail {
  local: string;           // part before @
  domain: string;          // part after @
  tld: string;             // top-level domain
  subdomain?: string;      // subdomain if present
  displayName?: string;    // from "Name <email>" format
  raw: string;             // original input
}

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
  normalized?: string;
}

export interface EmailParts {
  local: string;
  domain: string;
}
