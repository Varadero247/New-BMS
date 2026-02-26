// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512';
export interface JwtHeader { alg: JwtAlgorithm; typ: 'JWT'; [key: string]: unknown; }
export interface JwtPayload {
  iss?: string; sub?: string; aud?: string | string[];
  exp?: number; nbf?: number; iat?: number; jti?: string;
  [key: string]: unknown;
}
export interface JwtParts { header: JwtHeader; payload: JwtPayload; signature: string; raw: string; }
export interface SignOptions {
  algorithm?: JwtAlgorithm; expiresIn?: number; notBefore?: number;
  issuer?: string; audience?: string | string[]; subject?: string; jwtid?: string;
}
export interface VerifyOptions {
  algorithms?: JwtAlgorithm[]; issuer?: string; audience?: string | string[];
  subject?: string; clockTolerance?: number; ignoreExpiration?: boolean;
}
export interface VerifyResult { valid: boolean; payload?: JwtPayload; error?: string; }
