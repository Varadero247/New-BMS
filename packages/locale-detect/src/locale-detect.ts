// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── ParsedLocale ────────────────────────────────────────────────────────────

export interface ParsedLocale {
  language: string;
  region?: string;
  script?: string;
  raw: string;
}

export function parseLocale(tag: string): ParsedLocale {
  const raw = tag;
  const parts = tag.replace(/_/g, '-').split('-');
  const language = (parts[0] || '').toLowerCase();
  let region: string | undefined;
  let script: string | undefined;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.length === 4 && /^[A-Za-z]{4}$/.test(part)) {
      // Script subtag: 4 letters, title-cased
      script = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    } else if (part.length === 2 && /^[A-Za-z]{2}$/.test(part)) {
      region = part.toUpperCase();
    } else if (part.length === 3 && /^[0-9]{3}$/.test(part)) {
      // UN numeric region — leave as-is
      region = part;
    }
  }

  return { language, ...(region ? { region } : {}), ...(script ? { script } : {}), raw };
}

export function normalizeLocale(tag: string): string {
  const p = parseLocale(tag);
  const parts: string[] = [p.language];
  if (p.script) parts.push(p.script);
  if (p.region) parts.push(p.region);
  return parts.join('-');
}

export function isValidLocale(tag: string): boolean {
  if (!tag) return false;
  const p = parseLocale(tag);
  if (!LANGUAGES[p.language]) return false;
  if (p.region && !COUNTRIES[p.region]) return false;
  return true;
}

// ─── Accept-Language ──────────────────────────────────────────────────────────

export interface LanguagePreference {
  locale: string;
  quality: number;
}

export function parseAcceptLanguage(header: string): LanguagePreference[] {
  if (!header || !header.trim()) return [];
  const entries = header.split(',').map(s => s.trim()).filter(Boolean);
  const result: LanguagePreference[] = [];
  for (const entry of entries) {
    const [localePart, qPart] = entry.split(';').map(s => s.trim());
    const locale = localePart.trim();
    let quality = 1.0;
    if (qPart) {
      const m = qPart.match(/q\s*=\s*([\d.]+)/i);
      if (m) quality = parseFloat(m[1]);
    }
    result.push({ locale, quality });
  }
  result.sort((a, b) => b.quality - a.quality);
  return result;
}

export function bestMatch(header: string, supported: string[]): string | undefined {
  const prefs = parseAcceptLanguage(header);
  for (const pref of prefs) {
    // exact match
    if (supported.includes(pref.locale)) return pref.locale;
    // language-only fallback
    const lang = pref.locale.split('-')[0].split('_')[0];
    const fallback = supported.find(s => s === lang || s.split('-')[0].toLowerCase() === lang.toLowerCase());
    if (fallback) return fallback;
  }
  return undefined;
}

// ─── UTC offset helpers ───────────────────────────────────────────────────────

export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseUtcOffset(str: string): number {
  const m = str.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!m) return 0;
  const sign = m[1] === '+' ? 1 : -1;
  const hours = parseInt(m[2], 10);
  const minutes = parseInt(m[3], 10);
  return sign * (hours * 60 + minutes);
}

// ─── Timezone info ────────────────────────────────────────────────────────────

export interface TimezoneInfo {
  name: string;
  abbreviation: string;
  utcOffset: number;
  utcOffsetStr: string;
  dst: boolean;
  regions: string[];
}

