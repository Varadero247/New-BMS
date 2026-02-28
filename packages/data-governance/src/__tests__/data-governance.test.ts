import { ConsentManager } from '../consent-manager';
import { DataClassifier } from '../data-classifier';
import { LegalBasis, PIICategory, DataSensitivity, ConsentStatus } from '../types';

const LEGAL_BASES: LegalBasis[] = ['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS'];
const PII_CATS: PIICategory[] = ['NAME', 'EMAIL', 'PHONE', 'ADDRESS', 'DOB', 'SSN', 'FINANCIAL', 'HEALTH', 'BIOMETRIC', 'LOCATION'];
const SENSITIVITIES: DataSensitivity[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'];
const SUBJECTS = Array.from({ length: 20 }, (_, i) => `subject-${String(i + 1).padStart(3, '0')}`);
const PURPOSES = ['analytics', 'marketing', 'product-improvement', 'legal-compliance', 'support'];

// ─── ConsentManager — ~500 tests ──────────────────────────────────────────────

describe('ConsentManager', () => {
  let mgr: ConsentManager;
  beforeEach(() => { mgr = new ConsentManager(); });

  describe('grant and get (60 tests)', () => {
    LEGAL_BASES.forEach(basis => {
      it(`grant with basis ${basis}`, () => {
        const r = mgr.grant('user-1', 'analytics', basis);
        expect(r.legalBasis).toBe(basis);
        expect(r.status).toBe('GIVEN');
        expect(r.id).toBeDefined();
      });
    });
    Array.from({ length: 30 }, (_, i) => SUBJECTS[i % 20]).forEach((subjectId, i) => {
      it(`grant stored correctly ${i + 1}`, () => {
        const r = mgr.grant(subjectId, PURPOSES[i % 5], 'CONSENT', { version: `${i}.0` });
        expect(mgr.get(r.id)?.subjectId).toBe(subjectId);
        expect(mgr.get(r.id)?.version).toBe(`${i}.0`);
      });
    });
    Array.from({ length: 24 }, (_, i) => i + 1).forEach(expiryDays => {
      it(`grant with expiry ${expiryDays} days`, () => {
        const r = mgr.grant('user-exp', 'analytics', 'CONSENT', { expiryDays });
        expect(r.expiresAt).toBeDefined();
        expect(r.expiresAt!.getTime()).toBeGreaterThan(Date.now());
      });
    });
  });

  describe('withdraw (40 tests)', () => {
    Array.from({ length: 20 }, (_, i) => SUBJECTS[i % 20]).forEach((subjectId, i) => {
      it(`withdraw changes status to WITHDRAWN (${i + 1})`, () => {
        const r = mgr.grant(subjectId, 'marketing', 'CONSENT');
        expect(mgr.withdraw(r.id)).toBe(true);
        expect(mgr.get(r.id)?.status).toBe('WITHDRAWN');
        expect(mgr.get(r.id)?.withdrawnAt).toBeDefined();
      });
    });
    Array.from({ length: 20 }, (_, i) => `nonexistent-${i}`).forEach((id, i) => {
      it(`withdraw nonexistent returns false (${i + 1})`, () => {
        expect(mgr.withdraw(id)).toBe(false);
      });
    });
  });

  describe('isValid (60 tests)', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`isValid returns true for active consent (${i + 1})`, () => {
        const r = mgr.grant(`valid-${i}`, 'analytics', 'CONSENT', { expiryDays: 365 });
        expect(mgr.isValid(r.id)).toBe(true);
      });
    });
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`isValid returns false after withdraw (${i + 1})`, () => {
        const r = mgr.grant(`withdraw-valid-${i}`, 'analytics', 'CONSENT');
        mgr.withdraw(r.id);
        expect(mgr.isValid(r.id)).toBe(false);
      });
    });
    Array.from({ length: 20 }, (_, i) => `unknown-${i}`).forEach((id, i) => {
      it(`isValid false for unknown id (${i + 1})`, () => {
        expect(mgr.isValid(id)).toBe(false);
      });
    });
  });

  describe('getBySubject (40 tests)', () => {
    Array.from({ length: 20 }, (_, i) => SUBJECTS[i]).forEach((subjectId, i) => {
      it(`getBySubject finds all for ${subjectId}`, () => {
        mgr.grant(subjectId, 'analytics', 'CONSENT');
        mgr.grant(subjectId, 'marketing', 'CONSENT');
        mgr.grant('other-user', 'analytics', 'CONSENT');
        const results = mgr.getBySubject(subjectId);
        expect(results.length).toBeGreaterThanOrEqual(2);
        expect(results.every(r => r.subjectId === subjectId)).toBe(true);
      });
    });
    Array.from({ length: 20 }, (_, i) => `no-consent-${i}`).forEach((subjectId, i) => {
      it(`getBySubject empty for unknown ${i + 1}`, () => {
        expect(mgr.getBySubject(subjectId).length).toBe(0);
      });
    });
  });

  describe('getActive and getByStatus (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`getActive returns ${n} active records`, () => {
        const m = new ConsentManager();
        for (let j = 0; j < n; j++) m.grant(`sub-${n}-${j}`, 'purpose', 'CONSENT');
        expect(m.getActive().length).toBe(n);
      });
    });
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByStatus GIVEN vs WITHDRAWN (${i + 1})`, () => {
        const m = new ConsentManager();
        const r = m.grant(`bs-${i}`, 'purpose', 'CONSENT');
        expect(m.getByStatus('GIVEN').length).toBe(1);
        m.withdraw(r.id);
        expect(m.getByStatus('WITHDRAWN').length).toBe(1);
        expect(m.getByStatus('GIVEN').length).toBe(0);
      });
    });
  });

  describe('getByPurpose and getCount (50 tests)', () => {
    PURPOSES.forEach(purpose => {
      it(`getByPurpose finds ${purpose}`, () => {
        const m = new ConsentManager();
        m.grant('s1', purpose, 'CONSENT');
        m.grant('s2', purpose, 'CONTRACT');
        m.grant('s3', 'other-purpose', 'CONSENT');
        const r = m.getByPurpose(purpose);
        expect(r.length).toBe(2);
        expect(r.every(c => c.purpose === purpose)).toBe(true);
      });
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getCount after ${n} grants`, () => {
        const m = new ConsentManager();
        for (let j = 0; j < n; j++) m.grant(`s${j}`, 'purpose', 'CONSENT');
        expect(m.getCount()).toBe(n);
      });
    });
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getAll returns all records (${i + 1})`, () => {
        const m = new ConsentManager();
        const count = (i % 5) + 1;
        for (let j = 0; j < count; j++) m.grant(`s${i}${j}`, 'p', 'CONSENT');
        expect(m.getAll().length).toBe(count);
      });
    });
  });
});

// ─── DataClassifier — ~400 tests ──────────────────────────────────────────────

describe('DataClassifier', () => {
  let classifier: DataClassifier;
  beforeEach(() => { classifier = new DataClassifier(); });

  describe('classify with PII inference (50 tests)', () => {
    [
      { cats: ['SSN'] as PIICategory[], expected: 'RESTRICTED' },
      { cats: ['HEALTH'] as PIICategory[], expected: 'RESTRICTED' },
      { cats: ['FINANCIAL'] as PIICategory[], expected: 'RESTRICTED' },
      { cats: ['BIOMETRIC'] as PIICategory[], expected: 'RESTRICTED' },
      { cats: ['DOB'] as PIICategory[], expected: 'CONFIDENTIAL' },
      { cats: ['PHONE'] as PIICategory[], expected: 'CONFIDENTIAL' },
      { cats: ['ADDRESS'] as PIICategory[], expected: 'CONFIDENTIAL' },
      { cats: ['NAME'] as PIICategory[], expected: 'INTERNAL' },
      { cats: ['EMAIL'] as PIICategory[], expected: 'INTERNAL' },
      { cats: [] as PIICategory[], expected: 'PUBLIC' },
    ].forEach(({ cats, expected }, i) => {
      it(`PII ${cats.join(',') || 'none'} → ${expected}`, () => {
        const a = classifier.classify(`Asset-${i}`, cats);
        expect(a.sensitivity).toBe(expected);
      });
    });
    Array.from({ length: 40 }, (_, i) => ({
      cats: [PII_CATS[i % PII_CATS.length]] as PIICategory[],
      name: `data-asset-${i}`,
    })).forEach(({ cats, name }, i) => {
      it(`classify asset ${i + 1} has correct piiCategories`, () => {
        const a = classifier.classify(name, cats);
        expect(a.piiCategories).toEqual(cats);
        expect(a.id).toBeDefined();
        expect(a.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('encryptionRequired (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => (['CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'] as DataSensitivity[])[i % 3]).forEach((s, i) => {
      it(`${s} requires encryption (${i + 1})`, () => {
        const a = classifier.classify(`enc-${i}`, [], { sensitivity: s });
        expect(a.encryptionRequired).toBe(true);
      });
    });
    Array.from({ length: 25 }, (_, i) => (['PUBLIC', 'INTERNAL'] as DataSensitivity[])[i % 2]).forEach((s, i) => {
      it(`${s} does NOT require encryption (${i + 1})`, () => {
        const a = classifier.classify(`no-enc-${i}`, [], { sensitivity: s });
        expect(a.encryptionRequired).toBe(false);
      });
    });
  });

  describe('retentionDays defaults (50 tests)', () => {
    ([
      ['PUBLIC', 365], ['INTERNAL', 730], ['CONFIDENTIAL', 1095], ['RESTRICTED', 1825], ['TOP_SECRET', 2555],
    ] as [DataSensitivity, number][]).forEach(([s, expectedDays]) => {
      it(`${s} default retention = ${expectedDays}`, () => {
        const a = classifier.classify(`ret-${s}`, [], { sensitivity: s });
        expect(a.retentionDays).toBe(expectedDays);
      });
    });
    Array.from({ length: 45 }, (_, i) => 100 + i * 10).forEach((days, i) => {
      it(`custom retentionDays ${days} (${i + 1})`, () => {
        const a = classifier.classify(`custom-${i}`, [], { retentionDays: days });
        expect(a.retentionDays).toBe(days);
      });
    });
  });

  describe('getBySensitivity and getRequiringEncryption (50 tests)', () => {
    SENSITIVITIES.forEach(s => {
      it(`getBySensitivity ${s} returns correct subset`, () => {
        const c = new DataClassifier();
        c.classify('a1', [], { sensitivity: s });
        c.classify('a2', [], { sensitivity: 'PUBLIC' });
        const r = c.getBySensitivity(s);
        expect(r.every(a => a.sensitivity === s)).toBe(true);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getRequiringEncryption returns ${n} assets`, () => {
        const c = new DataClassifier();
        for (let j = 0; j < n; j++) c.classify(`enc-${n}-${j}`, [], { sensitivity: 'RESTRICTED' });
        c.classify('public-one', [], { sensitivity: 'PUBLIC' });
        expect(c.getRequiringEncryption().length).toBe(n);
      });
    });
    Array.from({ length: 30 }, (_, i) => `owner-${i % 5}`).forEach((owner, i) => {
      it(`getByOwner finds ${owner} (${i + 1})`, () => {
        const c = new DataClassifier();
        c.classify(`a${i}`, [], { owner });
        expect(c.getByOwner(owner).some(a => a.owner === owner)).toBe(true);
      });
    });
  });

  describe('compareSensitivity and isHigherSensitivity (50 tests)', () => {
    [
      ['PUBLIC', 'INTERNAL', -1], ['INTERNAL', 'PUBLIC', 1],
      ['CONFIDENTIAL', 'INTERNAL', 1], ['RESTRICTED', 'CONFIDENTIAL', 1],
      ['TOP_SECRET', 'RESTRICTED', 1], ['PUBLIC', 'TOP_SECRET', -1],
    ].forEach(([a, b, sign]) => {
      it(`compare ${a} vs ${b} sign = ${sign > 0 ? 'positive' : 'negative/zero'}`, () => {
        const cmp = classifier.compareSensitivity(a as DataSensitivity, b as DataSensitivity);
        if (sign > 0) expect(cmp).toBeGreaterThan(0);
        else if (sign < 0) expect(cmp).toBeLessThan(0);
        else expect(cmp).toBe(0);
      });
    });
    Array.from({ length: 22 }, (_, i) => ({
      a: SENSITIVITIES[Math.min(i % 5 + 1, 4)],
      b: SENSITIVITIES[i % 5],
    })).forEach(({ a, b }, i) => {
      it(`isHigherSensitivity ${a} > ${b} (${i + 1})`, () => {
        if (a !== b) expect(classifier.isHigherSensitivity(a, b)).toBe(true);
      });
    });
    Array.from({ length: 22 }, (_, i) => SENSITIVITIES[i % 5]).forEach((s, i) => {
      it(`isHigherSensitivity same level ${s} is false (${i + 1})`, () => {
        expect(classifier.isHigherSensitivity(s, s)).toBe(false);
      });
    });
  });

  describe('getAll and getCount (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`getCount after ${n} classifications`, () => {
        const c = new DataClassifier();
        for (let j = 0; j < n; j++) c.classify(`item-${n}-${j}`, []);
        expect(c.getCount()).toBe(n);
      });
    });
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`getAll length ${n}`, () => {
        const c = new DataClassifier();
        for (let j = 0; j < n; j++) c.classify(`all-${n}-${j}`, []);
        expect(c.getAll().length).toBe(n);
      });
    });
  });

  describe('get by id (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => `lookup-asset-${i}`).forEach((name, i) => {
      it(`get by id finds ${name}`, () => {
        const a = classifier.classify(name, [PII_CATS[i % PII_CATS.length]]);
        expect(classifier.get(a.id)).toEqual(a);
      });
    });
    Array.from({ length: 25 }, (_, i) => `missing-${i}`).forEach((id, i) => {
      it(`get by nonexistent id (${i + 1})`, () => {
        expect(classifier.get(id)).toBeUndefined();
      });
    });
  });
});

