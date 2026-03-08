// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export function getDateFormat(countryCode: string): string {
  const formats: Record<string, string> = {
    US: 'MM/DD/YYYY',
    JP: 'YYYY/MM/DD',
    CN: 'YYYY-MM-DD',
    KR: 'YYYY.MM.DD',
  };
  return formats[countryCode] ?? 'DD/MM/YYYY';
}
