// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface BarcodeResult {
  data: string;
  symbology: string;
  checkDigit?: number;
  encoded: string; // bar pattern as string of '1'/'0'
}

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  version?: number; // 1–10
}

export type BarcodeSymbology = 'CODE128' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'UPCA';
