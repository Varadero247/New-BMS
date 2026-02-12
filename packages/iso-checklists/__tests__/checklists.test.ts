import {
  iso9001Checklist,
  iso14001Checklist,
  iso45001Checklist,
  iatf16949Checklist,
  as9100Checklist,
  iso13485Checklist,
  checklists,
  getChecklist,
  getAvailableStandards,
} from '../src';
import type { StandardChecklist, ChecklistClause } from '../src';

describe('Checklist Registry', () => {
  describe('checklists map', () => {
    it('should contain 6 standards', () => {
      expect(Object.keys(checklists)).toHaveLength(6);
    });

    it('should contain ISO_9001', () => {
      expect(checklists['ISO_9001']).toBeDefined();
    });

    it('should contain ISO_14001', () => {
      expect(checklists['ISO_14001']).toBeDefined();
    });

    it('should contain ISO_45001', () => {
      expect(checklists['ISO_45001']).toBeDefined();
    });

    it('should contain IATF_16949', () => {
      expect(checklists['IATF_16949']).toBeDefined();
    });

    it('should contain AS9100D', () => {
      expect(checklists['AS9100D']).toBeDefined();
    });

    it('should contain ISO_13485', () => {
      expect(checklists['ISO_13485']).toBeDefined();
    });
  });

  describe('getChecklist', () => {
    it('should return ISO_9001 checklist', () => {
      const result = getChecklist('ISO_9001');
      expect(result).toBeDefined();
      expect(result!.standard).toBe('ISO_9001');
    });

    it('should return ISO_14001 checklist', () => {
      const result = getChecklist('ISO_14001');
      expect(result).toBeDefined();
      expect(result!.standard).toBe('ISO_14001');
    });

    it('should return ISO_45001 checklist', () => {
      const result = getChecklist('ISO_45001');
      expect(result).toBeDefined();
    });

    it('should return IATF_16949 checklist', () => {
      const result = getChecklist('IATF_16949');
      expect(result).toBeDefined();
    });

    it('should return AS9100D checklist', () => {
      const result = getChecklist('AS9100D');
      expect(result).toBeDefined();
    });

    it('should return ISO_13485 checklist', () => {
      const result = getChecklist('ISO_13485');
      expect(result).toBeDefined();
    });

    it('should return undefined for unknown standard', () => {
      expect(getChecklist('UNKNOWN')).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(getChecklist('')).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      expect(getChecklist('iso_9001')).toBeUndefined();
      expect(getChecklist('Iso_9001')).toBeUndefined();
    });
  });

  describe('getAvailableStandards', () => {
    it('should return 6 standards', () => {
      const standards = getAvailableStandards();
      expect(standards).toHaveLength(6);
    });

    it('should include all standard codes', () => {
      const standards = getAvailableStandards();
      expect(standards).toContain('ISO_9001');
      expect(standards).toContain('ISO_14001');
      expect(standards).toContain('ISO_45001');
      expect(standards).toContain('IATF_16949');
      expect(standards).toContain('AS9100D');
      expect(standards).toContain('ISO_13485');
    });

    it('should return array of strings', () => {
      const standards = getAvailableStandards();
      standards.forEach(s => {
        expect(typeof s).toBe('string');
      });
    });
  });
});

