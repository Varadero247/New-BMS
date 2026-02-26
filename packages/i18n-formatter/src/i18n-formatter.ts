// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Supported locales
// ---------------------------------------------------------------------------
export type Locale =
  | 'en-GB' | 'en-US' | 'en-AU' | 'en-CA'
  | 'fr-FR' | 'fr-CA'
  | 'de-DE' | 'de-AT' | 'de-CH'
  | 'es-ES' | 'es-MX' | 'es-AR'
  | 'it-IT'
  | 'pt-PT' | 'pt-BR'
  | 'nl-NL'
  | 'sv-SE' | 'no-NO' | 'da-DK' | 'fi-FI'
  | 'ja-JP' | 'zh-CN' | 'zh-TW' | 'ko-KR'
  | 'ar-SA' | 'he-IL'
  | 'ru-RU' | 'pl-PL'
  | 'tr-TR' | 'id-ID';

// ---------------------------------------------------------------------------
// Locale number format config
// ---------------------------------------------------------------------------
interface LocaleNumberConfig {
  groupSep: string;
  decimalSep: string;
}

const LOCALE_NUMBER_CONFIG: Record<Locale, LocaleNumberConfig> = {
  'en-GB': { groupSep: ',', decimalSep: '.' },
  'en-US': { groupSep: ',', decimalSep: '.' },
  'en-AU': { groupSep: ',', decimalSep: '.' },
  'en-CA': { groupSep: ',', decimalSep: '.' },
  'fr-FR': { groupSep: '\u00a0', decimalSep: ',' },
  'fr-CA': { groupSep: '\u00a0', decimalSep: ',' },
  'de-DE': { groupSep: '.', decimalSep: ',' },
  'de-AT': { groupSep: '.', decimalSep: ',' },
  'de-CH': { groupSep: "'", decimalSep: '.' },
  'es-ES': { groupSep: '.', decimalSep: ',' },
  'es-MX': { groupSep: ',', decimalSep: '.' },
  'es-AR': { groupSep: '.', decimalSep: ',' },
  'it-IT': { groupSep: '.', decimalSep: ',' },
  'pt-PT': { groupSep: '.', decimalSep: ',' },
  'pt-BR': { groupSep: '.', decimalSep: ',' },
  'nl-NL': { groupSep: '.', decimalSep: ',' },
  'sv-SE': { groupSep: '\u00a0', decimalSep: ',' },
  'no-NO': { groupSep: '\u00a0', decimalSep: ',' },
  'da-DK': { groupSep: '.', decimalSep: ',' },
  'fi-FI': { groupSep: '\u00a0', decimalSep: ',' },
  'ja-JP': { groupSep: ',', decimalSep: '.' },
  'zh-CN': { groupSep: ',', decimalSep: '.' },
  'zh-TW': { groupSep: ',', decimalSep: '.' },
  'ko-KR': { groupSep: ',', decimalSep: '.' },
  'ar-SA': { groupSep: ',', decimalSep: '.' },
  'he-IL': { groupSep: ',', decimalSep: '.' },
  'ru-RU': { groupSep: '\u00a0', decimalSep: ',' },
  'pl-PL': { groupSep: '\u00a0', decimalSep: ',' },
  'tr-TR': { groupSep: '.', decimalSep: ',' },
  'id-ID': { groupSep: '.', decimalSep: ',' },
};

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------
export interface NumberFormatOptions {
  decimals?: number;
  groupSeparator?: string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
}

export function formatNumber(value: number, locale: Locale, opts?: NumberFormatOptions): string {
  const cfg = LOCALE_NUMBER_CONFIG[locale];
  const groupSep = opts?.groupSeparator !== undefined ? opts.groupSeparator : cfg.groupSep;
  const decSep = opts?.decimalSeparator !== undefined ? opts.decimalSeparator : cfg.decimalSep;
  const decimals = opts?.decimals !== undefined ? opts.decimals : 2;

  const isNeg = value < 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals);
  const [intPart, fracPart] = fixed.split('.');

  // Insert group separators every 3 digits from the right
  let grouped = '';
  const intDigits = intPart;
  for (let i = 0; i < intDigits.length; i++) {
    if (i > 0 && (intDigits.length - i) % 3 === 0) {
      grouped += groupSep;
    }
    grouped += intDigits[i];
  }

  let result = grouped;
  if (decimals > 0 && fracPart !== undefined) {
    result += decSep + fracPart;
  }
  if (isNeg) result = '-' + result;
  if (opts?.prefix) result = opts.prefix + result;
  if (opts?.suffix) result = result + opts.suffix;
  return result;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
