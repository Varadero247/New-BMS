// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type PortalType = 'customer' | 'supplier';

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  organisationId: string;
  organisationName: string;
  portalType: PortalType;
  permissions: string[];
}

export interface PortalToken {
  id: string;
  email: string;
  organisationId: string;
  portalType: PortalType;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface PortalAuthConfig {
  secret?: string;
  expiresIn?: string;
  issuer?: string;
}

export interface PortalRequest {
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
  portalUser?: PortalUser;
}

export interface PortalResponse {
  status: (code: number) => PortalResponse;
  json: (body: unknown) => void;
}

export type NextFunction = (err?: unknown) => void;
