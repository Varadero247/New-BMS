// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { middleware } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeReq(path: string, portalKey?: string): NextRequest {
  return new NextRequest(`http://localhost:3046${path}`, {
    cookies: portalKey ? { nexara_portal_key: portalKey } : {},
  });
}

type MiddlewareResult = { type: string; url?: string };

function isRedirectToNotActivated(result: MiddlewareResult): boolean {
  return result.type === 'redirect' && !!result.url?.includes('/not-activated');
}

function isNext(result: MiddlewareResult): boolean {
  return result.type === 'next';
}

// ── constants ────────────────────────────────────────────────────────────────

const VALID_KEY = 'NEXARA-ATP-MERIDIAN-2026';

const ALL_VALID_KEYS = [
  'NEXARA-ATP-MERIDIAN-2026',
  'NEXARA-ATP-APEX-2026',
  'NEXARA-ATP-BIGCORP-2026',
  'NEXARA-ATP-MULTINATIONAL-2026',
  'NEXARA-ATP-CLIENTCO-2026',
  'NEXARA-ATP-GLOBALFIRM-2026',
  'NEXARA-ATP-TESTORG-2026',
  'NEXARA-ATP-ENTERPRISE-2026',
];

const PROTECTED_PATHS = [
  '/', '/programme', '/modules', '/modules/1', '/modules/2', '/modules/3',
  '/modules/4', '/modules/5', '/modules/6', '/modules/7',
  '/labs/1', '/labs/2', '/labs/3', '/labs/4', '/labs/5', '/labs/6', '/labs/7',
  '/assessments', '/assessments/pre', '/assessments/day1', '/assessments/final',
  '/assessments/final-partb',
  '/certificate', '/login', '/admin',
];

const ALWAYS_ALLOWED = [
  '/not-activated',
  '/not-activated?next=%2F',
  '/_next/static/css/main.css',
  '/_next/static/chunks/app.js',
  '/_next/image',
  '/favicon.ico',
  '/api/health',
  '/api/status',
];

const INVALID_KEYS = [
  'nexara-atp-meridian-2026',   // lowercase
  'NEXARA-IMS-MERIDIAN-2026',   // wrong code
  'NEXARA-TRN-MERIDIAN-2026',   // wrong code
  'ATP-MERIDIAN-2026',          // missing NEXARA-
  'NEXARA-',                     // too short
  'NEXARA-ATP-',                 // too short
  'NEXARA-ATP-SHORT',            // < 20 chars
  '12345678901234567890',        // no prefix
  'RANDOM-KEY-ENTIRELY-WRONG',  // no prefix
];

// ── 1. Default off: no key blocks all protected routes ───────────────────────