export interface CurrencyFormatOptions {
  decimals?: number;
  symbol?: string;
  symbolPosition?: 'before' | 'after';
}

export const LOCALE_CURRENCY: Record<Locale, { code: string; symbol: string; decimals: number }> = {
  'en-GB': { code: 'GBP', symbol: '£', decimals: 2 },
  'en-US': { code: 'USD', symbol: '$', decimals: 2 },
  'en-AU': { code: 'AUD', symbol: 'A$', decimals: 2 },
  'en-CA': { code: 'CAD', symbol: 'C$', decimals: 2 },
  'fr-FR': { code: 'EUR', symbol: '€', decimals: 2 },
  'fr-CA': { code: 'CAD', symbol: 'C$', decimals: 2 },
  'de-DE': { code: 'EUR', symbol: '€', decimals: 2 },
  'de-AT': { code: 'EUR', symbol: '€', decimals: 2 },
  'de-CH': { code: 'CHF', symbol: 'CHF', decimals: 2 },
  'es-ES': { code: 'EUR', symbol: '€', decimals: 2 },
  'es-MX': { code: 'MXN', symbol: '$', decimals: 2 },
  'es-AR': { code: 'ARS', symbol: '$', decimals: 2 },
  'it-IT': { code: 'EUR', symbol: '€', decimals: 2 },
  'pt-PT': { code: 'EUR', symbol: '€', decimals: 2 },
  'pt-BR': { code: 'BRL', symbol: 'R$', decimals: 2 },
  'nl-NL': { code: 'EUR', symbol: '€', decimals: 2 },
  'sv-SE': { code: 'SEK', symbol: 'kr', decimals: 2 },
  'no-NO': { code: 'NOK', symbol: 'kr', decimals: 2 },
  'da-DK': { code: 'DKK', symbol: 'kr', decimals: 2 },
  'fi-FI': { code: 'EUR', symbol: '€', decimals: 2 },
  'ja-JP': { code: 'JPY', symbol: '¥', decimals: 0 },
  'zh-CN': { code: 'CNY', symbol: '¥', decimals: 2 },
  'zh-TW': { code: 'TWD', symbol: 'NT$', decimals: 2 },
  'ko-KR': { code: 'KRW', symbol: '₩', decimals: 0 },
  'ar-SA': { code: 'SAR', symbol: 'ر.س', decimals: 2 },
  'he-IL': { code: 'ILS', symbol: '₪', decimals: 2 },
  'ru-RU': { code: 'RUB', symbol: '₽', decimals: 2 },
  'pl-PL': { code: 'PLN', symbol: 'zł', decimals: 2 },
  'tr-TR': { code: 'TRY', symbol: '₺', decimals: 2 },
  'id-ID': { code: 'IDR', symbol: 'Rp', decimals: 0 },
};

// Locales where symbol goes after the number
const SYMBOL_AFTER_LOCALES = new Set<Locale>([
  'fr-FR', 'fr-CA', 'de-DE', 'de-AT',
  'es-ES', 'it-IT', 'pt-PT', 'nl-NL',
  'sv-SE', 'no-NO', 'da-DK', 'fi-FI',
  'ru-RU', 'pl-PL', 'tr-TR',
]);

export function formatCurrency(value: number, locale: Locale, opts?: CurrencyFormatOptions): string {
  const currencyInfo = LOCALE_CURRENCY[locale];
  const decimals = opts?.decimals !== undefined ? opts.decimals : currencyInfo.decimals;
  const symbol = opts?.symbol !== undefined ? opts.symbol : currencyInfo.symbol;
  const isAfter = opts?.symbolPosition !== undefined
    ? opts.symbolPosition === 'after'
    : SYMBOL_AFTER_LOCALES.has(locale);

  const numStr = formatNumber(value, locale, { decimals });
  if (isAfter) {
    return numStr + '\u00a0' + symbol;
  }
  return symbol + numStr;
}