describe('ISO 9001:2015 Checklist', () => {
  it('should have standard code ISO_9001', () => {
    expect(iso9001Checklist.standard).toBe('ISO_9001');
  });

  it('should have version 2015', () => {
    expect(iso9001Checklist.version).toBe('2015');
  });

  it('should have a title', () => {
    expect(iso9001Checklist.title).toContain('Quality Management');
  });

  it('should have at least 10 clauses', () => {
    expect(iso9001Checklist.clauses.length).toBeGreaterThanOrEqual(10);
  });

  it('should have clauses from sections 4 through 10', () => {
    const clauseNumbers = iso9001Checklist.clauses.map(c => c.clause.split('.')[0]);
    expect(clauseNumbers).toContain('4');
    expect(clauseNumbers).toContain('5');
    expect(clauseNumbers).toContain('6');
    expect(clauseNumbers).toContain('7');
    expect(clauseNumbers).toContain('8');
    expect(clauseNumbers).toContain('9');
    expect(clauseNumbers).toContain('10');
  });

  it('should have non-empty questions for every clause', () => {
    iso9001Checklist.clauses.forEach(clause => {
      expect(clause.questions.length).toBeGreaterThan(0);
      clause.questions.forEach(q => {
        expect(q.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have non-empty evidence for every clause', () => {
    iso9001Checklist.clauses.forEach(clause => {
      expect(clause.evidence.length).toBeGreaterThan(0);
    });
  });

  it('should have mandatory field set for all clauses', () => {
    iso9001Checklist.clauses.forEach(clause => {
      expect(typeof clause.mandatory).toBe('boolean');
    });
  });

  it('should have all mandatory clauses', () => {
    const mandatory = iso9001Checklist.clauses.filter(c => c.mandatory);
    expect(mandatory.length).toBeGreaterThan(0);
  });

  it('should include clause 4.1 (Context)', () => {
    const c = iso9001Checklist.clauses.find(c => c.clause === '4.1');
    expect(c).toBeDefined();
    expect(c!.title).toContain('context');
  });

  it('should include clause 10.2 (Corrective action)', () => {
    const c = iso9001Checklist.clauses.find(c => c.clause === '10.2');
    expect(c).toBeDefined();
    expect(c!.title).toContain('corrective');
  });
});

describe('ISO 14001:2015 Checklist', () => {
  it('should have standard code ISO_14001', () => {
    expect(iso14001Checklist.standard).toBe('ISO_14001');
  });

  it('should have version 2015', () => {
    expect(iso14001Checklist.version).toBe('2015');
  });

  it('should have environmental management title', () => {
    expect(iso14001Checklist.title).toContain('Environmental');
  });

  it('should have at least 8 clauses', () => {
    expect(iso14001Checklist.clauses.length).toBeGreaterThanOrEqual(8);
  });

  it('should have non-empty questions for all clauses', () => {
    iso14001Checklist.clauses.forEach(clause => {
      expect(clause.questions.length).toBeGreaterThan(0);
    });
  });

  it('should have evidence for all clauses', () => {
    iso14001Checklist.clauses.forEach(clause => {
      expect(clause.evidence.length).toBeGreaterThan(0);
    });
  });
});

describe('ISO 45001 Checklist', () => {
  it('should have standard code ISO_45001', () => {
    expect(iso45001Checklist.standard).toBe('ISO_45001');
  });

  it('should have at least 8 clauses', () => {
    expect(iso45001Checklist.clauses.length).toBeGreaterThanOrEqual(8);
  });

  it('should have non-empty questions and evidence', () => {
    iso45001Checklist.clauses.forEach(clause => {
      expect(clause.questions.length).toBeGreaterThan(0);
      expect(clause.evidence.length).toBeGreaterThan(0);
    });
  });
});

describe('IATF 16949 Checklist', () => {
  it('should have standard code IATF_16949', () => {
    expect(iatf16949Checklist.standard).toBe('IATF_16949');
  });

  it('should have at least 8 clauses', () => {
    expect(iatf16949Checklist.clauses.length).toBeGreaterThanOrEqual(8);
  });

  it('should have non-empty questions and evidence', () => {
    iatf16949Checklist.clauses.forEach(clause => {
      expect(clause.questions.length).toBeGreaterThan(0);
      expect(clause.evidence.length).toBeGreaterThan(0);
    });
  });
});

describe('AS9100D Checklist', () => {
  it('should have standard code AS9100D', () => {
    expect(as9100Checklist.standard).toBe('AS9100D');
  });

  it('should have at least 5 clauses', () => {
    expect(as9100Checklist.clauses.length).toBeGreaterThanOrEqual(5);
  });

  it('should have aerospace-specific content', () => {
    expect(as9100Checklist.title).toContain('Aviation');
  });
});

describe('ISO 13485 Checklist', () => {
  it('should have standard code ISO_13485', () => {
    expect(iso13485Checklist.standard).toBe('ISO_13485');
  });

  it('should have at least 5 clauses', () => {
    expect(iso13485Checklist.clauses.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Checklist Clause Structure', () => {
  const allChecklists: StandardChecklist[] = [
    iso9001Checklist,
    iso14001Checklist,
    iso45001Checklist,
    iatf16949Checklist,
    as9100Checklist,
    iso13485Checklist,
  ];

  it('should have unique clause numbers within each checklist', () => {
    allChecklists.forEach(cl => {
      const clauseNumbers = cl.clauses.map(c => c.clause);
      const unique = new Set(clauseNumbers);
      expect(unique.size).toBe(clauseNumbers.length);
    });
  });

  it('should have non-empty titles for all clauses', () => {
    allChecklists.forEach(cl => {
      cl.clauses.forEach(c => {
        expect(c.title.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have non-empty clause numbers', () => {
    allChecklists.forEach(cl => {
      cl.clauses.forEach(c => {
        expect(c.clause.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have questions as arrays of strings', () => {
    allChecklists.forEach(cl => {
      cl.clauses.forEach(c => {
        expect(Array.isArray(c.questions)).toBe(true);
        c.questions.forEach(q => {
          expect(typeof q).toBe('string');
        });
      });
    });
  });

  it('should have evidence as arrays of strings', () => {
    allChecklists.forEach(cl => {
      cl.clauses.forEach(c => {
        expect(Array.isArray(c.evidence)).toBe(true);
        c.evidence.forEach(e => {
          expect(typeof e).toBe('string');
        });
      });
    });
  });
});
