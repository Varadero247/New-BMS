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
    'quality': 6,
    'environment': 6,
    'hr': 6,
    'inventory': 6,
    'finance': 6,
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
  });

  describe('validateQueryPermissions', () => {
    it('should return true when user has all required permissions', () => {
      expect(validateQueryPermissions(['health-safety', 'quality'], {
        'health-safety': 3,
        'quality': 2,
      })).toBe(true);
    });

    it('should return false when user lacks a required permission', () => {
      expect(validateQueryPermissions(['health-safety', 'quality'], {
        'health-safety': 3,
      })).toBe(false);
    });

    it('should return false when permission level is 0 (NONE)', () => {
      expect(validateQueryPermissions(['health-safety'], {
        'health-safety': 0,
      })).toBe(false);
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