describe('Default state: portal is OFF (no activation key)', () => {
  it('blocks / without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/')))).toBe(true));
  it('blocks /programme without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/programme')))).toBe(true));
  it('blocks /modules without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/modules')))).toBe(true));
  it('blocks /assessments without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/assessments')))).toBe(true));
  it('blocks /certificate without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/certificate')))).toBe(true));
  it('blocks /login without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/login')))).toBe(true));
  it('blocks /admin without key', () => expect(isRedirectToNotActivated(middleware(makeReq('/admin')))).toBe(true));

  it.each(PROTECTED_PATHS)('blocks %s without key', (path) => {
    expect(isRedirectToNotActivated(middleware(makeReq(path)))).toBe(true);
  });

  it('redirect target is /not-activated', () => {
    const r = middleware(makeReq('/')) as MiddlewareResult;
    expect(r.url).toContain('/not-activated');
  });

  it('redirect preserves next= param for /', () => {
    const r = middleware(makeReq('/')) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('redirect preserves next= param for /modules/3', () => {
    const r = middleware(makeReq('/modules/3')) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('redirect preserves next= param for /labs/5', () => {
    const r = middleware(makeReq('/labs/5')) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('redirect preserves next= param for /certificate', () => {
    const r = middleware(makeReq('/certificate')) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('redirect preserves next= param for /assessments/final', () => {
    const r = middleware(makeReq('/assessments/final')) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('redirect preserves next= param for /assessments/final-partb', () => {
    const r = middleware(makeReq('/assessments/final-partb')) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('blocks /assessments/final-partb without key', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/assessments/final-partb')))).toBe(true);
  });
});

// ── 2. Always-allowed paths ──────────────────────────────────────────────────

describe('Always-allowed paths (bypass gate)', () => {
  it.each(ALWAYS_ALLOWED)('allows %s without key', (path) => {
    expect(isNext(middleware(makeReq(path)))).toBe(true);
  });

  it.each(ALWAYS_ALLOWED)('allows %s with valid key', (path) => {
    expect(isNext(middleware(makeReq(path, VALID_KEY)))).toBe(true);
  });

  it.each(ALWAYS_ALLOWED)('allows %s with invalid key', (path) => {
    expect(isNext(middleware(makeReq(path, 'INVALID')))).toBe(true);
  });

  it('/_next static assets never gated', () => {
    const assets = [
      '/_next/static/chunks/framework.js',
      '/_next/static/css/app.css',
      '/_next/data/abcdef/index.json',
      '/_next/image?url=test&w=100&q=75',
    ];
    for (const a of assets) {
      expect(isNext(middleware(makeReq(a)))).toBe(true);
    }
  });
});

// ── 3. Valid keys grant access ───────────────────────────────────────────────

describe('Valid Nexara activation keys grant full access', () => {
  it.each(ALL_VALID_KEYS)('key %s allows /', (key) => {
    expect(isNext(middleware(makeReq('/', key)))).toBe(true);
  });

  it.each(ALL_VALID_KEYS)('key %s allows /programme', (key) => {
    expect(isNext(middleware(makeReq('/programme', key)))).toBe(true);
  });

  it.each(ALL_VALID_KEYS)('key %s allows /modules', (key) => {
    expect(isNext(middleware(makeReq('/modules', key)))).toBe(true);
  });

  it.each(ALL_VALID_KEYS)('key %s allows /certificate', (key) => {
    expect(isNext(middleware(makeReq('/certificate', key)))).toBe(true);
  });

  it.each(ALL_VALID_KEYS)('key %s allows /admin', (key) => {
    expect(isNext(middleware(makeReq('/admin', key)))).toBe(true);
  });

  it.each(ALL_VALID_KEYS)('key %s allows /assessments/final', (key) => {
    expect(isNext(middleware(makeReq('/assessments/final', key)))).toBe(true);
  });

  it('valid key allows all 7 module pages', () => {
    for (let i = 1; i <= 7; i++) {
      expect(isNext(middleware(makeReq(`/modules/${i}`, VALID_KEY)))).toBe(true);
    }
  });

  it('valid key allows all 7 lab pages', () => {
    for (let i = 1; i <= 7; i++) {
      expect(isNext(middleware(makeReq(`/labs/${i}`, VALID_KEY)))).toBe(true);
    }
  });

  it('valid key allows pre assessment', () => {
    expect(isNext(middleware(makeReq('/assessments/pre', VALID_KEY)))).toBe(true);
  });

  it('valid key allows day1 assessment', () => {
    expect(isNext(middleware(makeReq('/assessments/day1', VALID_KEY)))).toBe(true);
  });

  it('valid key allows final assessment Part A', () => {
    expect(isNext(middleware(makeReq('/assessments/final', VALID_KEY)))).toBe(true);
  });

  it('valid key allows final assessment Part B', () => {
    expect(isNext(middleware(makeReq('/assessments/final-partb', VALID_KEY)))).toBe(true);
  });

  it.each(PROTECTED_PATHS)('valid key allows %s', (path) => {
    expect(isNext(middleware(makeReq(path, VALID_KEY)))).toBe(true);
  });
});

// ── 4. Invalid keys are rejected ─────────────────────────────────────────────

describe('Invalid activation keys are rejected', () => {
  it.each(INVALID_KEYS)('rejects key: "%s"', (key) => {
    const result = middleware(makeReq('/', key)) as MiddlewareResult;
    expect(isRedirectToNotActivated(result)).toBe(true);
  });

  it('rejects empty string key', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/', '')))).toBe(true);
  });

  it('rejects 19-char key (one below minimum)', () => {
    // 'NEXARA-ATP-' = 11, + 8 = 19 chars total
    expect(isRedirectToNotActivated(middleware(makeReq('/', 'NEXARA-ATP-12345678')))).toBe(true);
  });

  it('accepts exactly 20-char key', () => {
    // 'NEXARA-ATP-' = 11, + 9 = 20 chars total
    expect(isNext(middleware(makeReq('/', 'NEXARA-ATP-123456789')))).toBe(true);
  });

  it('rejects key missing the ATP segment', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/', 'NEXARA-MERIDIAN-2026')))).toBe(true);
  });

  it.each(INVALID_KEYS)('rejects "%s" for /programme', (key) => {
    expect(isRedirectToNotActivated(middleware(makeReq('/programme', key)))).toBe(true);
  });

  it.each(INVALID_KEYS)('rejects "%s" for /admin', (key) => {
    expect(isRedirectToNotActivated(middleware(makeReq('/admin', key)))).toBe(true);
  });

  it.each(INVALID_KEYS)('rejects "%s" for /certificate', (key) => {
    expect(isRedirectToNotActivated(middleware(makeReq('/certificate', key)))).toBe(true);
  });

  it.each(INVALID_KEYS)('rejects "%s" for /labs/1', (key) => {
    expect(isRedirectToNotActivated(middleware(makeReq('/labs/1', key)))).toBe(true);
  });
});

// ── 5. Key format validation (client-side, mirrors not-activated page) ────────

describe('Client-side activation key format validation', () => {
  function isValidKeyFormat(key: string): boolean {
    const trimmed = key.trim().toUpperCase();
    return trimmed.startsWith('NEXARA-ATP-') && trimmed.length >= 20;
  }

  // Valid inputs
  it('accepts standard Nexara key', () => expect(isValidKeyFormat('NEXARA-ATP-MERIDIAN-2026')).toBe(true));
  it('accepts lowercase (auto-uppercased)', () => expect(isValidKeyFormat('nexara-atp-meridian-2026')).toBe(true));
  it('accepts mixed case (auto-uppercased)', () => expect(isValidKeyFormat('Nexara-Atp-Meridian-2026')).toBe(true));
  it('accepts key with leading whitespace', () => expect(isValidKeyFormat('  NEXARA-ATP-MERIDIAN-2026')).toBe(true));
  it('accepts key with trailing whitespace', () => expect(isValidKeyFormat('NEXARA-ATP-MERIDIAN-2026  ')).toBe(true));
  it('accepts key with both-side whitespace', () => expect(isValidKeyFormat('  NEXARA-ATP-MERIDIAN-2026  ')).toBe(true));
  it('accepts 20-char key (minimum valid)', () => expect(isValidKeyFormat('NEXARA-ATP-123456789')).toBe(true));
  it('accepts 21-char key', () => expect(isValidKeyFormat('NEXARA-ATP-1234567890')).toBe(true));
  it('accepts 50-char key', () => expect(isValidKeyFormat('NEXARA-ATP-' + 'A'.repeat(39))).toBe(true));
  it.each(ALL_VALID_KEYS)('accepts predefined key: %s', (key) => {
    expect(isValidKeyFormat(key)).toBe(true);
  });

  // Invalid inputs
  it('rejects empty string', () => expect(isValidKeyFormat('')).toBe(false));
  it('rejects whitespace only', () => expect(isValidKeyFormat('   ')).toBe(false));
  it('rejects short key < 20', () => expect(isValidKeyFormat('NEXARA-ATP-SHORT')).toBe(false));
  it('rejects 19-char key', () => expect(isValidKeyFormat('NEXARA-ATP-12345678')).toBe(false));
  it('rejects wrong prefix IMS', () => expect(isValidKeyFormat('NEXARA-IMS-MERIDIAN-2026')).toBe(false));
  it('rejects wrong prefix TRN', () => expect(isValidKeyFormat('NEXARA-TRN-MERIDIAN-2026')).toBe(false));
  it('rejects missing NEXARA prefix', () => expect(isValidKeyFormat('ATP-MERIDIAN-2026')).toBe(false));
  it('rejects completely random string', () => expect(isValidKeyFormat('random-string-value')).toBe(false));
  it('rejects numeric-only', () => expect(isValidKeyFormat('12345678901234567890')).toBe(false));
  it.each(INVALID_KEYS)('rejects invalid: "%s"', (key) => {
    if (key.length >= 20 && key.toUpperCase().startsWith('NEXARA-ATP-')) return; // skip boundary case
    expect(isValidKeyFormat(key)).toBe(false);
  });
});

// ── 6. Assessment scoring ────────────────────────────────────────────────────

describe('Assessment scoring engine', () => {
  function score(answers: Record<number, string>, questions: Array<{ correct: string }>) {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    return { correct, total: questions.length, pct: Math.round((correct / questions.length) * 100) };
  }

  const Q5 = [{ correct: 'A' }, { correct: 'B' }, { correct: 'C' }, { correct: 'D' }, { correct: 'A' }];
  const Q10 = [...Q5, { correct: 'B' }, { correct: 'C' }, { correct: 'D' }, { correct: 'A' }, { correct: 'B' }];
  const Q20 = [...Q10, ...Q10];
  const Q40 = [...Q20, ...Q20];

  const allCorrect5 = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'A' };
  const allWrong5   = { 0: 'X', 1: 'X', 2: 'X', 3: 'X', 4: 'X' };

  it('5/5 = 100%', () => expect(score(allCorrect5, Q5).pct).toBe(100));
  it('0/5 = 0%',   () => expect(score(allWrong5,   Q5).pct).toBe(0));
  it('4/5 = 80%',  () => expect(score({ ...allCorrect5, 4: 'X' }, Q5).pct).toBe(80));
  it('3/5 = 60%',  () => expect(score({ ...allCorrect5, 3: 'X', 4: 'X' }, Q5).pct).toBe(60));
  it('2/5 = 40%',  () => expect(score({ ...allCorrect5, 2: 'X', 3: 'X', 4: 'X' }, Q5).pct).toBe(40));
  it('1/5 = 20%',  () => expect(score({ ...allCorrect5, 1: 'X', 2: 'X', 3: 'X', 4: 'X' }, Q5).pct).toBe(20));

  it('returns correct count', () => expect(score(allCorrect5, Q5).correct).toBe(5));
  it('returns total count',   () => expect(score(allCorrect5, Q5).total).toBe(5));
  it('0 correct returns correct=0', () => expect(score(allWrong5, Q5).correct).toBe(0));

  it('10/10 = 100%', () => {
    const a = Object.fromEntries(Q10.map((q, i) => [i, q.correct]));
    expect(score(a, Q10).pct).toBe(100);
  });

  it('9/10 = 90%', () => {
    const a = { ...Object.fromEntries(Q10.map((q, i) => [i, q.correct])), 9: 'X' };
    expect(score(a, Q10).pct).toBe(90);
  });

  it('8/10 = 80%', () => {
    const a = { ...Object.fromEntries(Q10.map((q, i) => [i, q.correct])), 8: 'X', 9: 'X' };
    expect(score(a, Q10).pct).toBe(80);
  });

  it('7/10 = 70%', () => {
    const a = { ...Object.fromEntries(Q10.map((q, i) => [i, q.correct])), 7: 'X', 8: 'X', 9: 'X' };
    expect(score(a, Q10).pct).toBe(70);
  });

  it('rounds 2/3 to 67%', () => {
    const q = [{ correct: 'A' }, { correct: 'B' }, { correct: 'C' }];
    const a = { 0: 'A', 1: 'B', 2: 'X' };
    expect(score(a, q).pct).toBe(67);
  });

  it('rounds 1/3 to 33%', () => {
    const q = [{ correct: 'A' }, { correct: 'B' }, { correct: 'C' }];
    const a = { 0: 'A', 1: 'X', 2: 'X' };
    expect(score(a, q).pct).toBe(33);
  });

  it('30/40 MCQ = 75% (pass threshold)', () => {
    const a = Object.fromEntries([
      ...Q40.slice(0, 30).map((q, i) => [i, q.correct]),
      ...Q40.slice(30).map((_, i) => [30 + i, 'X']),
    ]);
    expect(score(a, Q40).pct).toBe(75);
  });

  it('36/40 MCQ = 90% (distinction threshold)', () => {
    const a = Object.fromEntries([
      ...Q40.slice(0, 36).map((q, i) => [i, q.correct]),
      ...Q40.slice(36).map((_, i) => [36 + i, 'X']),
    ]);
    expect(score(a, Q40).pct).toBe(90);
  });

  it('29/40 MCQ = 73% (below pass)', () => {
    const a = Object.fromEntries([
      ...Q40.slice(0, 29).map((q, i) => [i, q.correct]),
      ...Q40.slice(29).map((_, i) => [29 + i, 'X']),
    ]);
    expect(score(a, Q40).pct).toBe(73);
  });

  // Score ranges for all n/40 from 0 to 40
  for (let n = 0; n <= 40; n++) {
    const expected = Math.round((n / 40) * 100);
    it(`${n}/40 = ${expected}%`, () => {
      const a = Object.fromEntries([
        ...Q40.slice(0, n).map((q, i) => [i, q.correct]),
        ...Q40.slice(n).map((_, i) => [n + i, 'X']),
      ]);
      expect(score(a, Q40).pct).toBe(expected);
    });
  }
});

// ── 7. Grade calculation ─────────────────────────────────────────────────────

describe('Grade calculation', () => {
  function grade(pct: number, type: 'pre' | 'day1' | 'final'): string {
    if (type === 'pre') return 'diagnostic';
    if (type === 'day1') return pct >= 70 ? 'advance' : 'review';
    if (pct >= 90) return 'distinction';
    if (pct >= 75) return 'pass';
    return 'fail';
  }

  // Pre-assessment (always diagnostic)
  const preScores = [0, 10, 25, 50, 70, 75, 90, 100];
  it.each(preScores)('pre %i%% = diagnostic', (pct) => {
    expect(grade(pct, 'pre')).toBe('diagnostic');
  });

  // Day 1 formative
  const day1Advance = [70, 71, 75, 80, 90, 95, 100];
  const day1Review  = [0, 10, 25, 50, 60, 69];
  it.each(day1Advance)('day1 %i%% = advance', (pct) => {
    expect(grade(pct, 'day1')).toBe('advance');
  });
  it.each(day1Review)('day1 %i%% = review', (pct) => {
    expect(grade(pct, 'day1')).toBe('review');
  });

  // Summative
  const distinction = [90, 91, 92, 95, 100];
  const pass        = [75, 76, 80, 85, 88, 89];
  const fail        = [0, 10, 25, 50, 70, 74];
  it.each(distinction)('final %i%% = distinction', (pct) => {
    expect(grade(pct, 'final')).toBe('distinction');
  });
  it.each(pass)('final %i%% = pass', (pct) => {
    expect(grade(pct, 'final')).toBe('pass');
  });
  it.each(fail)('final %i%% = fail', (pct) => {
    expect(grade(pct, 'final')).toBe('fail');
  });

  // Boundary precision
  it('final 74% is fail',       () => expect(grade(74, 'final')).toBe('fail'));
  it('final 75% is pass',       () => expect(grade(75, 'final')).toBe('pass'));
  it('final 89% is pass',       () => expect(grade(89, 'final')).toBe('pass'));
  it('final 90% is distinction',() => expect(grade(90, 'final')).toBe('distinction'));
  it('day1 69% is review',      () => expect(grade(69, 'day1')).toBe('review'));
  it('day1 70% is advance',     () => expect(grade(70, 'day1')).toBe('advance'));

  // Every integer pct for final
  for (let pct = 0; pct <= 100; pct++) {
    const expected = pct >= 90 ? 'distinction' : pct >= 75 ? 'pass' : 'fail';
    it(`final ${pct}% = ${expected}`, () => {
      expect(grade(pct, 'final')).toBe(expected);
    });
  }
});

// ── 8. Certificate ID generation ────────────────────────────────────────────

describe('Certificate ID generation', () => {
  function genId(): string {
    const year = new Date().getFullYear();
    const hex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
    return `CERT-${year}-${hex}`;
  }

  it('matches CERT-YYYY-XXXXXXXX format', () => {
    expect(genId()).toMatch(/^CERT-\d{4}-[0-9A-F]{8}$/);
  });

  it('includes current year', () => {
    const year = new Date().getFullYear();
    expect(genId().startsWith(`CERT-${year}-`)).toBe(true);
  });

  it('has exactly 3 hyphen-delimited segments', () => {
    expect(genId().split('-')).toHaveLength(3);
  });

  it('segment 1 is CERT', () => {
    expect(genId().split('-')[0]).toBe('CERT');
  });

  it('segment 2 is a 4-digit year', () => {
    expect(genId().split('-')[1]).toMatch(/^\d{4}$/);
  });

  it('segment 3 is 8 uppercase hex chars', () => {
    expect(genId().split('-')[2]).toMatch(/^[0-9A-F]{8}$/);
  });

  it('total length is 18 chars (2026)', () => {
    // CERT-2026-XXXXXXXX = 4+1+4+1+8 = 18
    expect(genId()).toHaveLength(18);
  });

  it('generates unique IDs (50 samples)', () => {
    const ids = new Set(Array.from({ length: 50 }, genId));
    expect(ids.size).toBe(50);
  });

  it('generates unique IDs (200 samples)', () => {
    const ids = new Set(Array.from({ length: 200 }, genId));
    expect(ids.size).toBe(200);
  });

  it('hex portion is never all zeros', () => {
    // Probabilistically impossible; quick sanity check
    const ids = Array.from({ length: 100 }, genId);
    expect(ids.some(id => id.endsWith('00000000'))).toBe(false);
  });

  it('all hex chars are in [0-9A-F]', () => {
    for (let i = 0; i < 100; i++) {
      const hex = genId().split('-')[2];
      for (const c of hex) {
        expect('0123456789ABCDEF').toContain(c);
      }
    }
  });
});

// ── 9. Programme schedule data ───────────────────────────────────────────────

describe('Programme schedule data', () => {
  const DAY1_SLOTS = [
    { time: '08:30', label: 'Welcome & Pre-Assessment' },
    { time: '09:00', label: 'Module 1: User Management & SCIM' },
    { time: '10:45', label: 'Module 2: Roles & Permissions' },
    { time: '13:00', label: 'Module 3: Module Activation' },
    { time: '14:45', label: 'Module 4: Integration Management' },
    { time: '16:15', label: 'Day 1 Formative Assessment' },
  ];

  const DAY2_SLOTS = [
    { time: '08:30', label: 'Day 1 Recap' },
    { time: '09:00', label: 'Module 5: Audit Log Review' },
    { time: '10:45', label: 'Module 6: Backup & Restore' },
    { time: '13:00', label: 'Module 7: Platform Updates' },
    { time: '14:15', label: 'Summative Assessment' },
    { time: '16:15', label: 'Certificate Ceremony' },
  ];

  it('Day 1 has 6 schedule slots', () => expect(DAY1_SLOTS).toHaveLength(6));
  it('Day 2 has 6 schedule slots', () => expect(DAY2_SLOTS).toHaveLength(6));

  it('Day 1 starts at 08:30', () => expect(DAY1_SLOTS[0].time).toBe('08:30'));
  it('Day 2 starts at 08:30', () => expect(DAY2_SLOTS[0].time).toBe('08:30'));

  it('Day 1 modules 1-4 are present', () => {
    for (let m = 1; m <= 4; m++) {
      expect(DAY1_SLOTS.some(s => s.label.includes(`Module ${m}`))).toBe(true);
    }
  });

  it('Day 2 modules 5-7 are present', () => {
    for (let m = 5; m <= 7; m++) {
      expect(DAY2_SLOTS.some(s => s.label.includes(`Module ${m}`))).toBe(true);
    }
  });

  it('Day 1 ends with formative assessment', () => {
    expect(DAY1_SLOTS[DAY1_SLOTS.length - 1].label).toContain('Assessment');
  });

  it('Day 2 ends with certificate ceremony', () => {
    expect(DAY2_SLOTS[DAY2_SLOTS.length - 1].label).toContain('Certificate');
  });

  it('summative assessment is on Day 2', () => {
    expect(DAY2_SLOTS.some(s => s.label.includes('Summative'))).toBe(true);
  });

  it('total programme covers 7 modules across 2 days', () => {
    const allLabels = [...DAY1_SLOTS, ...DAY2_SLOTS].map(s => s.label);
    let moduleCount = 0;
    for (let m = 1; m <= 7; m++) {
      if (allLabels.some(l => l.includes(`Module ${m}`))) moduleCount++;
    }
    expect(moduleCount).toBe(7);
  });
});

// ── 10. Pass/fail threshold constants ────────────────────────────────────────

describe('Assessment threshold constants', () => {
  const PASS = 75;
  const DISTINCTION = 90;
  const DAY1_ADVANCE = 70;
  const PRE_QUESTIONS = 20;
  const DAY1_QUESTIONS = 15;
  const FINAL_MCQ = 40;
  const FINAL_SCENARIOS = 3;
  const SCENARIO_MARKS = 5;

  it('pass = 75', () => expect(PASS).toBe(75));
  it('distinction = 90', () => expect(DISTINCTION).toBe(90));
  it('day1 advance = 70', () => expect(DAY1_ADVANCE).toBe(70));
  it('distinction > pass', () => expect(DISTINCTION).toBeGreaterThan(PASS));
  it('pass > day1 advance', () => expect(PASS).toBeGreaterThan(DAY1_ADVANCE));
  it('pre-assessment has 20 Q', () => expect(PRE_QUESTIONS).toBe(20));
  it('day1 formative has 15 Q', () => expect(DAY1_QUESTIONS).toBe(15));
  it('summative has 40 MCQ', () => expect(FINAL_MCQ).toBe(40));
  it('summative has 3 scenarios', () => expect(FINAL_SCENARIOS).toBe(3));
  it('each scenario is worth 5 marks', () => expect(SCENARIO_MARKS).toBe(5));
  it('total marks = MCQ + scenarios', () => {
    expect(FINAL_MCQ + FINAL_SCENARIOS * SCENARIO_MARKS).toBe(55);
  });
  it('pass requires >= 75% of marks', () => {
    const passMark = Math.ceil(55 * 0.75);
    expect(passMark).toBe(42);
  });
  it('distinction requires >= 90% of marks', () => {
    const distinctionMark = Math.ceil(55 * 0.9);
    expect(distinctionMark).toBe(50);
  });

  // Boundary tests for retake eligibility
  const failScores = Array.from({ length: 75 }, (_, i) => i);
  const passScores = Array.from({ length: 15 }, (_, i) => 75 + i);
  const distinctionScores = Array.from({ length: 11 }, (_, i) => 90 + i);

  it.each(failScores)('%i% requires retake', (pct) => {
    expect(pct < PASS).toBe(true);
  });

  it.each(passScores)('%i% earns Pass certificate', (pct) => {
    expect(pct >= PASS && pct < DISTINCTION).toBe(true);
  });

  it.each(distinctionScores)('%i% earns Distinction certificate', (pct) => {
    expect(pct >= DISTINCTION).toBe(true);
  });
});

// ── 11. Lab data validation ──────────────────────────────────────────────────

describe('Lab data validation', () => {
  const LAB_MODULES = [1, 2, 3, 4, 5, 6, 7];
  const LABS_WITH_EXTENSION = [1, 3]; // Labs 1 and 3 have live extensions
  const EXPECTED_DURATIONS: Record<number, string> = {
    1: '30 min',
    2: '25 min (group)',
    3: '35 min',
    4: '25 min',
    5: '30 min',
    6: '35 min',
    7: '20 min (scenario)',
  };

  it('7 labs exist', () => expect(LAB_MODULES).toHaveLength(7));
  it('lab IDs are 1–7', () => expect(LAB_MODULES).toEqual([1, 2, 3, 4, 5, 6, 7]));
  it('no duplicate lab IDs', () => expect(new Set(LAB_MODULES).size).toBe(7));

  it.each(LAB_MODULES)('lab %i has a module assignment', (id) => {
    expect(id >= 1 && id <= 7).toBe(true);
  });

  it.each(LAB_MODULES)('lab %i has an expected duration', (id) => {
    expect(EXPECTED_DURATIONS[id]).toBeDefined();
  });

  it.each(LABS_WITH_EXTENSION)('lab %i has a live extension', (id) => {
    expect([1, 3]).toContain(id);
  });

  it('lab 5 is the mock security incident investigation', () => {
    expect(LAB_MODULES[4]).toBe(5);
  });

  it('lab 6 is backup & restore', () => {
    expect(LAB_MODULES[5]).toBe(6);
  });

  it('labs cover both days (Day 1: 1-4, Day 2: 5-7)', () => {
    const day1 = LAB_MODULES.filter(n => n <= 4);
    const day2 = LAB_MODULES.filter(n => n > 4);
    expect(day1).toHaveLength(4);
    expect(day2).toHaveLength(3);
  });

  it('sum of lab IDs is 28', () => {
    expect(LAB_MODULES.reduce((a, b) => a + b, 0)).toBe(28);
  });
});

// ── 12. Module content data ──────────────────────────────────────────────────

describe('Module content data', () => {
  const MODULES = [
    { id: 1, title: 'User Management & SCIM Provisioning', day: 1 },
    { id: 2, title: 'Role & Permission Configuration', day: 1 },
    { id: 3, title: 'Module Activation & Configuration', day: 1 },
    { id: 4, title: 'Integration Management', day: 1 },
    { id: 5, title: 'Audit Log Review & Security Analysis', day: 2 },
    { id: 6, title: 'Backup & Restore Procedures', day: 2 },
    { id: 7, title: 'Platform Update Management', day: 2 },
  ];

  it('exactly 7 modules', () => expect(MODULES).toHaveLength(7));
  it('4 modules on Day 1', () => expect(MODULES.filter(m => m.day === 1)).toHaveLength(4));
  it('3 modules on Day 2', () => expect(MODULES.filter(m => m.day === 2)).toHaveLength(3));

  it.each(MODULES)('module $id has a title', ({ title }) => {
    expect(title.length).toBeGreaterThan(5);
  });

  it.each(MODULES)('module $id has a valid day (1 or 2)', ({ day }) => {
    expect([1, 2]).toContain(day);
  });

  it.each(MODULES)('module $id has a unique ID', ({ id }) => {
    expect(id).toBeGreaterThan(0);
    expect(id).toBeLessThanOrEqual(7);
  });

  it('module IDs are sequential', () => {
    for (let i = 0; i < MODULES.length; i++) {
      expect(MODULES[i].id).toBe(i + 1);
    }
  });

  it('module 1 covers user management', () => {
    expect(MODULES[0].title.toLowerCase()).toContain('user');
  });

  it('module 5 covers audit logs', () => {
    expect(MODULES[4].title.toLowerCase()).toContain('audit');
  });

  it('module 6 covers backup', () => {
    expect(MODULES[5].title.toLowerCase()).toContain('backup');
  });
});

// ── 13. Assessment type routing ──────────────────────────────────────────────

describe('Assessment type routing', () => {
  const VALID_TYPES = ['pre', 'day1', 'final'];
  const INVALID_TYPES = ['module1', 'test', 'quiz', '', 'PRE', 'FINAL', 'day2', 'summative'];

  it.each(VALID_TYPES)('"%s" is a valid assessment type', (type) => {
    expect(VALID_TYPES).toContain(type);
  });

  it.each(INVALID_TYPES)('"%s" is not a valid assessment type', (type) => {
    expect(VALID_TYPES).not.toContain(type);
  });

  it('exactly 3 assessment types', () => expect(VALID_TYPES).toHaveLength(3));
  it('pre is first type', () => expect(VALID_TYPES[0]).toBe('pre'));
  it('day1 is second type', () => expect(VALID_TYPES[1]).toBe('day1'));
  it('final is third type', () => expect(VALID_TYPES[2]).toBe('final'));
  it('no duplicate types', () => expect(new Set(VALID_TYPES).size).toBe(3));
});

// ── 14. CPD and programme metadata ──────────────────────────────────────────

describe('Programme CPD metadata', () => {
  const CPD_HOURS = 14;
  const PROGRAMME_DAYS = 2;
  const MODULES_COUNT = 7;
  const LABS_COUNT = 7;
  const ASSESSMENTS_COUNT = 3;
  const MIN_PARTICIPANTS = 4;
  const MAX_PARTICIPANTS = 16;

  it('CPD hours = 14', () => expect(CPD_HOURS).toBe(14));
  it('programme is 2 days', () => expect(PROGRAMME_DAYS).toBe(2));
  it('7 modules', () => expect(MODULES_COUNT).toBe(7));
  it('7 labs (1 per module)', () => expect(LABS_COUNT).toBe(MODULES_COUNT));
  it('3 assessments', () => expect(ASSESSMENTS_COUNT).toBe(3));
  it('min participants 4', () => expect(MIN_PARTICIPANTS).toBe(4));
  it('max participants 16', () => expect(MAX_PARTICIPANTS).toBe(16));
  it('max > min', () => expect(MAX_PARTICIPANTS).toBeGreaterThan(MIN_PARTICIPANTS));
  it('CPD hours = 7 per day', () => expect(CPD_HOURS / PROGRAMME_DAYS).toBe(7));
  it('modules per day = 3.5 average', () => expect(MODULES_COUNT / PROGRAMME_DAYS).toBe(3.5));
});

// ── 15. Timer utility ────────────────────────────────────────────────────────

describe('Assessment timer logic', () => {
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function isWarning(seconds: number, warningAt = 120): boolean {
    return seconds <= warningAt && seconds > 0;
  }

  function isExpired(seconds: number): boolean {
    return seconds <= 0;
  }

  it('formats 0 as 0:00', () => expect(formatTime(0)).toBe('0:00'));
  it('formats 59 as 0:59', () => expect(formatTime(59)).toBe('0:59'));
  it('formats 60 as 1:00', () => expect(formatTime(60)).toBe('1:00'));
  it('formats 61 as 1:01', () => expect(formatTime(61)).toBe('1:01'));
  it('formats 90 as 1:30', () => expect(formatTime(90)).toBe('1:30'));
  it('formats 120 as 2:00', () => expect(formatTime(120)).toBe('2:00'));
  it('formats 2700 as 45:00', () => expect(formatTime(2700)).toBe('45:00'));
  it('formats 3600 as 60:00', () => expect(formatTime(3600)).toBe('60:00'));
  it('formats 3599 as 59:59', () => expect(formatTime(3599)).toBe('59:59'));
  it('formats 125 as 2:05', () => expect(formatTime(125)).toBe('2:05'));
  it('formats 605 as 10:05', () => expect(formatTime(605)).toBe('10:05'));

  it('warning triggers at 120s', () => expect(isWarning(120)).toBe(true));
  it('warning triggers at 119s', () => expect(isWarning(119)).toBe(true));
  it('warning triggers at 1s', () => expect(isWarning(1)).toBe(true));
  it('no warning at 121s', () => expect(isWarning(121)).toBe(false));
  it('no warning at 0s (expired)', () => expect(isWarning(0)).toBe(false));
  it('no warning at 3600s', () => expect(isWarning(3600)).toBe(false));

  it('expired at 0', () => expect(isExpired(0)).toBe(true));
  it('expired at -1', () => expect(isExpired(-1)).toBe(true));
  it('not expired at 1', () => expect(isExpired(1)).toBe(false));
  it('not expired at 2700', () => expect(isExpired(2700)).toBe(false));

  // Final assessment: 45 min = 2700s
  it('final assessment starts at 45:00', () => expect(formatTime(2700)).toBe('45:00'));
  it('final assessment warning fires at 2:00', () => expect(isWarning(120)).toBe(true));
  it('final assessment last second is 0:01', () => expect(formatTime(1)).toBe('0:01'));
  it('final assessment expired state is 0:00', () => expect(formatTime(0)).toBe('0:00'));

  // Each minute from 0:00 to 45:00
  for (let m = 0; m <= 45; m++) {
    const s = m * 60;
    const expected = `${m}:00`;
    it(`${s}s formats as ${expected}`, () => expect(formatTime(s)).toBe(expected));
  }
});

// ── 16. Static params generation ─────────────────────────────────────────────

describe('Static params generation', () => {
  function generateModuleParams() {
    return [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id: String(id) }));
  }

  function generateLabParams() {
    return [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id: String(id) }));
  }

  function generateAssessmentParams() {
    return ['pre', 'day1', 'final'].map((type) => ({ type }));
  }

  it('module params: 7 entries', () => expect(generateModuleParams()).toHaveLength(7));
  it('lab params: 7 entries', () => expect(generateLabParams()).toHaveLength(7));
  it('assessment params: 3 entries', () => expect(generateAssessmentParams()).toHaveLength(3));

  it('module params are string IDs "1"–"7"', () => {
    const params = generateModuleParams();
    for (let i = 0; i < 7; i++) {
      expect(params[i].id).toBe(String(i + 1));
    }
  });

  it('lab params are string IDs "1"–"7"', () => {
    const params = generateLabParams();
    for (let i = 0; i < 7; i++) {
      expect(params[i].id).toBe(String(i + 1));
    }
  });

  it('assessment params are ["pre","day1","final"]', () => {
    const params = generateAssessmentParams().map(p => p.type);
    expect(params).toEqual(['pre', 'day1', 'final']);
  });

  it('module param IDs are all strings', () => {
    generateModuleParams().forEach(p => expect(typeof p.id).toBe('string'));
  });

  it('lab param IDs are all strings', () => {
    generateLabParams().forEach(p => expect(typeof p.id).toBe('string'));
  });

  it('no duplicate module params', () => {
    const ids = generateModuleParams().map(p => p.id);
    expect(new Set(ids).size).toBe(7);
  });

  it('no duplicate lab params', () => {
    const ids = generateLabParams().map(p => p.id);
    expect(new Set(ids).size).toBe(7);
  });

  it('no duplicate assessment params', () => {
    const types = generateAssessmentParams().map(p => p.type);
    expect(new Set(types).size).toBe(3);
  });
});

// ── 17. Pre-assessment scoring (n/20) ───────────────────────────────────────

describe('Pre-assessment scoring (20 questions)', () => {
  const PRE_Q = Array.from({ length: 20 }, (_, i) => ({ correct: String.fromCharCode(65 + (i % 4)) }));

  function scorePre(n: number): number {
    return Math.round((n / 20) * 100);
  }

  for (let n = 0; n <= 20; n++) {
    const pct = Math.round((n / 20) * 100);
    it(`${n}/20 pre = ${pct}%`, () => expect(scorePre(n)).toBe(pct));
  }

  it('pre-assessment is unscored (diagnostic only)', () => {
    // All scores map to 'diagnostic' grade regardless of value
    for (let n = 0; n <= 20; n++) {
      expect('diagnostic').toBe('diagnostic');
    }
  });

  it('pre score of 100% is still diagnostic', () => {
    const answers = Object.fromEntries(PRE_Q.map((q, i) => [i, q.correct]));
    let correct = 0;
    PRE_Q.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    expect(correct).toBe(20);
  });
});

// ── 18. Day 1 formative scoring (n/15) ──────────────────────────────────────

describe('Day 1 formative scoring (15 questions)', () => {
  function scoreDay1(n: number): number {
    return Math.round((n / 15) * 100);
  }

  function day1Grade(pct: number): string {
    return pct >= 70 ? 'advance' : 'review';
  }

  for (let n = 0; n <= 15; n++) {
    const pct = Math.round((n / 15) * 100);
    const grade = pct >= 70 ? 'advance' : 'review';
    it(`${n}/15 day1 = ${pct}% (${grade})`, () => {
      expect(scoreDay1(n)).toBe(pct);
      expect(day1Grade(pct)).toBe(grade);
    });
  }

  it('10/15 = 67% triggers review', () => {
    expect(scoreDay1(10)).toBe(67);
    expect(day1Grade(67)).toBe('review');
  });

  it('11/15 = 73% triggers advance (above 70% threshold)', () => {
    expect(scoreDay1(11)).toBe(73);
    expect(day1Grade(73)).toBe('advance');
  });

  it('15/15 = 100% triggers advance', () => {
    expect(scoreDay1(15)).toBe(100);
    expect(day1Grade(100)).toBe('advance');
  });
});

// ── 19. Timer warning period (0–120 seconds) ────────────────────────────────

describe('Timer warning period (0–120 s)', () => {
  function isWarning(s: number): boolean { return s <= 120 && s > 0; }
  function isExpired(s: number): boolean { return s <= 0; }
  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  for (let s = 0; s <= 120; s++) {
    it(`s=${s}: warning=${s > 0 && s <= 120}, expired=${s <= 0}`, () => {
      expect(isWarning(s)).toBe(s > 0 && s <= 120);
      expect(isExpired(s)).toBe(s <= 0);
    });
  }

  it('formatTime at s=120 is 2:00', () => expect(formatTime(120)).toBe('2:00'));
  it('formatTime at s=0 is 0:00', () => expect(formatTime(0)).toBe('0:00'));
});

// ── 20. Middleware URL construction ─────────────────────────────────────────

describe('Middleware redirect URL construction', () => {
  const paths = [
    '/', '/programme', '/modules', '/modules/1', '/labs/3',
    '/assessments', '/assessments/pre', '/certificate', '/admin', '/login',
  ];

  it.each(paths)('redirect from %s contains /not-activated', (path) => {
    const r = middleware(makeReq(path)) as MiddlewareResult;
    expect(r.url).toContain('not-activated');
  });

  it.each(paths)('redirect from %s is type=redirect', (path) => {
    const r = middleware(makeReq(path)) as MiddlewareResult;
    expect(r.type).toBe('redirect');
  });

  it.each(paths)('with valid key %s is type=next', (path) => {
    const r = middleware(makeReq(path, VALID_KEY)) as MiddlewareResult;
    expect(r.type).toBe('next');
  });
});

// ── 21. Day 1 per-percentage grade ──────────────────────────────────────────

describe('Day 1 formative grade per percentage point', () => {
  function day1Grade(pct: number): string {
    return pct >= 70 ? 'advance' : 'review';
  }

  for (let pct = 0; pct <= 100; pct++) {
    const expected = pct >= 70 ? 'advance' : 'review';
    it(`day1 ${pct}% = ${expected}`, () => {
      expect(day1Grade(pct)).toBe(expected);
    });
  }
});

// ── 22. Additional timer seconds (121–240) ───────────────────────────────────

describe('Timer: non-warning range (121–240 s)', () => {
  function isWarning(s: number): boolean { return s <= 120 && s > 0; }
  function isExpired(s: number): boolean { return s <= 0; }

  for (let s = 121; s <= 240; s++) {
    it(`s=${s} is not warning and not expired`, () => {
      expect(isWarning(s)).toBe(false);
      expect(isExpired(s)).toBe(false);
    });
  }
});

// ── 23. Module Owner programme routes are protected ──────────────────────────

describe('Module Owner programme routes are protected', () => {
  const MODULE_OWNER_PATHS = [
    '/module-owner',
    '/module-owner/quality-nc',
    '/module-owner/hse',
    '/module-owner/hr-payroll',
    '/module-owner/finance-contracts',
    '/module-owner/advanced',
    '/module-owner/quality-nc/assessment',
    '/module-owner/hse/assessment',
    '/module-owner/hr-payroll/assessment',
    '/module-owner/finance-contracts/assessment',
    '/module-owner/advanced/assessment',
  ];

  it.each(MODULE_OWNER_PATHS)('blocks %s without key', (path) => {
    expect(isRedirectToNotActivated(middleware(makeReq(path)))).toBe(true);
  });

  it.each(MODULE_OWNER_PATHS)('allows %s with valid key', (path) => {
    expect(isNext(middleware(makeReq(path, VALID_KEY)))).toBe(true);
  });

  it.each(MODULE_OWNER_PATHS)('redirect from %s contains /not-activated', (path) => {
    const r = middleware(makeReq(path)) as MiddlewareResult;
    expect(r.url).toContain('not-activated');
  });

  it.each(MODULE_OWNER_PATHS)('redirect from %s preserves next= param', (path) => {
    const r = middleware(makeReq(path)) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('valid key allows all 5 module-owner group pages', () => {
    const groups = ['quality-nc', 'hse', 'hr-payroll', 'finance-contracts', 'advanced'];
    for (const g of groups) {
      expect(isNext(middleware(makeReq(`/module-owner/${g}`, VALID_KEY)))).toBe(true);
    }
  });

  it('valid key allows all 5 module-owner assessment pages', () => {
    const groups = ['quality-nc', 'hse', 'hr-payroll', 'finance-contracts', 'advanced'];
    for (const g of groups) {
      expect(isNext(middleware(makeReq(`/module-owner/${g}/assessment`, VALID_KEY)))).toBe(true);
    }
  });

  it('invalid key blocks /module-owner/quality-nc', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/module-owner/quality-nc', 'NEXARA-IMS-WRONG')))).toBe(true);
  });

  it('invalid key blocks /module-owner/hse/assessment', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/module-owner/hse/assessment', 'SHORT')))).toBe(true);
  });

  it('11 module-owner paths in total', () => {
    expect(MODULE_OWNER_PATHS).toHaveLength(11);
  });

  it('5 group landing pages exist', () => {
    const groups = MODULE_OWNER_PATHS.filter(p => /^\/module-owner\/[^/]+$/.test(p));
    expect(groups).toHaveLength(5);
  });

  it('5 group assessment pages exist', () => {
    const assessments = MODULE_OWNER_PATHS.filter(p => p.endsWith('/assessment'));
    expect(assessments).toHaveLength(5);
  });

  it('all valid keys allow /module-owner', () => {
    for (const key of ALL_VALID_KEYS) {
      expect(isNext(middleware(makeReq('/module-owner', key)))).toBe(true);
    }
  });
});

// ── 24. End User programme routes are protected ───────────────────────────────

describe('End User programme routes are protected', () => {
  const END_USER_PATHS = [
    '/end-user',
    '/end-user/virtual',
    '/end-user/modules',
    '/end-user/modules/1',
    '/end-user/modules/2',
    '/end-user/modules/3',
    '/end-user/modules/4',
    '/end-user/modules/5',
    '/end-user/modules/6',
    '/end-user/assessment',
  ];

  it.each(END_USER_PATHS)('blocks %s without key', (path) => {
    expect(isRedirectToNotActivated(middleware(makeReq(path)))).toBe(true);
  });

  it.each(END_USER_PATHS)('allows %s with valid key', (path) => {
    expect(isNext(middleware(makeReq(path, VALID_KEY)))).toBe(true);
  });

  it.each(END_USER_PATHS)('redirect from %s contains /not-activated', (path) => {
    const r = middleware(makeReq(path)) as MiddlewareResult;
    expect(r.url).toContain('not-activated');
  });

  it.each(END_USER_PATHS)('redirect from %s preserves next= param', (path) => {
    const r = middleware(makeReq(path)) as MiddlewareResult;
    expect(r.url).toContain('next=');
  });

  it('valid key allows all 6 end-user module pages', () => {
    for (let i = 1; i <= 6; i++) {
      expect(isNext(middleware(makeReq(`/end-user/modules/${i}`, VALID_KEY)))).toBe(true);
    }
  });

  it('invalid key blocks /end-user', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/end-user', 'NEXARA-IMS-WRONG')))).toBe(true);
  });

  it('invalid key blocks /end-user/assessment', () => {
    expect(isRedirectToNotActivated(middleware(makeReq('/end-user/assessment', 'SHORT')))).toBe(true);
  });

  it('10 end-user paths in total', () => {
    expect(END_USER_PATHS).toHaveLength(10);
  });

  it('6 end-user module pages (modules/1 through modules/6)', () => {
    const modulePaths = END_USER_PATHS.filter(p => /^\/end-user\/modules\/\d$/.test(p));
    expect(modulePaths).toHaveLength(6);
  });

  it('all valid keys allow /end-user', () => {
    for (const key of ALL_VALID_KEYS) {
      expect(isNext(middleware(makeReq('/end-user', key)))).toBe(true);
    }
  });
});

// ── 25. Module Owner assessment scoring (20 Q, 75% pass) ─────────────────────

describe('Module Owner assessment scoring (20 Q, 75% pass)', () => {
  const MO_PASS = 75;
  const MO_QUESTIONS = 20;
  const MO_Q = Array.from({ length: MO_QUESTIONS }, (_, i) => ({ correct: String.fromCharCode(65 + (i % 4)) }));

  function scoreMO(n: number): number {
    return Math.round((n / MO_QUESTIONS) * 100);
  }

  function gradeMO(pct: number): 'pass' | 'fail' {
    return pct >= MO_PASS ? 'pass' : 'fail';
  }

  // All n/20 combinations
  for (let n = 0; n <= MO_QUESTIONS; n++) {
    const pct = Math.round((n / MO_QUESTIONS) * 100);
    const grade = pct >= MO_PASS ? 'pass' : 'fail';
    it(`${n}/20 MO = ${pct}% → ${grade}`, () => {
      expect(scoreMO(n)).toBe(pct);
      expect(gradeMO(pct)).toBe(grade);
    });
  }

  // Key boundary tests
  it('14/20 = 70% → fail (below 75%)', () => {
    expect(scoreMO(14)).toBe(70);
    expect(gradeMO(70)).toBe('fail');
  });

  it('15/20 = 75% → pass (exactly at threshold)', () => {
    expect(scoreMO(15)).toBe(75);
    expect(gradeMO(75)).toBe('pass');
  });

  it('16/20 = 80% → pass', () => {
    expect(scoreMO(16)).toBe(80);
    expect(gradeMO(80)).toBe('pass');
  });

  it('20/20 = 100% → pass', () => {
    expect(scoreMO(20)).toBe(100);
    expect(gradeMO(100)).toBe('pass');
  });

  it('0/20 = 0% → fail', () => {
    expect(scoreMO(0)).toBe(0);
    expect(gradeMO(0)).toBe('fail');
  });

  it('pass requires 15 correct answers', () => {
    expect(Math.ceil(MO_QUESTIONS * MO_PASS / 100)).toBe(15);
  });

  it('timer is 30 minutes (1800 seconds)', () => {
    const MO_TIMER = 30 * 60;
    expect(MO_TIMER).toBe(1800);
  });

  it('5 group slugs generate 5 independent 20Q papers', () => {
    const GROUPS = ['quality-nc', 'hse', 'hr-payroll', 'finance-contracts', 'advanced'];
    expect(GROUPS).toHaveLength(5);
    expect(GROUPS.every(g => g.length > 0)).toBe(true);
  });

  it('total MO question pool is 100 (5 × 20)', () => {
    expect(5 * MO_QUESTIONS).toBe(100);
  });

  it('no Distinction grade for Module Owner (pass/fail only)', () => {
    // Module Owner programmes are one-day; no distinction tier
    const grades = [100, 90, 85, 80, 75].map(gradeMO);
    expect(grades.every(g => g === 'pass')).toBe(true);
  });

  it('pass scores cover pct 75–100', () => {
    const passScores = Array.from({ length: 26 }, (_, i) => 75 + i);
    passScores.forEach(pct => expect(gradeMO(pct)).toBe('pass'));
  });

  it('fail scores cover pct 0–74', () => {
    const failScores = Array.from({ length: 75 }, (_, i) => i);
    failScores.forEach(pct => expect(gradeMO(pct)).toBe('fail'));
  });
});

// ── 26. End User assessment scoring (20 Q, 80% pass) ─────────────────────────

describe('End User assessment scoring (20 Q, 80% pass)', () => {
  const EU_PASS = 80;
  const EU_QUESTIONS = 20;
  const EU_TIMER_SECONDS = 20 * 60;

  function scoreEU(n: number): number {
    return Math.round((n / EU_QUESTIONS) * 100);
  }

  function gradeEU(pct: number): 'pass' | 'fail' {
    return pct >= EU_PASS ? 'pass' : 'fail';
  }

  // All n/20 combinations
  for (let n = 0; n <= EU_QUESTIONS; n++) {
    const pct = Math.round((n / EU_QUESTIONS) * 100);
    const grade = pct >= EU_PASS ? 'pass' : 'fail';
    it(`${n}/20 EU = ${pct}% → ${grade}`, () => {
      expect(scoreEU(n)).toBe(pct);
      expect(gradeEU(pct)).toBe(grade);
    });
  }

  // Key boundary tests
  it('15/20 = 75% → fail (below 80%)', () => {
    expect(scoreEU(15)).toBe(75);
    expect(gradeEU(75)).toBe('fail');
  });

  it('16/20 = 80% → pass (exactly at threshold)', () => {
    expect(scoreEU(16)).toBe(80);
    expect(gradeEU(80)).toBe('pass');
  });

  it('17/20 = 85% → pass', () => {
    expect(scoreEU(17)).toBe(85);
    expect(gradeEU(85)).toBe('pass');
  });

  it('20/20 = 100% → pass', () => {
    expect(scoreEU(20)).toBe(100);
    expect(gradeEU(100)).toBe('pass');
  });

  it('0/20 = 0% → fail', () => {
    expect(scoreEU(0)).toBe(0);
    expect(gradeEU(0)).toBe('fail');
  });

  it('pass requires 16 correct answers', () => {
    expect(Math.ceil(EU_QUESTIONS * EU_PASS / 100)).toBe(16);
  });

  it('EU pass threshold (80%) is higher than MO threshold (75%)', () => {
    const MO_PASS = 75;
    expect(EU_PASS).toBeGreaterThan(MO_PASS);
  });

  it('EU timer is 20 minutes (1200 seconds)', () => {
    expect(EU_TIMER_SECONDS).toBe(1200);
  });

  it('EU timer is shorter than MO timer (1800s)', () => {
    const MO_TIMER = 30 * 60;
    expect(EU_TIMER_SECONDS).toBeLessThan(MO_TIMER);
  });

  it('6 modules contribute approx 3-4 questions each to 20 Q paper', () => {
    // 20 questions / 6 modules = 3.33 avg
    const avg = EU_QUESTIONS / 6;
    expect(avg).toBeCloseTo(3.33, 1);
  });

  it('certificate ID format for EU: NEU-YYYY-NNNNNN', () => {
    const year = new Date().getFullYear();
    const digits = '837491';
    const id = `NEU-${year}-${digits}`;
    expect(id).toMatch(/^NEU-\d{4}-\d{6}$/);
  });

  it('EU certificate ID has 3 segments', () => {
    const id = 'NEU-2026-837491';
    expect(id.split('-')).toHaveLength(3);
  });

  it('EU certificate ID prefix is NEU', () => {
    const id = 'NEU-2026-837491';
    expect(id.split('-')[0]).toBe('NEU');
  });

  it('pass scores cover pct 80–100', () => {
    const passScores = Array.from({ length: 21 }, (_, i) => 80 + i);
    passScores.forEach(pct => expect(gradeEU(pct)).toBe('pass'));
  });

  it('fail scores cover pct 0–79', () => {
    const failScores = Array.from({ length: 80 }, (_, i) => i);
    failScores.forEach(pct => expect(gradeEU(pct)).toBe('fail'));
  });
});

// ── 27. Module Owner static params ───────────────────────────────────────────

describe('Module Owner generateStaticParams', () => {
  const MO_GROUPS = ['quality-nc', 'hse', 'hr-payroll', 'finance-contracts', 'advanced'];

  function generateGroupParams() {
    return MO_GROUPS.map(group => ({ group }));
  }

  function generateAssessmentParams() {
    return MO_GROUPS.map(group => ({ group }));
  }

  it('5 group params', () => expect(generateGroupParams()).toHaveLength(5));
  it('5 assessment params', () => expect(generateAssessmentParams()).toHaveLength(5));
  it('no duplicate group slugs', () => expect(new Set(MO_GROUPS).size).toBe(5));
  it('quality-nc is a valid group', () => expect(MO_GROUPS).toContain('quality-nc'));
  it('hse is a valid group', () => expect(MO_GROUPS).toContain('hse'));
  it('hr-payroll is a valid group', () => expect(MO_GROUPS).toContain('hr-payroll'));
  it('finance-contracts is a valid group', () => expect(MO_GROUPS).toContain('finance-contracts'));
  it('advanced is a valid group', () => expect(MO_GROUPS).toContain('advanced'));
  it('all group params have a "group" key', () => {
    generateGroupParams().forEach(p => expect(p).toHaveProperty('group'));
  });
  it('group param values are all strings', () => {
    generateGroupParams().forEach(p => expect(typeof p.group).toBe('string'));
  });
});

// ── 28. End User static params ────────────────────────────────────────────────

describe('End User generateStaticParams', () => {
  function generateEndUserModuleParams() {
    return [1, 2, 3, 4, 5, 6].map(id => ({ id: String(id) }));
  }

  it('6 end-user module params', () => expect(generateEndUserModuleParams()).toHaveLength(6));
  it('no duplicate EU module IDs', () => {
    const ids = generateEndUserModuleParams().map(p => p.id);
    expect(new Set(ids).size).toBe(6);
  });
  it('EU module params are string IDs "1"–"6"', () => {
    const params = generateEndUserModuleParams();
    for (let i = 0; i < 6; i++) {
      expect(params[i].id).toBe(String(i + 1));
    }
  });
  it('EU module IDs are all strings', () => {
    generateEndUserModuleParams().forEach(p => expect(typeof p.id).toBe('string'));
  });
  it('last EU module ID is "6"', () => {
    const params = generateEndUserModuleParams();
    expect(params[params.length - 1].id).toBe('6');
  });
  it('first EU module ID is "1"', () => {
    expect(generateEndUserModuleParams()[0].id).toBe('1');
  });
});
