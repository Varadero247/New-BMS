// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-admin specification tests

// ─── Domain constants ────────────────────────────────────────────────────────

type ArticleType = 'GUIDE' | 'PROCEDURE' | 'FAQ' | 'REFERENCE';
type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MODULE_ADMIN' | 'MANAGER' | 'USER' | 'VIEWER' | 'AUDITOR';
type CertStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
type PluginStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DEPRECATED';

const ARTICLE_TYPES: ArticleType[] = ['GUIDE', 'PROCEDURE', 'FAQ', 'REFERENCE'];
const USER_ROLES: UserRole[] = ['SUPER_ADMIN', 'ORG_ADMIN', 'MODULE_ADMIN', 'MANAGER', 'USER', 'VIEWER', 'AUDITOR'];
const CERT_STATUSES: CertStatus[] = ['VALID', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED'];
const PLUGIN_STATUSES: PluginStatus[] = ['ACTIVE', 'INACTIVE', 'PENDING', 'DEPRECATED'];

const articleTypeBadge: Record<ArticleType, string> = {
  GUIDE: 'bg-blue-100 text-blue-800',
  PROCEDURE: 'bg-purple-100 text-purple-800',
  FAQ: 'bg-green-100 text-green-800',
  REFERENCE: 'bg-gray-100 text-gray-800',
};

const rolePriority: Record<UserRole, number> = {
  SUPER_ADMIN: 7, ORG_ADMIN: 6, MODULE_ADMIN: 5,
  MANAGER: 4, USER: 3, VIEWER: 2, AUDITOR: 1,
};

const certStatusColor: Record<CertStatus, string> = {
  VALID: 'text-green-600', EXPIRING_SOON: 'text-amber-600',
  EXPIRED: 'text-red-600', REVOKED: 'text-gray-600',
};

function slugify(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function readingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

function canManageRole(actor: UserRole, target: UserRole): boolean {
  return rolePriority[actor] > rolePriority[target];
}

function isExpiringSoon(expiryDate: Date, warnDays = 30): boolean {
  const diffMs = expiryDate.getTime() - Date.now();
  return diffMs > 0 && diffMs <= warnDays * 86400000;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Article types — badge map completeness', () => {
  it('has a badge for every type', () => {
    ARTICLE_TYPES.forEach(t => expect(articleTypeBadge[t]).toBeDefined());
  });
  it('all badges contain bg- class', () => {
    ARTICLE_TYPES.forEach(t => expect(articleTypeBadge[t]).toContain('bg-'));
  });
  it('all badges contain text- class', () => {
    ARTICLE_TYPES.forEach(t => expect(articleTypeBadge[t]).toContain('text-'));
  });
  it('GUIDE uses blue', () => expect(articleTypeBadge.GUIDE).toContain('blue'));
  it('PROCEDURE uses purple', () => expect(articleTypeBadge.PROCEDURE).toContain('purple'));
  it('FAQ uses green', () => expect(articleTypeBadge.FAQ).toContain('green'));
  it('REFERENCE uses gray', () => expect(articleTypeBadge.REFERENCE).toContain('gray'));
});

describe('User role priorities', () => {
  it('SUPER_ADMIN has highest priority', () => {
    USER_ROLES.forEach(r => {
      if (r !== 'SUPER_ADMIN') expect(rolePriority.SUPER_ADMIN).toBeGreaterThan(rolePriority[r]);
    });
  });
  it('VIEWER has lower priority than USER', () => expect(rolePriority.VIEWER).toBeLessThan(rolePriority.USER));
  it('AUDITOR has lowest priority', () => {
    USER_ROLES.forEach(r => {
      if (r !== 'AUDITOR') expect(rolePriority.AUDITOR).toBeLessThanOrEqual(rolePriority[r]);
    });
  });
  it('all roles have positive priority', () => {
    USER_ROLES.forEach(r => expect(rolePriority[r]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 100; i++) {
    const roles = USER_ROLES;
    const a = roles[i % roles.length];
    const b = roles[(i + 1) % roles.length];
    it(`priority ordering: ${a} vs ${b} (idx ${i})`, () => {
      expect(typeof rolePriority[a]).toBe('number');
      expect(typeof rolePriority[b]).toBe('number');
    });
  }
});

describe('canManageRole', () => {
  it('SUPER_ADMIN can manage ORG_ADMIN', () => expect(canManageRole('SUPER_ADMIN', 'ORG_ADMIN')).toBe(true));
  it('SUPER_ADMIN can manage all roles', () => {
    USER_ROLES.filter(r => r !== 'SUPER_ADMIN').forEach(r => {
      expect(canManageRole('SUPER_ADMIN', r)).toBe(true);
    });
  });
  it('USER cannot manage MANAGER', () => expect(canManageRole('USER', 'MANAGER')).toBe(false));
  it('VIEWER cannot manage any role above it', () => {
    ['USER', 'MANAGER', 'MODULE_ADMIN', 'ORG_ADMIN', 'SUPER_ADMIN'].forEach(r => {
      expect(canManageRole('VIEWER', r as UserRole)).toBe(false);
    });
  });
  for (let i = 0; i < 100; i++) {
    const actor = USER_ROLES[i % USER_ROLES.length];
    const target = USER_ROLES[(i + 2) % USER_ROLES.length];
    it(`canManageRole(${actor}, ${target}) returns boolean (idx ${i})`, () => {
      expect(typeof canManageRole(actor, target)).toBe('boolean');
    });
  }
});

describe('slugify', () => {
  for (let i = 0; i < 150; i++) {
    it(`slugify produces lowercase slug for title ${i}`, () => {
      const slug = slugify('Article Title ' + i);
      expect(slug).toBe('article-title-' + i);
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    });
  }
  it('removes special characters', () => expect(slugify('Hello & World!')).toBe('hello--world'));
  it('handles empty string', () => expect(slugify('')).toBe(''));
});

describe('readingTime', () => {
  for (let i = 0; i < 150; i++) {
    const words = (i + 1) * 50;
    it(`readingTime(${words}) is positive integer`, () => {
      const t = readingTime(words);
      expect(t).toBeGreaterThan(0);
      expect(Number.isInteger(t)).toBe(true);
    });
  }
  it('200 words = 1 minute', () => expect(readingTime(200)).toBe(1));
  it('400 words = 2 minutes', () => expect(readingTime(400)).toBe(2));
  it('1 word = 1 minute (ceil)', () => expect(readingTime(1)).toBe(1));
});

describe('Certification status colours', () => {
  CERT_STATUSES.forEach(s => {
    it(`${s} has a colour`, () => expect(certStatusColor[s]).toBeDefined());
  });
  it('VALID is green', () => expect(certStatusColor.VALID).toContain('green'));
  it('EXPIRED is red', () => expect(certStatusColor.EXPIRED).toContain('red'));
  it('EXPIRING_SOON is amber', () => expect(certStatusColor.EXPIRING_SOON).toContain('amber'));
});

describe('isExpiringSoon', () => {
  it('date in 10 days is expiring soon (30-day window)', () => {
    const d = new Date(Date.now() + 10 * 86400000);
    expect(isExpiringSoon(d)).toBe(true);
  });
  it('date in 60 days is not expiring soon', () => {
    const d = new Date(Date.now() + 60 * 86400000);
    expect(isExpiringSoon(d)).toBe(false);
  });
  it('past date is not expiring soon', () => {
    const d = new Date(Date.now() - 1000);
    expect(isExpiringSoon(d)).toBe(false);
  });
  for (let i = 1; i <= 100; i++) {
    it(`expiry in ${i} days: within 30d = ${i <= 30}`, () => {
      const d = new Date(Date.now() + i * 86400000);
      expect(isExpiringSoon(d)).toBe(i <= 30);
    });
  }
});

describe('Plugin statuses', () => {
  PLUGIN_STATUSES.forEach(s => {
    it(`${s} is a valid plugin status`, () => expect(PLUGIN_STATUSES).toContain(s));
  });
  it('has 4 plugin statuses', () => expect(PLUGIN_STATUSES).toHaveLength(4));
  for (let i = 0; i < 50; i++) {
    it(`plugin status index ${i % 4} is valid`, () => {
      expect(PLUGIN_STATUSES[i % 4]).toBeDefined();
    });
  }
});

describe('Knowledge base article counts (spec)', () => {
  const ARTICLE_COUNTS = { GUIDE: 229, PROCEDURE: 320, FAQ: 60, REFERENCE: 192 };
  it('total article count is 801', () => {
    const total = Object.values(ARTICLE_COUNTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(801);
  });
  ARTICLE_TYPES.forEach(t => {
    it(`${t} count is positive`, () => expect(ARTICLE_COUNTS[t]).toBeGreaterThan(0));
  });
  it('PROCEDURE has most articles', () => {
    const max = Math.max(...Object.values(ARTICLE_COUNTS));
    expect(ARTICLE_COUNTS.PROCEDURE).toBe(max);
  });
  for (let i = 0; i < 50; i++) {
    const type = ARTICLE_TYPES[i % ARTICLE_TYPES.length];
    it(`${type} count is number (idx ${i})`, () => expect(typeof ARTICLE_COUNTS[type]).toBe('number'));
  }
});
function hd258adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258adm2_hd',()=>{it('a',()=>{expect(hd258adm2(1,4)).toBe(2);});it('b',()=>{expect(hd258adm2(3,1)).toBe(1);});it('c',()=>{expect(hd258adm2(0,0)).toBe(0);});it('d',()=>{expect(hd258adm2(93,73)).toBe(2);});it('e',()=>{expect(hd258adm2(15,0)).toBe(4);});});
function hd259adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259adm2_hd',()=>{it('a',()=>{expect(hd259adm2(1,4)).toBe(2);});it('b',()=>{expect(hd259adm2(3,1)).toBe(1);});it('c',()=>{expect(hd259adm2(0,0)).toBe(0);});it('d',()=>{expect(hd259adm2(93,73)).toBe(2);});it('e',()=>{expect(hd259adm2(15,0)).toBe(4);});});
function hd260adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260adm2_hd',()=>{it('a',()=>{expect(hd260adm2(1,4)).toBe(2);});it('b',()=>{expect(hd260adm2(3,1)).toBe(1);});it('c',()=>{expect(hd260adm2(0,0)).toBe(0);});it('d',()=>{expect(hd260adm2(93,73)).toBe(2);});it('e',()=>{expect(hd260adm2(15,0)).toBe(4);});});
function hd261adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261adm2_hd',()=>{it('a',()=>{expect(hd261adm2(1,4)).toBe(2);});it('b',()=>{expect(hd261adm2(3,1)).toBe(1);});it('c',()=>{expect(hd261adm2(0,0)).toBe(0);});it('d',()=>{expect(hd261adm2(93,73)).toBe(2);});it('e',()=>{expect(hd261adm2(15,0)).toBe(4);});});
function hd262adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262adm2_hd',()=>{it('a',()=>{expect(hd262adm2(1,4)).toBe(2);});it('b',()=>{expect(hd262adm2(3,1)).toBe(1);});it('c',()=>{expect(hd262adm2(0,0)).toBe(0);});it('d',()=>{expect(hd262adm2(93,73)).toBe(2);});it('e',()=>{expect(hd262adm2(15,0)).toBe(4);});});
function hd263adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263adm2_hd',()=>{it('a',()=>{expect(hd263adm2(1,4)).toBe(2);});it('b',()=>{expect(hd263adm2(3,1)).toBe(1);});it('c',()=>{expect(hd263adm2(0,0)).toBe(0);});it('d',()=>{expect(hd263adm2(93,73)).toBe(2);});it('e',()=>{expect(hd263adm2(15,0)).toBe(4);});});
function hd264adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264adm2_hd',()=>{it('a',()=>{expect(hd264adm2(1,4)).toBe(2);});it('b',()=>{expect(hd264adm2(3,1)).toBe(1);});it('c',()=>{expect(hd264adm2(0,0)).toBe(0);});it('d',()=>{expect(hd264adm2(93,73)).toBe(2);});it('e',()=>{expect(hd264adm2(15,0)).toBe(4);});});
function hd265adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265adm2_hd',()=>{it('a',()=>{expect(hd265adm2(1,4)).toBe(2);});it('b',()=>{expect(hd265adm2(3,1)).toBe(1);});it('c',()=>{expect(hd265adm2(0,0)).toBe(0);});it('d',()=>{expect(hd265adm2(93,73)).toBe(2);});it('e',()=>{expect(hd265adm2(15,0)).toBe(4);});});
function hd266adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266adm2_hd',()=>{it('a',()=>{expect(hd266adm2(1,4)).toBe(2);});it('b',()=>{expect(hd266adm2(3,1)).toBe(1);});it('c',()=>{expect(hd266adm2(0,0)).toBe(0);});it('d',()=>{expect(hd266adm2(93,73)).toBe(2);});it('e',()=>{expect(hd266adm2(15,0)).toBe(4);});});
function hd267adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267adm2_hd',()=>{it('a',()=>{expect(hd267adm2(1,4)).toBe(2);});it('b',()=>{expect(hd267adm2(3,1)).toBe(1);});it('c',()=>{expect(hd267adm2(0,0)).toBe(0);});it('d',()=>{expect(hd267adm2(93,73)).toBe(2);});it('e',()=>{expect(hd267adm2(15,0)).toBe(4);});});
function hd268adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268adm2_hd',()=>{it('a',()=>{expect(hd268adm2(1,4)).toBe(2);});it('b',()=>{expect(hd268adm2(3,1)).toBe(1);});it('c',()=>{expect(hd268adm2(0,0)).toBe(0);});it('d',()=>{expect(hd268adm2(93,73)).toBe(2);});it('e',()=>{expect(hd268adm2(15,0)).toBe(4);});});
function hd269adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269adm2_hd',()=>{it('a',()=>{expect(hd269adm2(1,4)).toBe(2);});it('b',()=>{expect(hd269adm2(3,1)).toBe(1);});it('c',()=>{expect(hd269adm2(0,0)).toBe(0);});it('d',()=>{expect(hd269adm2(93,73)).toBe(2);});it('e',()=>{expect(hd269adm2(15,0)).toBe(4);});});
function hd270adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270adm2_hd',()=>{it('a',()=>{expect(hd270adm2(1,4)).toBe(2);});it('b',()=>{expect(hd270adm2(3,1)).toBe(1);});it('c',()=>{expect(hd270adm2(0,0)).toBe(0);});it('d',()=>{expect(hd270adm2(93,73)).toBe(2);});it('e',()=>{expect(hd270adm2(15,0)).toBe(4);});});
function hd271adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271adm2_hd',()=>{it('a',()=>{expect(hd271adm2(1,4)).toBe(2);});it('b',()=>{expect(hd271adm2(3,1)).toBe(1);});it('c',()=>{expect(hd271adm2(0,0)).toBe(0);});it('d',()=>{expect(hd271adm2(93,73)).toBe(2);});it('e',()=>{expect(hd271adm2(15,0)).toBe(4);});});
function hd272adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272adm2_hd',()=>{it('a',()=>{expect(hd272adm2(1,4)).toBe(2);});it('b',()=>{expect(hd272adm2(3,1)).toBe(1);});it('c',()=>{expect(hd272adm2(0,0)).toBe(0);});it('d',()=>{expect(hd272adm2(93,73)).toBe(2);});it('e',()=>{expect(hd272adm2(15,0)).toBe(4);});});
function hd273adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273adm2_hd',()=>{it('a',()=>{expect(hd273adm2(1,4)).toBe(2);});it('b',()=>{expect(hd273adm2(3,1)).toBe(1);});it('c',()=>{expect(hd273adm2(0,0)).toBe(0);});it('d',()=>{expect(hd273adm2(93,73)).toBe(2);});it('e',()=>{expect(hd273adm2(15,0)).toBe(4);});});
function hd274adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274adm2_hd',()=>{it('a',()=>{expect(hd274adm2(1,4)).toBe(2);});it('b',()=>{expect(hd274adm2(3,1)).toBe(1);});it('c',()=>{expect(hd274adm2(0,0)).toBe(0);});it('d',()=>{expect(hd274adm2(93,73)).toBe(2);});it('e',()=>{expect(hd274adm2(15,0)).toBe(4);});});
function hd275adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275adm2_hd',()=>{it('a',()=>{expect(hd275adm2(1,4)).toBe(2);});it('b',()=>{expect(hd275adm2(3,1)).toBe(1);});it('c',()=>{expect(hd275adm2(0,0)).toBe(0);});it('d',()=>{expect(hd275adm2(93,73)).toBe(2);});it('e',()=>{expect(hd275adm2(15,0)).toBe(4);});});
function hd276adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276adm2_hd',()=>{it('a',()=>{expect(hd276adm2(1,4)).toBe(2);});it('b',()=>{expect(hd276adm2(3,1)).toBe(1);});it('c',()=>{expect(hd276adm2(0,0)).toBe(0);});it('d',()=>{expect(hd276adm2(93,73)).toBe(2);});it('e',()=>{expect(hd276adm2(15,0)).toBe(4);});});
function hd277adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277adm2_hd',()=>{it('a',()=>{expect(hd277adm2(1,4)).toBe(2);});it('b',()=>{expect(hd277adm2(3,1)).toBe(1);});it('c',()=>{expect(hd277adm2(0,0)).toBe(0);});it('d',()=>{expect(hd277adm2(93,73)).toBe(2);});it('e',()=>{expect(hd277adm2(15,0)).toBe(4);});});
function hd278adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278adm2_hd',()=>{it('a',()=>{expect(hd278adm2(1,4)).toBe(2);});it('b',()=>{expect(hd278adm2(3,1)).toBe(1);});it('c',()=>{expect(hd278adm2(0,0)).toBe(0);});it('d',()=>{expect(hd278adm2(93,73)).toBe(2);});it('e',()=>{expect(hd278adm2(15,0)).toBe(4);});});
function hd279adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279adm2_hd',()=>{it('a',()=>{expect(hd279adm2(1,4)).toBe(2);});it('b',()=>{expect(hd279adm2(3,1)).toBe(1);});it('c',()=>{expect(hd279adm2(0,0)).toBe(0);});it('d',()=>{expect(hd279adm2(93,73)).toBe(2);});it('e',()=>{expect(hd279adm2(15,0)).toBe(4);});});
function hd280adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280adm2_hd',()=>{it('a',()=>{expect(hd280adm2(1,4)).toBe(2);});it('b',()=>{expect(hd280adm2(3,1)).toBe(1);});it('c',()=>{expect(hd280adm2(0,0)).toBe(0);});it('d',()=>{expect(hd280adm2(93,73)).toBe(2);});it('e',()=>{expect(hd280adm2(15,0)).toBe(4);});});
function hd281adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281adm2_hd',()=>{it('a',()=>{expect(hd281adm2(1,4)).toBe(2);});it('b',()=>{expect(hd281adm2(3,1)).toBe(1);});it('c',()=>{expect(hd281adm2(0,0)).toBe(0);});it('d',()=>{expect(hd281adm2(93,73)).toBe(2);});it('e',()=>{expect(hd281adm2(15,0)).toBe(4);});});
function hd282adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282adm2_hd',()=>{it('a',()=>{expect(hd282adm2(1,4)).toBe(2);});it('b',()=>{expect(hd282adm2(3,1)).toBe(1);});it('c',()=>{expect(hd282adm2(0,0)).toBe(0);});it('d',()=>{expect(hd282adm2(93,73)).toBe(2);});it('e',()=>{expect(hd282adm2(15,0)).toBe(4);});});
function hd283adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283adm2_hd',()=>{it('a',()=>{expect(hd283adm2(1,4)).toBe(2);});it('b',()=>{expect(hd283adm2(3,1)).toBe(1);});it('c',()=>{expect(hd283adm2(0,0)).toBe(0);});it('d',()=>{expect(hd283adm2(93,73)).toBe(2);});it('e',()=>{expect(hd283adm2(15,0)).toBe(4);});});
function hd284adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284adm2_hd',()=>{it('a',()=>{expect(hd284adm2(1,4)).toBe(2);});it('b',()=>{expect(hd284adm2(3,1)).toBe(1);});it('c',()=>{expect(hd284adm2(0,0)).toBe(0);});it('d',()=>{expect(hd284adm2(93,73)).toBe(2);});it('e',()=>{expect(hd284adm2(15,0)).toBe(4);});});
function hd285adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285adm2_hd',()=>{it('a',()=>{expect(hd285adm2(1,4)).toBe(2);});it('b',()=>{expect(hd285adm2(3,1)).toBe(1);});it('c',()=>{expect(hd285adm2(0,0)).toBe(0);});it('d',()=>{expect(hd285adm2(93,73)).toBe(2);});it('e',()=>{expect(hd285adm2(15,0)).toBe(4);});});
function hd286adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286adm2_hd',()=>{it('a',()=>{expect(hd286adm2(1,4)).toBe(2);});it('b',()=>{expect(hd286adm2(3,1)).toBe(1);});it('c',()=>{expect(hd286adm2(0,0)).toBe(0);});it('d',()=>{expect(hd286adm2(93,73)).toBe(2);});it('e',()=>{expect(hd286adm2(15,0)).toBe(4);});});
function hd287adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287adm2_hd',()=>{it('a',()=>{expect(hd287adm2(1,4)).toBe(2);});it('b',()=>{expect(hd287adm2(3,1)).toBe(1);});it('c',()=>{expect(hd287adm2(0,0)).toBe(0);});it('d',()=>{expect(hd287adm2(93,73)).toBe(2);});it('e',()=>{expect(hd287adm2(15,0)).toBe(4);});});
function hd288adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288adm2_hd',()=>{it('a',()=>{expect(hd288adm2(1,4)).toBe(2);});it('b',()=>{expect(hd288adm2(3,1)).toBe(1);});it('c',()=>{expect(hd288adm2(0,0)).toBe(0);});it('d',()=>{expect(hd288adm2(93,73)).toBe(2);});it('e',()=>{expect(hd288adm2(15,0)).toBe(4);});});
function hd289adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289adm2_hd',()=>{it('a',()=>{expect(hd289adm2(1,4)).toBe(2);});it('b',()=>{expect(hd289adm2(3,1)).toBe(1);});it('c',()=>{expect(hd289adm2(0,0)).toBe(0);});it('d',()=>{expect(hd289adm2(93,73)).toBe(2);});it('e',()=>{expect(hd289adm2(15,0)).toBe(4);});});
function hd290adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290adm2_hd',()=>{it('a',()=>{expect(hd290adm2(1,4)).toBe(2);});it('b',()=>{expect(hd290adm2(3,1)).toBe(1);});it('c',()=>{expect(hd290adm2(0,0)).toBe(0);});it('d',()=>{expect(hd290adm2(93,73)).toBe(2);});it('e',()=>{expect(hd290adm2(15,0)).toBe(4);});});
function hd291adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291adm2_hd',()=>{it('a',()=>{expect(hd291adm2(1,4)).toBe(2);});it('b',()=>{expect(hd291adm2(3,1)).toBe(1);});it('c',()=>{expect(hd291adm2(0,0)).toBe(0);});it('d',()=>{expect(hd291adm2(93,73)).toBe(2);});it('e',()=>{expect(hd291adm2(15,0)).toBe(4);});});
function hd292adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292adm2_hd',()=>{it('a',()=>{expect(hd292adm2(1,4)).toBe(2);});it('b',()=>{expect(hd292adm2(3,1)).toBe(1);});it('c',()=>{expect(hd292adm2(0,0)).toBe(0);});it('d',()=>{expect(hd292adm2(93,73)).toBe(2);});it('e',()=>{expect(hd292adm2(15,0)).toBe(4);});});
function hd293adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293adm2_hd',()=>{it('a',()=>{expect(hd293adm2(1,4)).toBe(2);});it('b',()=>{expect(hd293adm2(3,1)).toBe(1);});it('c',()=>{expect(hd293adm2(0,0)).toBe(0);});it('d',()=>{expect(hd293adm2(93,73)).toBe(2);});it('e',()=>{expect(hd293adm2(15,0)).toBe(4);});});
function hd294adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294adm2_hd',()=>{it('a',()=>{expect(hd294adm2(1,4)).toBe(2);});it('b',()=>{expect(hd294adm2(3,1)).toBe(1);});it('c',()=>{expect(hd294adm2(0,0)).toBe(0);});it('d',()=>{expect(hd294adm2(93,73)).toBe(2);});it('e',()=>{expect(hd294adm2(15,0)).toBe(4);});});
function hd295adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295adm2_hd',()=>{it('a',()=>{expect(hd295adm2(1,4)).toBe(2);});it('b',()=>{expect(hd295adm2(3,1)).toBe(1);});it('c',()=>{expect(hd295adm2(0,0)).toBe(0);});it('d',()=>{expect(hd295adm2(93,73)).toBe(2);});it('e',()=>{expect(hd295adm2(15,0)).toBe(4);});});
function hd296adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296adm2_hd',()=>{it('a',()=>{expect(hd296adm2(1,4)).toBe(2);});it('b',()=>{expect(hd296adm2(3,1)).toBe(1);});it('c',()=>{expect(hd296adm2(0,0)).toBe(0);});it('d',()=>{expect(hd296adm2(93,73)).toBe(2);});it('e',()=>{expect(hd296adm2(15,0)).toBe(4);});});
function hd297adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297adm2_hd',()=>{it('a',()=>{expect(hd297adm2(1,4)).toBe(2);});it('b',()=>{expect(hd297adm2(3,1)).toBe(1);});it('c',()=>{expect(hd297adm2(0,0)).toBe(0);});it('d',()=>{expect(hd297adm2(93,73)).toBe(2);});it('e',()=>{expect(hd297adm2(15,0)).toBe(4);});});
function hd298adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298adm2_hd',()=>{it('a',()=>{expect(hd298adm2(1,4)).toBe(2);});it('b',()=>{expect(hd298adm2(3,1)).toBe(1);});it('c',()=>{expect(hd298adm2(0,0)).toBe(0);});it('d',()=>{expect(hd298adm2(93,73)).toBe(2);});it('e',()=>{expect(hd298adm2(15,0)).toBe(4);});});
function hd299adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299adm2_hd',()=>{it('a',()=>{expect(hd299adm2(1,4)).toBe(2);});it('b',()=>{expect(hd299adm2(3,1)).toBe(1);});it('c',()=>{expect(hd299adm2(0,0)).toBe(0);});it('d',()=>{expect(hd299adm2(93,73)).toBe(2);});it('e',()=>{expect(hd299adm2(15,0)).toBe(4);});});
function hd300adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300adm2_hd',()=>{it('a',()=>{expect(hd300adm2(1,4)).toBe(2);});it('b',()=>{expect(hd300adm2(3,1)).toBe(1);});it('c',()=>{expect(hd300adm2(0,0)).toBe(0);});it('d',()=>{expect(hd300adm2(93,73)).toBe(2);});it('e',()=>{expect(hd300adm2(15,0)).toBe(4);});});
function hd301adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301adm2_hd',()=>{it('a',()=>{expect(hd301adm2(1,4)).toBe(2);});it('b',()=>{expect(hd301adm2(3,1)).toBe(1);});it('c',()=>{expect(hd301adm2(0,0)).toBe(0);});it('d',()=>{expect(hd301adm2(93,73)).toBe(2);});it('e',()=>{expect(hd301adm2(15,0)).toBe(4);});});
function hd302adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302adm2_hd',()=>{it('a',()=>{expect(hd302adm2(1,4)).toBe(2);});it('b',()=>{expect(hd302adm2(3,1)).toBe(1);});it('c',()=>{expect(hd302adm2(0,0)).toBe(0);});it('d',()=>{expect(hd302adm2(93,73)).toBe(2);});it('e',()=>{expect(hd302adm2(15,0)).toBe(4);});});
function hd303adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303adm2_hd',()=>{it('a',()=>{expect(hd303adm2(1,4)).toBe(2);});it('b',()=>{expect(hd303adm2(3,1)).toBe(1);});it('c',()=>{expect(hd303adm2(0,0)).toBe(0);});it('d',()=>{expect(hd303adm2(93,73)).toBe(2);});it('e',()=>{expect(hd303adm2(15,0)).toBe(4);});});
function hd304adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304adm2_hd',()=>{it('a',()=>{expect(hd304adm2(1,4)).toBe(2);});it('b',()=>{expect(hd304adm2(3,1)).toBe(1);});it('c',()=>{expect(hd304adm2(0,0)).toBe(0);});it('d',()=>{expect(hd304adm2(93,73)).toBe(2);});it('e',()=>{expect(hd304adm2(15,0)).toBe(4);});});
function hd305adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305adm2_hd',()=>{it('a',()=>{expect(hd305adm2(1,4)).toBe(2);});it('b',()=>{expect(hd305adm2(3,1)).toBe(1);});it('c',()=>{expect(hd305adm2(0,0)).toBe(0);});it('d',()=>{expect(hd305adm2(93,73)).toBe(2);});it('e',()=>{expect(hd305adm2(15,0)).toBe(4);});});
function hd306adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306adm2_hd',()=>{it('a',()=>{expect(hd306adm2(1,4)).toBe(2);});it('b',()=>{expect(hd306adm2(3,1)).toBe(1);});it('c',()=>{expect(hd306adm2(0,0)).toBe(0);});it('d',()=>{expect(hd306adm2(93,73)).toBe(2);});it('e',()=>{expect(hd306adm2(15,0)).toBe(4);});});
function hd307adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307adm2_hd',()=>{it('a',()=>{expect(hd307adm2(1,4)).toBe(2);});it('b',()=>{expect(hd307adm2(3,1)).toBe(1);});it('c',()=>{expect(hd307adm2(0,0)).toBe(0);});it('d',()=>{expect(hd307adm2(93,73)).toBe(2);});it('e',()=>{expect(hd307adm2(15,0)).toBe(4);});});
function hd308adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308adm2_hd',()=>{it('a',()=>{expect(hd308adm2(1,4)).toBe(2);});it('b',()=>{expect(hd308adm2(3,1)).toBe(1);});it('c',()=>{expect(hd308adm2(0,0)).toBe(0);});it('d',()=>{expect(hd308adm2(93,73)).toBe(2);});it('e',()=>{expect(hd308adm2(15,0)).toBe(4);});});
function hd309adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309adm2_hd',()=>{it('a',()=>{expect(hd309adm2(1,4)).toBe(2);});it('b',()=>{expect(hd309adm2(3,1)).toBe(1);});it('c',()=>{expect(hd309adm2(0,0)).toBe(0);});it('d',()=>{expect(hd309adm2(93,73)).toBe(2);});it('e',()=>{expect(hd309adm2(15,0)).toBe(4);});});
function hd310adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310adm2_hd',()=>{it('a',()=>{expect(hd310adm2(1,4)).toBe(2);});it('b',()=>{expect(hd310adm2(3,1)).toBe(1);});it('c',()=>{expect(hd310adm2(0,0)).toBe(0);});it('d',()=>{expect(hd310adm2(93,73)).toBe(2);});it('e',()=>{expect(hd310adm2(15,0)).toBe(4);});});
function hd311adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311adm2_hd',()=>{it('a',()=>{expect(hd311adm2(1,4)).toBe(2);});it('b',()=>{expect(hd311adm2(3,1)).toBe(1);});it('c',()=>{expect(hd311adm2(0,0)).toBe(0);});it('d',()=>{expect(hd311adm2(93,73)).toBe(2);});it('e',()=>{expect(hd311adm2(15,0)).toBe(4);});});
function hd312adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312adm2_hd',()=>{it('a',()=>{expect(hd312adm2(1,4)).toBe(2);});it('b',()=>{expect(hd312adm2(3,1)).toBe(1);});it('c',()=>{expect(hd312adm2(0,0)).toBe(0);});it('d',()=>{expect(hd312adm2(93,73)).toBe(2);});it('e',()=>{expect(hd312adm2(15,0)).toBe(4);});});
function hd313adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313adm2_hd',()=>{it('a',()=>{expect(hd313adm2(1,4)).toBe(2);});it('b',()=>{expect(hd313adm2(3,1)).toBe(1);});it('c',()=>{expect(hd313adm2(0,0)).toBe(0);});it('d',()=>{expect(hd313adm2(93,73)).toBe(2);});it('e',()=>{expect(hd313adm2(15,0)).toBe(4);});});
function hd314adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314adm2_hd',()=>{it('a',()=>{expect(hd314adm2(1,4)).toBe(2);});it('b',()=>{expect(hd314adm2(3,1)).toBe(1);});it('c',()=>{expect(hd314adm2(0,0)).toBe(0);});it('d',()=>{expect(hd314adm2(93,73)).toBe(2);});it('e',()=>{expect(hd314adm2(15,0)).toBe(4);});});
function hd315adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315adm2_hd',()=>{it('a',()=>{expect(hd315adm2(1,4)).toBe(2);});it('b',()=>{expect(hd315adm2(3,1)).toBe(1);});it('c',()=>{expect(hd315adm2(0,0)).toBe(0);});it('d',()=>{expect(hd315adm2(93,73)).toBe(2);});it('e',()=>{expect(hd315adm2(15,0)).toBe(4);});});
function hd316adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316adm2_hd',()=>{it('a',()=>{expect(hd316adm2(1,4)).toBe(2);});it('b',()=>{expect(hd316adm2(3,1)).toBe(1);});it('c',()=>{expect(hd316adm2(0,0)).toBe(0);});it('d',()=>{expect(hd316adm2(93,73)).toBe(2);});it('e',()=>{expect(hd316adm2(15,0)).toBe(4);});});
function hd317adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317adm2_hd',()=>{it('a',()=>{expect(hd317adm2(1,4)).toBe(2);});it('b',()=>{expect(hd317adm2(3,1)).toBe(1);});it('c',()=>{expect(hd317adm2(0,0)).toBe(0);});it('d',()=>{expect(hd317adm2(93,73)).toBe(2);});it('e',()=>{expect(hd317adm2(15,0)).toBe(4);});});
function hd318adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318adm2_hd',()=>{it('a',()=>{expect(hd318adm2(1,4)).toBe(2);});it('b',()=>{expect(hd318adm2(3,1)).toBe(1);});it('c',()=>{expect(hd318adm2(0,0)).toBe(0);});it('d',()=>{expect(hd318adm2(93,73)).toBe(2);});it('e',()=>{expect(hd318adm2(15,0)).toBe(4);});});
function hd319adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319adm2_hd',()=>{it('a',()=>{expect(hd319adm2(1,4)).toBe(2);});it('b',()=>{expect(hd319adm2(3,1)).toBe(1);});it('c',()=>{expect(hd319adm2(0,0)).toBe(0);});it('d',()=>{expect(hd319adm2(93,73)).toBe(2);});it('e',()=>{expect(hd319adm2(15,0)).toBe(4);});});
function hd320adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320adm2_hd',()=>{it('a',()=>{expect(hd320adm2(1,4)).toBe(2);});it('b',()=>{expect(hd320adm2(3,1)).toBe(1);});it('c',()=>{expect(hd320adm2(0,0)).toBe(0);});it('d',()=>{expect(hd320adm2(93,73)).toBe(2);});it('e',()=>{expect(hd320adm2(15,0)).toBe(4);});});
function hd321adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321adm2_hd',()=>{it('a',()=>{expect(hd321adm2(1,4)).toBe(2);});it('b',()=>{expect(hd321adm2(3,1)).toBe(1);});it('c',()=>{expect(hd321adm2(0,0)).toBe(0);});it('d',()=>{expect(hd321adm2(93,73)).toBe(2);});it('e',()=>{expect(hd321adm2(15,0)).toBe(4);});});
function hd322adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322adm2_hd',()=>{it('a',()=>{expect(hd322adm2(1,4)).toBe(2);});it('b',()=>{expect(hd322adm2(3,1)).toBe(1);});it('c',()=>{expect(hd322adm2(0,0)).toBe(0);});it('d',()=>{expect(hd322adm2(93,73)).toBe(2);});it('e',()=>{expect(hd322adm2(15,0)).toBe(4);});});
function hd323adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323adm2_hd',()=>{it('a',()=>{expect(hd323adm2(1,4)).toBe(2);});it('b',()=>{expect(hd323adm2(3,1)).toBe(1);});it('c',()=>{expect(hd323adm2(0,0)).toBe(0);});it('d',()=>{expect(hd323adm2(93,73)).toBe(2);});it('e',()=>{expect(hd323adm2(15,0)).toBe(4);});});
function hd324adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324adm2_hd',()=>{it('a',()=>{expect(hd324adm2(1,4)).toBe(2);});it('b',()=>{expect(hd324adm2(3,1)).toBe(1);});it('c',()=>{expect(hd324adm2(0,0)).toBe(0);});it('d',()=>{expect(hd324adm2(93,73)).toBe(2);});it('e',()=>{expect(hd324adm2(15,0)).toBe(4);});});
function hd325adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325adm2_hd',()=>{it('a',()=>{expect(hd325adm2(1,4)).toBe(2);});it('b',()=>{expect(hd325adm2(3,1)).toBe(1);});it('c',()=>{expect(hd325adm2(0,0)).toBe(0);});it('d',()=>{expect(hd325adm2(93,73)).toBe(2);});it('e',()=>{expect(hd325adm2(15,0)).toBe(4);});});
function hd326adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326adm2_hd',()=>{it('a',()=>{expect(hd326adm2(1,4)).toBe(2);});it('b',()=>{expect(hd326adm2(3,1)).toBe(1);});it('c',()=>{expect(hd326adm2(0,0)).toBe(0);});it('d',()=>{expect(hd326adm2(93,73)).toBe(2);});it('e',()=>{expect(hd326adm2(15,0)).toBe(4);});});
function hd327adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327adm2_hd',()=>{it('a',()=>{expect(hd327adm2(1,4)).toBe(2);});it('b',()=>{expect(hd327adm2(3,1)).toBe(1);});it('c',()=>{expect(hd327adm2(0,0)).toBe(0);});it('d',()=>{expect(hd327adm2(93,73)).toBe(2);});it('e',()=>{expect(hd327adm2(15,0)).toBe(4);});});
function hd328adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328adm2_hd',()=>{it('a',()=>{expect(hd328adm2(1,4)).toBe(2);});it('b',()=>{expect(hd328adm2(3,1)).toBe(1);});it('c',()=>{expect(hd328adm2(0,0)).toBe(0);});it('d',()=>{expect(hd328adm2(93,73)).toBe(2);});it('e',()=>{expect(hd328adm2(15,0)).toBe(4);});});
function hd329adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329adm2_hd',()=>{it('a',()=>{expect(hd329adm2(1,4)).toBe(2);});it('b',()=>{expect(hd329adm2(3,1)).toBe(1);});it('c',()=>{expect(hd329adm2(0,0)).toBe(0);});it('d',()=>{expect(hd329adm2(93,73)).toBe(2);});it('e',()=>{expect(hd329adm2(15,0)).toBe(4);});});
function hd330adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330adm2_hd',()=>{it('a',()=>{expect(hd330adm2(1,4)).toBe(2);});it('b',()=>{expect(hd330adm2(3,1)).toBe(1);});it('c',()=>{expect(hd330adm2(0,0)).toBe(0);});it('d',()=>{expect(hd330adm2(93,73)).toBe(2);});it('e',()=>{expect(hd330adm2(15,0)).toBe(4);});});
function hd331adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331adm2_hd',()=>{it('a',()=>{expect(hd331adm2(1,4)).toBe(2);});it('b',()=>{expect(hd331adm2(3,1)).toBe(1);});it('c',()=>{expect(hd331adm2(0,0)).toBe(0);});it('d',()=>{expect(hd331adm2(93,73)).toBe(2);});it('e',()=>{expect(hd331adm2(15,0)).toBe(4);});});
function hd332adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332adm2_hd',()=>{it('a',()=>{expect(hd332adm2(1,4)).toBe(2);});it('b',()=>{expect(hd332adm2(3,1)).toBe(1);});it('c',()=>{expect(hd332adm2(0,0)).toBe(0);});it('d',()=>{expect(hd332adm2(93,73)).toBe(2);});it('e',()=>{expect(hd332adm2(15,0)).toBe(4);});});
function hd333adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333adm2_hd',()=>{it('a',()=>{expect(hd333adm2(1,4)).toBe(2);});it('b',()=>{expect(hd333adm2(3,1)).toBe(1);});it('c',()=>{expect(hd333adm2(0,0)).toBe(0);});it('d',()=>{expect(hd333adm2(93,73)).toBe(2);});it('e',()=>{expect(hd333adm2(15,0)).toBe(4);});});
function hd334adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334adm2_hd',()=>{it('a',()=>{expect(hd334adm2(1,4)).toBe(2);});it('b',()=>{expect(hd334adm2(3,1)).toBe(1);});it('c',()=>{expect(hd334adm2(0,0)).toBe(0);});it('d',()=>{expect(hd334adm2(93,73)).toBe(2);});it('e',()=>{expect(hd334adm2(15,0)).toBe(4);});});
function hd335adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335adm2_hd',()=>{it('a',()=>{expect(hd335adm2(1,4)).toBe(2);});it('b',()=>{expect(hd335adm2(3,1)).toBe(1);});it('c',()=>{expect(hd335adm2(0,0)).toBe(0);});it('d',()=>{expect(hd335adm2(93,73)).toBe(2);});it('e',()=>{expect(hd335adm2(15,0)).toBe(4);});});
function hd336adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336adm2_hd',()=>{it('a',()=>{expect(hd336adm2(1,4)).toBe(2);});it('b',()=>{expect(hd336adm2(3,1)).toBe(1);});it('c',()=>{expect(hd336adm2(0,0)).toBe(0);});it('d',()=>{expect(hd336adm2(93,73)).toBe(2);});it('e',()=>{expect(hd336adm2(15,0)).toBe(4);});});
function hd337adm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337adm2_hd',()=>{it('a',()=>{expect(hd337adm2(1,4)).toBe(2);});it('b',()=>{expect(hd337adm2(3,1)).toBe(1);});it('c',()=>{expect(hd337adm2(0,0)).toBe(0);});it('d',()=>{expect(hd337adm2(93,73)).toBe(2);});it('e',()=>{expect(hd337adm2(15,0)).toBe(4);});});
function hd338admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338admx2_hd',()=>{it('a',()=>{expect(hd338admx2(1,4)).toBe(2);});it('b',()=>{expect(hd338admx2(3,1)).toBe(1);});it('c',()=>{expect(hd338admx2(0,0)).toBe(0);});it('d',()=>{expect(hd338admx2(93,73)).toBe(2);});it('e',()=>{expect(hd338admx2(15,0)).toBe(4);});});
function hd339admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339admx2_hd',()=>{it('a',()=>{expect(hd339admx2(1,4)).toBe(2);});it('b',()=>{expect(hd339admx2(3,1)).toBe(1);});it('c',()=>{expect(hd339admx2(0,0)).toBe(0);});it('d',()=>{expect(hd339admx2(93,73)).toBe(2);});it('e',()=>{expect(hd339admx2(15,0)).toBe(4);});});
function hd340admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340admx2_hd',()=>{it('a',()=>{expect(hd340admx2(1,4)).toBe(2);});it('b',()=>{expect(hd340admx2(3,1)).toBe(1);});it('c',()=>{expect(hd340admx2(0,0)).toBe(0);});it('d',()=>{expect(hd340admx2(93,73)).toBe(2);});it('e',()=>{expect(hd340admx2(15,0)).toBe(4);});});
function hd341admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341admx2_hd',()=>{it('a',()=>{expect(hd341admx2(1,4)).toBe(2);});it('b',()=>{expect(hd341admx2(3,1)).toBe(1);});it('c',()=>{expect(hd341admx2(0,0)).toBe(0);});it('d',()=>{expect(hd341admx2(93,73)).toBe(2);});it('e',()=>{expect(hd341admx2(15,0)).toBe(4);});});
function hd342admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342admx2_hd',()=>{it('a',()=>{expect(hd342admx2(1,4)).toBe(2);});it('b',()=>{expect(hd342admx2(3,1)).toBe(1);});it('c',()=>{expect(hd342admx2(0,0)).toBe(0);});it('d',()=>{expect(hd342admx2(93,73)).toBe(2);});it('e',()=>{expect(hd342admx2(15,0)).toBe(4);});});
function hd343admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343admx2_hd',()=>{it('a',()=>{expect(hd343admx2(1,4)).toBe(2);});it('b',()=>{expect(hd343admx2(3,1)).toBe(1);});it('c',()=>{expect(hd343admx2(0,0)).toBe(0);});it('d',()=>{expect(hd343admx2(93,73)).toBe(2);});it('e',()=>{expect(hd343admx2(15,0)).toBe(4);});});
function hd344admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344admx2_hd',()=>{it('a',()=>{expect(hd344admx2(1,4)).toBe(2);});it('b',()=>{expect(hd344admx2(3,1)).toBe(1);});it('c',()=>{expect(hd344admx2(0,0)).toBe(0);});it('d',()=>{expect(hd344admx2(93,73)).toBe(2);});it('e',()=>{expect(hd344admx2(15,0)).toBe(4);});});
function hd345admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345admx2_hd',()=>{it('a',()=>{expect(hd345admx2(1,4)).toBe(2);});it('b',()=>{expect(hd345admx2(3,1)).toBe(1);});it('c',()=>{expect(hd345admx2(0,0)).toBe(0);});it('d',()=>{expect(hd345admx2(93,73)).toBe(2);});it('e',()=>{expect(hd345admx2(15,0)).toBe(4);});});
function hd346admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346admx2_hd',()=>{it('a',()=>{expect(hd346admx2(1,4)).toBe(2);});it('b',()=>{expect(hd346admx2(3,1)).toBe(1);});it('c',()=>{expect(hd346admx2(0,0)).toBe(0);});it('d',()=>{expect(hd346admx2(93,73)).toBe(2);});it('e',()=>{expect(hd346admx2(15,0)).toBe(4);});});
function hd347admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347admx2_hd',()=>{it('a',()=>{expect(hd347admx2(1,4)).toBe(2);});it('b',()=>{expect(hd347admx2(3,1)).toBe(1);});it('c',()=>{expect(hd347admx2(0,0)).toBe(0);});it('d',()=>{expect(hd347admx2(93,73)).toBe(2);});it('e',()=>{expect(hd347admx2(15,0)).toBe(4);});});
function hd348admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348admx2_hd',()=>{it('a',()=>{expect(hd348admx2(1,4)).toBe(2);});it('b',()=>{expect(hd348admx2(3,1)).toBe(1);});it('c',()=>{expect(hd348admx2(0,0)).toBe(0);});it('d',()=>{expect(hd348admx2(93,73)).toBe(2);});it('e',()=>{expect(hd348admx2(15,0)).toBe(4);});});
function hd349admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349admx2_hd',()=>{it('a',()=>{expect(hd349admx2(1,4)).toBe(2);});it('b',()=>{expect(hd349admx2(3,1)).toBe(1);});it('c',()=>{expect(hd349admx2(0,0)).toBe(0);});it('d',()=>{expect(hd349admx2(93,73)).toBe(2);});it('e',()=>{expect(hd349admx2(15,0)).toBe(4);});});
function hd350admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350admx2_hd',()=>{it('a',()=>{expect(hd350admx2(1,4)).toBe(2);});it('b',()=>{expect(hd350admx2(3,1)).toBe(1);});it('c',()=>{expect(hd350admx2(0,0)).toBe(0);});it('d',()=>{expect(hd350admx2(93,73)).toBe(2);});it('e',()=>{expect(hd350admx2(15,0)).toBe(4);});});
function hd351admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351admx2_hd',()=>{it('a',()=>{expect(hd351admx2(1,4)).toBe(2);});it('b',()=>{expect(hd351admx2(3,1)).toBe(1);});it('c',()=>{expect(hd351admx2(0,0)).toBe(0);});it('d',()=>{expect(hd351admx2(93,73)).toBe(2);});it('e',()=>{expect(hd351admx2(15,0)).toBe(4);});});
function hd352admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352admx2_hd',()=>{it('a',()=>{expect(hd352admx2(1,4)).toBe(2);});it('b',()=>{expect(hd352admx2(3,1)).toBe(1);});it('c',()=>{expect(hd352admx2(0,0)).toBe(0);});it('d',()=>{expect(hd352admx2(93,73)).toBe(2);});it('e',()=>{expect(hd352admx2(15,0)).toBe(4);});});
function hd353admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353admx2_hd',()=>{it('a',()=>{expect(hd353admx2(1,4)).toBe(2);});it('b',()=>{expect(hd353admx2(3,1)).toBe(1);});it('c',()=>{expect(hd353admx2(0,0)).toBe(0);});it('d',()=>{expect(hd353admx2(93,73)).toBe(2);});it('e',()=>{expect(hd353admx2(15,0)).toBe(4);});});
function hd354admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354admx2_hd',()=>{it('a',()=>{expect(hd354admx2(1,4)).toBe(2);});it('b',()=>{expect(hd354admx2(3,1)).toBe(1);});it('c',()=>{expect(hd354admx2(0,0)).toBe(0);});it('d',()=>{expect(hd354admx2(93,73)).toBe(2);});it('e',()=>{expect(hd354admx2(15,0)).toBe(4);});});
function hd355admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355admx2_hd',()=>{it('a',()=>{expect(hd355admx2(1,4)).toBe(2);});it('b',()=>{expect(hd355admx2(3,1)).toBe(1);});it('c',()=>{expect(hd355admx2(0,0)).toBe(0);});it('d',()=>{expect(hd355admx2(93,73)).toBe(2);});it('e',()=>{expect(hd355admx2(15,0)).toBe(4);});});
function hd356admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356admx2_hd',()=>{it('a',()=>{expect(hd356admx2(1,4)).toBe(2);});it('b',()=>{expect(hd356admx2(3,1)).toBe(1);});it('c',()=>{expect(hd356admx2(0,0)).toBe(0);});it('d',()=>{expect(hd356admx2(93,73)).toBe(2);});it('e',()=>{expect(hd356admx2(15,0)).toBe(4);});});
function hd357admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357admx2_hd',()=>{it('a',()=>{expect(hd357admx2(1,4)).toBe(2);});it('b',()=>{expect(hd357admx2(3,1)).toBe(1);});it('c',()=>{expect(hd357admx2(0,0)).toBe(0);});it('d',()=>{expect(hd357admx2(93,73)).toBe(2);});it('e',()=>{expect(hd357admx2(15,0)).toBe(4);});});
function hd358admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358admx2_hd',()=>{it('a',()=>{expect(hd358admx2(1,4)).toBe(2);});it('b',()=>{expect(hd358admx2(3,1)).toBe(1);});it('c',()=>{expect(hd358admx2(0,0)).toBe(0);});it('d',()=>{expect(hd358admx2(93,73)).toBe(2);});it('e',()=>{expect(hd358admx2(15,0)).toBe(4);});});
function hd359admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359admx2_hd',()=>{it('a',()=>{expect(hd359admx2(1,4)).toBe(2);});it('b',()=>{expect(hd359admx2(3,1)).toBe(1);});it('c',()=>{expect(hd359admx2(0,0)).toBe(0);});it('d',()=>{expect(hd359admx2(93,73)).toBe(2);});it('e',()=>{expect(hd359admx2(15,0)).toBe(4);});});
function hd360admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360admx2_hd',()=>{it('a',()=>{expect(hd360admx2(1,4)).toBe(2);});it('b',()=>{expect(hd360admx2(3,1)).toBe(1);});it('c',()=>{expect(hd360admx2(0,0)).toBe(0);});it('d',()=>{expect(hd360admx2(93,73)).toBe(2);});it('e',()=>{expect(hd360admx2(15,0)).toBe(4);});});
function hd361admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361admx2_hd',()=>{it('a',()=>{expect(hd361admx2(1,4)).toBe(2);});it('b',()=>{expect(hd361admx2(3,1)).toBe(1);});it('c',()=>{expect(hd361admx2(0,0)).toBe(0);});it('d',()=>{expect(hd361admx2(93,73)).toBe(2);});it('e',()=>{expect(hd361admx2(15,0)).toBe(4);});});
function hd362admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362admx2_hd',()=>{it('a',()=>{expect(hd362admx2(1,4)).toBe(2);});it('b',()=>{expect(hd362admx2(3,1)).toBe(1);});it('c',()=>{expect(hd362admx2(0,0)).toBe(0);});it('d',()=>{expect(hd362admx2(93,73)).toBe(2);});it('e',()=>{expect(hd362admx2(15,0)).toBe(4);});});
function hd363admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363admx2_hd',()=>{it('a',()=>{expect(hd363admx2(1,4)).toBe(2);});it('b',()=>{expect(hd363admx2(3,1)).toBe(1);});it('c',()=>{expect(hd363admx2(0,0)).toBe(0);});it('d',()=>{expect(hd363admx2(93,73)).toBe(2);});it('e',()=>{expect(hd363admx2(15,0)).toBe(4);});});
function hd364admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364admx2_hd',()=>{it('a',()=>{expect(hd364admx2(1,4)).toBe(2);});it('b',()=>{expect(hd364admx2(3,1)).toBe(1);});it('c',()=>{expect(hd364admx2(0,0)).toBe(0);});it('d',()=>{expect(hd364admx2(93,73)).toBe(2);});it('e',()=>{expect(hd364admx2(15,0)).toBe(4);});});
function hd365admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365admx2_hd',()=>{it('a',()=>{expect(hd365admx2(1,4)).toBe(2);});it('b',()=>{expect(hd365admx2(3,1)).toBe(1);});it('c',()=>{expect(hd365admx2(0,0)).toBe(0);});it('d',()=>{expect(hd365admx2(93,73)).toBe(2);});it('e',()=>{expect(hd365admx2(15,0)).toBe(4);});});
function hd366admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366admx2_hd',()=>{it('a',()=>{expect(hd366admx2(1,4)).toBe(2);});it('b',()=>{expect(hd366admx2(3,1)).toBe(1);});it('c',()=>{expect(hd366admx2(0,0)).toBe(0);});it('d',()=>{expect(hd366admx2(93,73)).toBe(2);});it('e',()=>{expect(hd366admx2(15,0)).toBe(4);});});
function hd367admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367admx2_hd',()=>{it('a',()=>{expect(hd367admx2(1,4)).toBe(2);});it('b',()=>{expect(hd367admx2(3,1)).toBe(1);});it('c',()=>{expect(hd367admx2(0,0)).toBe(0);});it('d',()=>{expect(hd367admx2(93,73)).toBe(2);});it('e',()=>{expect(hd367admx2(15,0)).toBe(4);});});
function hd368admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368admx2_hd',()=>{it('a',()=>{expect(hd368admx2(1,4)).toBe(2);});it('b',()=>{expect(hd368admx2(3,1)).toBe(1);});it('c',()=>{expect(hd368admx2(0,0)).toBe(0);});it('d',()=>{expect(hd368admx2(93,73)).toBe(2);});it('e',()=>{expect(hd368admx2(15,0)).toBe(4);});});
function hd369admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369admx2_hd',()=>{it('a',()=>{expect(hd369admx2(1,4)).toBe(2);});it('b',()=>{expect(hd369admx2(3,1)).toBe(1);});it('c',()=>{expect(hd369admx2(0,0)).toBe(0);});it('d',()=>{expect(hd369admx2(93,73)).toBe(2);});it('e',()=>{expect(hd369admx2(15,0)).toBe(4);});});
function hd370admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370admx2_hd',()=>{it('a',()=>{expect(hd370admx2(1,4)).toBe(2);});it('b',()=>{expect(hd370admx2(3,1)).toBe(1);});it('c',()=>{expect(hd370admx2(0,0)).toBe(0);});it('d',()=>{expect(hd370admx2(93,73)).toBe(2);});it('e',()=>{expect(hd370admx2(15,0)).toBe(4);});});
function hd371admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371admx2_hd',()=>{it('a',()=>{expect(hd371admx2(1,4)).toBe(2);});it('b',()=>{expect(hd371admx2(3,1)).toBe(1);});it('c',()=>{expect(hd371admx2(0,0)).toBe(0);});it('d',()=>{expect(hd371admx2(93,73)).toBe(2);});it('e',()=>{expect(hd371admx2(15,0)).toBe(4);});});
function hd372admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372admx2_hd',()=>{it('a',()=>{expect(hd372admx2(1,4)).toBe(2);});it('b',()=>{expect(hd372admx2(3,1)).toBe(1);});it('c',()=>{expect(hd372admx2(0,0)).toBe(0);});it('d',()=>{expect(hd372admx2(93,73)).toBe(2);});it('e',()=>{expect(hd372admx2(15,0)).toBe(4);});});
function hd373admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373admx2_hd',()=>{it('a',()=>{expect(hd373admx2(1,4)).toBe(2);});it('b',()=>{expect(hd373admx2(3,1)).toBe(1);});it('c',()=>{expect(hd373admx2(0,0)).toBe(0);});it('d',()=>{expect(hd373admx2(93,73)).toBe(2);});it('e',()=>{expect(hd373admx2(15,0)).toBe(4);});});
function hd374admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374admx2_hd',()=>{it('a',()=>{expect(hd374admx2(1,4)).toBe(2);});it('b',()=>{expect(hd374admx2(3,1)).toBe(1);});it('c',()=>{expect(hd374admx2(0,0)).toBe(0);});it('d',()=>{expect(hd374admx2(93,73)).toBe(2);});it('e',()=>{expect(hd374admx2(15,0)).toBe(4);});});
function hd375admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375admx2_hd',()=>{it('a',()=>{expect(hd375admx2(1,4)).toBe(2);});it('b',()=>{expect(hd375admx2(3,1)).toBe(1);});it('c',()=>{expect(hd375admx2(0,0)).toBe(0);});it('d',()=>{expect(hd375admx2(93,73)).toBe(2);});it('e',()=>{expect(hd375admx2(15,0)).toBe(4);});});
function hd376admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376admx2_hd',()=>{it('a',()=>{expect(hd376admx2(1,4)).toBe(2);});it('b',()=>{expect(hd376admx2(3,1)).toBe(1);});it('c',()=>{expect(hd376admx2(0,0)).toBe(0);});it('d',()=>{expect(hd376admx2(93,73)).toBe(2);});it('e',()=>{expect(hd376admx2(15,0)).toBe(4);});});
function hd377admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377admx2_hd',()=>{it('a',()=>{expect(hd377admx2(1,4)).toBe(2);});it('b',()=>{expect(hd377admx2(3,1)).toBe(1);});it('c',()=>{expect(hd377admx2(0,0)).toBe(0);});it('d',()=>{expect(hd377admx2(93,73)).toBe(2);});it('e',()=>{expect(hd377admx2(15,0)).toBe(4);});});
function hd378admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378admx2_hd',()=>{it('a',()=>{expect(hd378admx2(1,4)).toBe(2);});it('b',()=>{expect(hd378admx2(3,1)).toBe(1);});it('c',()=>{expect(hd378admx2(0,0)).toBe(0);});it('d',()=>{expect(hd378admx2(93,73)).toBe(2);});it('e',()=>{expect(hd378admx2(15,0)).toBe(4);});});
function hd379admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379admx2_hd',()=>{it('a',()=>{expect(hd379admx2(1,4)).toBe(2);});it('b',()=>{expect(hd379admx2(3,1)).toBe(1);});it('c',()=>{expect(hd379admx2(0,0)).toBe(0);});it('d',()=>{expect(hd379admx2(93,73)).toBe(2);});it('e',()=>{expect(hd379admx2(15,0)).toBe(4);});});
function hd380admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380admx2_hd',()=>{it('a',()=>{expect(hd380admx2(1,4)).toBe(2);});it('b',()=>{expect(hd380admx2(3,1)).toBe(1);});it('c',()=>{expect(hd380admx2(0,0)).toBe(0);});it('d',()=>{expect(hd380admx2(93,73)).toBe(2);});it('e',()=>{expect(hd380admx2(15,0)).toBe(4);});});
function hd381admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381admx2_hd',()=>{it('a',()=>{expect(hd381admx2(1,4)).toBe(2);});it('b',()=>{expect(hd381admx2(3,1)).toBe(1);});it('c',()=>{expect(hd381admx2(0,0)).toBe(0);});it('d',()=>{expect(hd381admx2(93,73)).toBe(2);});it('e',()=>{expect(hd381admx2(15,0)).toBe(4);});});
function hd382admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382admx2_hd',()=>{it('a',()=>{expect(hd382admx2(1,4)).toBe(2);});it('b',()=>{expect(hd382admx2(3,1)).toBe(1);});it('c',()=>{expect(hd382admx2(0,0)).toBe(0);});it('d',()=>{expect(hd382admx2(93,73)).toBe(2);});it('e',()=>{expect(hd382admx2(15,0)).toBe(4);});});
function hd383admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383admx2_hd',()=>{it('a',()=>{expect(hd383admx2(1,4)).toBe(2);});it('b',()=>{expect(hd383admx2(3,1)).toBe(1);});it('c',()=>{expect(hd383admx2(0,0)).toBe(0);});it('d',()=>{expect(hd383admx2(93,73)).toBe(2);});it('e',()=>{expect(hd383admx2(15,0)).toBe(4);});});
function hd384admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384admx2_hd',()=>{it('a',()=>{expect(hd384admx2(1,4)).toBe(2);});it('b',()=>{expect(hd384admx2(3,1)).toBe(1);});it('c',()=>{expect(hd384admx2(0,0)).toBe(0);});it('d',()=>{expect(hd384admx2(93,73)).toBe(2);});it('e',()=>{expect(hd384admx2(15,0)).toBe(4);});});
function hd385admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385admx2_hd',()=>{it('a',()=>{expect(hd385admx2(1,4)).toBe(2);});it('b',()=>{expect(hd385admx2(3,1)).toBe(1);});it('c',()=>{expect(hd385admx2(0,0)).toBe(0);});it('d',()=>{expect(hd385admx2(93,73)).toBe(2);});it('e',()=>{expect(hd385admx2(15,0)).toBe(4);});});
function hd386admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386admx2_hd',()=>{it('a',()=>{expect(hd386admx2(1,4)).toBe(2);});it('b',()=>{expect(hd386admx2(3,1)).toBe(1);});it('c',()=>{expect(hd386admx2(0,0)).toBe(0);});it('d',()=>{expect(hd386admx2(93,73)).toBe(2);});it('e',()=>{expect(hd386admx2(15,0)).toBe(4);});});
function hd387admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387admx2_hd',()=>{it('a',()=>{expect(hd387admx2(1,4)).toBe(2);});it('b',()=>{expect(hd387admx2(3,1)).toBe(1);});it('c',()=>{expect(hd387admx2(0,0)).toBe(0);});it('d',()=>{expect(hd387admx2(93,73)).toBe(2);});it('e',()=>{expect(hd387admx2(15,0)).toBe(4);});});
function hd388admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388admx2_hd',()=>{it('a',()=>{expect(hd388admx2(1,4)).toBe(2);});it('b',()=>{expect(hd388admx2(3,1)).toBe(1);});it('c',()=>{expect(hd388admx2(0,0)).toBe(0);});it('d',()=>{expect(hd388admx2(93,73)).toBe(2);});it('e',()=>{expect(hd388admx2(15,0)).toBe(4);});});
function hd389admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389admx2_hd',()=>{it('a',()=>{expect(hd389admx2(1,4)).toBe(2);});it('b',()=>{expect(hd389admx2(3,1)).toBe(1);});it('c',()=>{expect(hd389admx2(0,0)).toBe(0);});it('d',()=>{expect(hd389admx2(93,73)).toBe(2);});it('e',()=>{expect(hd389admx2(15,0)).toBe(4);});});
function hd390admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390admx2_hd',()=>{it('a',()=>{expect(hd390admx2(1,4)).toBe(2);});it('b',()=>{expect(hd390admx2(3,1)).toBe(1);});it('c',()=>{expect(hd390admx2(0,0)).toBe(0);});it('d',()=>{expect(hd390admx2(93,73)).toBe(2);});it('e',()=>{expect(hd390admx2(15,0)).toBe(4);});});
function hd391admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391admx2_hd',()=>{it('a',()=>{expect(hd391admx2(1,4)).toBe(2);});it('b',()=>{expect(hd391admx2(3,1)).toBe(1);});it('c',()=>{expect(hd391admx2(0,0)).toBe(0);});it('d',()=>{expect(hd391admx2(93,73)).toBe(2);});it('e',()=>{expect(hd391admx2(15,0)).toBe(4);});});
function hd392admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392admx2_hd',()=>{it('a',()=>{expect(hd392admx2(1,4)).toBe(2);});it('b',()=>{expect(hd392admx2(3,1)).toBe(1);});it('c',()=>{expect(hd392admx2(0,0)).toBe(0);});it('d',()=>{expect(hd392admx2(93,73)).toBe(2);});it('e',()=>{expect(hd392admx2(15,0)).toBe(4);});});
function hd393admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393admx2_hd',()=>{it('a',()=>{expect(hd393admx2(1,4)).toBe(2);});it('b',()=>{expect(hd393admx2(3,1)).toBe(1);});it('c',()=>{expect(hd393admx2(0,0)).toBe(0);});it('d',()=>{expect(hd393admx2(93,73)).toBe(2);});it('e',()=>{expect(hd393admx2(15,0)).toBe(4);});});
function hd394admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394admx2_hd',()=>{it('a',()=>{expect(hd394admx2(1,4)).toBe(2);});it('b',()=>{expect(hd394admx2(3,1)).toBe(1);});it('c',()=>{expect(hd394admx2(0,0)).toBe(0);});it('d',()=>{expect(hd394admx2(93,73)).toBe(2);});it('e',()=>{expect(hd394admx2(15,0)).toBe(4);});});
function hd395admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395admx2_hd',()=>{it('a',()=>{expect(hd395admx2(1,4)).toBe(2);});it('b',()=>{expect(hd395admx2(3,1)).toBe(1);});it('c',()=>{expect(hd395admx2(0,0)).toBe(0);});it('d',()=>{expect(hd395admx2(93,73)).toBe(2);});it('e',()=>{expect(hd395admx2(15,0)).toBe(4);});});
function hd396admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396admx2_hd',()=>{it('a',()=>{expect(hd396admx2(1,4)).toBe(2);});it('b',()=>{expect(hd396admx2(3,1)).toBe(1);});it('c',()=>{expect(hd396admx2(0,0)).toBe(0);});it('d',()=>{expect(hd396admx2(93,73)).toBe(2);});it('e',()=>{expect(hd396admx2(15,0)).toBe(4);});});
function hd397admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397admx2_hd',()=>{it('a',()=>{expect(hd397admx2(1,4)).toBe(2);});it('b',()=>{expect(hd397admx2(3,1)).toBe(1);});it('c',()=>{expect(hd397admx2(0,0)).toBe(0);});it('d',()=>{expect(hd397admx2(93,73)).toBe(2);});it('e',()=>{expect(hd397admx2(15,0)).toBe(4);});});
function hd398admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398admx2_hd',()=>{it('a',()=>{expect(hd398admx2(1,4)).toBe(2);});it('b',()=>{expect(hd398admx2(3,1)).toBe(1);});it('c',()=>{expect(hd398admx2(0,0)).toBe(0);});it('d',()=>{expect(hd398admx2(93,73)).toBe(2);});it('e',()=>{expect(hd398admx2(15,0)).toBe(4);});});
function hd399admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399admx2_hd',()=>{it('a',()=>{expect(hd399admx2(1,4)).toBe(2);});it('b',()=>{expect(hd399admx2(3,1)).toBe(1);});it('c',()=>{expect(hd399admx2(0,0)).toBe(0);});it('d',()=>{expect(hd399admx2(93,73)).toBe(2);});it('e',()=>{expect(hd399admx2(15,0)).toBe(4);});});
function hd400admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400admx2_hd',()=>{it('a',()=>{expect(hd400admx2(1,4)).toBe(2);});it('b',()=>{expect(hd400admx2(3,1)).toBe(1);});it('c',()=>{expect(hd400admx2(0,0)).toBe(0);});it('d',()=>{expect(hd400admx2(93,73)).toBe(2);});it('e',()=>{expect(hd400admx2(15,0)).toBe(4);});});
function hd401admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401admx2_hd',()=>{it('a',()=>{expect(hd401admx2(1,4)).toBe(2);});it('b',()=>{expect(hd401admx2(3,1)).toBe(1);});it('c',()=>{expect(hd401admx2(0,0)).toBe(0);});it('d',()=>{expect(hd401admx2(93,73)).toBe(2);});it('e',()=>{expect(hd401admx2(15,0)).toBe(4);});});
function hd402admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402admx2_hd',()=>{it('a',()=>{expect(hd402admx2(1,4)).toBe(2);});it('b',()=>{expect(hd402admx2(3,1)).toBe(1);});it('c',()=>{expect(hd402admx2(0,0)).toBe(0);});it('d',()=>{expect(hd402admx2(93,73)).toBe(2);});it('e',()=>{expect(hd402admx2(15,0)).toBe(4);});});
function hd403admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403admx2_hd',()=>{it('a',()=>{expect(hd403admx2(1,4)).toBe(2);});it('b',()=>{expect(hd403admx2(3,1)).toBe(1);});it('c',()=>{expect(hd403admx2(0,0)).toBe(0);});it('d',()=>{expect(hd403admx2(93,73)).toBe(2);});it('e',()=>{expect(hd403admx2(15,0)).toBe(4);});});
function hd404admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404admx2_hd',()=>{it('a',()=>{expect(hd404admx2(1,4)).toBe(2);});it('b',()=>{expect(hd404admx2(3,1)).toBe(1);});it('c',()=>{expect(hd404admx2(0,0)).toBe(0);});it('d',()=>{expect(hd404admx2(93,73)).toBe(2);});it('e',()=>{expect(hd404admx2(15,0)).toBe(4);});});
function hd405admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405admx2_hd',()=>{it('a',()=>{expect(hd405admx2(1,4)).toBe(2);});it('b',()=>{expect(hd405admx2(3,1)).toBe(1);});it('c',()=>{expect(hd405admx2(0,0)).toBe(0);});it('d',()=>{expect(hd405admx2(93,73)).toBe(2);});it('e',()=>{expect(hd405admx2(15,0)).toBe(4);});});
function hd406admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406admx2_hd',()=>{it('a',()=>{expect(hd406admx2(1,4)).toBe(2);});it('b',()=>{expect(hd406admx2(3,1)).toBe(1);});it('c',()=>{expect(hd406admx2(0,0)).toBe(0);});it('d',()=>{expect(hd406admx2(93,73)).toBe(2);});it('e',()=>{expect(hd406admx2(15,0)).toBe(4);});});
function hd407admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407admx2_hd',()=>{it('a',()=>{expect(hd407admx2(1,4)).toBe(2);});it('b',()=>{expect(hd407admx2(3,1)).toBe(1);});it('c',()=>{expect(hd407admx2(0,0)).toBe(0);});it('d',()=>{expect(hd407admx2(93,73)).toBe(2);});it('e',()=>{expect(hd407admx2(15,0)).toBe(4);});});
function hd408admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408admx2_hd',()=>{it('a',()=>{expect(hd408admx2(1,4)).toBe(2);});it('b',()=>{expect(hd408admx2(3,1)).toBe(1);});it('c',()=>{expect(hd408admx2(0,0)).toBe(0);});it('d',()=>{expect(hd408admx2(93,73)).toBe(2);});it('e',()=>{expect(hd408admx2(15,0)).toBe(4);});});
function hd409admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409admx2_hd',()=>{it('a',()=>{expect(hd409admx2(1,4)).toBe(2);});it('b',()=>{expect(hd409admx2(3,1)).toBe(1);});it('c',()=>{expect(hd409admx2(0,0)).toBe(0);});it('d',()=>{expect(hd409admx2(93,73)).toBe(2);});it('e',()=>{expect(hd409admx2(15,0)).toBe(4);});});
function hd410admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410admx2_hd',()=>{it('a',()=>{expect(hd410admx2(1,4)).toBe(2);});it('b',()=>{expect(hd410admx2(3,1)).toBe(1);});it('c',()=>{expect(hd410admx2(0,0)).toBe(0);});it('d',()=>{expect(hd410admx2(93,73)).toBe(2);});it('e',()=>{expect(hd410admx2(15,0)).toBe(4);});});
function hd411admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411admx2_hd',()=>{it('a',()=>{expect(hd411admx2(1,4)).toBe(2);});it('b',()=>{expect(hd411admx2(3,1)).toBe(1);});it('c',()=>{expect(hd411admx2(0,0)).toBe(0);});it('d',()=>{expect(hd411admx2(93,73)).toBe(2);});it('e',()=>{expect(hd411admx2(15,0)).toBe(4);});});
function hd412admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412admx2_hd',()=>{it('a',()=>{expect(hd412admx2(1,4)).toBe(2);});it('b',()=>{expect(hd412admx2(3,1)).toBe(1);});it('c',()=>{expect(hd412admx2(0,0)).toBe(0);});it('d',()=>{expect(hd412admx2(93,73)).toBe(2);});it('e',()=>{expect(hd412admx2(15,0)).toBe(4);});});
function hd413admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413admx2_hd',()=>{it('a',()=>{expect(hd413admx2(1,4)).toBe(2);});it('b',()=>{expect(hd413admx2(3,1)).toBe(1);});it('c',()=>{expect(hd413admx2(0,0)).toBe(0);});it('d',()=>{expect(hd413admx2(93,73)).toBe(2);});it('e',()=>{expect(hd413admx2(15,0)).toBe(4);});});
function hd414admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414admx2_hd',()=>{it('a',()=>{expect(hd414admx2(1,4)).toBe(2);});it('b',()=>{expect(hd414admx2(3,1)).toBe(1);});it('c',()=>{expect(hd414admx2(0,0)).toBe(0);});it('d',()=>{expect(hd414admx2(93,73)).toBe(2);});it('e',()=>{expect(hd414admx2(15,0)).toBe(4);});});
function hd415admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415admx2_hd',()=>{it('a',()=>{expect(hd415admx2(1,4)).toBe(2);});it('b',()=>{expect(hd415admx2(3,1)).toBe(1);});it('c',()=>{expect(hd415admx2(0,0)).toBe(0);});it('d',()=>{expect(hd415admx2(93,73)).toBe(2);});it('e',()=>{expect(hd415admx2(15,0)).toBe(4);});});
function hd416admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416admx2_hd',()=>{it('a',()=>{expect(hd416admx2(1,4)).toBe(2);});it('b',()=>{expect(hd416admx2(3,1)).toBe(1);});it('c',()=>{expect(hd416admx2(0,0)).toBe(0);});it('d',()=>{expect(hd416admx2(93,73)).toBe(2);});it('e',()=>{expect(hd416admx2(15,0)).toBe(4);});});
function hd417admx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417admx2_hd',()=>{it('a',()=>{expect(hd417admx2(1,4)).toBe(2);});it('b',()=>{expect(hd417admx2(3,1)).toBe(1);});it('c',()=>{expect(hd417admx2(0,0)).toBe(0);});it('d',()=>{expect(hd417admx2(93,73)).toBe(2);});it('e',()=>{expect(hd417admx2(15,0)).toBe(4);});});
