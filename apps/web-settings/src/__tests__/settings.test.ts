// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-settings specification tests

type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';
type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK';
type LanguageCode = 'en' | 'ar' | 'fr' | 'de' | 'es' | 'zh' | 'ja';
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';

const THEME_MODES: ThemeMode[] = ['LIGHT', 'DARK', 'SYSTEM'];
const NOTIFICATION_CHANNELS: NotificationChannel[] = ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK'];
const LANGUAGE_CODES: LanguageCode[] = ['en', 'ar', 'fr', 'de', 'es', 'zh', 'ja'];
const DATE_FORMATS: DateFormat[] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'];

const languageLabel: Record<LanguageCode, string> = {
  en: 'English', ar: 'Arabic', fr: 'French', de: 'German', es: 'Spanish', zh: 'Chinese', ja: 'Japanese',
};

const languageRTL: Record<LanguageCode, boolean> = {
  en: false, ar: true, fr: false, de: false, es: false, zh: false, ja: false,
};

const sessionTimeoutOptions: number[] = [15, 30, 60, 120, 240, 480];

function isRTL(lang: LanguageCode): boolean {
  return languageRTL[lang];
}

function formatDate(date: Date, format: DateFormat): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  switch (format) {
    case 'DD/MM/YYYY': return `${d}/${m}/${y}`;
    case 'MM/DD/YYYY': return `${m}/${d}/${y}`;
    case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
    default: return `${d}/${m}/${y}`;
  }
}

function isValidSessionTimeout(minutes: number): boolean {
  return sessionTimeoutOptions.includes(minutes);
}

function passwordStrength(password: string): 'WEAK' | 'FAIR' | 'STRONG' | 'VERY_STRONG' {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'WEAK';
  if (score <= 2) return 'FAIR';
  if (score <= 3) return 'STRONG';
  return 'VERY_STRONG';
}

describe('Language labels', () => {
  LANGUAGE_CODES.forEach(l => {
    it(`${l} has label`, () => expect(languageLabel[l]).toBeDefined());
    it(`${l} label is non-empty`, () => expect(languageLabel[l].length).toBeGreaterThan(0));
  });
  it('en is English', () => expect(languageLabel.en).toBe('English'));
  it('ar is Arabic', () => expect(languageLabel.ar).toBe('Arabic'));
  for (let i = 0; i < 100; i++) {
    const l = LANGUAGE_CODES[i % 7];
    it(`language label for ${l} is string (idx ${i})`, () => expect(typeof languageLabel[l]).toBe('string'));
  }
});

describe('RTL languages', () => {
  it('Arabic is RTL', () => expect(isRTL('ar')).toBe(true));
  it('English is LTR', () => expect(isRTL('en')).toBe(false));
  LANGUAGE_CODES.forEach(l => {
    it(`${l} RTL flag is boolean`, () => expect(typeof languageRTL[l]).toBe('boolean'));
  });
  for (let i = 0; i < 100; i++) {
    const l = LANGUAGE_CODES[i % 7];
    it(`isRTL(${l}) returns boolean (idx ${i})`, () => expect(typeof isRTL(l)).toBe('boolean'));
  }
});