// ---------------------------------------------------------------------------
// Percentage
// ---------------------------------------------------------------------------
export function formatPercent(value: number, locale: Locale, decimals?: number): string {
  // Treat values <= 1 (exclusive) as fractions, others as whole
  const pct = value > 1 || value < 0 ? value : value * 100;
  const dec = decimals !== undefined ? decimals : 1;
  const numStr = formatNumber(pct, locale, { decimals: dec });
  const cfg = LOCALE_NUMBER_CONFIG[locale];
  // In some locales a space before %
  if (['fr-FR', 'fr-CA', 'sv-SE', 'no-NO', 'fi-FI', 'ru-RU', 'pl-PL'].includes(locale)) {
    return numStr + '\u00a0%';
  }
  return numStr + '%';
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------
const MONTH_NAMES_LONG: Record<string, string[]> = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
  de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  it: ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],
  pt: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
  nl: ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'],
  sv: ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'],
  no: ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'],
  da: ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'],
  fi: ['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'],
  ja: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  zh: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  ko: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  he: ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'],
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  pl: ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'],
  tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
};

const MONTH_NAMES_SHORT: Record<string, string[]> = {
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  fr: ['jan.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],
  de: ['Jan.','Feb.','März','Apr.','Mai','Jun.','Jul.','Aug.','Sep.','Okt.','Nov.','Dez.'],
  es: ['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.'],
  it: ['gen.','feb.','mar.','apr.','mag.','giu.','lug.','ago.','set.','ott.','nov.','dic.'],
  pt: ['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.'],
  nl: ['jan.','feb.','mrt.','apr.','mei','jun.','jul.','aug.','sep.','okt.','nov.','dec.'],
  sv: ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'],
  no: ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'],
  da: ['jan.','feb.','mar.','apr.','maj','jun.','jul.','aug.','sep.','okt.','nov.','dec.'],
  fi: ['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu'],
  ja: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  zh: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  ko: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  he: ['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ'],
  ru: ['янв.','февр.','март','апр.','май','июн.','июл.','авг.','сент.','окт.','нояб.','дек.'],
  pl: ['sty.','lut.','mar.','kwi.','maj','cze.','lip.','sie.','wrz.','paź.','lis.','gru.'],
  tr: ['Oca.','Şub.','Mar.','Nis.','May.','Haz.','Tem.','Ağu.','Eyl.','Eki.','Kas.','Ara.'],
  id: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
};

// Date order: 'dmy' = day first, 'mdy' = month first, 'ymd' = year first
type DateOrder = 'dmy' | 'mdy' | 'ymd';

const LOCALE_DATE_ORDER: Record<Locale, DateOrder> = {
  'en-GB': 'dmy', 'en-AU': 'dmy',
  'en-US': 'mdy', 'en-CA': 'mdy',
  'fr-FR': 'dmy', 'fr-CA': 'dmy',
  'de-DE': 'dmy', 'de-AT': 'dmy', 'de-CH': 'dmy',
  'es-ES': 'dmy', 'es-MX': 'dmy', 'es-AR': 'dmy',
  'it-IT': 'dmy',
  'pt-PT': 'dmy', 'pt-BR': 'dmy',
  'nl-NL': 'dmy',
  'sv-SE': 'ymd', 'no-NO': 'dmy', 'da-DK': 'dmy', 'fi-FI': 'dmy',
  'ja-JP': 'ymd', 'zh-CN': 'ymd', 'zh-TW': 'ymd', 'ko-KR': 'ymd',
  'ar-SA': 'dmy', 'he-IL': 'dmy',
  'ru-RU': 'dmy', 'pl-PL': 'dmy',
  'tr-TR': 'dmy', 'id-ID': 'dmy',
};

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'iso';
}

