// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface SlugOptions {
  separator?: string;
  lowercase?: boolean;
  trim?: boolean;
  transliterate?: boolean;
  maxLength?: number;
  strict?: boolean;
}

export interface SlugifyResult {
  slug: string;
  original: string;
  changed: boolean;
}
