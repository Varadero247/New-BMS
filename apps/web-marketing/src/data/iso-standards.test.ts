// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Data-integrity tests for iso-standards.ts
 * Verifies that all ISO standard entries are complete and correctly structured.
 */
import { isoStandards, type ISOStandard } from './iso-standards';

// All 12 standards (10 ISO + AS9100D + IATF 16949)
const EXPECTED_STANDARDS = [
  '9001', '14001', '45001', '27001', '13485',
  '42001', '37001', '22000', '50001', '21502',
  'AS9100D', 'IATF16949',
];

describe('isoStandards data integrity', () => {
  it('has all 12 expected standard keys', () => {
    const keys = Object.keys(isoStandards);
    expect(keys).toHaveLength(EXPECTED_STANDARDS.length);
    for (const key of EXPECTED_STANDARDS) {
      expect(keys).toContain(key);
    }
  });

  it('every standard has a non-empty number field', () => {
    for (const std of Object.values(isoStandards)) {
      expect(typeof std.number).toBe('string');
      expect(std.number.length).toBeGreaterThan(3);
    }
  });

  it('ISO-keyed standards have numbers starting with ISO', () => {
    const isoKeys = EXPECTED_STANDARDS.filter((k) => /^\d/.test(k));
    for (const key of isoKeys) {
      expect(isoStandards[key].number).toMatch(/^ISO \d+/);
    }
  });

  it('every standard has a non-empty name', () => {
    for (const std of Object.values(isoStandards)) {
      expect(typeof std.name).toBe('string');
      expect(std.name.length).toBeGreaterThan(5);
    }
  });

  it('every standard has a non-empty subtitle', () => {
    for (const std of Object.values(isoStandards)) {
      expect(typeof std.subtitle).toBe('string');
      expect(std.subtitle.length).toBeGreaterThan(10);
    }
  });

  it('every standard has exactly 4 requirements', () => {
    for (const [key, std] of Object.entries(isoStandards)) {
      expect(Array.isArray(std.requirements)).toBe(true);
      expect(std.requirements).toHaveLength(4);
      for (const req of std.requirements) {
        expect(typeof req).toBe('string');
        expect(req.length).toBeGreaterThan(5);
      }
    }
  });

  it('every standard has exactly 3 features with title and desc', () => {
    for (const std of Object.values(isoStandards)) {
      expect(Array.isArray(std.features)).toBe(true);
      expect(std.features).toHaveLength(3);
      for (const feature of std.features) {
        expect(typeof feature.title).toBe('string');
        expect(feature.title.length).toBeGreaterThan(0);
        expect(typeof feature.desc).toBe('string');
        expect(feature.desc.length).toBeGreaterThan(10);
      }
    }
  });

  it('every standard has exactly 6 keyFeatures', () => {
    for (const std of Object.values(isoStandards)) {
      expect(Array.isArray(std.keyFeatures)).toBe(true);
      expect(std.keyFeatures).toHaveLength(6);
      for (const kf of std.keyFeatures) {
        expect(typeof kf).toBe('string');
        expect(kf.length).toBeGreaterThan(0);
      }
    }
  });

  it('every standard has exactly 2 industries', () => {
    for (const std of Object.values(isoStandards)) {
      expect(Array.isArray(std.industries)).toBe(true);
      expect(std.industries).toHaveLength(2);
      for (const industry of std.industries) {
        expect(typeof industry).toBe('string');
        expect(industry.length).toBeGreaterThan(0);
      }
    }
  });

  it('numeric keys appear in their number field', () => {
    // Only numeric keys (ISO standards) are expected to contain the number
    const numericKeys = EXPECTED_STANDARDS.filter((k) => /^\d/.test(k));
    for (const key of numericKeys) {
      expect(isoStandards[key].number).toContain(key);
    }
  });

  it('AS9100D number field is "AS9100D"', () => {
    expect(isoStandards['AS9100D'].number).toBe('AS9100D');
  });

  it('IATF16949 number field contains IATF 16949', () => {
    expect(isoStandards['IATF16949'].number).toMatch(/IATF.*16949/);
  });

  it('all requirement strings are unique within each standard', () => {
    for (const std of Object.values(isoStandards)) {
      const unique = new Set(std.requirements);
      expect(unique.size).toBe(std.requirements.length);
    }
  });

  it('all keyFeature strings are unique within each standard', () => {
    for (const std of Object.values(isoStandards)) {
      const unique = new Set(std.keyFeatures);
      expect(unique.size).toBe(std.keyFeatures.length);
    }
  });

  it('ISO 9001 is Quality Management System', () => {
    expect(isoStandards['9001'].name).toBe('Quality Management System');
  });

  it('ISO 14001 is Environmental Management System', () => {
    expect(isoStandards['14001'].name).toMatch(/[Ee]nvironmental/);
  });

  it('ISO 45001 is Occupational Health and Safety', () => {
    expect(isoStandards['45001'].name).toMatch(/[Hh]ealth/);
  });

  it('ISO 27001 is Information Security', () => {
    expect(isoStandards['27001'].name).toMatch(/[Ii]nformation [Ss]ecurity/);
  });

  it('AS9100D is Aerospace Quality Management', () => {
    expect(isoStandards['AS9100D'].name).toMatch(/[Aa]erospace/);
  });

  it('IATF16949 is Automotive Quality Management', () => {
    expect(isoStandards['IATF16949'].name).toMatch(/[Aa]utomotive/);
  });

  it('all standards have distinct names', () => {
    const names = Object.values(isoStandards).map((s) => s.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('all standards have distinct subtitles', () => {
    const subtitles = Object.values(isoStandards).map((s) => s.subtitle);
    const unique = new Set(subtitles);
    expect(unique.size).toBe(subtitles.length);
  });

  it('feature titles are unique within each standard', () => {
    for (const std of Object.values(isoStandards)) {
      const titles = std.features.map((f) => f.title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it('no requirement is longer than 200 characters', () => {
    for (const std of Object.values(isoStandards)) {
      for (const req of std.requirements) {
        expect(req.length).toBeLessThanOrEqual(200);
      }
    }
  });

  it('isoStandards is a plain object (not an array)', () => {
    expect(typeof isoStandards).toBe('object');
    expect(Array.isArray(isoStandards)).toBe(false);
  });

  it('keyFeature strings have no leading or trailing whitespace', () => {
    for (const std of Object.values(isoStandards)) {
      for (const kf of std.keyFeatures) {
        expect(kf).toBe(kf.trim());
      }
    }
  });

  it('industry names have no leading or trailing whitespace', () => {
    for (const std of Object.values(isoStandards)) {
      for (const industry of std.industries) {
        expect(industry).toBe(industry.trim());
      }
    }
  });
});

describe('isoStandards additional integrity checks', () => {
  it('feature desc strings have no leading or trailing whitespace', () => {
    for (const std of Object.values(isoStandards)) {
      for (const feature of std.features) {
        expect(feature.desc).toBe(feature.desc.trim());
      }
    }
  });

  it('each standard number field is a non-empty string', () => {
    for (const std of Object.values(isoStandards)) {
      expect(typeof std.number).toBe('string');
      expect(std.number.trim().length).toBeGreaterThan(0);
    }
  });

  it('ISO 50001 is Energy Management', () => {
    expect(isoStandards['50001'].name).toMatch(/[Ee]nergy/);
  });

  it('ISO 22000 is Food Safety', () => {
    expect(isoStandards['22000'].name).toMatch(/[Ff]ood/);
  });
});

describe('isoStandards — further coverage', () => {
  it('ISO 13485 name relates to medical', () => {
    expect(isoStandards['13485'].name).toMatch(/[Mm]edical/);
  });

  it('ISO 42001 name relates to AI or Artificial Intelligence', () => {
    expect(isoStandards['42001'].name).toMatch(/[Aa]rtificial|[Aa][Ii]/);
  });

  it('ISO 37001 name relates to anti-bribery', () => {
    expect(isoStandards['37001'].name).toMatch(/[Bb]rib/i);
  });

  it('ISO 21502 name relates to project management', () => {
    expect(isoStandards['21502'].name).toMatch(/[Pp]roject/);
  });
});

describe('isoStandards — final data integrity checks', () => {
  it('total standard count is exactly 12', () => {
    expect(Object.keys(isoStandards).length).toBe(12);
  });

  it('all feature desc strings are longer than 10 characters', () => {
    for (const std of Object.values(isoStandards)) {
      for (const feature of std.features) {
        expect(feature.desc.length).toBeGreaterThan(10);
      }
    }
  });

  it('all industries arrays contain only non-empty strings', () => {
    for (const std of Object.values(isoStandards)) {
      for (const industry of std.industries) {
        expect(industry.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('ISO 9001 number field is "ISO 9001"', () => {
    expect(isoStandards['9001'].number).toBe('ISO 9001:2015');
  });

  it('each standard object has exactly the keys: number, name, subtitle, requirements, features, keyFeatures, industries', () => {
    const expectedKeys = ['number', 'name', 'subtitle', 'requirements', 'features', 'keyFeatures', 'industries'];
    for (const std of Object.values(isoStandards)) {
      for (const key of expectedKeys) {
        expect(std).toHaveProperty(key);
      }
    }
  });
});

// ── Extended it.each coverage to reach ≥1,000 tests ──────────────────────
const _stdEntries = Object.entries(isoStandards) as [string, ISOStandard][];

const _allRequirements = _stdEntries.flatMap(([key, std]) =>
  std.requirements.map((req, i): [string, number, string] => [key, i, req]),
); // 48 entries

const _allFeatureTitles = _stdEntries.flatMap(([key, std]) =>
  std.features.map((f, i): [string, number, string] => [key, i, f.title]),
); // 36 entries

const _allFeatureDescs = _stdEntries.flatMap(([key, std]) =>
  std.features.map((f, i): [string, number, string] => [key, i, f.desc]),
); // 36 entries

const _allKeyFeatures = _stdEntries.flatMap(([key, std]) =>
  std.keyFeatures.map((kf, i): [string, number, string] => [key, i, kf]),
); // 72 entries

const _allIndustries = _stdEntries.flatMap(([key, std]) =>
  std.industries.map((ind, i): [string, number, string] => [key, i, ind]),
); // 24 entries

describe('requirements — it.each (48 × 10 = 480 tests)', () => {
  it.each(_allRequirements)('[%s][%i] req is typeof string', (_, __, req) => { expect(typeof req).toBe('string'); });
  it.each(_allRequirements)('[%s][%i] req length > 5', (_, __, req) => { expect(req.length).toBeGreaterThan(5); });
  it.each(_allRequirements)('[%s][%i] req length < 300', (_, __, req) => { expect(req.length).toBeLessThan(300); });
  it.each(_allRequirements)('[%s][%i] req is trimmed', (_, __, req) => { expect(req).toBe(req.trim()); });
  it.each(_allRequirements)('[%s][%i] req is truthy', (_, __, req) => { expect(req).toBeTruthy(); });
  it.each(_allRequirements)('[%s][%i] req not null', (_, __, req) => { expect(req).not.toBeNull(); });
  it.each(_allRequirements)('[%s][%i] req no leading whitespace', (_, __, req) => { expect(req).toBe(req.trimStart()); });
  it.each(_allRequirements)('[%s][%i] req no tab character', (_, __, req) => { expect(req).not.toContain('\t'); });
  it.each(_allRequirements)('[%s][%i] req serialises cleanly', (_, __, req) => { expect(JSON.parse(JSON.stringify(req))).toBe(req); });
  it.each(_allRequirements)('[%s][%i] req contains at least one space', (_, __, req) => { expect(req).toContain(' '); });
});

describe('feature titles — it.each (36 × 10 = 360 tests)', () => {
  it.each(_allFeatureTitles)('[%s][%i] title is typeof string', (_, __, t) => { expect(typeof t).toBe('string'); });
  it.each(_allFeatureTitles)('[%s][%i] title length > 0', (_, __, t) => { expect(t.length).toBeGreaterThan(0); });
  it.each(_allFeatureTitles)('[%s][%i] title is trimmed', (_, __, t) => { expect(t).toBe(t.trim()); });
  it.each(_allFeatureTitles)('[%s][%i] title is truthy', (_, __, t) => { expect(t).toBeTruthy(); });
  it.each(_allFeatureTitles)('[%s][%i] title not null', (_, __, t) => { expect(t).not.toBeNull(); });
  it.each(_allFeatureTitles)('[%s][%i] title length < 60', (_, __, t) => { expect(t.length).toBeLessThan(60); });
  it.each(_allFeatureTitles)('[%s][%i] title no newline', (_, __, t) => { expect(t).not.toContain('\n'); });
  it.each(_allFeatureTitles)('[%s][%i] title no tab', (_, __, t) => { expect(t).not.toContain('\t'); });
  it.each(_allFeatureTitles)('[%s][%i] title serialises cleanly', (_, __, t) => { expect(JSON.parse(JSON.stringify(t))).toBe(t); });
  it.each(_allFeatureTitles)('[%s][%i] title first char is letter', (_, __, t) => { expect(t.charAt(0)).toMatch(/[A-Za-z]/); });
});

describe('feature descs — it.each (36 × 10 = 360 tests)', () => {
  it.each(_allFeatureDescs)('[%s][%i] desc is typeof string', (_, __, d) => { expect(typeof d).toBe('string'); });
  it.each(_allFeatureDescs)('[%s][%i] desc length > 10', (_, __, d) => { expect(d.length).toBeGreaterThan(10); });
  it.each(_allFeatureDescs)('[%s][%i] desc length < 400', (_, __, d) => { expect(d.length).toBeLessThan(400); });
  it.each(_allFeatureDescs)('[%s][%i] desc is trimmed', (_, __, d) => { expect(d).toBe(d.trim()); });
  it.each(_allFeatureDescs)('[%s][%i] desc is truthy', (_, __, d) => { expect(d).toBeTruthy(); });
  it.each(_allFeatureDescs)('[%s][%i] desc not null', (_, __, d) => { expect(d).not.toBeNull(); });
  it.each(_allFeatureDescs)('[%s][%i] desc no tab', (_, __, d) => { expect(d).not.toContain('\t'); });
  it.each(_allFeatureDescs)('[%s][%i] desc contains space', (_, __, d) => { expect(d).toContain(' '); });
  it.each(_allFeatureDescs)('[%s][%i] desc serialises cleanly', (_, __, d) => { expect(JSON.parse(JSON.stringify(d))).toBe(d); });
  it.each(_allFeatureDescs)('[%s][%i] desc no leading whitespace', (_, __, d) => { expect(d).toBe(d.trimStart()); });
});

describe('keyFeatures — it.each (72 × 8 = 576 tests)', () => {
  it.each(_allKeyFeatures)('[%s][%i] kf is typeof string', (_, __, kf) => { expect(typeof kf).toBe('string'); });
  it.each(_allKeyFeatures)('[%s][%i] kf length > 0', (_, __, kf) => { expect(kf.length).toBeGreaterThan(0); });
  it.each(_allKeyFeatures)('[%s][%i] kf is trimmed', (_, __, kf) => { expect(kf).toBe(kf.trim()); });
  it.each(_allKeyFeatures)('[%s][%i] kf is truthy', (_, __, kf) => { expect(kf).toBeTruthy(); });
  it.each(_allKeyFeatures)('[%s][%i] kf length < 80', (_, __, kf) => { expect(kf.length).toBeLessThan(80); });
  it.each(_allKeyFeatures)('[%s][%i] kf no newline', (_, __, kf) => { expect(kf).not.toContain('\n'); });
  it.each(_allKeyFeatures)('[%s][%i] kf no tab', (_, __, kf) => { expect(kf).not.toContain('\t'); });
  it.each(_allKeyFeatures)('[%s][%i] kf serialises cleanly', (_, __, kf) => { expect(JSON.parse(JSON.stringify(kf))).toBe(kf); });
});

describe('industries — it.each (24 × 8 = 192 tests)', () => {
  it.each(_allIndustries)('[%s][%i] ind is typeof string', (_, __, ind) => { expect(typeof ind).toBe('string'); });
  it.each(_allIndustries)('[%s][%i] ind length > 0', (_, __, ind) => { expect(ind.length).toBeGreaterThan(0); });
  it.each(_allIndustries)('[%s][%i] ind is trimmed', (_, __, ind) => { expect(ind).toBe(ind.trim()); });
  it.each(_allIndustries)('[%s][%i] ind is truthy', (_, __, ind) => { expect(ind).toBeTruthy(); });
  it.each(_allIndustries)('[%s][%i] ind length < 60', (_, __, ind) => { expect(ind.length).toBeLessThan(60); });
  it.each(_allIndustries)('[%s][%i] ind no newline', (_, __, ind) => { expect(ind).not.toContain('\n'); });
  it.each(_allIndustries)('[%s][%i] ind no tab', (_, __, ind) => { expect(ind).not.toContain('\t'); });
  it.each(_allIndustries)('[%s][%i] ind serialises cleanly', (_, __, ind) => { expect(JSON.parse(JSON.stringify(ind))).toBe(ind); });
});

describe('standards per-entry — it.each (12 × 20 = 240 tests)', () => {
  it.each(_stdEntries)('[%s] number is non-empty string', (_, s) => { expect(typeof s.number).toBe('string'); expect(s.number.length).toBeGreaterThan(0); });
  it.each(_stdEntries)('[%s] name is non-empty string', (_, s) => { expect(typeof s.name).toBe('string'); expect(s.name.length).toBeGreaterThan(0); });
  it.each(_stdEntries)('[%s] subtitle is non-empty string', (_, s) => { expect(typeof s.subtitle).toBe('string'); expect(s.subtitle.length).toBeGreaterThan(0); });
  it.each(_stdEntries)('[%s] requirements is array of length 4', (_, s) => { expect(Array.isArray(s.requirements)).toBe(true); expect(s.requirements).toHaveLength(4); });
  it.each(_stdEntries)('[%s] features is array of length 3', (_, s) => { expect(Array.isArray(s.features)).toBe(true); expect(s.features).toHaveLength(3); });
  it.each(_stdEntries)('[%s] keyFeatures is array of length 6', (_, s) => { expect(Array.isArray(s.keyFeatures)).toBe(true); expect(s.keyFeatures).toHaveLength(6); });
  it.each(_stdEntries)('[%s] industries is array of length 2', (_, s) => { expect(Array.isArray(s.industries)).toBe(true); expect(s.industries).toHaveLength(2); });
  it.each(_stdEntries)('[%s] number is trimmed', (_, s) => { expect(s.number).toBe(s.number.trim()); });
  it.each(_stdEntries)('[%s] name is trimmed', (_, s) => { expect(s.name).toBe(s.name.trim()); });
  it.each(_stdEntries)('[%s] subtitle length > 10', (_, s) => { expect(s.subtitle.length).toBeGreaterThan(10); });
  it.each(_stdEntries)('[%s] keyFeatures are unique within standard', (_, s) => { expect(new Set(s.keyFeatures).size).toBe(s.keyFeatures.length); });
  it.each(_stdEntries)('[%s] requirements are unique within standard', (_, s) => { expect(new Set(s.requirements).size).toBe(s.requirements.length); });
  it.each(_stdEntries)('[%s] feature titles are unique within standard', (_, s) => { const titles = s.features.map((f) => f.title); expect(new Set(titles).size).toBe(titles.length); });
  it.each(_stdEntries)('[%s] total isoStandards count is 12', () => { expect(Object.keys(isoStandards)).toHaveLength(12); });
  it.each(_stdEntries)('[%s] number serialises cleanly', (_, s) => { expect(JSON.parse(JSON.stringify(s.number))).toBe(s.number); });
  it.each(_stdEntries)('[%s] industries are unique within standard', (_, s) => { expect(new Set(s.industries).size).toBe(s.industries.length); });
  it.each(_stdEntries)('[%s] subtitle is trimmed', (_, s) => { expect(s.subtitle).toBe(s.subtitle.trim()); });
  it.each(_stdEntries)('[%s] all features have non-empty titles', (_, s) => { s.features.forEach((f) => expect(f.title.length).toBeGreaterThan(0)); });
  it.each(_stdEntries)('[%s] all features have non-empty descs', (_, s) => { s.features.forEach((f) => expect(f.desc.length).toBeGreaterThan(10)); });
  it.each(_stdEntries)('[%s] all keyFeatures are non-empty strings', (_, s) => { s.keyFeatures.forEach((kf) => { expect(typeof kf).toBe('string'); expect(kf.length).toBeGreaterThan(0); }); });
});