export const TIMEZONES: Record<string, TimezoneInfo> = {
  'UTC': {
    name: 'UTC', abbreviation: 'UTC', utcOffset: 0, utcOffsetStr: '+00:00', dst: false,
    regions: [],
  },
  'Europe/London': {
    name: 'Europe/London', abbreviation: 'GMT', utcOffset: 0, utcOffsetStr: '+00:00', dst: true,
    regions: ['GB'],
  },
  'Europe/Paris': {
    name: 'Europe/Paris', abbreviation: 'CET', utcOffset: 60, utcOffsetStr: '+01:00', dst: true,
    regions: ['FR', 'BE'],
  },
  'Europe/Berlin': {
    name: 'Europe/Berlin', abbreviation: 'CET', utcOffset: 60, utcOffsetStr: '+01:00', dst: true,
    regions: ['DE', 'AT'],
  },
  'America/New_York': {
    name: 'America/New_York', abbreviation: 'EST', utcOffset: -300, utcOffsetStr: '-05:00', dst: true,
    regions: ['US'],
  },
  'America/Chicago': {
    name: 'America/Chicago', abbreviation: 'CST', utcOffset: -360, utcOffsetStr: '-06:00', dst: true,
    regions: ['US'],
  },
  'America/Denver': {
    name: 'America/Denver', abbreviation: 'MST', utcOffset: -420, utcOffsetStr: '-07:00', dst: true,
    regions: ['US'],
  },
  'America/Los_Angeles': {
    name: 'America/Los_Angeles', abbreviation: 'PST', utcOffset: -480, utcOffsetStr: '-08:00', dst: true,
    regions: ['US'],
  },
  'America/Toronto': {
    name: 'America/Toronto', abbreviation: 'EST', utcOffset: -300, utcOffsetStr: '-05:00', dst: true,
    regions: ['CA'],
  },
  'America/Sao_Paulo': {
    name: 'America/Sao_Paulo', abbreviation: 'BRT', utcOffset: -180, utcOffsetStr: '-03:00', dst: false,
    regions: ['BR'],
  },
  'Asia/Dubai': {
    name: 'Asia/Dubai', abbreviation: 'GST', utcOffset: 240, utcOffsetStr: '+04:00', dst: false,
    regions: ['AE'],
  },
  'Asia/Kolkata': {
    name: 'Asia/Kolkata', abbreviation: 'IST', utcOffset: 330, utcOffsetStr: '+05:30', dst: false,
    regions: ['IN'],
  },
  'Asia/Tokyo': {
    name: 'Asia/Tokyo', abbreviation: 'JST', utcOffset: 540, utcOffsetStr: '+09:00', dst: false,
    regions: ['JP'],
  },
  'Asia/Shanghai': {
    name: 'Asia/Shanghai', abbreviation: 'CST', utcOffset: 480, utcOffsetStr: '+08:00', dst: false,
    regions: ['CN'],
  },
  'Asia/Singapore': {
    name: 'Asia/Singapore', abbreviation: 'SGT', utcOffset: 480, utcOffsetStr: '+08:00', dst: false,
    regions: ['SG'],
  },
  'Australia/Sydney': {
    name: 'Australia/Sydney', abbreviation: 'AEST', utcOffset: 600, utcOffsetStr: '+10:00', dst: true,
    regions: ['AU'],
  },
  'Pacific/Auckland': {
    name: 'Pacific/Auckland', abbreviation: 'NZST', utcOffset: 720, utcOffsetStr: '+12:00', dst: true,
    regions: ['NZ'],
  },
  'Africa/Cairo': {
    name: 'Africa/Cairo', abbreviation: 'EET', utcOffset: 120, utcOffsetStr: '+02:00', dst: false,
    regions: ['EG'],
  },
  'Asia/Riyadh': {
    name: 'Asia/Riyadh', abbreviation: 'AST', utcOffset: 180, utcOffsetStr: '+03:00', dst: false,
    regions: ['SA'],
  },
  'America/Mexico_City': {
    name: 'America/Mexico_City', abbreviation: 'CST', utcOffset: -360, utcOffsetStr: '-06:00', dst: true,
    regions: ['MX'],
  },
};

export function getTimezone(name: string): TimezoneInfo | undefined {
  return TIMEZONES[name];
}

export function listTimezones(): string[] {
  return Object.keys(TIMEZONES);
}

export function timezonesByOffset(offsetMinutes: number): string[] {
  return Object.values(TIMEZONES)
    .filter(tz => tz.utcOffset === offsetMinutes)
    .map(tz => tz.name);
}

export function guessTimezoneFromOffset(offsetMinutes: number): string {
  const matches = timezonesByOffset(offsetMinutes);
  return matches[0] ?? 'UTC';
}

// ─── Country info ─────────────────────────────────────────────────────────────