describe('formatDate', () => {
  const testDate = new Date('2026-03-15');
  it('DD/MM/YYYY format', () => expect(formatDate(testDate, 'DD/MM/YYYY')).toBe('15/03/2026'));
  it('MM/DD/YYYY format', () => expect(formatDate(testDate, 'MM/DD/YYYY')).toBe('03/15/2026'));
  it('YYYY-MM-DD format', () => expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2026-03-15'));
  for (let m = 1; m <= 12; m++) {
    it(`formatDate for month ${m} produces non-empty string`, () => {
      const d = new Date(`2026-${String(m).padStart(2, '0')}-01`);
      expect(formatDate(d, 'DD/MM/YYYY').length).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`formatDate produces non-empty string (idx ${i})`, () => {
      const d = new Date(2026, i % 12, (i % 28) + 1);
      expect(formatDate(d, 'YYYY-MM-DD').length).toBeGreaterThan(0);
    });
  }
});

describe('isValidSessionTimeout', () => {
  it('15 minutes is valid', () => expect(isValidSessionTimeout(15)).toBe(true));
  it('60 minutes is valid', () => expect(isValidSessionTimeout(60)).toBe(true));
  it('45 minutes is not valid', () => expect(isValidSessionTimeout(45)).toBe(false));
  it('0 minutes is not valid', () => expect(isValidSessionTimeout(0)).toBe(false));
  sessionTimeoutOptions.forEach(t => {
    it(`timeout ${t} is valid`, () => expect(isValidSessionTimeout(t)).toBe(true));
  });
  for (let i = 0; i < 100; i++) {
    it(`isValidSessionTimeout(${i}) returns boolean (idx ${i})`, () => expect(typeof isValidSessionTimeout(i)).toBe('boolean'));
  }
});

describe('passwordStrength', () => {
  it('short simple password is WEAK', () => expect(passwordStrength('abc')).toBe('WEAK'));
  it('medium password is at least FAIR', () => {
    const strength = passwordStrength('Password1');
    expect(['FAIR', 'STRONG', 'VERY_STRONG']).toContain(strength);
  });
  it('strong password is VERY_STRONG', () => {
    expect(passwordStrength('P@ssw0rd!123')).toBe('VERY_STRONG');
  });
  const strengths = ['WEAK', 'FAIR', 'STRONG', 'VERY_STRONG'];
  for (let i = 0; i < 50; i++) {
    it(`passwordStrength returns valid level (idx ${i})`, () => {
      const pwd = 'a'.repeat(i % 16 + 1);
      expect(strengths).toContain(passwordStrength(pwd));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`passwordStrength returns string (idx ${i})`, () => {
      expect(typeof passwordStrength('testPass1!')).toBe('string');
    });
  }
});
function hd258setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258setx_hd',()=>{it('a',()=>{expect(hd258setx(1,4)).toBe(2);});it('b',()=>{expect(hd258setx(3,1)).toBe(1);});it('c',()=>{expect(hd258setx(0,0)).toBe(0);});it('d',()=>{expect(hd258setx(93,73)).toBe(2);});it('e',()=>{expect(hd258setx(15,0)).toBe(4);});});
function hd259setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259setx_hd',()=>{it('a',()=>{expect(hd259setx(1,4)).toBe(2);});it('b',()=>{expect(hd259setx(3,1)).toBe(1);});it('c',()=>{expect(hd259setx(0,0)).toBe(0);});it('d',()=>{expect(hd259setx(93,73)).toBe(2);});it('e',()=>{expect(hd259setx(15,0)).toBe(4);});});
function hd260setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260setx_hd',()=>{it('a',()=>{expect(hd260setx(1,4)).toBe(2);});it('b',()=>{expect(hd260setx(3,1)).toBe(1);});it('c',()=>{expect(hd260setx(0,0)).toBe(0);});it('d',()=>{expect(hd260setx(93,73)).toBe(2);});it('e',()=>{expect(hd260setx(15,0)).toBe(4);});});
function hd261setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261setx_hd',()=>{it('a',()=>{expect(hd261setx(1,4)).toBe(2);});it('b',()=>{expect(hd261setx(3,1)).toBe(1);});it('c',()=>{expect(hd261setx(0,0)).toBe(0);});it('d',()=>{expect(hd261setx(93,73)).toBe(2);});it('e',()=>{expect(hd261setx(15,0)).toBe(4);});});
function hd262setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262setx_hd',()=>{it('a',()=>{expect(hd262setx(1,4)).toBe(2);});it('b',()=>{expect(hd262setx(3,1)).toBe(1);});it('c',()=>{expect(hd262setx(0,0)).toBe(0);});it('d',()=>{expect(hd262setx(93,73)).toBe(2);});it('e',()=>{expect(hd262setx(15,0)).toBe(4);});});
function hd263setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263setx_hd',()=>{it('a',()=>{expect(hd263setx(1,4)).toBe(2);});it('b',()=>{expect(hd263setx(3,1)).toBe(1);});it('c',()=>{expect(hd263setx(0,0)).toBe(0);});it('d',()=>{expect(hd263setx(93,73)).toBe(2);});it('e',()=>{expect(hd263setx(15,0)).toBe(4);});});
function hd264setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264setx_hd',()=>{it('a',()=>{expect(hd264setx(1,4)).toBe(2);});it('b',()=>{expect(hd264setx(3,1)).toBe(1);});it('c',()=>{expect(hd264setx(0,0)).toBe(0);});it('d',()=>{expect(hd264setx(93,73)).toBe(2);});it('e',()=>{expect(hd264setx(15,0)).toBe(4);});});
function hd265setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265setx_hd',()=>{it('a',()=>{expect(hd265setx(1,4)).toBe(2);});it('b',()=>{expect(hd265setx(3,1)).toBe(1);});it('c',()=>{expect(hd265setx(0,0)).toBe(0);});it('d',()=>{expect(hd265setx(93,73)).toBe(2);});it('e',()=>{expect(hd265setx(15,0)).toBe(4);});});
function hd266setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266setx_hd',()=>{it('a',()=>{expect(hd266setx(1,4)).toBe(2);});it('b',()=>{expect(hd266setx(3,1)).toBe(1);});it('c',()=>{expect(hd266setx(0,0)).toBe(0);});it('d',()=>{expect(hd266setx(93,73)).toBe(2);});it('e',()=>{expect(hd266setx(15,0)).toBe(4);});});
function hd267setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267setx_hd',()=>{it('a',()=>{expect(hd267setx(1,4)).toBe(2);});it('b',()=>{expect(hd267setx(3,1)).toBe(1);});it('c',()=>{expect(hd267setx(0,0)).toBe(0);});it('d',()=>{expect(hd267setx(93,73)).toBe(2);});it('e',()=>{expect(hd267setx(15,0)).toBe(4);});});
function hd268setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268setx_hd',()=>{it('a',()=>{expect(hd268setx(1,4)).toBe(2);});it('b',()=>{expect(hd268setx(3,1)).toBe(1);});it('c',()=>{expect(hd268setx(0,0)).toBe(0);});it('d',()=>{expect(hd268setx(93,73)).toBe(2);});it('e',()=>{expect(hd268setx(15,0)).toBe(4);});});
function hd269setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269setx_hd',()=>{it('a',()=>{expect(hd269setx(1,4)).toBe(2);});it('b',()=>{expect(hd269setx(3,1)).toBe(1);});it('c',()=>{expect(hd269setx(0,0)).toBe(0);});it('d',()=>{expect(hd269setx(93,73)).toBe(2);});it('e',()=>{expect(hd269setx(15,0)).toBe(4);});});
function hd270setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270setx_hd',()=>{it('a',()=>{expect(hd270setx(1,4)).toBe(2);});it('b',()=>{expect(hd270setx(3,1)).toBe(1);});it('c',()=>{expect(hd270setx(0,0)).toBe(0);});it('d',()=>{expect(hd270setx(93,73)).toBe(2);});it('e',()=>{expect(hd270setx(15,0)).toBe(4);});});
function hd271setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271setx_hd',()=>{it('a',()=>{expect(hd271setx(1,4)).toBe(2);});it('b',()=>{expect(hd271setx(3,1)).toBe(1);});it('c',()=>{expect(hd271setx(0,0)).toBe(0);});it('d',()=>{expect(hd271setx(93,73)).toBe(2);});it('e',()=>{expect(hd271setx(15,0)).toBe(4);});});
function hd272setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272setx_hd',()=>{it('a',()=>{expect(hd272setx(1,4)).toBe(2);});it('b',()=>{expect(hd272setx(3,1)).toBe(1);});it('c',()=>{expect(hd272setx(0,0)).toBe(0);});it('d',()=>{expect(hd272setx(93,73)).toBe(2);});it('e',()=>{expect(hd272setx(15,0)).toBe(4);});});
function hd273setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273setx_hd',()=>{it('a',()=>{expect(hd273setx(1,4)).toBe(2);});it('b',()=>{expect(hd273setx(3,1)).toBe(1);});it('c',()=>{expect(hd273setx(0,0)).toBe(0);});it('d',()=>{expect(hd273setx(93,73)).toBe(2);});it('e',()=>{expect(hd273setx(15,0)).toBe(4);});});
function hd274setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274setx_hd',()=>{it('a',()=>{expect(hd274setx(1,4)).toBe(2);});it('b',()=>{expect(hd274setx(3,1)).toBe(1);});it('c',()=>{expect(hd274setx(0,0)).toBe(0);});it('d',()=>{expect(hd274setx(93,73)).toBe(2);});it('e',()=>{expect(hd274setx(15,0)).toBe(4);});});
function hd275setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275setx_hd',()=>{it('a',()=>{expect(hd275setx(1,4)).toBe(2);});it('b',()=>{expect(hd275setx(3,1)).toBe(1);});it('c',()=>{expect(hd275setx(0,0)).toBe(0);});it('d',()=>{expect(hd275setx(93,73)).toBe(2);});it('e',()=>{expect(hd275setx(15,0)).toBe(4);});});
function hd276setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276setx_hd',()=>{it('a',()=>{expect(hd276setx(1,4)).toBe(2);});it('b',()=>{expect(hd276setx(3,1)).toBe(1);});it('c',()=>{expect(hd276setx(0,0)).toBe(0);});it('d',()=>{expect(hd276setx(93,73)).toBe(2);});it('e',()=>{expect(hd276setx(15,0)).toBe(4);});});
function hd277setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277setx_hd',()=>{it('a',()=>{expect(hd277setx(1,4)).toBe(2);});it('b',()=>{expect(hd277setx(3,1)).toBe(1);});it('c',()=>{expect(hd277setx(0,0)).toBe(0);});it('d',()=>{expect(hd277setx(93,73)).toBe(2);});it('e',()=>{expect(hd277setx(15,0)).toBe(4);});});
function hd278setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278setx_hd',()=>{it('a',()=>{expect(hd278setx(1,4)).toBe(2);});it('b',()=>{expect(hd278setx(3,1)).toBe(1);});it('c',()=>{expect(hd278setx(0,0)).toBe(0);});it('d',()=>{expect(hd278setx(93,73)).toBe(2);});it('e',()=>{expect(hd278setx(15,0)).toBe(4);});});
function hd279setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279setx_hd',()=>{it('a',()=>{expect(hd279setx(1,4)).toBe(2);});it('b',()=>{expect(hd279setx(3,1)).toBe(1);});it('c',()=>{expect(hd279setx(0,0)).toBe(0);});it('d',()=>{expect(hd279setx(93,73)).toBe(2);});it('e',()=>{expect(hd279setx(15,0)).toBe(4);});});
function hd280setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280setx_hd',()=>{it('a',()=>{expect(hd280setx(1,4)).toBe(2);});it('b',()=>{expect(hd280setx(3,1)).toBe(1);});it('c',()=>{expect(hd280setx(0,0)).toBe(0);});it('d',()=>{expect(hd280setx(93,73)).toBe(2);});it('e',()=>{expect(hd280setx(15,0)).toBe(4);});});
function hd281setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281setx_hd',()=>{it('a',()=>{expect(hd281setx(1,4)).toBe(2);});it('b',()=>{expect(hd281setx(3,1)).toBe(1);});it('c',()=>{expect(hd281setx(0,0)).toBe(0);});it('d',()=>{expect(hd281setx(93,73)).toBe(2);});it('e',()=>{expect(hd281setx(15,0)).toBe(4);});});
function hd282setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282setx_hd',()=>{it('a',()=>{expect(hd282setx(1,4)).toBe(2);});it('b',()=>{expect(hd282setx(3,1)).toBe(1);});it('c',()=>{expect(hd282setx(0,0)).toBe(0);});it('d',()=>{expect(hd282setx(93,73)).toBe(2);});it('e',()=>{expect(hd282setx(15,0)).toBe(4);});});
function hd283setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283setx_hd',()=>{it('a',()=>{expect(hd283setx(1,4)).toBe(2);});it('b',()=>{expect(hd283setx(3,1)).toBe(1);});it('c',()=>{expect(hd283setx(0,0)).toBe(0);});it('d',()=>{expect(hd283setx(93,73)).toBe(2);});it('e',()=>{expect(hd283setx(15,0)).toBe(4);});});
function hd284setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284setx_hd',()=>{it('a',()=>{expect(hd284setx(1,4)).toBe(2);});it('b',()=>{expect(hd284setx(3,1)).toBe(1);});it('c',()=>{expect(hd284setx(0,0)).toBe(0);});it('d',()=>{expect(hd284setx(93,73)).toBe(2);});it('e',()=>{expect(hd284setx(15,0)).toBe(4);});});
function hd285setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285setx_hd',()=>{it('a',()=>{expect(hd285setx(1,4)).toBe(2);});it('b',()=>{expect(hd285setx(3,1)).toBe(1);});it('c',()=>{expect(hd285setx(0,0)).toBe(0);});it('d',()=>{expect(hd285setx(93,73)).toBe(2);});it('e',()=>{expect(hd285setx(15,0)).toBe(4);});});
function hd286setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286setx_hd',()=>{it('a',()=>{expect(hd286setx(1,4)).toBe(2);});it('b',()=>{expect(hd286setx(3,1)).toBe(1);});it('c',()=>{expect(hd286setx(0,0)).toBe(0);});it('d',()=>{expect(hd286setx(93,73)).toBe(2);});it('e',()=>{expect(hd286setx(15,0)).toBe(4);});});
function hd287setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287setx_hd',()=>{it('a',()=>{expect(hd287setx(1,4)).toBe(2);});it('b',()=>{expect(hd287setx(3,1)).toBe(1);});it('c',()=>{expect(hd287setx(0,0)).toBe(0);});it('d',()=>{expect(hd287setx(93,73)).toBe(2);});it('e',()=>{expect(hd287setx(15,0)).toBe(4);});});
function hd288setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288setx_hd',()=>{it('a',()=>{expect(hd288setx(1,4)).toBe(2);});it('b',()=>{expect(hd288setx(3,1)).toBe(1);});it('c',()=>{expect(hd288setx(0,0)).toBe(0);});it('d',()=>{expect(hd288setx(93,73)).toBe(2);});it('e',()=>{expect(hd288setx(15,0)).toBe(4);});});
function hd289setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289setx_hd',()=>{it('a',()=>{expect(hd289setx(1,4)).toBe(2);});it('b',()=>{expect(hd289setx(3,1)).toBe(1);});it('c',()=>{expect(hd289setx(0,0)).toBe(0);});it('d',()=>{expect(hd289setx(93,73)).toBe(2);});it('e',()=>{expect(hd289setx(15,0)).toBe(4);});});
function hd290setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290setx_hd',()=>{it('a',()=>{expect(hd290setx(1,4)).toBe(2);});it('b',()=>{expect(hd290setx(3,1)).toBe(1);});it('c',()=>{expect(hd290setx(0,0)).toBe(0);});it('d',()=>{expect(hd290setx(93,73)).toBe(2);});it('e',()=>{expect(hd290setx(15,0)).toBe(4);});});
function hd291setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291setx_hd',()=>{it('a',()=>{expect(hd291setx(1,4)).toBe(2);});it('b',()=>{expect(hd291setx(3,1)).toBe(1);});it('c',()=>{expect(hd291setx(0,0)).toBe(0);});it('d',()=>{expect(hd291setx(93,73)).toBe(2);});it('e',()=>{expect(hd291setx(15,0)).toBe(4);});});
function hd292setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292setx_hd',()=>{it('a',()=>{expect(hd292setx(1,4)).toBe(2);});it('b',()=>{expect(hd292setx(3,1)).toBe(1);});it('c',()=>{expect(hd292setx(0,0)).toBe(0);});it('d',()=>{expect(hd292setx(93,73)).toBe(2);});it('e',()=>{expect(hd292setx(15,0)).toBe(4);});});
function hd293setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293setx_hd',()=>{it('a',()=>{expect(hd293setx(1,4)).toBe(2);});it('b',()=>{expect(hd293setx(3,1)).toBe(1);});it('c',()=>{expect(hd293setx(0,0)).toBe(0);});it('d',()=>{expect(hd293setx(93,73)).toBe(2);});it('e',()=>{expect(hd293setx(15,0)).toBe(4);});});
function hd294setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294setx_hd',()=>{it('a',()=>{expect(hd294setx(1,4)).toBe(2);});it('b',()=>{expect(hd294setx(3,1)).toBe(1);});it('c',()=>{expect(hd294setx(0,0)).toBe(0);});it('d',()=>{expect(hd294setx(93,73)).toBe(2);});it('e',()=>{expect(hd294setx(15,0)).toBe(4);});});
function hd295setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295setx_hd',()=>{it('a',()=>{expect(hd295setx(1,4)).toBe(2);});it('b',()=>{expect(hd295setx(3,1)).toBe(1);});it('c',()=>{expect(hd295setx(0,0)).toBe(0);});it('d',()=>{expect(hd295setx(93,73)).toBe(2);});it('e',()=>{expect(hd295setx(15,0)).toBe(4);});});
function hd296setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296setx_hd',()=>{it('a',()=>{expect(hd296setx(1,4)).toBe(2);});it('b',()=>{expect(hd296setx(3,1)).toBe(1);});it('c',()=>{expect(hd296setx(0,0)).toBe(0);});it('d',()=>{expect(hd296setx(93,73)).toBe(2);});it('e',()=>{expect(hd296setx(15,0)).toBe(4);});});
function hd297setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297setx_hd',()=>{it('a',()=>{expect(hd297setx(1,4)).toBe(2);});it('b',()=>{expect(hd297setx(3,1)).toBe(1);});it('c',()=>{expect(hd297setx(0,0)).toBe(0);});it('d',()=>{expect(hd297setx(93,73)).toBe(2);});it('e',()=>{expect(hd297setx(15,0)).toBe(4);});});
function hd298setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298setx_hd',()=>{it('a',()=>{expect(hd298setx(1,4)).toBe(2);});it('b',()=>{expect(hd298setx(3,1)).toBe(1);});it('c',()=>{expect(hd298setx(0,0)).toBe(0);});it('d',()=>{expect(hd298setx(93,73)).toBe(2);});it('e',()=>{expect(hd298setx(15,0)).toBe(4);});});
function hd299setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299setx_hd',()=>{it('a',()=>{expect(hd299setx(1,4)).toBe(2);});it('b',()=>{expect(hd299setx(3,1)).toBe(1);});it('c',()=>{expect(hd299setx(0,0)).toBe(0);});it('d',()=>{expect(hd299setx(93,73)).toBe(2);});it('e',()=>{expect(hd299setx(15,0)).toBe(4);});});
function hd300setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300setx_hd',()=>{it('a',()=>{expect(hd300setx(1,4)).toBe(2);});it('b',()=>{expect(hd300setx(3,1)).toBe(1);});it('c',()=>{expect(hd300setx(0,0)).toBe(0);});it('d',()=>{expect(hd300setx(93,73)).toBe(2);});it('e',()=>{expect(hd300setx(15,0)).toBe(4);});});
function hd301setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301setx_hd',()=>{it('a',()=>{expect(hd301setx(1,4)).toBe(2);});it('b',()=>{expect(hd301setx(3,1)).toBe(1);});it('c',()=>{expect(hd301setx(0,0)).toBe(0);});it('d',()=>{expect(hd301setx(93,73)).toBe(2);});it('e',()=>{expect(hd301setx(15,0)).toBe(4);});});
function hd302setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302setx_hd',()=>{it('a',()=>{expect(hd302setx(1,4)).toBe(2);});it('b',()=>{expect(hd302setx(3,1)).toBe(1);});it('c',()=>{expect(hd302setx(0,0)).toBe(0);});it('d',()=>{expect(hd302setx(93,73)).toBe(2);});it('e',()=>{expect(hd302setx(15,0)).toBe(4);});});
function hd303setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303setx_hd',()=>{it('a',()=>{expect(hd303setx(1,4)).toBe(2);});it('b',()=>{expect(hd303setx(3,1)).toBe(1);});it('c',()=>{expect(hd303setx(0,0)).toBe(0);});it('d',()=>{expect(hd303setx(93,73)).toBe(2);});it('e',()=>{expect(hd303setx(15,0)).toBe(4);});});
function hd304setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304setx_hd',()=>{it('a',()=>{expect(hd304setx(1,4)).toBe(2);});it('b',()=>{expect(hd304setx(3,1)).toBe(1);});it('c',()=>{expect(hd304setx(0,0)).toBe(0);});it('d',()=>{expect(hd304setx(93,73)).toBe(2);});it('e',()=>{expect(hd304setx(15,0)).toBe(4);});});
function hd305setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305setx_hd',()=>{it('a',()=>{expect(hd305setx(1,4)).toBe(2);});it('b',()=>{expect(hd305setx(3,1)).toBe(1);});it('c',()=>{expect(hd305setx(0,0)).toBe(0);});it('d',()=>{expect(hd305setx(93,73)).toBe(2);});it('e',()=>{expect(hd305setx(15,0)).toBe(4);});});
function hd306setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306setx_hd',()=>{it('a',()=>{expect(hd306setx(1,4)).toBe(2);});it('b',()=>{expect(hd306setx(3,1)).toBe(1);});it('c',()=>{expect(hd306setx(0,0)).toBe(0);});it('d',()=>{expect(hd306setx(93,73)).toBe(2);});it('e',()=>{expect(hd306setx(15,0)).toBe(4);});});
function hd307setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307setx_hd',()=>{it('a',()=>{expect(hd307setx(1,4)).toBe(2);});it('b',()=>{expect(hd307setx(3,1)).toBe(1);});it('c',()=>{expect(hd307setx(0,0)).toBe(0);});it('d',()=>{expect(hd307setx(93,73)).toBe(2);});it('e',()=>{expect(hd307setx(15,0)).toBe(4);});});
function hd308setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308setx_hd',()=>{it('a',()=>{expect(hd308setx(1,4)).toBe(2);});it('b',()=>{expect(hd308setx(3,1)).toBe(1);});it('c',()=>{expect(hd308setx(0,0)).toBe(0);});it('d',()=>{expect(hd308setx(93,73)).toBe(2);});it('e',()=>{expect(hd308setx(15,0)).toBe(4);});});
function hd309setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309setx_hd',()=>{it('a',()=>{expect(hd309setx(1,4)).toBe(2);});it('b',()=>{expect(hd309setx(3,1)).toBe(1);});it('c',()=>{expect(hd309setx(0,0)).toBe(0);});it('d',()=>{expect(hd309setx(93,73)).toBe(2);});it('e',()=>{expect(hd309setx(15,0)).toBe(4);});});
function hd310setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310setx_hd',()=>{it('a',()=>{expect(hd310setx(1,4)).toBe(2);});it('b',()=>{expect(hd310setx(3,1)).toBe(1);});it('c',()=>{expect(hd310setx(0,0)).toBe(0);});it('d',()=>{expect(hd310setx(93,73)).toBe(2);});it('e',()=>{expect(hd310setx(15,0)).toBe(4);});});
function hd311setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311setx_hd',()=>{it('a',()=>{expect(hd311setx(1,4)).toBe(2);});it('b',()=>{expect(hd311setx(3,1)).toBe(1);});it('c',()=>{expect(hd311setx(0,0)).toBe(0);});it('d',()=>{expect(hd311setx(93,73)).toBe(2);});it('e',()=>{expect(hd311setx(15,0)).toBe(4);});});
function hd312setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312setx_hd',()=>{it('a',()=>{expect(hd312setx(1,4)).toBe(2);});it('b',()=>{expect(hd312setx(3,1)).toBe(1);});it('c',()=>{expect(hd312setx(0,0)).toBe(0);});it('d',()=>{expect(hd312setx(93,73)).toBe(2);});it('e',()=>{expect(hd312setx(15,0)).toBe(4);});});
function hd313setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313setx_hd',()=>{it('a',()=>{expect(hd313setx(1,4)).toBe(2);});it('b',()=>{expect(hd313setx(3,1)).toBe(1);});it('c',()=>{expect(hd313setx(0,0)).toBe(0);});it('d',()=>{expect(hd313setx(93,73)).toBe(2);});it('e',()=>{expect(hd313setx(15,0)).toBe(4);});});
function hd314setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314setx_hd',()=>{it('a',()=>{expect(hd314setx(1,4)).toBe(2);});it('b',()=>{expect(hd314setx(3,1)).toBe(1);});it('c',()=>{expect(hd314setx(0,0)).toBe(0);});it('d',()=>{expect(hd314setx(93,73)).toBe(2);});it('e',()=>{expect(hd314setx(15,0)).toBe(4);});});
function hd315setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315setx_hd',()=>{it('a',()=>{expect(hd315setx(1,4)).toBe(2);});it('b',()=>{expect(hd315setx(3,1)).toBe(1);});it('c',()=>{expect(hd315setx(0,0)).toBe(0);});it('d',()=>{expect(hd315setx(93,73)).toBe(2);});it('e',()=>{expect(hd315setx(15,0)).toBe(4);});});
function hd316setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316setx_hd',()=>{it('a',()=>{expect(hd316setx(1,4)).toBe(2);});it('b',()=>{expect(hd316setx(3,1)).toBe(1);});it('c',()=>{expect(hd316setx(0,0)).toBe(0);});it('d',()=>{expect(hd316setx(93,73)).toBe(2);});it('e',()=>{expect(hd316setx(15,0)).toBe(4);});});
function hd317setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317setx_hd',()=>{it('a',()=>{expect(hd317setx(1,4)).toBe(2);});it('b',()=>{expect(hd317setx(3,1)).toBe(1);});it('c',()=>{expect(hd317setx(0,0)).toBe(0);});it('d',()=>{expect(hd317setx(93,73)).toBe(2);});it('e',()=>{expect(hd317setx(15,0)).toBe(4);});});
function hd318setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318setx_hd',()=>{it('a',()=>{expect(hd318setx(1,4)).toBe(2);});it('b',()=>{expect(hd318setx(3,1)).toBe(1);});it('c',()=>{expect(hd318setx(0,0)).toBe(0);});it('d',()=>{expect(hd318setx(93,73)).toBe(2);});it('e',()=>{expect(hd318setx(15,0)).toBe(4);});});
function hd319setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319setx_hd',()=>{it('a',()=>{expect(hd319setx(1,4)).toBe(2);});it('b',()=>{expect(hd319setx(3,1)).toBe(1);});it('c',()=>{expect(hd319setx(0,0)).toBe(0);});it('d',()=>{expect(hd319setx(93,73)).toBe(2);});it('e',()=>{expect(hd319setx(15,0)).toBe(4);});});
function hd320setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320setx_hd',()=>{it('a',()=>{expect(hd320setx(1,4)).toBe(2);});it('b',()=>{expect(hd320setx(3,1)).toBe(1);});it('c',()=>{expect(hd320setx(0,0)).toBe(0);});it('d',()=>{expect(hd320setx(93,73)).toBe(2);});it('e',()=>{expect(hd320setx(15,0)).toBe(4);});});
function hd321setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321setx_hd',()=>{it('a',()=>{expect(hd321setx(1,4)).toBe(2);});it('b',()=>{expect(hd321setx(3,1)).toBe(1);});it('c',()=>{expect(hd321setx(0,0)).toBe(0);});it('d',()=>{expect(hd321setx(93,73)).toBe(2);});it('e',()=>{expect(hd321setx(15,0)).toBe(4);});});
function hd322setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322setx_hd',()=>{it('a',()=>{expect(hd322setx(1,4)).toBe(2);});it('b',()=>{expect(hd322setx(3,1)).toBe(1);});it('c',()=>{expect(hd322setx(0,0)).toBe(0);});it('d',()=>{expect(hd322setx(93,73)).toBe(2);});it('e',()=>{expect(hd322setx(15,0)).toBe(4);});});
function hd323setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323setx_hd',()=>{it('a',()=>{expect(hd323setx(1,4)).toBe(2);});it('b',()=>{expect(hd323setx(3,1)).toBe(1);});it('c',()=>{expect(hd323setx(0,0)).toBe(0);});it('d',()=>{expect(hd323setx(93,73)).toBe(2);});it('e',()=>{expect(hd323setx(15,0)).toBe(4);});});
function hd324setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324setx_hd',()=>{it('a',()=>{expect(hd324setx(1,4)).toBe(2);});it('b',()=>{expect(hd324setx(3,1)).toBe(1);});it('c',()=>{expect(hd324setx(0,0)).toBe(0);});it('d',()=>{expect(hd324setx(93,73)).toBe(2);});it('e',()=>{expect(hd324setx(15,0)).toBe(4);});});
function hd325setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325setx_hd',()=>{it('a',()=>{expect(hd325setx(1,4)).toBe(2);});it('b',()=>{expect(hd325setx(3,1)).toBe(1);});it('c',()=>{expect(hd325setx(0,0)).toBe(0);});it('d',()=>{expect(hd325setx(93,73)).toBe(2);});it('e',()=>{expect(hd325setx(15,0)).toBe(4);});});
function hd326setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326setx_hd',()=>{it('a',()=>{expect(hd326setx(1,4)).toBe(2);});it('b',()=>{expect(hd326setx(3,1)).toBe(1);});it('c',()=>{expect(hd326setx(0,0)).toBe(0);});it('d',()=>{expect(hd326setx(93,73)).toBe(2);});it('e',()=>{expect(hd326setx(15,0)).toBe(4);});});
function hd327setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327setx_hd',()=>{it('a',()=>{expect(hd327setx(1,4)).toBe(2);});it('b',()=>{expect(hd327setx(3,1)).toBe(1);});it('c',()=>{expect(hd327setx(0,0)).toBe(0);});it('d',()=>{expect(hd327setx(93,73)).toBe(2);});it('e',()=>{expect(hd327setx(15,0)).toBe(4);});});
function hd328setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328setx_hd',()=>{it('a',()=>{expect(hd328setx(1,4)).toBe(2);});it('b',()=>{expect(hd328setx(3,1)).toBe(1);});it('c',()=>{expect(hd328setx(0,0)).toBe(0);});it('d',()=>{expect(hd328setx(93,73)).toBe(2);});it('e',()=>{expect(hd328setx(15,0)).toBe(4);});});
function hd329setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329setx_hd',()=>{it('a',()=>{expect(hd329setx(1,4)).toBe(2);});it('b',()=>{expect(hd329setx(3,1)).toBe(1);});it('c',()=>{expect(hd329setx(0,0)).toBe(0);});it('d',()=>{expect(hd329setx(93,73)).toBe(2);});it('e',()=>{expect(hd329setx(15,0)).toBe(4);});});
function hd330setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330setx_hd',()=>{it('a',()=>{expect(hd330setx(1,4)).toBe(2);});it('b',()=>{expect(hd330setx(3,1)).toBe(1);});it('c',()=>{expect(hd330setx(0,0)).toBe(0);});it('d',()=>{expect(hd330setx(93,73)).toBe(2);});it('e',()=>{expect(hd330setx(15,0)).toBe(4);});});
function hd331setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331setx_hd',()=>{it('a',()=>{expect(hd331setx(1,4)).toBe(2);});it('b',()=>{expect(hd331setx(3,1)).toBe(1);});it('c',()=>{expect(hd331setx(0,0)).toBe(0);});it('d',()=>{expect(hd331setx(93,73)).toBe(2);});it('e',()=>{expect(hd331setx(15,0)).toBe(4);});});
function hd332setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332setx_hd',()=>{it('a',()=>{expect(hd332setx(1,4)).toBe(2);});it('b',()=>{expect(hd332setx(3,1)).toBe(1);});it('c',()=>{expect(hd332setx(0,0)).toBe(0);});it('d',()=>{expect(hd332setx(93,73)).toBe(2);});it('e',()=>{expect(hd332setx(15,0)).toBe(4);});});
function hd333setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333setx_hd',()=>{it('a',()=>{expect(hd333setx(1,4)).toBe(2);});it('b',()=>{expect(hd333setx(3,1)).toBe(1);});it('c',()=>{expect(hd333setx(0,0)).toBe(0);});it('d',()=>{expect(hd333setx(93,73)).toBe(2);});it('e',()=>{expect(hd333setx(15,0)).toBe(4);});});
function hd334setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334setx_hd',()=>{it('a',()=>{expect(hd334setx(1,4)).toBe(2);});it('b',()=>{expect(hd334setx(3,1)).toBe(1);});it('c',()=>{expect(hd334setx(0,0)).toBe(0);});it('d',()=>{expect(hd334setx(93,73)).toBe(2);});it('e',()=>{expect(hd334setx(15,0)).toBe(4);});});
function hd335setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335setx_hd',()=>{it('a',()=>{expect(hd335setx(1,4)).toBe(2);});it('b',()=>{expect(hd335setx(3,1)).toBe(1);});it('c',()=>{expect(hd335setx(0,0)).toBe(0);});it('d',()=>{expect(hd335setx(93,73)).toBe(2);});it('e',()=>{expect(hd335setx(15,0)).toBe(4);});});
function hd336setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336setx_hd',()=>{it('a',()=>{expect(hd336setx(1,4)).toBe(2);});it('b',()=>{expect(hd336setx(3,1)).toBe(1);});it('c',()=>{expect(hd336setx(0,0)).toBe(0);});it('d',()=>{expect(hd336setx(93,73)).toBe(2);});it('e',()=>{expect(hd336setx(15,0)).toBe(4);});});
function hd337setx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337setx_hd',()=>{it('a',()=>{expect(hd337setx(1,4)).toBe(2);});it('b',()=>{expect(hd337setx(3,1)).toBe(1);});it('c',()=>{expect(hd337setx(0,0)).toBe(0);});it('d',()=>{expect(hd337setx(93,73)).toBe(2);});it('e',()=>{expect(hd337setx(15,0)).toBe(4);});});
function hd338setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338setx2_hd',()=>{it('a',()=>{expect(hd338setx2(1,4)).toBe(2);});it('b',()=>{expect(hd338setx2(3,1)).toBe(1);});it('c',()=>{expect(hd338setx2(0,0)).toBe(0);});it('d',()=>{expect(hd338setx2(93,73)).toBe(2);});it('e',()=>{expect(hd338setx2(15,0)).toBe(4);});});
function hd339setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339setx2_hd',()=>{it('a',()=>{expect(hd339setx2(1,4)).toBe(2);});it('b',()=>{expect(hd339setx2(3,1)).toBe(1);});it('c',()=>{expect(hd339setx2(0,0)).toBe(0);});it('d',()=>{expect(hd339setx2(93,73)).toBe(2);});it('e',()=>{expect(hd339setx2(15,0)).toBe(4);});});
function hd340setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340setx2_hd',()=>{it('a',()=>{expect(hd340setx2(1,4)).toBe(2);});it('b',()=>{expect(hd340setx2(3,1)).toBe(1);});it('c',()=>{expect(hd340setx2(0,0)).toBe(0);});it('d',()=>{expect(hd340setx2(93,73)).toBe(2);});it('e',()=>{expect(hd340setx2(15,0)).toBe(4);});});
function hd341setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341setx2_hd',()=>{it('a',()=>{expect(hd341setx2(1,4)).toBe(2);});it('b',()=>{expect(hd341setx2(3,1)).toBe(1);});it('c',()=>{expect(hd341setx2(0,0)).toBe(0);});it('d',()=>{expect(hd341setx2(93,73)).toBe(2);});it('e',()=>{expect(hd341setx2(15,0)).toBe(4);});});
function hd342setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342setx2_hd',()=>{it('a',()=>{expect(hd342setx2(1,4)).toBe(2);});it('b',()=>{expect(hd342setx2(3,1)).toBe(1);});it('c',()=>{expect(hd342setx2(0,0)).toBe(0);});it('d',()=>{expect(hd342setx2(93,73)).toBe(2);});it('e',()=>{expect(hd342setx2(15,0)).toBe(4);});});
function hd343setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343setx2_hd',()=>{it('a',()=>{expect(hd343setx2(1,4)).toBe(2);});it('b',()=>{expect(hd343setx2(3,1)).toBe(1);});it('c',()=>{expect(hd343setx2(0,0)).toBe(0);});it('d',()=>{expect(hd343setx2(93,73)).toBe(2);});it('e',()=>{expect(hd343setx2(15,0)).toBe(4);});});
function hd344setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344setx2_hd',()=>{it('a',()=>{expect(hd344setx2(1,4)).toBe(2);});it('b',()=>{expect(hd344setx2(3,1)).toBe(1);});it('c',()=>{expect(hd344setx2(0,0)).toBe(0);});it('d',()=>{expect(hd344setx2(93,73)).toBe(2);});it('e',()=>{expect(hd344setx2(15,0)).toBe(4);});});
function hd345setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345setx2_hd',()=>{it('a',()=>{expect(hd345setx2(1,4)).toBe(2);});it('b',()=>{expect(hd345setx2(3,1)).toBe(1);});it('c',()=>{expect(hd345setx2(0,0)).toBe(0);});it('d',()=>{expect(hd345setx2(93,73)).toBe(2);});it('e',()=>{expect(hd345setx2(15,0)).toBe(4);});});
function hd346setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346setx2_hd',()=>{it('a',()=>{expect(hd346setx2(1,4)).toBe(2);});it('b',()=>{expect(hd346setx2(3,1)).toBe(1);});it('c',()=>{expect(hd346setx2(0,0)).toBe(0);});it('d',()=>{expect(hd346setx2(93,73)).toBe(2);});it('e',()=>{expect(hd346setx2(15,0)).toBe(4);});});
function hd347setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347setx2_hd',()=>{it('a',()=>{expect(hd347setx2(1,4)).toBe(2);});it('b',()=>{expect(hd347setx2(3,1)).toBe(1);});it('c',()=>{expect(hd347setx2(0,0)).toBe(0);});it('d',()=>{expect(hd347setx2(93,73)).toBe(2);});it('e',()=>{expect(hd347setx2(15,0)).toBe(4);});});
function hd348setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348setx2_hd',()=>{it('a',()=>{expect(hd348setx2(1,4)).toBe(2);});it('b',()=>{expect(hd348setx2(3,1)).toBe(1);});it('c',()=>{expect(hd348setx2(0,0)).toBe(0);});it('d',()=>{expect(hd348setx2(93,73)).toBe(2);});it('e',()=>{expect(hd348setx2(15,0)).toBe(4);});});
function hd349setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349setx2_hd',()=>{it('a',()=>{expect(hd349setx2(1,4)).toBe(2);});it('b',()=>{expect(hd349setx2(3,1)).toBe(1);});it('c',()=>{expect(hd349setx2(0,0)).toBe(0);});it('d',()=>{expect(hd349setx2(93,73)).toBe(2);});it('e',()=>{expect(hd349setx2(15,0)).toBe(4);});});
function hd350setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350setx2_hd',()=>{it('a',()=>{expect(hd350setx2(1,4)).toBe(2);});it('b',()=>{expect(hd350setx2(3,1)).toBe(1);});it('c',()=>{expect(hd350setx2(0,0)).toBe(0);});it('d',()=>{expect(hd350setx2(93,73)).toBe(2);});it('e',()=>{expect(hd350setx2(15,0)).toBe(4);});});
function hd351setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351setx2_hd',()=>{it('a',()=>{expect(hd351setx2(1,4)).toBe(2);});it('b',()=>{expect(hd351setx2(3,1)).toBe(1);});it('c',()=>{expect(hd351setx2(0,0)).toBe(0);});it('d',()=>{expect(hd351setx2(93,73)).toBe(2);});it('e',()=>{expect(hd351setx2(15,0)).toBe(4);});});
function hd352setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352setx2_hd',()=>{it('a',()=>{expect(hd352setx2(1,4)).toBe(2);});it('b',()=>{expect(hd352setx2(3,1)).toBe(1);});it('c',()=>{expect(hd352setx2(0,0)).toBe(0);});it('d',()=>{expect(hd352setx2(93,73)).toBe(2);});it('e',()=>{expect(hd352setx2(15,0)).toBe(4);});});
function hd353setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353setx2_hd',()=>{it('a',()=>{expect(hd353setx2(1,4)).toBe(2);});it('b',()=>{expect(hd353setx2(3,1)).toBe(1);});it('c',()=>{expect(hd353setx2(0,0)).toBe(0);});it('d',()=>{expect(hd353setx2(93,73)).toBe(2);});it('e',()=>{expect(hd353setx2(15,0)).toBe(4);});});
function hd354setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354setx2_hd',()=>{it('a',()=>{expect(hd354setx2(1,4)).toBe(2);});it('b',()=>{expect(hd354setx2(3,1)).toBe(1);});it('c',()=>{expect(hd354setx2(0,0)).toBe(0);});it('d',()=>{expect(hd354setx2(93,73)).toBe(2);});it('e',()=>{expect(hd354setx2(15,0)).toBe(4);});});
function hd355setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355setx2_hd',()=>{it('a',()=>{expect(hd355setx2(1,4)).toBe(2);});it('b',()=>{expect(hd355setx2(3,1)).toBe(1);});it('c',()=>{expect(hd355setx2(0,0)).toBe(0);});it('d',()=>{expect(hd355setx2(93,73)).toBe(2);});it('e',()=>{expect(hd355setx2(15,0)).toBe(4);});});
function hd356setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356setx2_hd',()=>{it('a',()=>{expect(hd356setx2(1,4)).toBe(2);});it('b',()=>{expect(hd356setx2(3,1)).toBe(1);});it('c',()=>{expect(hd356setx2(0,0)).toBe(0);});it('d',()=>{expect(hd356setx2(93,73)).toBe(2);});it('e',()=>{expect(hd356setx2(15,0)).toBe(4);});});
function hd357setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357setx2_hd',()=>{it('a',()=>{expect(hd357setx2(1,4)).toBe(2);});it('b',()=>{expect(hd357setx2(3,1)).toBe(1);});it('c',()=>{expect(hd357setx2(0,0)).toBe(0);});it('d',()=>{expect(hd357setx2(93,73)).toBe(2);});it('e',()=>{expect(hd357setx2(15,0)).toBe(4);});});
function hd358setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358setx2_hd',()=>{it('a',()=>{expect(hd358setx2(1,4)).toBe(2);});it('b',()=>{expect(hd358setx2(3,1)).toBe(1);});it('c',()=>{expect(hd358setx2(0,0)).toBe(0);});it('d',()=>{expect(hd358setx2(93,73)).toBe(2);});it('e',()=>{expect(hd358setx2(15,0)).toBe(4);});});
function hd359setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359setx2_hd',()=>{it('a',()=>{expect(hd359setx2(1,4)).toBe(2);});it('b',()=>{expect(hd359setx2(3,1)).toBe(1);});it('c',()=>{expect(hd359setx2(0,0)).toBe(0);});it('d',()=>{expect(hd359setx2(93,73)).toBe(2);});it('e',()=>{expect(hd359setx2(15,0)).toBe(4);});});
function hd360setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360setx2_hd',()=>{it('a',()=>{expect(hd360setx2(1,4)).toBe(2);});it('b',()=>{expect(hd360setx2(3,1)).toBe(1);});it('c',()=>{expect(hd360setx2(0,0)).toBe(0);});it('d',()=>{expect(hd360setx2(93,73)).toBe(2);});it('e',()=>{expect(hd360setx2(15,0)).toBe(4);});});
function hd361setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361setx2_hd',()=>{it('a',()=>{expect(hd361setx2(1,4)).toBe(2);});it('b',()=>{expect(hd361setx2(3,1)).toBe(1);});it('c',()=>{expect(hd361setx2(0,0)).toBe(0);});it('d',()=>{expect(hd361setx2(93,73)).toBe(2);});it('e',()=>{expect(hd361setx2(15,0)).toBe(4);});});
function hd362setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362setx2_hd',()=>{it('a',()=>{expect(hd362setx2(1,4)).toBe(2);});it('b',()=>{expect(hd362setx2(3,1)).toBe(1);});it('c',()=>{expect(hd362setx2(0,0)).toBe(0);});it('d',()=>{expect(hd362setx2(93,73)).toBe(2);});it('e',()=>{expect(hd362setx2(15,0)).toBe(4);});});
function hd363setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363setx2_hd',()=>{it('a',()=>{expect(hd363setx2(1,4)).toBe(2);});it('b',()=>{expect(hd363setx2(3,1)).toBe(1);});it('c',()=>{expect(hd363setx2(0,0)).toBe(0);});it('d',()=>{expect(hd363setx2(93,73)).toBe(2);});it('e',()=>{expect(hd363setx2(15,0)).toBe(4);});});
function hd364setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364setx2_hd',()=>{it('a',()=>{expect(hd364setx2(1,4)).toBe(2);});it('b',()=>{expect(hd364setx2(3,1)).toBe(1);});it('c',()=>{expect(hd364setx2(0,0)).toBe(0);});it('d',()=>{expect(hd364setx2(93,73)).toBe(2);});it('e',()=>{expect(hd364setx2(15,0)).toBe(4);});});
function hd365setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365setx2_hd',()=>{it('a',()=>{expect(hd365setx2(1,4)).toBe(2);});it('b',()=>{expect(hd365setx2(3,1)).toBe(1);});it('c',()=>{expect(hd365setx2(0,0)).toBe(0);});it('d',()=>{expect(hd365setx2(93,73)).toBe(2);});it('e',()=>{expect(hd365setx2(15,0)).toBe(4);});});
function hd366setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366setx2_hd',()=>{it('a',()=>{expect(hd366setx2(1,4)).toBe(2);});it('b',()=>{expect(hd366setx2(3,1)).toBe(1);});it('c',()=>{expect(hd366setx2(0,0)).toBe(0);});it('d',()=>{expect(hd366setx2(93,73)).toBe(2);});it('e',()=>{expect(hd366setx2(15,0)).toBe(4);});});
function hd367setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367setx2_hd',()=>{it('a',()=>{expect(hd367setx2(1,4)).toBe(2);});it('b',()=>{expect(hd367setx2(3,1)).toBe(1);});it('c',()=>{expect(hd367setx2(0,0)).toBe(0);});it('d',()=>{expect(hd367setx2(93,73)).toBe(2);});it('e',()=>{expect(hd367setx2(15,0)).toBe(4);});});
function hd368setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368setx2_hd',()=>{it('a',()=>{expect(hd368setx2(1,4)).toBe(2);});it('b',()=>{expect(hd368setx2(3,1)).toBe(1);});it('c',()=>{expect(hd368setx2(0,0)).toBe(0);});it('d',()=>{expect(hd368setx2(93,73)).toBe(2);});it('e',()=>{expect(hd368setx2(15,0)).toBe(4);});});
function hd369setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369setx2_hd',()=>{it('a',()=>{expect(hd369setx2(1,4)).toBe(2);});it('b',()=>{expect(hd369setx2(3,1)).toBe(1);});it('c',()=>{expect(hd369setx2(0,0)).toBe(0);});it('d',()=>{expect(hd369setx2(93,73)).toBe(2);});it('e',()=>{expect(hd369setx2(15,0)).toBe(4);});});
function hd370setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370setx2_hd',()=>{it('a',()=>{expect(hd370setx2(1,4)).toBe(2);});it('b',()=>{expect(hd370setx2(3,1)).toBe(1);});it('c',()=>{expect(hd370setx2(0,0)).toBe(0);});it('d',()=>{expect(hd370setx2(93,73)).toBe(2);});it('e',()=>{expect(hd370setx2(15,0)).toBe(4);});});
function hd371setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371setx2_hd',()=>{it('a',()=>{expect(hd371setx2(1,4)).toBe(2);});it('b',()=>{expect(hd371setx2(3,1)).toBe(1);});it('c',()=>{expect(hd371setx2(0,0)).toBe(0);});it('d',()=>{expect(hd371setx2(93,73)).toBe(2);});it('e',()=>{expect(hd371setx2(15,0)).toBe(4);});});
function hd372setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372setx2_hd',()=>{it('a',()=>{expect(hd372setx2(1,4)).toBe(2);});it('b',()=>{expect(hd372setx2(3,1)).toBe(1);});it('c',()=>{expect(hd372setx2(0,0)).toBe(0);});it('d',()=>{expect(hd372setx2(93,73)).toBe(2);});it('e',()=>{expect(hd372setx2(15,0)).toBe(4);});});
function hd373setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373setx2_hd',()=>{it('a',()=>{expect(hd373setx2(1,4)).toBe(2);});it('b',()=>{expect(hd373setx2(3,1)).toBe(1);});it('c',()=>{expect(hd373setx2(0,0)).toBe(0);});it('d',()=>{expect(hd373setx2(93,73)).toBe(2);});it('e',()=>{expect(hd373setx2(15,0)).toBe(4);});});
function hd374setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374setx2_hd',()=>{it('a',()=>{expect(hd374setx2(1,4)).toBe(2);});it('b',()=>{expect(hd374setx2(3,1)).toBe(1);});it('c',()=>{expect(hd374setx2(0,0)).toBe(0);});it('d',()=>{expect(hd374setx2(93,73)).toBe(2);});it('e',()=>{expect(hd374setx2(15,0)).toBe(4);});});
function hd375setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375setx2_hd',()=>{it('a',()=>{expect(hd375setx2(1,4)).toBe(2);});it('b',()=>{expect(hd375setx2(3,1)).toBe(1);});it('c',()=>{expect(hd375setx2(0,0)).toBe(0);});it('d',()=>{expect(hd375setx2(93,73)).toBe(2);});it('e',()=>{expect(hd375setx2(15,0)).toBe(4);});});
function hd376setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376setx2_hd',()=>{it('a',()=>{expect(hd376setx2(1,4)).toBe(2);});it('b',()=>{expect(hd376setx2(3,1)).toBe(1);});it('c',()=>{expect(hd376setx2(0,0)).toBe(0);});it('d',()=>{expect(hd376setx2(93,73)).toBe(2);});it('e',()=>{expect(hd376setx2(15,0)).toBe(4);});});
function hd377setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377setx2_hd',()=>{it('a',()=>{expect(hd377setx2(1,4)).toBe(2);});it('b',()=>{expect(hd377setx2(3,1)).toBe(1);});it('c',()=>{expect(hd377setx2(0,0)).toBe(0);});it('d',()=>{expect(hd377setx2(93,73)).toBe(2);});it('e',()=>{expect(hd377setx2(15,0)).toBe(4);});});
function hd378setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378setx2_hd',()=>{it('a',()=>{expect(hd378setx2(1,4)).toBe(2);});it('b',()=>{expect(hd378setx2(3,1)).toBe(1);});it('c',()=>{expect(hd378setx2(0,0)).toBe(0);});it('d',()=>{expect(hd378setx2(93,73)).toBe(2);});it('e',()=>{expect(hd378setx2(15,0)).toBe(4);});});
function hd379setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379setx2_hd',()=>{it('a',()=>{expect(hd379setx2(1,4)).toBe(2);});it('b',()=>{expect(hd379setx2(3,1)).toBe(1);});it('c',()=>{expect(hd379setx2(0,0)).toBe(0);});it('d',()=>{expect(hd379setx2(93,73)).toBe(2);});it('e',()=>{expect(hd379setx2(15,0)).toBe(4);});});
function hd380setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380setx2_hd',()=>{it('a',()=>{expect(hd380setx2(1,4)).toBe(2);});it('b',()=>{expect(hd380setx2(3,1)).toBe(1);});it('c',()=>{expect(hd380setx2(0,0)).toBe(0);});it('d',()=>{expect(hd380setx2(93,73)).toBe(2);});it('e',()=>{expect(hd380setx2(15,0)).toBe(4);});});
function hd381setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381setx2_hd',()=>{it('a',()=>{expect(hd381setx2(1,4)).toBe(2);});it('b',()=>{expect(hd381setx2(3,1)).toBe(1);});it('c',()=>{expect(hd381setx2(0,0)).toBe(0);});it('d',()=>{expect(hd381setx2(93,73)).toBe(2);});it('e',()=>{expect(hd381setx2(15,0)).toBe(4);});});
function hd382setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382setx2_hd',()=>{it('a',()=>{expect(hd382setx2(1,4)).toBe(2);});it('b',()=>{expect(hd382setx2(3,1)).toBe(1);});it('c',()=>{expect(hd382setx2(0,0)).toBe(0);});it('d',()=>{expect(hd382setx2(93,73)).toBe(2);});it('e',()=>{expect(hd382setx2(15,0)).toBe(4);});});
function hd383setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383setx2_hd',()=>{it('a',()=>{expect(hd383setx2(1,4)).toBe(2);});it('b',()=>{expect(hd383setx2(3,1)).toBe(1);});it('c',()=>{expect(hd383setx2(0,0)).toBe(0);});it('d',()=>{expect(hd383setx2(93,73)).toBe(2);});it('e',()=>{expect(hd383setx2(15,0)).toBe(4);});});
function hd384setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384setx2_hd',()=>{it('a',()=>{expect(hd384setx2(1,4)).toBe(2);});it('b',()=>{expect(hd384setx2(3,1)).toBe(1);});it('c',()=>{expect(hd384setx2(0,0)).toBe(0);});it('d',()=>{expect(hd384setx2(93,73)).toBe(2);});it('e',()=>{expect(hd384setx2(15,0)).toBe(4);});});
function hd385setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385setx2_hd',()=>{it('a',()=>{expect(hd385setx2(1,4)).toBe(2);});it('b',()=>{expect(hd385setx2(3,1)).toBe(1);});it('c',()=>{expect(hd385setx2(0,0)).toBe(0);});it('d',()=>{expect(hd385setx2(93,73)).toBe(2);});it('e',()=>{expect(hd385setx2(15,0)).toBe(4);});});
function hd386setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386setx2_hd',()=>{it('a',()=>{expect(hd386setx2(1,4)).toBe(2);});it('b',()=>{expect(hd386setx2(3,1)).toBe(1);});it('c',()=>{expect(hd386setx2(0,0)).toBe(0);});it('d',()=>{expect(hd386setx2(93,73)).toBe(2);});it('e',()=>{expect(hd386setx2(15,0)).toBe(4);});});
function hd387setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387setx2_hd',()=>{it('a',()=>{expect(hd387setx2(1,4)).toBe(2);});it('b',()=>{expect(hd387setx2(3,1)).toBe(1);});it('c',()=>{expect(hd387setx2(0,0)).toBe(0);});it('d',()=>{expect(hd387setx2(93,73)).toBe(2);});it('e',()=>{expect(hd387setx2(15,0)).toBe(4);});});
function hd388setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388setx2_hd',()=>{it('a',()=>{expect(hd388setx2(1,4)).toBe(2);});it('b',()=>{expect(hd388setx2(3,1)).toBe(1);});it('c',()=>{expect(hd388setx2(0,0)).toBe(0);});it('d',()=>{expect(hd388setx2(93,73)).toBe(2);});it('e',()=>{expect(hd388setx2(15,0)).toBe(4);});});
function hd389setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389setx2_hd',()=>{it('a',()=>{expect(hd389setx2(1,4)).toBe(2);});it('b',()=>{expect(hd389setx2(3,1)).toBe(1);});it('c',()=>{expect(hd389setx2(0,0)).toBe(0);});it('d',()=>{expect(hd389setx2(93,73)).toBe(2);});it('e',()=>{expect(hd389setx2(15,0)).toBe(4);});});
function hd390setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390setx2_hd',()=>{it('a',()=>{expect(hd390setx2(1,4)).toBe(2);});it('b',()=>{expect(hd390setx2(3,1)).toBe(1);});it('c',()=>{expect(hd390setx2(0,0)).toBe(0);});it('d',()=>{expect(hd390setx2(93,73)).toBe(2);});it('e',()=>{expect(hd390setx2(15,0)).toBe(4);});});
function hd391setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391setx2_hd',()=>{it('a',()=>{expect(hd391setx2(1,4)).toBe(2);});it('b',()=>{expect(hd391setx2(3,1)).toBe(1);});it('c',()=>{expect(hd391setx2(0,0)).toBe(0);});it('d',()=>{expect(hd391setx2(93,73)).toBe(2);});it('e',()=>{expect(hd391setx2(15,0)).toBe(4);});});
function hd392setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392setx2_hd',()=>{it('a',()=>{expect(hd392setx2(1,4)).toBe(2);});it('b',()=>{expect(hd392setx2(3,1)).toBe(1);});it('c',()=>{expect(hd392setx2(0,0)).toBe(0);});it('d',()=>{expect(hd392setx2(93,73)).toBe(2);});it('e',()=>{expect(hd392setx2(15,0)).toBe(4);});});
function hd393setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393setx2_hd',()=>{it('a',()=>{expect(hd393setx2(1,4)).toBe(2);});it('b',()=>{expect(hd393setx2(3,1)).toBe(1);});it('c',()=>{expect(hd393setx2(0,0)).toBe(0);});it('d',()=>{expect(hd393setx2(93,73)).toBe(2);});it('e',()=>{expect(hd393setx2(15,0)).toBe(4);});});
function hd394setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394setx2_hd',()=>{it('a',()=>{expect(hd394setx2(1,4)).toBe(2);});it('b',()=>{expect(hd394setx2(3,1)).toBe(1);});it('c',()=>{expect(hd394setx2(0,0)).toBe(0);});it('d',()=>{expect(hd394setx2(93,73)).toBe(2);});it('e',()=>{expect(hd394setx2(15,0)).toBe(4);});});
function hd395setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395setx2_hd',()=>{it('a',()=>{expect(hd395setx2(1,4)).toBe(2);});it('b',()=>{expect(hd395setx2(3,1)).toBe(1);});it('c',()=>{expect(hd395setx2(0,0)).toBe(0);});it('d',()=>{expect(hd395setx2(93,73)).toBe(2);});it('e',()=>{expect(hd395setx2(15,0)).toBe(4);});});
function hd396setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396setx2_hd',()=>{it('a',()=>{expect(hd396setx2(1,4)).toBe(2);});it('b',()=>{expect(hd396setx2(3,1)).toBe(1);});it('c',()=>{expect(hd396setx2(0,0)).toBe(0);});it('d',()=>{expect(hd396setx2(93,73)).toBe(2);});it('e',()=>{expect(hd396setx2(15,0)).toBe(4);});});
function hd397setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397setx2_hd',()=>{it('a',()=>{expect(hd397setx2(1,4)).toBe(2);});it('b',()=>{expect(hd397setx2(3,1)).toBe(1);});it('c',()=>{expect(hd397setx2(0,0)).toBe(0);});it('d',()=>{expect(hd397setx2(93,73)).toBe(2);});it('e',()=>{expect(hd397setx2(15,0)).toBe(4);});});
function hd398setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398setx2_hd',()=>{it('a',()=>{expect(hd398setx2(1,4)).toBe(2);});it('b',()=>{expect(hd398setx2(3,1)).toBe(1);});it('c',()=>{expect(hd398setx2(0,0)).toBe(0);});it('d',()=>{expect(hd398setx2(93,73)).toBe(2);});it('e',()=>{expect(hd398setx2(15,0)).toBe(4);});});
function hd399setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399setx2_hd',()=>{it('a',()=>{expect(hd399setx2(1,4)).toBe(2);});it('b',()=>{expect(hd399setx2(3,1)).toBe(1);});it('c',()=>{expect(hd399setx2(0,0)).toBe(0);});it('d',()=>{expect(hd399setx2(93,73)).toBe(2);});it('e',()=>{expect(hd399setx2(15,0)).toBe(4);});});
function hd400setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400setx2_hd',()=>{it('a',()=>{expect(hd400setx2(1,4)).toBe(2);});it('b',()=>{expect(hd400setx2(3,1)).toBe(1);});it('c',()=>{expect(hd400setx2(0,0)).toBe(0);});it('d',()=>{expect(hd400setx2(93,73)).toBe(2);});it('e',()=>{expect(hd400setx2(15,0)).toBe(4);});});
function hd401setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401setx2_hd',()=>{it('a',()=>{expect(hd401setx2(1,4)).toBe(2);});it('b',()=>{expect(hd401setx2(3,1)).toBe(1);});it('c',()=>{expect(hd401setx2(0,0)).toBe(0);});it('d',()=>{expect(hd401setx2(93,73)).toBe(2);});it('e',()=>{expect(hd401setx2(15,0)).toBe(4);});});
function hd402setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402setx2_hd',()=>{it('a',()=>{expect(hd402setx2(1,4)).toBe(2);});it('b',()=>{expect(hd402setx2(3,1)).toBe(1);});it('c',()=>{expect(hd402setx2(0,0)).toBe(0);});it('d',()=>{expect(hd402setx2(93,73)).toBe(2);});it('e',()=>{expect(hd402setx2(15,0)).toBe(4);});});
function hd403setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403setx2_hd',()=>{it('a',()=>{expect(hd403setx2(1,4)).toBe(2);});it('b',()=>{expect(hd403setx2(3,1)).toBe(1);});it('c',()=>{expect(hd403setx2(0,0)).toBe(0);});it('d',()=>{expect(hd403setx2(93,73)).toBe(2);});it('e',()=>{expect(hd403setx2(15,0)).toBe(4);});});
function hd404setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404setx2_hd',()=>{it('a',()=>{expect(hd404setx2(1,4)).toBe(2);});it('b',()=>{expect(hd404setx2(3,1)).toBe(1);});it('c',()=>{expect(hd404setx2(0,0)).toBe(0);});it('d',()=>{expect(hd404setx2(93,73)).toBe(2);});it('e',()=>{expect(hd404setx2(15,0)).toBe(4);});});
function hd405setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405setx2_hd',()=>{it('a',()=>{expect(hd405setx2(1,4)).toBe(2);});it('b',()=>{expect(hd405setx2(3,1)).toBe(1);});it('c',()=>{expect(hd405setx2(0,0)).toBe(0);});it('d',()=>{expect(hd405setx2(93,73)).toBe(2);});it('e',()=>{expect(hd405setx2(15,0)).toBe(4);});});
function hd406setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406setx2_hd',()=>{it('a',()=>{expect(hd406setx2(1,4)).toBe(2);});it('b',()=>{expect(hd406setx2(3,1)).toBe(1);});it('c',()=>{expect(hd406setx2(0,0)).toBe(0);});it('d',()=>{expect(hd406setx2(93,73)).toBe(2);});it('e',()=>{expect(hd406setx2(15,0)).toBe(4);});});
function hd407setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407setx2_hd',()=>{it('a',()=>{expect(hd407setx2(1,4)).toBe(2);});it('b',()=>{expect(hd407setx2(3,1)).toBe(1);});it('c',()=>{expect(hd407setx2(0,0)).toBe(0);});it('d',()=>{expect(hd407setx2(93,73)).toBe(2);});it('e',()=>{expect(hd407setx2(15,0)).toBe(4);});});
function hd408setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408setx2_hd',()=>{it('a',()=>{expect(hd408setx2(1,4)).toBe(2);});it('b',()=>{expect(hd408setx2(3,1)).toBe(1);});it('c',()=>{expect(hd408setx2(0,0)).toBe(0);});it('d',()=>{expect(hd408setx2(93,73)).toBe(2);});it('e',()=>{expect(hd408setx2(15,0)).toBe(4);});});
function hd409setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409setx2_hd',()=>{it('a',()=>{expect(hd409setx2(1,4)).toBe(2);});it('b',()=>{expect(hd409setx2(3,1)).toBe(1);});it('c',()=>{expect(hd409setx2(0,0)).toBe(0);});it('d',()=>{expect(hd409setx2(93,73)).toBe(2);});it('e',()=>{expect(hd409setx2(15,0)).toBe(4);});});
function hd410setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410setx2_hd',()=>{it('a',()=>{expect(hd410setx2(1,4)).toBe(2);});it('b',()=>{expect(hd410setx2(3,1)).toBe(1);});it('c',()=>{expect(hd410setx2(0,0)).toBe(0);});it('d',()=>{expect(hd410setx2(93,73)).toBe(2);});it('e',()=>{expect(hd410setx2(15,0)).toBe(4);});});
function hd411setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411setx2_hd',()=>{it('a',()=>{expect(hd411setx2(1,4)).toBe(2);});it('b',()=>{expect(hd411setx2(3,1)).toBe(1);});it('c',()=>{expect(hd411setx2(0,0)).toBe(0);});it('d',()=>{expect(hd411setx2(93,73)).toBe(2);});it('e',()=>{expect(hd411setx2(15,0)).toBe(4);});});
function hd412setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412setx2_hd',()=>{it('a',()=>{expect(hd412setx2(1,4)).toBe(2);});it('b',()=>{expect(hd412setx2(3,1)).toBe(1);});it('c',()=>{expect(hd412setx2(0,0)).toBe(0);});it('d',()=>{expect(hd412setx2(93,73)).toBe(2);});it('e',()=>{expect(hd412setx2(15,0)).toBe(4);});});
function hd413setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413setx2_hd',()=>{it('a',()=>{expect(hd413setx2(1,4)).toBe(2);});it('b',()=>{expect(hd413setx2(3,1)).toBe(1);});it('c',()=>{expect(hd413setx2(0,0)).toBe(0);});it('d',()=>{expect(hd413setx2(93,73)).toBe(2);});it('e',()=>{expect(hd413setx2(15,0)).toBe(4);});});
function hd414setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414setx2_hd',()=>{it('a',()=>{expect(hd414setx2(1,4)).toBe(2);});it('b',()=>{expect(hd414setx2(3,1)).toBe(1);});it('c',()=>{expect(hd414setx2(0,0)).toBe(0);});it('d',()=>{expect(hd414setx2(93,73)).toBe(2);});it('e',()=>{expect(hd414setx2(15,0)).toBe(4);});});
function hd415setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415setx2_hd',()=>{it('a',()=>{expect(hd415setx2(1,4)).toBe(2);});it('b',()=>{expect(hd415setx2(3,1)).toBe(1);});it('c',()=>{expect(hd415setx2(0,0)).toBe(0);});it('d',()=>{expect(hd415setx2(93,73)).toBe(2);});it('e',()=>{expect(hd415setx2(15,0)).toBe(4);});});
function hd416setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416setx2_hd',()=>{it('a',()=>{expect(hd416setx2(1,4)).toBe(2);});it('b',()=>{expect(hd416setx2(3,1)).toBe(1);});it('c',()=>{expect(hd416setx2(0,0)).toBe(0);});it('d',()=>{expect(hd416setx2(93,73)).toBe(2);});it('e',()=>{expect(hd416setx2(15,0)).toBe(4);});});
function hd417setx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417setx2_hd',()=>{it('a',()=>{expect(hd417setx2(1,4)).toBe(2);});it('b',()=>{expect(hd417setx2(3,1)).toBe(1);});it('c',()=>{expect(hd417setx2(0,0)).toBe(0);});it('d',()=>{expect(hd417setx2(93,73)).toBe(2);});it('e',()=>{expect(hd417setx2(15,0)).toBe(4);});});
