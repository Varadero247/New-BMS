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