export interface CountryInfo {
  code: string;
  name: string;
  languages: string[];
  currency: string;
  timezone: string;
  callingCode: string;
  tld: string;
  continent: string;
  rtl: boolean;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  'GB': { code: 'GB', name: 'United Kingdom', languages: ['en'], currency: 'GBP', timezone: 'Europe/London', callingCode: '+44', tld: '.uk', continent: 'Europe', rtl: false },
  'US': { code: 'US', name: 'United States', languages: ['en'], currency: 'USD', timezone: 'America/New_York', callingCode: '+1', tld: '.us', continent: 'North America', rtl: false },
  'FR': { code: 'FR', name: 'France', languages: ['fr'], currency: 'EUR', timezone: 'Europe/Paris', callingCode: '+33', tld: '.fr', continent: 'Europe', rtl: false },
  'DE': { code: 'DE', name: 'Germany', languages: ['de'], currency: 'EUR', timezone: 'Europe/Berlin', callingCode: '+49', tld: '.de', continent: 'Europe', rtl: false },
  'ES': { code: 'ES', name: 'Spain', languages: ['es'], currency: 'EUR', timezone: 'Europe/Paris', callingCode: '+34', tld: '.es', continent: 'Europe', rtl: false },
  'IT': { code: 'IT', name: 'Italy', languages: ['it'], currency: 'EUR', timezone: 'Europe/Paris', callingCode: '+39', tld: '.it', continent: 'Europe', rtl: false },
  'PT': { code: 'PT', name: 'Portugal', languages: ['pt'], currency: 'EUR', timezone: 'Europe/London', callingCode: '+351', tld: '.pt', continent: 'Europe', rtl: false },
  'NL': { code: 'NL', name: 'Netherlands', languages: ['nl'], currency: 'EUR', timezone: 'Europe/Paris', callingCode: '+31', tld: '.nl', continent: 'Europe', rtl: false },
  'BE': { code: 'BE', name: 'Belgium', languages: ['nl', 'fr'], currency: 'EUR', timezone: 'Europe/Paris', callingCode: '+32', tld: '.be', continent: 'Europe', rtl: false },
  'CH': { code: 'CH', name: 'Switzerland', languages: ['de', 'fr', 'it'], currency: 'CHF', timezone: 'Europe/Paris', callingCode: '+41', tld: '.ch', continent: 'Europe', rtl: false },
  'AT': { code: 'AT', name: 'Austria', languages: ['de'], currency: 'EUR', timezone: 'Europe/Berlin', callingCode: '+43', tld: '.at', continent: 'Europe', rtl: false },
  'SE': { code: 'SE', name: 'Sweden', languages: ['sv'], currency: 'SEK', timezone: 'Europe/Paris', callingCode: '+46', tld: '.se', continent: 'Europe', rtl: false },
  'NO': { code: 'NO', name: 'Norway', languages: ['no'], currency: 'NOK', timezone: 'Europe/Paris', callingCode: '+47', tld: '.no', continent: 'Europe', rtl: false },
  'DK': { code: 'DK', name: 'Denmark', languages: ['da'], currency: 'DKK', timezone: 'Europe/Paris', callingCode: '+45', tld: '.dk', continent: 'Europe', rtl: false },
  'FI': { code: 'FI', name: 'Finland', languages: ['fi'], currency: 'EUR', timezone: 'Europe/Paris', callingCode: '+358', tld: '.fi', continent: 'Europe', rtl: false },
  'AU': { code: 'AU', name: 'Australia', languages: ['en'], currency: 'AUD', timezone: 'Australia/Sydney', callingCode: '+61', tld: '.au', continent: 'Oceania', rtl: false },
  'CA': { code: 'CA', name: 'Canada', languages: ['en', 'fr'], currency: 'CAD', timezone: 'America/Toronto', callingCode: '+1', tld: '.ca', continent: 'North America', rtl: false },
  'NZ': { code: 'NZ', name: 'New Zealand', languages: ['en'], currency: 'NZD', timezone: 'Pacific/Auckland', callingCode: '+64', tld: '.nz', continent: 'Oceania', rtl: false },
  'JP': { code: 'JP', name: 'Japan', languages: ['ja'], currency: 'JPY', timezone: 'Asia/Tokyo', callingCode: '+81', tld: '.jp', continent: 'Asia', rtl: false },
  'CN': { code: 'CN', name: 'China', languages: ['zh'], currency: 'CNY', timezone: 'Asia/Shanghai', callingCode: '+86', tld: '.cn', continent: 'Asia', rtl: false },
  'KR': { code: 'KR', name: 'South Korea', languages: ['ko'], currency: 'KRW', timezone: 'Asia/Tokyo', callingCode: '+82', tld: '.kr', continent: 'Asia', rtl: false },
  'IN': { code: 'IN', name: 'India', languages: ['hi', 'en'], currency: 'INR', timezone: 'Asia/Kolkata', callingCode: '+91', tld: '.in', continent: 'Asia', rtl: false },
  'BR': { code: 'BR', name: 'Brazil', languages: ['pt'], currency: 'BRL', timezone: 'America/Sao_Paulo', callingCode: '+55', tld: '.br', continent: 'South America', rtl: false },
  'MX': { code: 'MX', name: 'Mexico', languages: ['es'], currency: 'MXN', timezone: 'America/Mexico_City', callingCode: '+52', tld: '.mx', continent: 'North America', rtl: false },
  'AR': { code: 'AR', name: 'Argentina', languages: ['es'], currency: 'ARS', timezone: 'America/Sao_Paulo', callingCode: '+54', tld: '.ar', continent: 'South America', rtl: false },
  'ZA': { code: 'ZA', name: 'South Africa', languages: ['en'], currency: 'ZAR', timezone: 'Africa/Cairo', callingCode: '+27', tld: '.za', continent: 'Africa', rtl: false },
  'AE': { code: 'AE', name: 'United Arab Emirates', languages: ['ar'], currency: 'AED', timezone: 'Asia/Dubai', callingCode: '+971', tld: '.ae', continent: 'Asia', rtl: true },
  'SA': { code: 'SA', name: 'Saudi Arabia', languages: ['ar'], currency: 'SAR', timezone: 'Asia/Riyadh', callingCode: '+966', tld: '.sa', continent: 'Asia', rtl: true },
  'EG': { code: 'EG', name: 'Egypt', languages: ['ar'], currency: 'EGP', timezone: 'Africa/Cairo', callingCode: '+20', tld: '.eg', continent: 'Africa', rtl: true },
  'SG': { code: 'SG', name: 'Singapore', languages: ['en', 'zh'], currency: 'SGD', timezone: 'Asia/Singapore', callingCode: '+65', tld: '.sg', continent: 'Asia', rtl: false },
  'PL': { code: 'PL', name: 'Poland', languages: ['pl'], currency: 'PLN', timezone: 'Europe/Paris', callingCode: '+48', tld: '.pl', continent: 'Europe', rtl: false },
  'RU': { code: 'RU', name: 'Russia', languages: ['ru'], currency: 'RUB', timezone: 'Europe/Paris', callingCode: '+7', tld: '.ru', continent: 'Europe', rtl: false },
};