export function formatDate(date: Date, locale: Locale, opts?: DateFormatOptions): string {
  const fmt = opts?.format ?? 'short';
  const lang = getLanguageCode(locale);
  const day = date.getDate();
  const month = date.getMonth(); // 0-based
  const year = date.getFullYear();

  if (fmt === 'iso') {
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
  }

  if (fmt === 'short') {
    const order = LOCALE_DATE_ORDER[locale];
    const d = pad2(day);
    const m = pad2(month + 1);
    const y = String(year);
    if (order === 'dmy') return `${d}/${m}/${y}`;
    if (order === 'mdy') return `${m}/${d}/${y}`;
    return `${y}/${m}/${d}`;
  }

  if (fmt === 'medium') {
    const monthShort = (MONTH_NAMES_SHORT[lang] ?? MONTH_NAMES_SHORT['en'])[month];
    const order = LOCALE_DATE_ORDER[locale];
    if (order === 'mdy') {
      return `${monthShort} ${day}, ${year}`;
    }
    if (order === 'ymd') {
      return `${year}年${pad2(month + 1)}月${pad2(day)}日`;
    }
    return `${day} ${monthShort} ${year}`;
  }

  // long
  const monthLong = (MONTH_NAMES_LONG[lang] ?? MONTH_NAMES_LONG['en'])[month];
  const order = LOCALE_DATE_ORDER[locale];
  if (order === 'mdy') {
    return `${monthLong} ${day}, ${year}`;
  }
  if (order === 'ymd') {
    if (lang === 'ja' || lang === 'zh') return `${year}年${month + 1}月${day}日`;
    if (lang === 'ko') return `${year}년 ${month + 1}월 ${day}일`;
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
  }
  return `${day} ${monthLong} ${year}`;
}

// ---------------------------------------------------------------------------
// Time formatting
// ---------------------------------------------------------------------------
const LOCALE_24H: Record<Locale, boolean> = {
  'en-GB': true, 'en-US': false, 'en-AU': false, 'en-CA': false,
  'fr-FR': true, 'fr-CA': false,
  'de-DE': true, 'de-AT': true, 'de-CH': true,
  'es-ES': true, 'es-MX': false, 'es-AR': false,
  'it-IT': true,
  'pt-PT': true, 'pt-BR': false,
  'nl-NL': true,
  'sv-SE': true, 'no-NO': true, 'da-DK': true, 'fi-FI': true,
  'ja-JP': true, 'zh-CN': true, 'zh-TW': false, 'ko-KR': false,
  'ar-SA': false, 'he-IL': true,
  'ru-RU': true, 'pl-PL': true,
  'tr-TR': true, 'id-ID': true,
};

export interface TimeFormatOptions {
  use24h?: boolean;
  showSeconds?: boolean;
}

