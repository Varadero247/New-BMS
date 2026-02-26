// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type OtpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';
export interface TotpOptions { digits?: number; period?: number; algorithm?: OtpAlgorithm; }
export interface HotpOptions { digits?: number; algorithm?: OtpAlgorithm; }
export interface TotpSecret { base32: string; hex: string; bytes: Buffer; }
export interface TotpVerifyResult { valid: boolean; delta?: number; }
export interface ProvisioningUriOptions { issuer: string; accountName: string; algorithm?: OtpAlgorithm; digits?: number; period?: number; }
export interface BackupCode { code: string; used: boolean; }
