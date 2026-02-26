// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export interface DeveloperApp {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  clientId: string;
  clientSecretHash: string;
  redirectUris: string[];
  scopes: string[];
  sandboxApiKey?: string;
  productionApiKey?: string;
  status: 'sandbox' | 'production' | 'suspended';
  createdAt: Date;
  lastUsedAt?: Date;
  rateLimitPerMin: number;
}

export interface ApiEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: Record<string, unknown>[];
  requestBody?: Record<string, unknown>;
  responses: Record<string, { description: string; schema?: Record<string, unknown> }>;
  auth: boolean;
  deprecated: boolean;
  examples?: Record<string, unknown>[];
}

export interface CodeExample {
  language: 'typescript' | 'python' | 'curl' | 'go' | 'php';
  title: string;
  code: string;
  endpoint: string;
}
