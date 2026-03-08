// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export function getLocaleForCountry(countryCode: string): string {
  const locales: Record<string, string> = {
    SG: 'en-SG',
    AU: 'en-AU',
    NZ: 'en-NZ',
    MY: 'en-MY',
    ID: 'id-ID',
    TH: 'th-TH',
    PH: 'en-PH',
    VN: 'vi-VN',
    BN: 'ms-BN',
    MM: 'my-MM',
    KH: 'km-KH',
    LA: 'lo-LA',
    CN: 'zh-CN',
    JP: 'ja-JP',
    KR: 'ko-KR',
    HK: 'en-HK',
    TW: 'zh-TW',
    IN: 'en-IN',
    BD: 'bn-BD',
    LK: 'en-LK',
    FJ: 'en-FJ',
    PG: 'en-PG',
    AE: 'en-AE',
    SA: 'ar-SA',
  };
  return locales[countryCode] ?? 'en-US';
}
