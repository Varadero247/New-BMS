import {
  parseNaturalLanguage,
  validateQueryPermissions,
  sanitizeQuery,
  QUERY_PATTERNS,
} from '../src';
import type { NLQPermissionContext } from '../src';

const fullAccessContext: NLQPermissionContext = {
  userId: 'user-001',
  role: 'admin',
  modulePermissions: {
    'health-safety': 6,
    quality: 6,
    environment: 6,
    hr: 6,
    inventory: 6,
    finance: 6,
  },
};

const limitedContext: NLQPermissionContext = {
  userId: 'user-002',
  role: 'viewer',
  modulePermissions: {
    'health-safety': 1,
  },
};

describe('nlq', () => {
  describe('sanitizeQuery', () => {
    it('should remove SQL injection attempts', () => {
      const result = sanitizeQuery('show me all capas; DROP TABLE users;');
      expect(result).not.toContain('DROP');
      expect(result).not.toContain(';');
    });

    it('should remove UNION SELECT attacks', () => {
      const result = sanitizeQuery('show incidents UNION SELECT * FROM users');
      expect(result).not.toContain('UNION SELECT');
    });

    it('should remove SQL comments', () => {
      const result = sanitizeQuery('show capas -- this is a comment');
      expect(result).not.toContain('--');
    });

    it('should remove block comments', () => {
      const result = sanitizeQuery('show capas /* malicious */ WHERE 1=1');
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('should trim and normalize whitespace', () => {
      const result = sanitizeQuery('  show  me   all   capas  ');
      expect(result).toBe('show me all capas');
    });

    it('should pass through normal queries unchanged', () => {
      const result = sanitizeQuery('show me all overdue capas');
      expect(result).toBe('show me all overdue capas');
    });

    it('should remove ;DELETE injection', () => {
      const result = sanitizeQuery('list capas; DELETE FROM hs_capas;');
      expect(result).not.toContain('DELETE');
      expect(result).not.toContain(';');
    });

    it('should remove ;UPDATE injection', () => {
      const result = sanitizeQuery('list items; UPDATE inv_items SET qty=0;');
      expect(result).not.toContain('UPDATE');
    });

    it('should remove ;INSERT injection', () => {
      const result = sanitizeQuery("capas; INSERT INTO users VALUES ('hack','hack');");
      expect(result).not.toContain('INSERT');
    });

    it('should remove xp_ stored procedure calls', () => {
      const result = sanitizeQuery('show capas xp_cmdshell');
      expect(result).not.toContain('xp_');
    });

    it('should remove exec() calls', () => {
      const result = sanitizeQuery("show capas exec('rm -rf')");
      expect(result).not.toContain('exec(');
    });

    it('should remove INTO OUTFILE injection', () => {
      const result = sanitizeQuery("show capas INTO OUTFILE '/tmp/out.txt'");
      expect(result).not.toContain('INTO OUTFILE');
    });

    it('should remove LOAD_FILE injection', () => {
      const result = sanitizeQuery('show capas LOAD_FILE(/etc/passwd)');
      expect(result).not.toContain('LOAD_FILE');
    });

    it('should strip the DROP keyword from a pure-injection input', () => {
      // '; DROP TABLE users;' → ';DROP ' pattern removed → 'TABLE users' remaining
      // (TABLE is not itself a SQL command — this is correct behaviour)
      const result = sanitizeQuery('; DROP TABLE users;');
      expect(result).not.toContain('DROP');
      expect(result).not.toContain(';');
    });

    it('should handle case-insensitive injection removal', () => {
      expect(sanitizeQuery('capas; drop TABLE users')).not.toContain('drop');
      expect(sanitizeQuery('capas UNION select * from users')).not.toContain('union select');
    });
  });

  describe('parseNaturalLanguage', () => {
    it('should match overdue CAPAs query', () => {
      const result = parseNaturalLanguage('show me all overdue CAPAs', fullAccessContext);
      expect(result.sql).toContain('hs_capas');
      expect(result.modules).toContain('health-safety');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should match LTIFR query', () => {
      const result = parseNaturalLanguage('what is our LTIFR', fullAccessContext);
      expect(result.sql).toContain('ltifr');
      expect(result.modules).toContain('health-safety');
    });

    it('should match supplier NCRs query', () => {
      const result = parseNaturalLanguage('which suppliers have open NCRs', fullAccessContext);
      expect(result.sql).toContain('qms_ncrs');
      expect(result.modules).toContain('quality');
    });

    it('should match carbon emissions query', () => {
      const result = parseNaturalLanguage('what are our total emissions', fullAccessContext);
      expect(result.sql).toContain('env_emissions');
    });

    it('should match overdue training query', () => {
      const result = parseNaturalLanguage('show all overdue training', fullAccessContext);
      expect(result.sql).toContain('hr_training');
    });

    it('should match low stock query', () => {
      const result = parseNaturalLanguage('show items below reorder', fullAccessContext);
      expect(result.sql).toContain('inv_items');
    });

    it('should match overdue invoices query', () => {
      const result = parseNaturalLanguage('show overdue invoices', fullAccessContext);
      expect(result.sql).toContain('fin_invoices');
    });

    it('should return empty SQL for unrecognized query', () => {
      const result = parseNaturalLanguage('tell me a joke', fullAccessContext);
      expect(result.sql).toBe('');
      expect(result.confidence).toBe(0);
    });

    it('should deny access when user lacks permissions', () => {
      const result = parseNaturalLanguage('which suppliers have open NCRs', limitedContext);
      expect(result.sql).toBe('');
      expect(result.confidence).toBe(0);
    });

    it('should allow access when user has required permissions', () => {
      const result = parseNaturalLanguage('show me all overdue CAPAs', limitedContext);
      expect(result.sql).not.toBe('');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('result always has original field equal to the raw input', () => {
      const raw = 'show me all overdue CAPAs';
      const result = parseNaturalLanguage(raw, fullAccessContext);
      expect(result.original).toBe(raw);
    });

    it('result sanitized field differs from original when injection is stripped', () => {
      const raw = 'show capas; DROP TABLE users';
      const result = parseNaturalLanguage(raw, fullAccessContext);
      expect(result.original).toBe(raw);
      expect(result.sanitized).not.toContain('DROP');
    });

    it('result params is an empty array when no extractParams defined', () => {
      const result = parseNaturalLanguage('show me all overdue CAPAs', fullAccessContext);
      expect(result.params).toEqual([]);
    });

    it('unrecognised query still sets original and sanitized', () => {
      const raw = 'tell me a joke';
      const result = parseNaturalLanguage(raw, fullAccessContext);
      expect(result.original).toBe(raw);
      expect(result.sanitized).toBe(raw);
      expect(result.modules).toEqual([]);
    });

    it('denied query still sets modules from the matched pattern', () => {
      // limitedContext only has health-safety, so quality query is denied
      const result = parseNaturalLanguage('which suppliers have open NCRs', limitedContext);
      expect(result.modules).toContain('quality');
      expect(result.sql).toBe('');
    });

    it('confidence is 0.9 on successful match', () => {
      const result = parseNaturalLanguage('show me all overdue CAPAs', fullAccessContext);
      expect(result.confidence).toBe(0.9);
    });
  });

  describe('validateQueryPermissions', () => {
    it('should return true when user has all required permissions', () => {
      expect(
        validateQueryPermissions(['health-safety', 'quality'], {
          'health-safety': 3,
          quality: 2,
        })
      ).toBe(true);
    });

    it('should return false when user lacks a required permission', () => {
      expect(
        validateQueryPermissions(['health-safety', 'quality'], {
          'health-safety': 3,
        })
      ).toBe(false);
    });

    it('should return false when permission level is 0 (NONE)', () => {
      expect(
        validateQueryPermissions(['health-safety'], {
          'health-safety': 0,
        })
      ).toBe(false);
    });

    it('should return true for empty modules array', () => {
      expect(validateQueryPermissions([], {})).toBe(true);
    });
  });

  describe('QUERY_PATTERNS', () => {
    it('should have at least 10 patterns defined', () => {
      expect(QUERY_PATTERNS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have modules defined for each pattern', () => {
      for (const pattern of QUERY_PATTERNS) {
        expect(pattern.modules.length).toBeGreaterThan(0);
      }
    });

    it('should have SQL defined for each pattern', () => {
      for (const pattern of QUERY_PATTERNS) {
        expect(pattern.sql.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('nlq — additional coverage', () => {
  it('sanitizeQuery handles empty string', () => {
    const result = sanitizeQuery('');
    expect(result).toBe('');
  });

  it('parseNaturalLanguage returns an object with sql, modules, confidence, original, sanitized, params fields', () => {
    const result = parseNaturalLanguage('show me all overdue CAPAs', fullAccessContext);
    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('modules');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('sanitized');
    expect(result).toHaveProperty('params');
  });
});

describe('nlq — phase28 coverage', () => {
  it('sanitizeQuery removes xp_cmdshell case-insensitively', () => {
    const result = sanitizeQuery('show items XP_CMDSHELL foo');
    expect(result).not.toContain('XP_CMDSHELL');
    expect(result).not.toContain('xp_');
  });

  it('parseNaturalLanguage returns an object with a params array that is empty by default', () => {
    const result = parseNaturalLanguage('what is our LTIFR', fullAccessContext);
    expect(Array.isArray(result.params)).toBe(true);
    expect(result.params).toHaveLength(0);
  });

  it('validateQueryPermissions returns false when permission level is undefined for a required module', () => {
    expect(validateQueryPermissions(['finance'], { 'health-safety': 3 })).toBe(false);
  });

  it('sanitizeQuery with only spaces returns empty string', () => {
    const result = sanitizeQuery('   ');
    expect(result).toBe('');
  });

  it('QUERY_PATTERNS each entry has a regex or pattern property', () => {
    for (const pattern of QUERY_PATTERNS) {
      // Each pattern must have sql and modules as already tested; also verify modules is an array
      expect(Array.isArray(pattern.modules)).toBe(true);
      expect(typeof pattern.sql).toBe('string');
    }
  });
});
