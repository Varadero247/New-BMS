// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type CompressionEncoding = 'gzip' | 'deflate' | 'brotli' | 'deflateRaw';

export interface CompressionOptions {
  level?: number;
  chunkSize?: number;
}

export interface CompressionResult {
  data: Buffer;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  encoding: CompressionEncoding;
}

export interface CompressionStats {
  encoding: CompressionEncoding;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  spaceSaved: number;
  spaceSavedPercent: number;
}