export function getCountry(code: string): CountryInfo | undefined {
  return COUNTRIES[code];
}

export function listCountries(): string[] {
  return Object.keys(COUNTRIES);
}

export function countriesByLanguage(langCode: string): string[] {
  return Object.values(COUNTRIES)
    .filter(c => c.languages.includes(langCode))
    .map(c => c.code);
}

export function countriesByContinent(continent: string): string[] {
  return Object.values(COUNTRIES)
    .filter(c => c.continent === continent)
    .map(c => c.code);
}

// ─── Language info ────────────────────────────────────────────────────────────

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  script: string;
  speakers: number;
}

export const LANGUAGES: Record<string, LanguageInfo> = {
  'en': { code: 'en', name: 'English', nativeName: 'English', rtl: false, script: 'Latin', speakers: 1132000000 },
  'fr': { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, script: 'Latin', speakers: 280000000 },
  'de': { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, script: 'Latin', speakers: 132000000 },
  'es': { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, script: 'Latin', speakers: 485000000 },
  'it': { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, script: 'Latin', speakers: 67000000 },
  'pt': { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, script: 'Latin', speakers: 236000000 },
  'nl': { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false, script: 'Latin', speakers: 24000000 },
  'sv': { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false, script: 'Latin', speakers: 13000000 },
  'no': { code: 'no', name: 'Norwegian', nativeName: 'Norsk', rtl: false, script: 'Latin', speakers: 5000000 },
  'da': { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false, script: 'Latin', speakers: 6000000 },
  'fi': { code: 'fi', name: 'Finnish', nativeName: 'Suomi', rtl: false, script: 'Latin', speakers: 5000000 },
  'ja': { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, script: 'Japanese', speakers: 128000000 },
  'zh': { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, script: 'Han', speakers: 1200000000 },
  'ko': { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false, script: 'Hangul', speakers: 77000000 },
  'ar': { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, script: 'Arabic', speakers: 422000000 },
  'he': { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true, script: 'Hebrew', speakers: 9000000 },
  'ru': { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, script: 'Cyrillic', speakers: 258000000 },
  'pl': { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false, script: 'Latin', speakers: 45000000 },
  'tr': { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false, script: 'Latin', speakers: 75000000 },
  'id': { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false, script: 'Latin', speakers: 199000000 },
  'hi': { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, script: 'Devanagari', speakers: 600000000 },
  'th': { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false, script: 'Thai', speakers: 61000000 },
  'vi': { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false, script: 'Latin', speakers: 85000000 },
  'uk': { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', rtl: false, script: 'Cyrillic', speakers: 40000000 },
  'cs': { code: 'cs', name: 'Czech', nativeName: 'Čeština', rtl: false, script: 'Latin', speakers: 10000000 },
};

export function getLanguage(code: string): LanguageInfo | undefined {
  return LANGUAGES[code];
}

export function listLanguages(): string[] {
  return Object.keys(LANGUAGES);
}

export function isRTL(localeOrCode: string): boolean {
  const lang = localeOrCode.split('-')[0].split('_')[0].toLowerCase();
  return LANGUAGES[lang]?.rtl ?? false;
}

export function getScript(localeOrCode: string): string | undefined {
  const lang = localeOrCode.split('-')[0].split('_')[0].toLowerCase();
  return LANGUAGES[lang]?.script;
}

// ─── Currency info ────────────────────────────────────────────────────────────

export interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  countries: string[];
}