export function formatTime(date: Date, locale: Locale, opts?: TimeFormatOptions): string {
  const use24h = opts?.use24h !== undefined ? opts.use24h : LOCALE_24H[locale];
  const showSecs = opts?.showSeconds ?? false;
  const h24 = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  if (use24h) {
    let t = `${pad2(h24)}:${pad2(min)}`;
    if (showSecs) t += `:${pad2(sec)}`;
    return t;
  }
  // 12h
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 || 12;
  let t = `${h12}:${pad2(min)}`;
  if (showSecs) t += `:${pad2(sec)}`;
  return `${t} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------
const RELATIVE_STRINGS: Record<string, {
  justNow: string;
  secondsAgo: (n: number) => string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
  daysAgo: (n: number) => string;
  weeksAgo: (n: number) => string;
  monthsAgo: (n: number) => string;
  yearsAgo: (n: number) => string;
  inSeconds: (n: number) => string;
  inMinutes: (n: number) => string;
  inHours: (n: number) => string;
  inDays: (n: number) => string;
  inWeeks: (n: number) => string;
  inMonths: (n: number) => string;
  inYears: (n: number) => string;
}> = {
  en: {
    justNow: 'just now',
    secondsAgo: (n) => `${n} second${n !== 1 ? 's' : ''} ago`,
    minutesAgo: (n) => `${n} minute${n !== 1 ? 's' : ''} ago`,
    hoursAgo: (n) => `${n} hour${n !== 1 ? 's' : ''} ago`,
    daysAgo: (n) => `${n} day${n !== 1 ? 's' : ''} ago`,
    weeksAgo: (n) => `${n} week${n !== 1 ? 's' : ''} ago`,
    monthsAgo: (n) => `${n} month${n !== 1 ? 's' : ''} ago`,
    yearsAgo: (n) => `${n} year${n !== 1 ? 's' : ''} ago`,
    inSeconds: (n) => `in ${n} second${n !== 1 ? 's' : ''}`,
    inMinutes: (n) => `in ${n} minute${n !== 1 ? 's' : ''}`,
    inHours: (n) => `in ${n} hour${n !== 1 ? 's' : ''}`,
    inDays: (n) => `in ${n} day${n !== 1 ? 's' : ''}`,
    inWeeks: (n) => `in ${n} week${n !== 1 ? 's' : ''}`,
    inMonths: (n) => `in ${n} month${n !== 1 ? 's' : ''}`,
    inYears: (n) => `in ${n} year${n !== 1 ? 's' : ''}`,
  },
  fr: {
    justNow: 'à l\'instant',
    secondsAgo: (n) => `il y a ${n} seconde${n !== 1 ? 's' : ''}`,
    minutesAgo: (n) => `il y a ${n} minute${n !== 1 ? 's' : ''}`,
    hoursAgo: (n) => `il y a ${n} heure${n !== 1 ? 's' : ''}`,
    daysAgo: (n) => `il y a ${n} jour${n !== 1 ? 's' : ''}`,
    weeksAgo: (n) => `il y a ${n} semaine${n !== 1 ? 's' : ''}`,
    monthsAgo: (n) => `il y a ${n} mois`,
    yearsAgo: (n) => `il y a ${n} an${n !== 1 ? 's' : ''}`,
    inSeconds: (n) => `dans ${n} seconde${n !== 1 ? 's' : ''}`,
    inMinutes: (n) => `dans ${n} minute${n !== 1 ? 's' : ''}`,
    inHours: (n) => `dans ${n} heure${n !== 1 ? 's' : ''}`,
    inDays: (n) => `dans ${n} jour${n !== 1 ? 's' : ''}`,
    inWeeks: (n) => `dans ${n} semaine${n !== 1 ? 's' : ''}`,
    inMonths: (n) => `dans ${n} mois`,
    inYears: (n) => `dans ${n} an${n !== 1 ? 's' : ''}`,
  },
  de: {
    justNow: 'gerade eben',
    secondsAgo: (n) => `vor ${n} Sekunde${n !== 1 ? 'n' : ''}`,
    minutesAgo: (n) => `vor ${n} Minute${n !== 1 ? 'n' : ''}`,
    hoursAgo: (n) => `vor ${n} Stunde${n !== 1 ? 'n' : ''}`,
    daysAgo: (n) => `vor ${n} Tag${n !== 1 ? 'en' : ''}`,
    weeksAgo: (n) => `vor ${n} Woche${n !== 1 ? 'n' : ''}`,
    monthsAgo: (n) => `vor ${n} Monat${n !== 1 ? 'en' : ''}`,
    yearsAgo: (n) => `vor ${n} Jahr${n !== 1 ? 'en' : ''}`,
    inSeconds: (n) => `in ${n} Sekunde${n !== 1 ? 'n' : ''}`,
    inMinutes: (n) => `in ${n} Minute${n !== 1 ? 'n' : ''}`,
    inHours: (n) => `in ${n} Stunde${n !== 1 ? 'n' : ''}`,
    inDays: (n) => `in ${n} Tag${n !== 1 ? 'en' : ''}`,
    inWeeks: (n) => `in ${n} Woche${n !== 1 ? 'n' : ''}`,
    inMonths: (n) => `in ${n} Monat${n !== 1 ? 'en' : ''}`,
    inYears: (n) => `in ${n} Jahr${n !== 1 ? 'en' : ''}`,
  },
};

function getRelativeStrings(locale: Locale) {
  const lang = getLanguageCode(locale);
  return RELATIVE_STRINGS[lang] ?? RELATIVE_STRINGS['en'];
}

export function formatRelativeTime(date: Date, locale: Locale, now?: Date): string {
  const base = now ?? new Date();
  const diffMs = date.getTime() - base.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);
  const strings = getRelativeStrings(locale);

  if (absSec < 5) return strings.justNow;

  const isPast = diffSec < 0;
  const absMin = Math.round(absSec / 60);
  const absHr = Math.round(absSec / 3600);
  const absDay = Math.round(absSec / 86400);
  const absWeek = Math.round(absSec / 604800);
  const absMon = Math.round(absSec / 2592000);
  const absYr = Math.round(absSec / 31536000);

  if (absSec < 60) return isPast ? strings.secondsAgo(absSec) : strings.inSeconds(absSec);
  if (absMin < 60) return isPast ? strings.minutesAgo(absMin) : strings.inMinutes(absMin);
  if (absHr < 24) return isPast ? strings.hoursAgo(absHr) : strings.inHours(absHr);
  if (absDay < 7) return isPast ? strings.daysAgo(absDay) : strings.inDays(absDay);
  if (absWeek < 5) return isPast ? strings.weeksAgo(absWeek) : strings.inWeeks(absWeek);
  if (absMon < 12) return isPast ? strings.monthsAgo(absMon) : strings.inMonths(absMon);
  return isPast ? strings.yearsAgo(absYr) : strings.inYears(absYr);
}

// ---------------------------------------------------------------------------
// List formatting
// ---------------------------------------------------------------------------
const LIST_CONJUNCTIONS: Partial<Record<string, { and: string; or: string; serialComma: boolean }>> = {
  en: { and: 'and', or: 'or', serialComma: true },
  fr: { and: 'et', or: 'ou', serialComma: false },
  de: { and: 'und', or: 'oder', serialComma: false },
  es: { and: 'y', or: 'o', serialComma: false },
  it: { and: 'e', or: 'o', serialComma: false },
  pt: { and: 'e', or: 'ou', serialComma: false },
  nl: { and: 'en', or: 'of', serialComma: false },
  sv: { and: 'och', or: 'eller', serialComma: false },
  no: { and: 'og', or: 'eller', serialComma: false },
  da: { and: 'og', or: 'eller', serialComma: false },
  fi: { and: 'ja', or: 'tai', serialComma: false },
  ja: { and: 'と', or: 'か', serialComma: false },
  zh: { and: '和', or: '或', serialComma: false },
  ko: { and: '및', or: '또는', serialComma: false },
  ar: { and: 'و', or: 'أو', serialComma: false },
  he: { and: 'ו', or: 'או', serialComma: false },
  ru: { and: 'и', or: 'или', serialComma: false },
  pl: { and: 'i', or: 'lub', serialComma: false },
  tr: { and: 've', or: 'veya', serialComma: false },
  id: { and: 'dan', or: 'atau', serialComma: false },
};

export function formatList(items: string[], locale: Locale, type: 'conjunction' | 'disjunction' = 'conjunction'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const lang = getLanguageCode(locale);
  const cfg = LIST_CONJUNCTIONS[lang] ?? { and: 'and', or: 'or', serialComma: true };
  const conj = type === 'conjunction' ? cfg.and : cfg.or;

  if (items.length === 2) {
    return `${items[0]} ${conj} ${items[1]}`;
  }

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  const comma = cfg.serialComma ? ',' : '';
  return `${allButLast}${comma} ${conj} ${last}`;
}

// ---------------------------------------------------------------------------
// Ordinal numbers
// ---------------------------------------------------------------------------
export function formatOrdinal(n: number, locale: Locale): string {
  const lang = getLanguageCode(locale);

  if (lang === 'en') {
    const abs = Math.abs(n);
    const mod100 = abs % 100;
    const mod10 = abs % 10;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;
    return `${n}th`;
  }

  if (lang === 'fr') {
    return n === 1 ? `${n}er` : `${n}e`;
  }

  if (lang === 'de' || lang === 'nl' || lang === 'da' || lang === 'no' || lang === 'sv'
      || lang === 'fi' || lang === 'ru' || lang === 'pl' || lang === 'tr' || lang === 'id') {
    return `${n}.`;
  }

  if (lang === 'es') {
    return `${n}.º`;
  }

  if (lang === 'it') {
    return `${n}°`;
  }

  if (lang === 'pt') {
    return `${n}.º`;
  }

  if (lang === 'ja') {
    return `第${n}`;
  }

  if (lang === 'zh') {
    return `第${n}`;
  }

  if (lang === 'ko') {
    return `${n}번째`;
  }

  if (lang === 'ar') {
    return `${n}.`;
  }

  if (lang === 'he') {
    return `${n}.`;
  }

  // Default
  return `${n}.`;
}

// ---------------------------------------------------------------------------
// Byte/file size
// ---------------------------------------------------------------------------
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatBytes(bytes: number, locale: Locale, decimals?: number): string {
  const dec = decimals !== undefined ? decimals : 1;
  if (bytes === 0) return `0${formatNumber(0, locale, { decimals: dec }).replace(/0+/, '0')} B`;
  const isNeg = bytes < 0;
  const abs = Math.abs(bytes);
  let i = 0;
  let val = abs;
  while (val >= 1024 && i < BYTE_UNITS.length - 1) {
    val /= 1024;
    i++;
  }
  const formatted = formatNumber(isNeg ? -val : val, locale, { decimals: dec });
  return `${formatted} ${BYTE_UNITS[i]}`;
}

// ---------------------------------------------------------------------------
// Duration formatting
// ---------------------------------------------------------------------------
export function formatDuration(seconds: number, locale: Locale): string {
  const lang = getLanguageCode(locale);
  // Labels
  const labels: Record<string, { d: string; h: string; m: string; s: string }> = {
    en: { d: 'd', h: 'h', m: 'm', s: 's' },
    fr: { d: 'j', h: 'h', m: 'min', s: 's' },
    de: { d: 'T', h: 'Std', m: 'Min', s: 'Sek' },
    es: { d: 'd', h: 'h', m: 'min', s: 's' },
    it: { d: 'g', h: 'h', m: 'min', s: 's' },
    pt: { d: 'd', h: 'h', m: 'min', s: 's' },
    nl: { d: 'd', h: 'u', m: 'min', s: 's' },
    sv: { d: 'd', h: 'h', m: 'min', s: 's' },
    no: { d: 'd', h: 't', m: 'min', s: 's' },
    da: { d: 'd', h: 't', m: 'min', s: 's' },
    fi: { d: 'pv', h: 't', m: 'min', s: 's' },
    ja: { d: '日', h: '時間', m: '分', s: '秒' },
    zh: { d: '天', h: '小时', m: '分', s: '秒' },
    ko: { d: '일', h: '시간', m: '분', s: '초' },
    ar: { d: 'ي', h: 'س', m: 'د', s: 'ث' },
    he: { d: 'י', h: 'ש', m: 'ד', s: 'ש' },
    ru: { d: 'д', h: 'ч', m: 'мин', s: 'с' },
    pl: { d: 'd', h: 'godz', m: 'min', s: 's' },
    tr: { d: 'g', h: 'sa', m: 'dk', s: 's' },
    id: { d: 'h', h: 'j', m: 'mnt', s: 'd' },
  };

  const lbl = labels[lang] ?? labels['en'];
  const abs = Math.abs(Math.round(seconds));

  const days = Math.floor(abs / 86400);
  const hrs = Math.floor((abs % 86400) / 3600);
  const mins = Math.floor((abs % 3600) / 60);
  const secs = abs % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}${lbl.d}`);
  if (hrs > 0) parts.push(`${hrs}${lbl.h}`);
  if (mins > 0) parts.push(`${mins}${lbl.m}`);
  if (parts.length === 0 || secs > 0) {
    if (parts.length === 0 || (days === 0 && hrs === 0)) {
      parts.push(`${secs}${lbl.s}`);
    }
  }

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Compact number
// ---------------------------------------------------------------------------
export function formatCompact(value: number, locale: Locale, decimals?: number): string {
  const dec = decimals !== undefined ? decimals : 1;
  const abs = Math.abs(value);
  const isNeg = value < 0;
  let val: number;
  let suffix: string;

  if (abs >= 1_000_000_000) {
    val = abs / 1_000_000_000;
    suffix = 'B';
  } else if (abs >= 1_000_000) {
    val = abs / 1_000_000;
    suffix = 'M';
  } else if (abs >= 1_000) {
    val = abs / 1_000;
    suffix = 'K';
  } else {
    val = abs;
    suffix = '';
  }

  const formatted = formatNumber(isNeg ? -val : val, locale, { decimals: dec });
  return formatted + suffix;
}

// ---------------------------------------------------------------------------
// Text direction
// ---------------------------------------------------------------------------
const RTL_LOCALES = new Set<Locale>(['ar-SA', 'he-IL']);

export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

// ---------------------------------------------------------------------------
// Locale utilities
// ---------------------------------------------------------------------------
export function getLanguageCode(locale: Locale): string {
  return locale.split('-')[0];
}

export function getRegionCode(locale: Locale): string {
  return locale.split('-')[1] ?? '';
}

export function listLocales(): Locale[] {
  return [
    'en-GB', 'en-US', 'en-AU', 'en-CA',
    'fr-FR', 'fr-CA',
    'de-DE', 'de-AT', 'de-CH',
    'es-ES', 'es-MX', 'es-AR',
    'it-IT',
    'pt-PT', 'pt-BR',
    'nl-NL',
    'sv-SE', 'no-NO', 'da-DK', 'fi-FI',
    'ja-JP', 'zh-CN', 'zh-TW', 'ko-KR',
    'ar-SA', 'he-IL',
    'ru-RU', 'pl-PL',
    'tr-TR', 'id-ID',
  ];
}