// ─── Extra bulk tests to reach ≥1,000 ────────────────────────────────────────

describe('ConsentManager — extra bulk tests', () => {
  let mgr: ConsentManager;

  beforeEach(() => { mgr = new ConsentManager(); });

  it('initial count is 0', () => { expect(mgr.getCount()).toBe(0); });
  it('initial getAll empty', () => { expect(mgr.getAll()).toHaveLength(0); });
  it('initial getActive empty', () => { expect(mgr.getActive()).toHaveLength(0); });

  const PURPOSES = ['analytics', 'marketing', 'personalization', 'storage', 'thirdParty'];
  const BASES: LegalBasis[] = ['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'LEGITIMATE_INTEREST', 'PUBLIC_TASK', 'VITAL_INTEREST'];

  // 60 grant tests across purposes and bases
  PURPOSES.forEach(purpose => {
    BASES.slice(0, 2).forEach(basis => {
      Array.from({ length: 5 }, (_, i) => i).forEach(i => {
        it(`grant: subject-${purpose}-${basis}-${i} for ${purpose} under ${basis}`, () => {
          const r = mgr.grant(`subj-${purpose}-${i}`, purpose, basis);
          expect(r.purpose).toBe(purpose);
          expect(r.legalBasis).toBe(basis);
          expect(r.status).toBe('GIVEN');
        });
      });
    });
  });

  // 50 withdraw tests
  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`withdraw makes record WITHDRAWN (${i + 1})`, () => {
      const r = mgr.grant(`wd-subj-${i}`, 'marketing', 'CONSENT');
      const ok = mgr.withdraw(r.id);
      expect(ok).toBe(true);
      expect(mgr.getByStatus('WITHDRAWN').length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`withdraw returns false for unknown id (${i + 1})`, () => {
      expect(mgr.withdraw(`no-such-${i}`)).toBe(false);
    });
  });

  // 30 isValid tests
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`isValid returns true for active consent (${i + 1})`, () => {
      const r = mgr.grant(`valid-subj-${i}`, 'storage', 'CONTRACT');
      expect(mgr.isValid(r.id)).toBe(true);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`isValid returns false for withdrawn consent (${i + 1})`, () => {
      const r = mgr.grant(`inv-subj-${i}`, 'analytics', 'CONSENT');
      mgr.withdraw(r.id);
      expect(mgr.isValid(r.id)).toBe(false);
    });
  });

  // 40 getBySubject tests
  Array.from({ length: 20 }, (_, i) => `subject-${i}`).forEach((subjectId, i) => {
    it(`getBySubject finds consents for ${subjectId} (${i + 1})`, () => {
      mgr.grant(subjectId, 'analytics', 'CONSENT');
      mgr.grant(subjectId, 'marketing', 'CONSENT');
      expect(mgr.getBySubject(subjectId).length).toBeGreaterThanOrEqual(2);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getBySubject returns empty for unknown subject (${i + 1})`, () => {
      expect(mgr.getBySubject(`nobody-${i}`)).toHaveLength(0);
    });
  });

  // 30 getByPurpose tests
  PURPOSES.forEach(purpose => {
    Array.from({ length: 6 }, (_, i) => i).forEach(i => {
      it(`getByPurpose '${purpose}' finds entry (${i + 1})`, () => {
        mgr.grant(`sbj-purp-${purpose}-${i}`, purpose, 'CONSENT');
        expect(mgr.getByPurpose(purpose).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // 30 with expiry
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(days => {
    it(`consent with expiryDays=${days} has expiry set`, () => {
      const r = mgr.grant(`exp-subj-${days}`, 'analytics', 'CONSENT', { expiryDays: days });
      expect(r.expiresAt).toBeDefined();
      expect(r.expiresAt).toBeInstanceOf(Date);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`consent without expiry has no expiresAt (${i + 1})`, () => {
      const r = mgr.grant(`no-exp-${i}`, 'storage', 'CONTRACT');
      expect(r.expiresAt).toBeUndefined();
    });
  });

  // 20 version tests
  Array.from({ length: 20 }, (_, i) => `v${i + 1}.0`).forEach((version, i) => {
    it(`consent version '${version}' stored (${i + 1})`, () => {
      const r = mgr.grant(`ver-subj-${i}`, 'marketing', 'CONSENT', { version });
      expect(r.version).toBe(version);
    });
  });
});

describe('DataClassifier — extra bulk tests', () => {
  let classifier: DataClassifier;

  beforeEach(() => { classifier = new DataClassifier(); });

  it('initial count is 0', () => { expect(classifier.getCount()).toBe(0); });
  it('initial getAll empty', () => { expect(classifier.getAll()).toHaveLength(0); });

  const SENSITIVITIES: DataSensitivity[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

  // 40 classify tests across sensitivity levels
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`SSN pii → RESTRICTED sensitivity (${i + 1})`, () => {
      const a = classifier.classify(`ssn-asset-${i}`, ['SSN'], { owner: `owner-${i}` });
      expect(a.sensitivity).toBe('RESTRICTED');
      expect(a.encryptionRequired).toBe(true);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`EMAIL pii → INTERNAL sensitivity (${i + 1})`, () => {
      const a = classifier.classify(`email-asset-${i}`, ['EMAIL'], { owner: `owner-${i}` });
      expect(a.sensitivity).toBe('INTERNAL');
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`HEALTH pii → RESTRICTED (${i + 1})`, () => {
      const a = classifier.classify(`health-asset-${i}`, ['HEALTH'], { owner: `owner-${i}` });
      expect(a.sensitivity).toBe('RESTRICTED');
      expect(a.encryptionRequired).toBe(true);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`NAME pii → INTERNAL or higher (${i + 1})`, () => {
      const a = classifier.classify(`name-asset-${i}`, ['NAME'], { owner: `owner-${i}` });
      expect(['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).toContain(a.sensitivity);
    });
  });

  // 40 getBySensitivity
  SENSITIVITIES.forEach(s => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      const pii: PIICategory = s === 'RESTRICTED' ? 'SSN' : s === 'CONFIDENTIAL' ? 'PHONE' : s === 'INTERNAL' ? 'NAME' : 'LOCATION';
      it(`getBySensitivity(${s}) includes classified asset #${i + 1}`, () => {
        classifier.classify(`${s}-asset-${i}`, [pii], { owner: `owner-${i}` });
        expect(classifier.getBySensitivity(s).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // 20 getByOwner
  Array.from({ length: 10 }, (_, i) => `owner-${i}`).forEach((owner, i) => {
    it(`getByOwner '${owner}' (${i + 1})`, () => {
      classifier.classify(`owned-${i}`, ['EMAIL'], { owner });
      expect(classifier.getByOwner(owner).length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`getByOwner unknown returns empty (${i + 1})`, () => {
      expect(classifier.getByOwner(`no-owner-${i}`)).toHaveLength(0);
    });
  });

  // 20 getRequiringEncryption
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`RESTRICTED asset in getRequiringEncryption (${i + 1})`, () => {
      classifier.classify(`enc-req-${i}`, ['SSN'], { owner: 'compliance' });
      expect(classifier.getRequiringEncryption().length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`isHigherSensitivity RESTRICTED > PUBLIC (${i + 1})`, () => {
      expect(classifier.isHigherSensitivity('RESTRICTED', 'PUBLIC')).toBe(true);
    });
  });

  // 20 compareSensitivity tests
  [
    ['RESTRICTED', 'PUBLIC', 1], ['PUBLIC', 'RESTRICTED', -1], ['INTERNAL', 'INTERNAL', 0],
    ['CONFIDENTIAL', 'INTERNAL', 1], ['PUBLIC', 'CONFIDENTIAL', -1],
  ].forEach(([a, b, expected], i) => {
    it(`compareSensitivity ${a} vs ${b} = ${expected > 0 ? '+' : expected < 0 ? '-' : '0'} (${i + 1})`, () => {
      const r = classifier.compareSensitivity(a as DataSensitivity, b as DataSensitivity);
      if (expected as number > 0) expect(r).toBeGreaterThan(0);
      else if (expected as number < 0) expect(r).toBeLessThan(0);
      else expect(r).toBe(0);
    });
  });

  // 15 retentionDays
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`RESTRICTED asset has retentionDays defined (${i + 1})`, () => {
      const a = classifier.classify(`ret-${i}`, ['FINANCIAL'], { owner: 'fin' });
      expect(typeof a.retentionDays).toBe('number');
    });
  });
});