export const CURRENCIES: Record<string, CurrencyData> = {
  'GBP': { code: 'GBP', name: 'British Pound Sterling', symbol: '£', decimals: 2, countries: ['GB'] },
  'USD': { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, countries: ['US'] },
  'EUR': { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, countries: ['FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'AT', 'FI', 'PT'] },
  'JPY': { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, countries: ['JP'] },
  'CNY': { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, countries: ['CN'] },
  'INR': { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, countries: ['IN'] },
  'CAD': { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, countries: ['CA'] },
  'AUD': { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, countries: ['AU'] },
  'CHF': { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, countries: ['CH'] },
  'SEK': { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, countries: ['SE'] },
  'NOK': { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, countries: ['NO'] },
  'DKK': { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, countries: ['DK'] },
  'SGD': { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, countries: ['SG'] },
  'AED': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, countries: ['AE'] },
  'SAR': { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2, countries: ['SA'] },
  'BRL': { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, countries: ['BR'] },
  'MXN': { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2, countries: ['MX'] },
  'ZAR': { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, countries: ['ZA'] },
  'KRW': { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, countries: ['KR'] },
  'TRY': { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, countries: ['TR'] },
};

export function getCurrency(code: string): CurrencyData | undefined {
  return CURRENCIES[code];
}

export function currencyForCountry(countryCode: string): CurrencyData | undefined {
  const country = COUNTRIES[countryCode];
  if (!country) return undefined;
  return CURRENCIES[country.currency];
}

export function listCurrencies(): string[] {
  return Object.keys(CURRENCIES);
}

// ─── Detection ────────────────────────────────────────────────────────────────

export interface DetectedLocale {
  locale: string;
  confidence: number;
  source: 'accept-language' | 'ip-country' | 'default';
}

export function detectFromHeaders(
  headers: Record<string, string>,
  supported: string[],
  defaultLocale = 'en'
): DetectedLocale {
  // Try Accept-Language first
  const acceptLang = headers['accept-language'] || headers['Accept-Language'];
  if (acceptLang) {
    const match = bestMatch(acceptLang, supported);
    if (match) {
      const prefs = parseAcceptLanguage(acceptLang);
      const quality = prefs.find(p => p.locale === match || p.locale.split('-')[0] === match.split('-')[0])?.quality ?? 0.5;
      return { locale: match, confidence: quality, source: 'accept-language' };
    }
  }

  // Try CF-IPCountry or X-Country-Code header
  const countryCode = headers['cf-ipcountry'] || headers['x-country-code'] || headers['CF-IPCountry'] || headers['X-Country-Code'];
  if (countryCode) {
    const country = COUNTRIES[countryCode.toUpperCase()];
    if (country) {
      const lang = country.languages[0];
      const locale = supported.find(s => s.startsWith(lang)) ?? (supported.includes(lang) ? lang : undefined);
      if (locale) {
        return { locale, confidence: 0.6, source: 'ip-country' };
      }
    }
  }

  // Default
  const def = supported.includes(defaultLocale) ? defaultLocale : (supported[0] ?? defaultLocale);
  return { locale: def, confidence: 0.1, source: 'default' };
}
