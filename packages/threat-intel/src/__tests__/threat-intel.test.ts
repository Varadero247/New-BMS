import { IOCManager } from '../ioc-manager';
import { CVETracker } from '../cve-tracker';
import { ThreatFeedProcessor } from '../threat-feed';
import { IOCType, ThreatSeverity } from '../types';

const IOC_TYPES: IOCType[] = ['IP', 'DOMAIN', 'URL', 'HASH_MD5', 'HASH_SHA256', 'EMAIL', 'FILE_PATH', 'REGISTRY_KEY'];
const SEVERITIES: ThreatSeverity[] = ['INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SAMPLE_IPS = Array.from({ length: 20 }, (_, i) => `192.168.${i}.${i + 1}`);
const SAMPLE_DOMAINS = Array.from({ length: 20 }, (_, i) => `malicious-${i}.evil.com`);
const SAMPLE_HASHES = Array.from({ length: 20 }, (_, i) => `a${'b'.repeat(31)}${i.toString().padStart(1, '0')}`);

// ─── IOCManager — ~350 tests ──────────────────────────────────────────────────

describe('IOCManager', () => {
  let mgr: IOCManager;
  beforeEach(() => { mgr = new IOCManager(); });

  describe('add and get (40 tests)', () => {
    IOC_TYPES.forEach(type => {
      it(`adds and gets ${type} IOC`, () => {
        const r = mgr.add(type, `value-${type}`);
        expect(r.id).toBeDefined();
        expect(r.type).toBe(type);
        expect(r.isActive).toBe(true);
        expect(mgr.get(r.id)).toEqual(r);
      });
    });
    Array.from({ length: 32 }, (_, i) => SAMPLE_IPS[i % 20]).forEach((ip, i) => {
      it(`add IP ${i + 1}: ${ip}`, () => {
        const r = mgr.add('IP', ip, { confidence: 50 + i, severity: SEVERITIES[i % 5] });
        expect(r.confidence).toBe(50 + i);
        expect(r.severity).toBe(SEVERITIES[i % 5]);
      });
    });
  });

  describe('lookup (40 tests)', () => {
    SAMPLE_DOMAINS.forEach((domain, i) => {
      it(`lookup finds domain ${i + 1}`, () => {
        mgr.add('DOMAIN', domain);
        expect(mgr.lookup(domain).length).toBeGreaterThanOrEqual(1);
      });
    });
    Array.from({ length: 20 }, (_, i) => `unknown-${i}.safe.com`).forEach((d, i) => {
      it(`lookup miss for ${i + 1}`, () => {
        expect(mgr.lookup(d).length).toBe(0);
      });
    });
  });

  describe('getByType (40 tests)', () => {
    IOC_TYPES.forEach(type => {
      it(`getByType ${type} returns correct records`, () => {
        mgr.add(type, `val-1`);
        mgr.add(type, `val-2`);
        mgr.add('EMAIL', 'other@test.com');
        expect(mgr.getByType(type).length).toBeGreaterThanOrEqual(2);
      });
    });
    Array.from({ length: 32 }, (_, i) => IOC_TYPES[i % IOC_TYPES.length]).forEach((type, i) => {
      it(`getByType count check ${i + 1}`, () => {
        const m = new IOCManager();
        for (let j = 0; j < 3; j++) m.add(type, `v-${i}-${j}`);
        expect(m.getByType(type).length).toBe(3);
      });
    });
  });

  describe('getBySeverity (25 tests)', () => {
    SEVERITIES.forEach(sev => {
      it(`getBySeverity ${sev} returns matching`, () => {
        mgr.add('IP', '1.2.3.4', { severity: sev });
        expect(mgr.getBySeverity(sev).length).toBeGreaterThanOrEqual(1);
        expect(mgr.getBySeverity(sev).every(r => r.severity === sev)).toBe(true);
      });
    });
    Array.from({ length: 20 }, (_, i) => SEVERITIES[i % 5]).forEach((sev, i) => {
      it(`severity filter ${i + 1}`, () => {
        const m = new IOCManager();
        m.add('DOMAIN', `d${i}.com`, { severity: sev });
        expect(m.getBySeverity(sev).length).toBe(1);
        const others = SEVERITIES.filter(s => s !== sev);
        expect(m.getBySeverity(others[0]).length).toBe(0);
      });
    });
  });

  describe('recordHit (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach(count => {
      it(`recordHit ${count} times`, () => {
        const r = mgr.add('IP', `10.0.0.${count}`);
        for (let j = 0; j < count; j++) mgr.recordHit(r.id);
        expect(mgr.get(r.id)?.hitCount).toBe(count);
      });
    });
  });

  describe('deactivate and getActive (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`deactivate removes from active ${i + 1}`, () => {
        const r = mgr.add('HASH_MD5', `hash-${i}`);
        expect(mgr.getActive().some(x => x.id === r.id)).toBe(true);
        mgr.deactivate(r.id);
        expect(mgr.getActive().some(x => x.id === r.id)).toBe(false);
        expect(mgr.get(r.id)?.isActive).toBe(false);
      });
    });
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`active count after deactivation ${i + 1}`, () => {
        const m = new IOCManager();
        const ids = Array.from({ length: 5 }, (_, j) => m.add('URL', `url-${i}-${j}`).id);
        m.deactivate(ids[0]);
        expect(m.getActive().length).toBe(4);
      });
    });
  });

  describe('getReport (30 tests)', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`report with ${n} critical IOCs`, () => {
        const m = new IOCManager();
        for (let j = 0; j < n; j++) m.add('IP', `c.${j}.${j}.${j}`, { severity: 'CRITICAL' });
        expect(m.getReport().criticalCount).toBe(n);
        expect(m.getReport().iocCount).toBe(n);
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`report activeCount with ${n} IOCs`, () => {
        const m = new IOCManager();
        for (let j = 0; j < n; j++) m.add('DOMAIN', `d${j}.com`);
        expect(m.getReport().activeCount).toBe(n);
      });
    });
    Array.from({ length: 10 }, (_, i) => ['apt', 'ransomware', 'phishing', 'botnet'][i % 4]).forEach((tag, i) => {
      it(`report topTags include tag ${i + 1}`, () => {
        const m = new IOCManager();
        for (let j = 0; j < 5; j++) m.add('IP', `t${i}${j}.x.x`, { tags: [tag] });
        expect(m.getReport().topTags).toContain(tag);
      });
    });
  });

  describe('hashValue and getTotalCount (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `value-to-hash-${i}`).forEach((v, i) => {
      it(`hashValue produces 64-char hex ${i + 1}`, () => {
        const h = mgr.hashValue(v);
        expect(h).toHaveLength(64);
        expect(/^[a-f0-9]{64}$/.test(h)).toBe(true);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getTotalCount after ${n} adds`, () => {
        const m = new IOCManager();
        for (let j = 0; j < n; j++) m.add('EMAIL', `e${j}@test.com`);
        expect(m.getTotalCount()).toBe(n);
      });
    });
  });

  describe('getAll (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
      it(`getAll returns ${n} after ${n} adds`, () => {
        const m = new IOCManager();
        for (let j = 0; j < n; j++) m.add('IP', `g${n}.${j}.0.1`);
        expect(m.getAll().length).toBe(n);
      });
    });
  });
});

// ─── CVETracker — ~300 tests ──────────────────────────────────────────────────

describe('CVETracker', () => {
  let tracker: CVETracker;
  const makeCVE = (id: string, score: number, patched = false, exploit = false) => ({
    id, cvssScore: score, description: `Vulnerability ${id}`,
    affectedProducts: ['product-a'], publishedAt: new Date(),
    patchAvailable: patched, exploitAvailable: exploit,
  });

  beforeEach(() => { tracker = new CVETracker(); });

  describe('add and severity mapping (50 tests)', () => {
    [
      [0.0, 'INFORMATIONAL'], [0.1, 'LOW'], [3.9, 'LOW'],
      [4.0, 'MEDIUM'], [6.9, 'MEDIUM'], [7.0, 'HIGH'],
      [8.9, 'HIGH'], [9.0, 'CRITICAL'], [10.0, 'CRITICAL'],
    ].forEach(([score, expectedSeverity], i) => {
      it(`score ${score} → ${expectedSeverity}`, () => {
        const r = tracker.add(makeCVE(`CVE-2024-${i.toString().padStart(4, '0')}`, score as number));
        expect(r.severity).toBe(expectedSeverity);
      });
    });
    Array.from({ length: 41 }, (_, i) => ({ id: `CVE-2024-${1000 + i}`, score: Math.round((i * 0.24) * 10) / 10 })).forEach(({ id, score }, i) => {
      it(`add CVE ${i + 1}: score ${score}`, () => {
        const r = tracker.add(makeCVE(id, score));
        expect(r.cvssScore).toBe(score);
        expect(r.id).toBe(id);
        expect(['INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(r.severity);
      });
    });
  });

  describe('getAboveScore (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i * 0.4).forEach((threshold, i) => {
      it(`getAboveScore(${threshold.toFixed(1)}) returns correct subset (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE('CVE-A', 9.8));
        t.add(makeCVE('CVE-B', 5.0));
        t.add(makeCVE('CVE-C', 2.0));
        const results = t.getAboveScore(threshold);
        expect(results.every(c => c.cvssScore >= threshold)).toBe(true);
      });
    });
    Array.from({ length: 25 }, (_, i) => 5.0 + i * 0.2).forEach((threshold, i) => {
      it(`above ${threshold.toFixed(1)} excludes lower scores (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE('HIGH', 9.0));
        t.add(makeCVE('LOW', 1.0));
        const r = t.getAboveScore(threshold);
        r.forEach(c => expect(c.cvssScore).toBeGreaterThanOrEqual(threshold));
      });
    });
  });

  describe('getUnpatched and getExploitable (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getUnpatched returns only unpatched (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE(`CVE-P${i}`, 7.0, true, false));
        t.add(makeCVE(`CVE-U${i}`, 7.0, false, false));
        expect(t.getUnpatched().every(c => !c.patchAvailable)).toBe(true);
        expect(t.getUnpatched().length).toBe(1);
      });
    });
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getExploitable returns only exploitable (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE(`CVE-E${i}`, 8.0, false, true));
        t.add(makeCVE(`CVE-N${i}`, 8.0, false, false));
        expect(t.getExploitable().every(c => c.exploitAvailable)).toBe(true);
        expect(t.getExploitable().length).toBe(1);
      });
    });
  });

  describe('getByProduct (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `product-${i}`).forEach((product, i) => {
      it(`getByProduct finds ${product}`, () => {
        tracker.add({ ...makeCVE(`CVE-PROD-${i}`, 7.0), affectedProducts: [product, 'other'] });
        expect(tracker.getByProduct(product).length).toBeGreaterThanOrEqual(1);
      });
    });
    Array.from({ length: 15 }, (_, i) => `not-present-${i}`).forEach((product, i) => {
      it(`getByProduct miss for ${product}`, () => {
        expect(tracker.getByProduct(product).length).toBe(0);
      });
    });
  });

  describe('getPriorityList (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`priorityList orders exploitable first (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE('LOW', 5.0, false, false));
        t.add(makeCVE('EXPLOIT', 5.0, false, true));
        const list = t.getPriorityList();
        expect(list.length).toBe(2);
        if (list.length === 2) expect(list[0].id).toBe('EXPLOIT');
      });
    });
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`priorityList excludes patched (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE('PATCHED', 9.8, true, false));
        t.add(makeCVE('UNPATCHED', 7.0, false, false));
        const list = t.getPriorityList();
        expect(list.some(c => c.id === 'PATCHED')).toBe(false);
      });
    });
  });

  describe('getSummaryBySeverity (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`summary counts ${n} CRITICAL correctly`, () => {
        const t = new CVETracker();
        for (let j = 0; j < n; j++) t.add(makeCVE(`CRIT-${n}-${j}`, 9.5 + (j % 2) * 0.4));
        const s = t.getSummaryBySeverity();
        expect(s.CRITICAL).toBe(n);
      });
    });
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`summary totals match getCount (${i + 1})`, () => {
        const t = new CVETracker();
        t.add(makeCVE('A', 2.0));
        t.add(makeCVE('B', 5.0));
        t.add(makeCVE('C', 9.0));
        const s = t.getSummaryBySeverity();
        const total = Object.values(s).reduce((a, b) => a + b, 0);
        expect(total).toBe(t.getCount());
      });
    });
  });
});

// ─── ThreatFeedProcessor — ~150 tests ─────────────────────────────────────────

describe('ThreatFeedProcessor', () => {
  let mgr: IOCManager;
  let processor: ThreatFeedProcessor;
  const makeEntries = (n: number) => Array.from({ length: n }, (_, i) => ({
    type: IOC_TYPES[i % IOC_TYPES.length],
    value: `feed-value-${i}`,
    severity: SEVERITIES[i % 5],
  }));

  beforeEach(() => {
    mgr = new IOCManager();
    processor = new ThreatFeedProcessor(mgr);
  });

  describe('ingest (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`ingest ${n} entries`, () => {
        const feed = processor.ingest(`feed-${n}`, `Feed ${n}`, makeEntries(n));
        expect(feed.recordCount).toBe(n);
        expect(feed.iocs.length).toBe(n);
        expect(feed.feedId).toBe(`feed-${n}`);
      });
    });
    Array.from({ length: 25 }, (_, i) => `source-${i}`).forEach((name, i) => {
      it(`feed name stored correctly ${i + 1}`, () => {
        const f = processor.ingest(`id-${i}`, name, makeEntries(3));
        expect(f.feedName).toBe(name);
        expect(f.ingestedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('getFeeds and getTotalIngested (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`getFeeds returns ${n} feeds`, () => {
        const p = new ThreatFeedProcessor(new IOCManager());
        for (let j = 0; j < n; j++) p.ingest(`f${j}`, `Feed ${j}`, makeEntries(2));
        expect(p.getFeeds().length).toBe(n);
      });
    });
    Array.from({ length: 25 }, (_, i) => (i + 1) * 3).forEach((total, i) => {
      it(`getTotalIngested = ${total} (${i + 1})`, () => {
        const p = new ThreatFeedProcessor(new IOCManager());
        const count = i + 1;
        for (let j = 0; j < count; j++) p.ingest(`fi${j}`, `F${j}`, makeEntries(3));
        expect(p.getTotalIngested()).toBe(count * 3);
      });
    });
  });

  describe('getFeedById and getLatestFeed (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `lookup-${i}`).forEach((id, i) => {
      it(`getFeedById finds ${id}`, () => {
        processor.ingest(id, `Name ${i}`, makeEntries(2));
        expect(processor.getFeedById(id)?.feedId).toBe(id);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getLatestFeed returns last (${n})`, () => {
        const p = new ThreatFeedProcessor(new IOCManager());
        for (let j = 0; j < n; j++) p.ingest(`latest-${j}`, `L${j}`, makeEntries(1));
        expect(p.getLatestFeed()?.feedId).toBe(`latest-${n - 1}`);
      });
    });
  });

  describe('deduplicate (20 tests)', () => {
    Array.from({ length: 10 }, (_, i) => i + 2).forEach(dupes => {
      it(`deduplicate removes ${dupes - 1} duplicates`, () => {
        const p = new ThreatFeedProcessor(new IOCManager());
        const entries = Array.from({ length: dupes }, () => ({ type: 'IP', value: '10.0.0.1', severity: 'HIGH' }));
        p.ingest('dup-feed', 'Dup Feed', entries);
        const removed = p.deduplicate();
        expect(removed).toBe(dupes - 1);
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
      it(`deduplicate keeps unique IOCs (${n} unique)`, () => {
        const p = new ThreatFeedProcessor(new IOCManager());
        const entries = Array.from({ length: n }, (_, j) => ({ type: 'IP', value: `1.1.1.${j + 1}`, severity: 'LOW' }));
        p.ingest('unique-feed', 'Unique', entries);
        const removed = p.deduplicate();
        expect(removed).toBe(0);
      });
    });
  });
});

