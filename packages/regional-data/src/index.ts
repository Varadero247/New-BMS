// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Existing exports — kept intact
export * from './types/region.types';
export * from './types/trade.types';
export * from './utils/currency';
export * from './utils/date-format';
export * from './utils/locale';
export { SG } from './data/countries/SG';
export { AU } from './data/countries/AU';
export { NZ } from './data/countries/NZ';
export { MY } from './data/countries/MY';
export { ID } from './data/countries/ID';
export { TH } from './data/countries/TH';
export { PH } from './data/countries/PH';
export { VN } from './data/countries/VN';
export { BN } from './data/countries/BN';
export { MM } from './data/countries/MM';
export { KH } from './data/countries/KH';
export { LA } from './data/countries/LA';
export { CN } from './data/countries/CN';
export { JP } from './data/countries/JP';
export { KR } from './data/countries/KR';
export { HK } from './data/countries/HK';
export { TW } from './data/countries/TW';
export { IN } from './data/countries/IN';
export { BD } from './data/countries/BD';
export { LK } from './data/countries/LK';
export { FJ } from './data/countries/FJ';
export { PG } from './data/countries/PG';
export { AE } from './data/countries/AE';
export { SA } from './data/countries/SA';
export { tradeAgreements } from './data/trade-agreements/index';
export { isoLegislationMappings } from './data/iso-mappings/legislation-to-iso';
export type { IsoLegislationMapping } from './data/iso-mappings/legislation-to-iso';

import { SG } from './data/countries/SG';
import { AU } from './data/countries/AU';
import { NZ } from './data/countries/NZ';
import { MY } from './data/countries/MY';
import { ID } from './data/countries/ID';
import { TH } from './data/countries/TH';
import { PH } from './data/countries/PH';
import { VN } from './data/countries/VN';
import { BN } from './data/countries/BN';
import { MM } from './data/countries/MM';
import { KH } from './data/countries/KH';
import { LA } from './data/countries/LA';
import { CN } from './data/countries/CN';
import { JP } from './data/countries/JP';
import { KR } from './data/countries/KR';
import { HK } from './data/countries/HK';
import { TW } from './data/countries/TW';
import { IN } from './data/countries/IN';
import { BD } from './data/countries/BD';
import { LK } from './data/countries/LK';
import { FJ } from './data/countries/FJ';
import { PG } from './data/countries/PG';
import { AE } from './data/countries/AE';
import { SA } from './data/countries/SA';
import type { CountryData } from './types/region.types';

export const allCountries: CountryData[] = [
  SG, AU, NZ, MY, ID, TH, PH, VN, BN, MM, KH, LA,
  CN, JP, KR, HK, TW, IN, BD, LK, FJ, PG, AE, SA,
];

export function getCountryByCode(code: string): CountryData | undefined {
  return allCountries.find((c) => c.code === code);
}

// ─── Rich Region Config types ────────────────────────────────────────────────
export * from './types/region-config.types';

// ─── Rich Region Config data (20 countries) ──────────────────────────────────
export { sg } from './regions/sg';
export { au as auConfig } from './regions/au';
export { nz } from './regions/nz';
export { my } from './regions/my';
export { id as idConfig } from './regions/id';
export { th } from './regions/th';
export { vn } from './regions/vn';
export { ph } from './regions/ph';
export { jp } from './regions/jp';
export { kr } from './regions/kr';
export { hk } from './regions/hk';
export { tw } from './regions/tw';
export { cn } from './regions/cn';
export { india } from './regions/in_config';
export { bd } from './regions/bd';
export { lk } from './regions/lk';
export { mm } from './regions/mm';
export { kh } from './regions/kh';
export { la } from './regions/la';
export { bn } from './regions/bn';

// ─── Utility functions ────────────────────────────────────────────────────────
// Note: formatCurrency from currency-formatter is exported as formatRegionCurrency
// to avoid conflict with the existing formatCurrency from ./utils/currency
export { parseCurrency, convertCurrency } from './utils/currency-formatter';
export { formatCurrency as formatRegionCurrency } from './utils/currency-formatter';
export * from './utils/date-formatter';
export * from './utils/tax-calculator';
export * from './utils/legislation-matcher';
export * from './utils/comparison';

// ─── Aggregate array and lookup ───────────────────────────────────────────────
import { sg } from './regions/sg';
import { au as auConfig } from './regions/au';
import { nz } from './regions/nz';
import { my } from './regions/my';
import { id as idConfig } from './regions/id';
import { th } from './regions/th';
import { vn } from './regions/vn';
import { ph } from './regions/ph';
import { jp } from './regions/jp';
import { kr } from './regions/kr';
import { hk } from './regions/hk';
import { tw } from './regions/tw';
import { cn } from './regions/cn';
import { india } from './regions/in_config';
import { bd } from './regions/bd';
import { lk } from './regions/lk';
import { mm } from './regions/mm';
import { kh } from './regions/kh';
import { la } from './regions/la';
import { bn } from './regions/bn';
import type { RegionConfig } from './types/region-config.types';

export const allRegionConfigs: RegionConfig[] = [
  sg, auConfig, nz, my, idConfig, th, vn, ph, jp, kr,
  hk, tw, cn, india, bd, lk, mm, kh, la, bn,
];

export function getRegionConfig(countryCode: string): RegionConfig | undefined {
  return allRegionConfigs.find((r) => r.countryCode === countryCode);
}
