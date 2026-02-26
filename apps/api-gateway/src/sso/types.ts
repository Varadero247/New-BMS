// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface SetupStep {
  stepNumber: number;
  title: string;
  description: string;
  screenshotHint?: string;
  copyableValues?: Record<string, string>;
}

export interface ProviderSetupGuide {
  provider: string;
  estimatedMinutes: number;
  adminConsoleUrl: string;
  steps: SetupStep[];
  nexaraValues: {
    entityId: string;
    acsUrl: string;
    sloUrl: string;
    metadataUrl: string;
  };
  attributeDefaults: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ParsedSSOConfig {
  type: 'SAML' | 'OIDC';
  entityId?: string;
  ssoUrl?: string;
  certificate?: string;
  sloUrl?: string;
  issuer?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  validUntil?: Date;
  warnings: string[];
}

export interface SSOWizardSession {
  sessionId: string;
  orgId: string;
  provider?: string;
  parsedConfig?: ParsedSSOConfig;
  testResult?: {
    success: boolean;
    attributes: Record<string, string>;
    timestamp: Date;
  };
  attributeMapping?: {
    emailAttr: string;
    firstNameAttr: string;
    lastNameAttr: string;
    roleAttr?: string;
    groupAttr?: string;
  };
  status: 'STARTED' | 'PROVIDER_SELECTED' | 'METADATA_PARSED' | 'TESTED' | 'MAPPED' | 'ACTIVATED';
  expiresAt: Date;
}