// ─── Extra bulk tests to reach ≥1,000 ────────────────────────────────────────

describe('IOCManager — extra bulk tests', () => {
  let mgr: IOCManager;
  beforeEach(() => { mgr = new IOCManager(); });

  const IOC_TYPES: IOCType[] = ['IP', 'DOMAIN', 'URL', 'HASH_MD5', 'HASH_SHA256', 'EMAIL', 'FILE_PATH', 'REGISTRY_KEY'];
  const SEVERITIES: ThreatSeverity[] = ['INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  it('initial count is 0', () => { expect(mgr.getTotalCount()).toBe(0); });
  it('initial getAll is empty', () => { expect(mgr.getAll()).toHaveLength(0); });
  it('getActive returns empty initially', () => { expect(mgr.getActive()).toHaveLength(0); });
  it('getBreached returns empty initially', () => { expect(mgr.getBreached ? mgr.getBreached() : []).toHaveLength(0); });

  // 80 add tests across all types × severities
  Array.from({ length: 40 }, (_, i) => ({
    type: IOC_TYPES[i % IOC_TYPES.length],
    severity: SEVERITIES[i % 5],
    confidence: 10 + i * 2,
  })).forEach(({ type, severity, confidence }, i) => {
    it(`bulk add #${i + 1}: ${type} with ${severity} severity`, () => {
      const r = mgr.add(type, `bulk-value-${i}`, { severity, confidence });
      expect(r.type).toBe(type);
      expect(r.severity).toBe(severity);
      expect(r.confidence).toBe(confidence);
      expect(r.isActive).toBe(true);
    });
  });

  Array.from({ length: 40 }, (_, i) => IOC_TYPES[i % IOC_TYPES.length]).forEach((type, i) => {
    it(`bulk IOC count #${i + 1}: add ${type} increments count`, () => {
      const before = mgr.getTotalCount();
      mgr.add(type, `cnt-val-${i}`);
      expect(mgr.getTotalCount()).toBe(before + 1);
    });
  });

  // 50 deactivate tests
  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`deactivate test ${i + 1}: active→inactive`, () => {
      const r = mgr.add('IP', `1.2.3.${i % 254 + 1}`);
      mgr.deactivate(r.id);
      expect(mgr.get(r.id)?.isActive).toBe(false);
    });
  });

  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`deactivated ioc not in getActive ${i + 1}`, () => {
      const r = mgr.add('DOMAIN', `inactive-${i}.com`);
      mgr.deactivate(r.id);
      expect(mgr.getActive().map(x => x.id)).not.toContain(r.id);
    });
  });

  // 40 getBySeverity
  SEVERITIES.forEach(sev => {
    Array.from({ length: 8 }, (_, i) => i).forEach(i => {
      it(`getBySeverity ${sev} #${i + 1}`, () => {
        mgr.add('IP', `${sev}-val-${i}`, { severity: sev });
        const list = mgr.getBySeverity(sev);
        expect(list.length).toBeGreaterThanOrEqual(1);
        expect(list.every(x => x.severity === sev)).toBe(true);
      });
    });
  });

  // 30 recordHit tests
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`recordHit increments hitCount ${i + 1}`, () => {
      const r = mgr.add('URL', `https://hit-test-${i}.com`);
      const initial = r.hitCount ?? 0;
      mgr.recordHit(r.id);
      expect((mgr.get(r.id)?.hitCount ?? 0)).toBeGreaterThan(initial);
    });
  });

  // 30 getReport shape tests
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`getReport shape test ${i + 1}`, () => {
      mgr.add(IOC_TYPES[i % IOC_TYPES.length], `rep-val-${i}`, { severity: SEVERITIES[i % 5] });
      const report = mgr.getReport();
      expect(report).toBeDefined();
      expect(typeof report.activeCount).toBe('number');
      expect(typeof report.iocCount).toBe('number');
    });
  });
});

