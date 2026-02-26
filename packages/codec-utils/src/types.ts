// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface EncodingOptions {
  charset?: BufferEncoding;
  strict?: boolean;
}

export type Base64Variant = 'standard' | 'url-safe' | 'url-safe-no-padding';

export interface HexOptions {
  uppercase?: boolean;
  separator?: string;
}

export type HashAlgorithm = 'sha256' | 'sha512' | 'sha1' | 'md5';

export interface ChecksumOptions {
  algorithm?: 'crc32';
  encoding?: 'hex' | 'decimal';
}
