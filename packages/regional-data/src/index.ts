// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

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