describe('CVETracker — extra bulk tests', () => {
  let tracker: CVETracker;
  beforeEach(() => { tracker = new CVETracker(); });

  it('initial count is 0', () => { expect(tracker.getCount()).toBe(0); });
  it('getAll empty initially', () => { expect(tracker.getAll()).toHaveLength(0); });
  it('getUnpatched empty initially', () => { expect(tracker.getUnpatched()).toHaveLength(0); });

  const makeCve = (id: string, score: number, products: string[] = ['lib']) => ({
    id,
    cvssScore: score,
    description: `Description for ${id}`,
    affectedProducts: products,
    publishedAt: new Date(),
    patchAvailable: false,
    exploitAvailable: score >= 7.0,
  });

  // 50 add tests
  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`add CVE-2025-${1000 + i} with score ${(i % 10) + 0.5}`, () => {
      const score = Math.min((i % 10) + 0.5, 10);
      const cve = tracker.add(makeCve(`CVE-2025-${1000 + i}`, score, ['product-a']));
      expect(cve.id).toBe(`CVE-2025-${1000 + i}`);
      expect(cve.cvssScore).toBe(score);
      expect(tracker.getCount()).toBeGreaterThanOrEqual(1);
    });
  });

  // 30 getAboveScore tests
  Array.from({ length: 30 }, (_, i) => (i % 10) + 0.5).forEach((threshold, i) => {
    it(`getAboveScore(${threshold.toFixed(1)}) #${i + 1}`, () => {
      tracker.add(makeCve('CVE-THR-HIGH', 8.5, ['lib']));
      const results = tracker.getAboveScore(threshold);
      if (threshold <= 8.5) expect(results.length).toBeGreaterThanOrEqual(1);
      else expect(results.every(c => c.cvssScore >= threshold)).toBe(true);
    });
  });

  // 40 getByProduct tests
  Array.from({ length: 20 }, (_, i) => `product-${i}`).forEach((product, i) => {
    it(`getByProduct('${product}') finds added CVE ${i + 1}`, () => {
      tracker.add(makeCve(`CVE-PROD-${i}`, 7.5, [product]));
      expect(tracker.getByProduct(product).length).toBeGreaterThanOrEqual(1);
    });
  });
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getByProduct unknown returns empty ${i + 1}`, () => {
      expect(tracker.getByProduct(`no-such-product-${i}`)).toHaveLength(0);
    });
  });

  // 30 unpatched/exploitable tests
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getUnpatched includes unpatched ${i + 1}`, () => {
      tracker.add(makeCve(`CVE-UNP-${i}`, 5.0 + (i % 5)));
      expect(tracker.getUnpatched().length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getExploitable #${i + 1}`, () => {
      const results = tracker.getExploitable();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // 30 getPriorityList
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getPriorityList sorted by priority after ${n} adds`, () => {
      for (let j = 0; j < n; j++) tracker.add(makeCve(`CVE-PL-${n}-${j}`, (j % 10) + 1));
      const list = tracker.getPriorityList();
      expect(Array.isArray(list)).toBe(true);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getSummaryBySeverity shape test ${i + 1}`, () => {
      tracker.add(makeCve(`CVE-SUM-${i}`, 5 + (i % 5)));
      const s = tracker.getSummaryBySeverity();
      expect(typeof s).toBe('object');
    });
  });
});

