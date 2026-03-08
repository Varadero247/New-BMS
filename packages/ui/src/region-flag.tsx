// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React from 'react';

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', MY: '🇲🇾', ID: '🇮🇩',
  TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', JP: '🇯🇵', KR: '🇰🇷',
  HK: '🇭🇰', TW: '🇹🇼', CN: '🇨🇳', IN: '🇮🇳', BD: '🇧🇩',
  LK: '🇱🇰', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦', BN: '🇧🇳',
  FJ: '🇫🇯', PG: '🇵🇬', AE: '🇦🇪', SA: '🇸🇦',
  GB: '🇬🇧', US: '🇺🇸', EU: '🇪🇺', DE: '🇩🇪', FR: '🇫🇷',
};

export interface RegionFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCode?: boolean;
}

export function RegionFlag({ countryCode, size = 'md', className = '', showCode = false }: RegionFlagProps) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl', xl: 'text-5xl' };
  const emoji = FLAG_EMOJIS[countryCode.toUpperCase()] ?? '\uD83C\uDFF3\uFE0F';
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={sizes[size]} role="img" aria-label={`${countryCode} flag`}>{emoji}</span>
      {showCode && <span className="text-xs font-mono text-gray-500">{countryCode}</span>}
    </span>
  );
}
