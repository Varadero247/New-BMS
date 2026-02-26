// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';

export interface StatusInfo {
  code: number;
  text: string;
  category: 'informational' | 'success' | 'redirection' | 'client-error' | 'server-error';
}

export interface ParsedUrl {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
}

export interface RequestOptions {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface ContentType {
  type: string;
  subtype: string;
  parameters: Record<string, string>;
}