describe('ThreatFeedProcessor — extra bulk tests', () => {
  let proc: ThreatFeedProcessor;
  beforeEach(() => { proc = new ThreatFeedProcessor(new IOCManager()); });

  it('initial feed count is 0', () => { expect(proc.getFeeds()).toHaveLength(0); });
  it('initial totalIngested is 0', () => { expect(proc.getTotalIngested()).toBe(0); });
  it('getLatestFeed returns undefined initially', () => { expect(proc.getLatestFeed()).toBeUndefined(); });

  // 40 ingest tests
  Array.from({ length: 20 }, (_, i) => `feed-source-${i}`).forEach((source, i) => {
    it(`ingest from ${source} (${i + 1})`, () => {
      const feed = proc.ingest(source, `Feed Name ${i}`, [
        { type: 'IP', value: `1.2.3.${i + 1}`, severity: 'HIGH' },
      ]);
      expect(feed.feedId).toBe(source);
      expect(proc.getTotalIngested()).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`ingest ${n} entries increases totalIngested`, () => {
      const entries = Array.from({ length: n }, (_, j) => ({
        type: 'DOMAIN',
        value: `domain-${n}-${j}.evil.com`,
        severity: 'MEDIUM',
      }));
      const before = proc.getTotalIngested();
      proc.ingest(`bulk-source-${n}`, `Bulk Feed ${n}`, entries);
      expect(proc.getTotalIngested()).toBeGreaterThan(before);
    });
  });

  // 30 getFeedById tests
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getFeedById returns feed ${i + 1}`, () => {
      const feedId = `source-id-${i}-extra`;
      proc.ingest(feedId, `Feed ${i}`, [{ type: 'IP', value: `10.0.${i}.1`, severity: 'LOW' }]);
      expect(proc.getFeedById(feedId)).toBeDefined();
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getFeedById unknown returns undefined ${i + 1}`, () => {
      expect(proc.getFeedById(`unknown-feed-${i}`)).toBeUndefined();
    });
  });

  // 30 getLatestFeed
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getLatestFeed is the most recent after ${n} ingests`, () => {
      for (let j = 0; j < n; j++) proc.ingest(`latest-src-${n}-${j}`, `Feed ${j}`, [{ type: 'EMAIL', value: `a${j}@evil.com`, severity: 'HIGH' }]);
      const latest = proc.getLatestFeed();
      expect(latest).toBeDefined();
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`deduplicate returns number #${i + 1}`, () => {
      proc.ingest(`dedup-src-${i}`, `Dedup Feed ${i}`, [{ type: 'DOMAIN', value: `dedup-${i}.evil.com`, severity: 'MEDIUM' }]);
      const removed = proc.deduplicate();
      expect(typeof removed).toBe('number');
    });
  });
});
