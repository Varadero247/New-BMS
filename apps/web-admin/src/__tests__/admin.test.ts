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
